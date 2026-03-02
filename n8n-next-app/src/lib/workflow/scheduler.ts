import { Workflow, Execution } from '@/models/workflowSchema';
import { executeHTTPRequest, calculateNextExecution, shouldTriggerRun, formatExecutionResult } from './executionEngine';
import { dbConnect } from '@/lib/mongodb/mongodb';
import { User } from '@/models/userSchema';

/**
 * Sort nodes based on their connections to ensure correct execution order
 * Performs a simple topological sort: trigger nodes first, then follow edges
 */
function sortNodesByConnections(nodes: any[], edges: any[]): any[] {
  // Find trigger node (should be first)
  const triggerNodes = nodes.filter(n => 
    n.type === 'scheduleTriggerNode' || 
    n.type === 'scheduleTrigger' ||
    n.type === 'chatTriggerNode' ||
    n.type === 'webhookNode'
  );
  
  if (triggerNodes.length === 0) {
    // No trigger, return nodes as-is
    return nodes;
  }
  
  const sorted: any[] = [];
  const visited = new Set<string>();
  
  // Helper function to recursively add nodes in order
  function addNodeAndChildren(nodeId: string) {
    if (visited.has(nodeId)) return;
    
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    visited.add(nodeId);
    sorted.push(node);
    
    // Find all edges starting from this node
    const outgoingEdges = edges.filter(e => e.source === nodeId);
    for (const edge of outgoingEdges) {
      addNodeAndChildren(edge.target);
    }
  }
  
  // Start from trigger node(s)
  for (const trigger of triggerNodes) {
    addNodeAndChildren(trigger.id);
  }
  
  // Add any remaining nodes that weren't connected
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      sorted.push(node);
    }
  }
  
  return sorted;
}


interface SchedulerConfig {
  checkIntervalMs?: number;
  maxConcurrentExecutions?: number;
}

let isRunning = false;
let activeExecutions = 0;
const runningWorkflowIds = new Set<string>();

export async function initializeScheduler(config: SchedulerConfig = {}) {
  const checkInterval = config.checkIntervalMs || 5000;
  const maxConcurrent = config.maxConcurrentExecutions || 5;

  console.log('[Scheduler] Initialized with check interval:', checkInterval, 'ms');

  setInterval(async () => {
    if (isRunning || activeExecutions >= maxConcurrent) {
      return;
    }

    try {
      isRunning = true;
      await checkAndExecuteWorkflows();
    } catch (error) {
      console.error('[Scheduler] Error during check:', error);
    } finally {
      isRunning = false;
    }
  }, checkInterval);
}

export async function checkAndExecuteWorkflows() {
  try {
    await dbConnect();

    const workflows = await Workflow.find({
      isActive: true,
    });
    
    if (workflows.length > 0) {
        // Active workflows found
    }

    for (const workflow of workflows) {
      const scheduleTrigger = workflow.nodes.find((n: any) => n.type === 'scheduleTriggerNode');

      if (!scheduleTrigger) {
        continue;
      }

      if (scheduleTrigger.data.executionMode !== 'auto') {
        continue;
      }

      // Skip if already executing in this process
      if (runningWorkflowIds.has(workflow._id.toString())) {
        console.log(`[Scheduler] ⏭️ Workflow ${workflow.name || workflow._id} is already running. Skipping.`);
        continue;
      }
      
      const shouldRun = shouldTriggerRun(scheduleTrigger.data, workflow.lastExecuted);
      
      const diff = workflow.lastExecuted ? Date.now() - new Date(workflow.lastExecuted).getTime() : 'NEVER';
      
      if (!shouldRun) {
         if (diff === 'NEVER') {
             console.log(`[Scheduler] ⚠️ Workflow ${workflow._id} (Auto) has never run but shouldRun=false. Check trigger config.`);
         }
         continue;
      }

      console.log(`[Scheduler] 🟢 TRIGGERING workflow: ${workflow.name || workflow._id}`);

      
      // Update lastExecuted NOW to prevent duplicate triggers in next tick, but allow parallel if interval passes repeatedly
      workflow.lastExecuted = new Date();
      workflow.nextExecution = calculateNextExecution(scheduleTrigger.data, workflow.lastExecuted);
      
      try {
        await workflow.save();
        console.log(`[Scheduler] Updated workflow state (Start of execution)`);
      } catch (err) {
        console.error(`[Scheduler] Failed to update workflow state:`, err);
        // Continue anyway? If save failed, next tick might trigger again. 
        // But runningWorkflowIds check (if present) would block.
        // We removed check, so risk of spam. But proceed.
      }

      activeExecutions++;
      runningWorkflowIds.add(workflow._id.toString());

      executeWorkflowAsync(workflow._id.toString())
        .catch(error => console.error(`[Scheduler] Workflow ${workflow._id} Execution Error:`, error))
        .finally(() => {
          activeExecutions--;
          runningWorkflowIds.delete(workflow._id.toString());
      });
    }
  } catch (error) {
    console.error('[Scheduler] Database error:', error);
  }
}

const EXECUTOR_TIMEOUT_MS = 60000; // 1 Minute Timeout

export async function executeWorkflowAsync(workflowId: string) {
    const timeoutPromise = new Promise<void>((_, reject) => 
        setTimeout(() => reject(new Error(`Workflow execution timed out (> ${EXECUTOR_TIMEOUT_MS/1000}s)`)), EXECUTOR_TIMEOUT_MS)
    );
    
    return Promise.race([executeWorkflowBody(workflowId), timeoutPromise]);
}

async function executeWorkflowBody(workflowId: string) {
  try {
    await dbConnect();

    const workflow = await Workflow.findById(workflowId);
    if (!workflow) {
      console.error('[Scheduler] Workflow not found:', workflowId);
      return;
    }

    const execution = new Execution({
      workflowId: workflowId,
      status: 'running',
      nodeExecutions: [],
      logs: [],
    });

    // Sort nodes based on their connections to ensure we find trigger nodes
    const sortedNodes = sortNodesByConnections(workflow.nodes, workflow.edges || []);

    // Queue for execution (BFS)
    let queue: { node: any, input: any }[] = sortedNodes.filter(n => 
        n.type === 'scheduleTriggerNode' || 
        n.type === 'scheduleTrigger' ||
        n.type === 'chatTrigger' ||
        n.type === 'webhookNode'
    ).map(n => ({ node: n, input: {} }));

    // If no trigger found, start with the first node
    if (queue.length === 0 && sortedNodes.length > 0) {
        queue = [{ node: sortedNodes[0], input: {} }];
    }

    const visited = new Set<string>();
    let steps = 0;
    const MAX_STEPS = 100;

    while (queue.length > 0 && steps < MAX_STEPS) {
      steps++;
      const currentItem = queue.shift();
      if (!currentItem) break;

      const { node, input } = currentItem;
      if (visited.has(node.id)) continue;
      visited.add(node.id);

      const nodeExecution: any = {
        nodeId: node.id,
        nodeType: node.type,
        status: 'running',
        startTime: new Date(),
        input: input,
      };

      execution.nodeExecutions.push(nodeExecution);
      execution.logs?.push(`⚙️ Processing unit: ${node.data?.label || node.id} (${node.type})`);

      let output: any = {};
      let success = true;
      let selectedHandle: string | null = null;

      try {
        if (node.type === 'scheduleTriggerNode' || node.type === 'scheduleTrigger') {
          output = {
            triggeredAt: new Date().toISOString(),
            executionId: execution._id.toString(),
            source: 'scheduler',
            ...(node.data || {})
          };
          execution.logs?.push(`✓ Triggered by scheduler`);
        } 
        else if (node.type === 'httpNode' || node.type === 'httpRequest') {
            execution.logs?.push(`📡 HTTP: ${node.data?.method || 'GET'} ${node.data?.url}`);
            const result = await executeHTTPRequest(node.data, input || {});
            nodeExecution.output = formatExecutionResult(result);
            if (result.success) {
              output = result.data;
              execution.logs?.push(`✓ HTTP: Success (${result.status})`);
            } else {
              success = false;
              execution.logs?.push(`✗ HTTP: Failed - ${result.error}`);
            }
        } 
        else if (node.type === 'ifNode') {
            const { conditions, combineOperation } = node.data || {};
            execution.logs?.push(`▶ Evaluating logic conditions...`);
            
            const evaluateCondition = (cond: any, data: any) => {
                const val = getNestedValue(data, cond.variable);
                const target = cond.value;
                switch (cond.operator) {
                    case 'equal': return String(val) === String(target);
                    case 'notEqual': return String(val) !== String(target);
                    case 'contains': return String(val).toLowerCase().includes(String(target).toLowerCase());
                    case 'greater': return Number(val) > Number(target);
                    case 'less': return Number(val) < Number(target);
                    case 'exists': return val !== undefined && val !== null;
                    default: return false;
                }
            };

            let items: any[] = [];
            let isWrapped = false;
            let wrapperKey = 'data';

            if (Array.isArray(input)) items = input;
            else if (input && typeof input === 'object') {
                if (Array.isArray(input.data)) { items = input.data; isWrapped = true; wrapperKey = 'data'; }
                else if (Array.isArray(input.items)) { items = input.items; isWrapped = true; wrapperKey = 'items'; }
                else if (Array.isArray(input.json)) { items = input.json; isWrapped = true; wrapperKey = 'json'; }
                else if (Array.isArray(input.records)) { items = input.records; isWrapped = true; wrapperKey = 'records'; }
                else items = [input];
            }

            const trueItems = items.filter((item: any) => {
                const results = (conditions || []).map((c: any) => evaluateCondition(c, item));
                return combineOperation === 'OR' 
                    ? (results.length === 0 ? false : results.some((r: any) => r)) 
                    : (results.length === 0 ? true : results.every((r: any) => r));
            });
            const falseItems = items.filter((item: any) => !trueItems.includes(item));

            const trueOutput = isWrapped ? { ...input, [wrapperKey]: trueItems } : (Array.isArray(input) ? trueItems : input);
            const falseOutput = isWrapped ? { ...input, [wrapperKey]: falseItems } : (Array.isArray(input) ? falseItems : input);

            (nodeExecution as any).branchOutputs = { 'true': trueOutput, 'false': falseOutput };
            
            if (Array.isArray(input) || isWrapped) {
                selectedHandle = null; 
                execution.logs?.push(`✓ Records split: ${trueItems.length} passed, ${falseItems.length} failed`);
            } else {
                selectedHandle = trueItems.length > 0 ? 'true' : 'false';
                output = input;
                execution.logs?.push(`✓ Condition result: ${selectedHandle.toUpperCase()}`);
            }
        }
        else if (node.type === 'switchNode') {
            const { variable, cases } = node.data || {};
            execution.logs?.push(`▶ Evaluating Switch logic...`);

            let items: any[] = [];
            let isWrapped = false;
            let wrapperKey = 'data';

            if (Array.isArray(input)) items = input;
            else if (input && typeof input === 'object') {
                if (Array.isArray(input.data)) { items = input.data; isWrapped = true; wrapperKey = 'data'; }
                else if (Array.isArray(input.items)) { items = input.items; isWrapped = true; wrapperKey = 'items'; }
                else if (Array.isArray(input.json)) { items = input.json; isWrapped = true; wrapperKey = 'json'; }
                else if (Array.isArray(input.records)) { items = input.records; isWrapped = true; wrapperKey = 'records'; }
                else items = [input];
            }

            const branchData: Record<string, any[]> = { 'default': [] };
            if (cases && Array.isArray(cases)) {
                cases.forEach((_, i) => { branchData[`case-${i}`] = []; });
            }

            items.forEach((item: any) => {
                const val = getNestedValue(item, variable);
                let found = false;
                if (cases && Array.isArray(cases)) {
                    const index = cases.findIndex((c: any) => String(c.value) === String(val));
                    if (index !== -1) {
                        branchData[`case-${index}`].push(item);
                        found = true;
                    }
                }
                if (!found) branchData['default'].push(item);
            });

            const finalBranchOutputs: Record<string, any> = {};
            Object.keys(branchData).forEach(key => {
                finalBranchOutputs[key] = isWrapped ? { ...input, [wrapperKey]: branchData[key] } : branchData[key];
            });
            (nodeExecution as any).branchOutputs = finalBranchOutputs;

            if (Array.isArray(input) || isWrapped) {
                selectedHandle = null;
                execution.logs?.push(`✓ Partitioned ${items.length} records across branches`);
            } else {
                const val = getNestedValue(input, variable);
                const index = (cases || []).findIndex((c: any) => String(c.value) === String(val));
                selectedHandle = index !== -1 ? `case-${index}` : 'default';
                output = input;
                execution.logs?.push(`✓ Switch choice: ${selectedHandle}`);
            }
        }
        else if (node.type === 'googleSheetNode') {
          const { executeGoogleSheetNode } = await import('@/lib/workflow/googleSheetExecutor');
          const user = await User.findById(workflow.userId);
          if (!user || (!user.googleAccessToken && !user.googleRefreshToken)) {
              throw new Error("User Google account not connected.");
          }
          output = await executeGoogleSheetNode(node.data, input, 
              { accessToken: user.googleAccessToken, refreshToken: user.googleRefreshToken }, 
              execution.logs || []
          );
          nodeExecution.output = output;
        } 
        else if (node.type === 'mongoDBNode') {
          const { executeMongoDBNode } = await import('@/lib/workflow/mongoDBExecutor');
          output = await executeMongoDBNode(node.data, input, execution.logs || []);
          nodeExecution.output = output;
        }
        else if (node.type === 'whatsAppNode') {
          const { executeWhatsAppNode } = await import('@/lib/workflow/whatsAppExecutor');
          output = await executeWhatsAppNode(node.data, input, execution.logs || []);
          nodeExecution.output = output;
        }
        else if (node.type === 'sendDataNode') {
          const destinationType = node.data?.destinationType || 'http';
          if (destinationType === 'http') {
              const result = await executeHTTPRequest({ ...node.data, method: node.data?.httpMethod || 'POST', url: node.data?.httpUrl } as any, input);
              output = formatExecutionResult(result);
              success = result.success;
          } else {
              output = { success: true, timestamp: Date.now() };
          }
          nodeExecution.output = output;
        } 
        else {
          output = input;
        }

        nodeExecution.status = success ? 'success' : 'failed';
        nodeExecution.endTime = new Date();
        
        if (!success) {
            execution.status = 'failed';
            break; 
        }

        // --- FIND NEXT NODES ---
        if (workflow.edges && Array.isArray(workflow.edges)) {
            let outgoingEdges = workflow.edges.filter((e: any) => e.source === node.id);
            if (selectedHandle) {
                outgoingEdges = outgoingEdges.filter((e: any) => (e as any).sourceHandle === selectedHandle);
            }

            for (const edge of outgoingEdges) {
                const nextNode = workflow.nodes.find((n: any) => n.id === edge.target);
                if (nextNode) {
                    let branchInput = output;
                    const branchOutputs = (nodeExecution as any).branchOutputs;
                    
                    if (branchOutputs && (edge as any).sourceHandle && branchOutputs[(edge as any).sourceHandle]) {
                        branchInput = branchOutputs[(edge as any).sourceHandle];
                        
                        // Skip if no records in this branch
                        let recordCount = 0;
                        if (Array.isArray(branchInput)) recordCount = branchInput.length;
                        else if (branchInput && typeof branchInput === 'object') {
                            const data = (branchInput as any).data || (branchInput as any).items || (branchInput as any).json || (branchInput as any).records;
                            if (Array.isArray(data)) recordCount = data.length;
                        }

                        if (recordCount === 0) {
                            execution.logs?.push(`ℹ Skipping branch ${(edge as any).sourceHandle}: 0 records`);
                            continue;
                        }
                    }
                    queue.push({ node: nextNode, input: branchInput });
                }
            }
        }
      } catch (error: any) {
        nodeExecution.status = 'failed';
        nodeExecution.error = error.message;
        execution.logs?.push(`✗ ${node.type}: ${error.message}`);
        nodeExecution.endTime = new Date();
        execution.status = 'failed';
        break;
      }
    }

    execution.status = execution.nodeExecutions.some((n: any) => n.status === 'failed') ? 'failed' : 'success';
    execution.endTime = new Date();
    execution.duration = execution.endTime.getTime() - execution.startTime.getTime();
    await execution.save();

  } catch (error) {
    console.error('[Scheduler] Workflow error:', error);
  }
}

export async function triggerWorkflowManually(workflowId: string) {
  activeExecutions++;
  return executeWorkflowAsync(workflowId).finally(() => {
    activeExecutions--;
  });
}

export function getSchedulerStatus() {
  return {
    isRunning,
    activeExecutions,
    timestamp: new Date().toISOString(),
  };
}

function getNestedValue(obj: any, path: string) {
    if (!path || !obj) return obj;
    if (path === '$root') return obj;
    const keys = path.split('.');
    let current = obj;
    for (const key of keys) {
        if (current === null || current === undefined) return undefined;
        current = current[key];
    }
    return current;
}
