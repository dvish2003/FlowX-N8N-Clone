import { NextRequest, NextResponse } from 'next/server';
import { executeHTTPRequest, formatExecutionResult } from '@/lib/workflow/executionEngine';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/mongodb/mongodb";
import { User } from "@/models/userSchema";

type AdHocWorkflow = {
  nodes: any[];
  edges: any[];
};

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    let user = null;
    if (session?.user?.email) {
        user = await User.findOne({ email: session.user.email });
    }

    const body = await request.json();
    const { nodes, edges } = body as AdHocWorkflow;

    if (!nodes || !Array.isArray(nodes)) {
      return NextResponse.json({ error: 'Invalid nodes data' }, { status: 400 });
    }

    console.log(`[Test Workflow] Executing ad-hoc workflow with ${nodes.length} nodes and ${edges?.length || 0} edges`);

    const executionLogs: string[] = [];
    const nodeExecutions: any[] = [];
    let status = 'success';
    
    let startNodes = nodes.filter(n => 
        n.type === 'scheduleTriggerNode' || 
        n.type === 'scheduleTrigger' ||
        n.type === 'chatTriggerNode' ||
        n.type === 'webhookNode'
    );
    
    // If no explicit trigger, use the first node
    if (startNodes.length === 0 && nodes.length > 0) {
        startNodes = [nodes[0]];
    }

    // Queue for BFS-like execution
    // { nodeId, inputData }
    let queue: { node: any, input: any }[] = startNodes.map(n => ({ node: n, input: {} }));
    const visited = new Set<string>();

    // Safeguard for infinite loops
    let steps = 0;
    const MAX_STEPS = 50;

    let finalOutput: any = {};

    while (queue.length > 0 && steps < MAX_STEPS) {
        steps++;
        const currentItem = queue.shift();
        if (!currentItem) break;
        
        const { node, input } = currentItem;
        
        // Prevent re-execution of same node in simple flows (DAG)
        // Note: For complex loops, we'd need more sophisticated logic
        if (visited.has(node.id)) continue;
        visited.add(node.id);

        const nodeExecution: any = {
            nodeId: node.id,
            nodeType: node.type,
            status: 'running',
            startTime: new Date(),
            input: input,
        };

        let output: any = {};
        let success = true;
        let selectedHandle: string | null = null;

        try {
            // --- EXECUTE NODE LOGIC ---
            if (node.type === 'scheduleTriggerNode' || node.type === 'scheduleTrigger') {
                output = {
                    triggeredAt: new Date().toISOString(),
                    source: 'manual-test',
                    ...(node.data || {})
                };
                executionLogs.push(`✓ Trigger (${node.type})`);
            } 
            else if (node.type === 'webhookNode') {
                output = {
                    method: 'POST',
                    body: input || {},
                    headers: {},
                    query: {}
                };
                executionLogs.push(`✓ Webhook Triggered`);
            }
            else if (node.type === 'httpNode' || node.type === 'httpRequest') {
                 const method = node.data?.method || 'GET';
                 const url = node.data?.url || '';
                 executionLogs.push(`▶ HTTP Request: ${method} ${url}`);
                 
                 const config = {
                     ...node.data,
                     method,
                     timeoutSeconds: Number(node.data?.timeoutSeconds || 30),
                     retries: Number(node.data?.retries || 0),
                     followRedirects: node.data?.followRedirects ?? true,
                 };

                 const result = await executeHTTPRequest(config as any, input);
                 
                 if (result.success) {
                     output = result.data;
                     executionLogs.push(`✓ HTTP Success (${result.status})`);
                 } else {
                     output = { error: result.error, status: result.status };
                     executionLogs.push(`✗ HTTP Failed: ${result.error}`);
                     success = false;
                 }
            } 
            else if (node.type === 'ifNode') {
                const { conditions, combineOperation } = node.data || {};
                executionLogs.push(`▶ Evaluating IF conditions (${combineOperation || 'AND'})...`);
                
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

                // Extract array from common wrappers
                let items: any[] = [];
                let isWrapped = false;
                let wrapperKey = 'data';

                if (Array.isArray(input)) {
                    items = input;
                } else if (input && typeof input === 'object') {
                    if (Array.isArray(input.data)) { items = input.data; isWrapped = true; wrapperKey = 'data'; }
                    else if (Array.isArray(input.items)) { items = input.items; isWrapped = true; wrapperKey = 'items'; }
                    else if (Array.isArray(input.json)) { items = input.json; isWrapped = true; wrapperKey = 'json'; }
                    else if (Array.isArray(input.records)) { items = input.records; isWrapped = true; wrapperKey = 'records'; }
                    else { items = [input]; }
                }

                const trueItems = items.filter((item: any) => {
                    const results = (conditions || []).map((c: any) => evaluateCondition(c, item));
                    return combineOperation === 'OR' 
                        ? (results.length === 0 ? false : results.some((r: any) => r)) 
                        : (results.length === 0 ? true : results.every((r: any) => r));
                });
                const falseItems = items.filter((item: any) => !trueItems.includes(item));

                // Prepare outputs
                const trueOutput = isWrapped ? { ...input, [wrapperKey]: trueItems } : (Array.isArray(input) ? trueItems : input);
                const falseOutput = isWrapped ? { ...input, [wrapperKey]: falseItems } : (Array.isArray(input) ? falseItems : input);

                if (Array.isArray(input) || isWrapped) {
                    (nodeExecution as any).branchOutputs = { 'true': trueOutput, 'false': falseOutput };
                    selectedHandle = null; 
                    executionLogs.push(`✓ Processed ${items.length} records: ${trueItems.length} passed, ${falseItems.length} failed`);
                } else {
                    const isTrue = trueItems.length > 0;
                    selectedHandle = isTrue ? 'true' : 'false';
                    output = input;
                    executionLogs.push(`✓ Condition result: ${isTrue ? 'TRUE' : 'FALSE'}`);
                }
            }
            else if (node.type === 'switchNode') {
                const { variable, cases } = node.data || {};
                executionLogs.push(`▶ Evaluating Switch logic on variable: ${variable}`);

                // Extract array from common wrappers
                let items: any[] = [];
                let isWrapped = false;
                let wrapperKey = 'data';

                if (Array.isArray(input)) {
                    items = input;
                } else if (input && typeof input === 'object') {
                    if (Array.isArray(input.data)) { items = input.data; isWrapped = true; wrapperKey = 'data'; }
                    else if (Array.isArray(input.items)) { items = input.items; isWrapped = true; wrapperKey = 'items'; }
                    else if (Array.isArray(input.json)) { items = input.json; isWrapped = true; wrapperKey = 'json'; }
                    else if (Array.isArray(input.records)) { items = input.records; isWrapped = true; wrapperKey = 'records'; }
                    else { items = [input]; }
                }

                const branchData: Record<string, any[]> = {};
                if (cases && Array.isArray(cases)) {
                    cases.forEach((_, i) => { branchData[`case-${i}`] = []; });
                }
                branchData['default'] = [];

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

                if (Array.isArray(input) || isWrapped) {
                    const finalBranchOutputs: Record<string, any> = {};
                    Object.keys(branchData).forEach(key => {
                        finalBranchOutputs[key] = isWrapped ? { ...input, [wrapperKey]: branchData[key] } : branchData[key];
                    });
                    (nodeExecution as any).branchOutputs = finalBranchOutputs;
                    selectedHandle = null;
                    executionLogs.push(`✓ Partitioned ${items.length} records across switch paths`);
                } else {
                    const val = getNestedValue(input, variable);
                    const index = (cases || []).findIndex((c: any) => String(c.value) === String(val));
                    selectedHandle = index !== -1 ? `case-${index}` : 'default';
                    output = input;
                    executionLogs.push(`✓ Switch choice: ${selectedHandle}`);
                }
            }
            else if (node.type === 'delayNode') {
                const delay = Number(node.data?.delay || 0);
                const unit = node.data?.unit || 'seconds';
                let ms = delay * 1000;
                if (unit === 'minutes') ms *= 60;
                if (unit === 'hours') ms *= 3600;

                executionLogs.push(`🕒 Waiting for ${delay} ${unit}...`);
                await new Promise(r => setTimeout(r, Math.min(ms, 10000))); // Cap at 10s for tests
                output = input;
                executionLogs.push(`✓ Delay completed`);
            }
            else if (node.type === 'emailNode') {
                executionLogs.push(`▶ Sending Email to ${node.data?.to || 'recipient'}...`);
                try {
                    const nodemailer = await import('nodemailer');
                    const transporter = nodemailer.createTransport({
                        host: node.data?.host,
                        port: Number(node.data?.port),
                        secure: node.data?.secure ?? true,
                        auth: node.data?.auth
                    });
                    
                    await transporter.sendMail({
                        from: node.data?.from,
                        to: node.data?.to,
                        subject: node.data?.subject,
                        text: node.data?.isHtml ? undefined : node.data?.body,
                        html: node.data?.isHtml ? node.data?.body : undefined,
                    });
                    output = { success: true, sentAt: new Date().toISOString() };
                    executionLogs.push(`✓ Email sent successfully`);
                } catch (err: any) {
                    executionLogs.push(`✗ Email failed: ${err.message}`);
                    output = { error: err.message };
                    success = false;
                }
            }
            else if (node.type === 'telegramNode') {
                const { botToken, chatId, message } = node.data || {};
                executionLogs.push(`▶ Sending Telegram message to ${chatId}...`);
                try {
                    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'Markdown' })
                    });
                    const data = await res.json();
                    if (data.ok) {
                        output = data.result;
                        executionLogs.push(`✓ Telegram message sent`);
                    } else {
                        throw new Error(data.description || 'Telegram API Error');
                    }
                } catch (err: any) {
                    executionLogs.push(`✗ Telegram failed: ${err.message}`);
                    output = { error: err.message };
                    success = false;
                }
            }
            else if (node.type === 'dataFormatterNode') {
                const { mode, mappings } = node.data || {};
                executionLogs.push(`▶ Formatting data (${mode})...`);
                let formatted = mode === 'filter' ? {} : { ...input };
                
                if (mappings && Array.isArray(mappings)) {
                    mappings.forEach((m: any) => {
                        const val = getNestedValue(input, m.from);
                        if (mode === 'add' || mode === 'map' || mode === 'rename') {
                            setNestedValue(formatted, m.to, val);
                            if (mode === 'rename' && m.from !== m.to) {
                                deleteNestedValue(formatted, m.from);
                            }
                        } else if (mode === 'filter') {
                            setNestedValue(formatted, m.to || m.from, val);
                        }
                    });
                }
                output = formatted;
                executionLogs.push(`✓ Data transformation applied`);
            }
            else if (node.type === 'codeNode') {
                executionLogs.push(`▶ Executing custom JavaScript...`);
                try {
                    const code = node.data?.code || 'return input;';
                    // Very basic sandbox-less execution for testing
                    // In production this would use a safer vm
                    const fn = new Function('input', 'axios', 'executionLogs', `
                        return (async () => {
                            ${code}
                        })();
                    `);
                    const axios = (await import('axios')).default;
                    output = await fn(input, axios, executionLogs);
                    executionLogs.push(`✓ Code executed successfully`);
                } catch (err: any) {
                    executionLogs.push(`✗ Code Error: ${err.message}`);
                    output = { error: err.message };
                    success = false;
                }
            }
            else if (node.type === 'loopNode') {
                const { arrayPath } = node.data || {};
                const arr = getNestedValue(input, arrayPath);
                
                if (Array.isArray(arr) && arr.length > 0) {
                    executionLogs.push(`▶ Entering Loop: Processing ${arr.length} items...`);
                    // Note: True sequential loop in BFS requires state management
                    // For MOCK/TEST, we just pass the first item and log it
                    output = { ...input, $item: arr[0], $index: 0, $isLoop: true };
                    selectedHandle = 'loop';
                    executionLogs.push(`ℹ Loop started with first item`);
                } else {
                    selectedHandle = 'done';
                    output = input;
                    executionLogs.push(`ℹ Loop: Array empty or not found, finishing.`);
                }
            }
            else if (node.type === 'errorHandlerNode') {
                output = input;
                executionLogs.push(`🛡️ Error Handler Active (Policy: ${node.data?.onFailure || 'retry'})`);
            }
            else if (['gmailNode', 'driveNode', 'slackNode', 'notionNode', 'discordNode'].includes(node.type)) {
                 executionLogs.push(`▶ Executing ${node.type}...`);
                 await new Promise(r => setTimeout(r, 600));
                 output = { success: true, timestamp: Date.now(), data: 'Mock logic applied' };
                 executionLogs.push(`✓ ${node.type} executed successfully`);
            }
            else if (node.type === 'sendDataNode') {
                 const destinationType = node.data?.destinationType || 'http';
                 executionLogs.push(`▶ Send Data: ${destinationType}`);
                 
                 if (destinationType === 'http') {
                     const result = await executeHTTPRequest({ ...node.data, method: node.data?.httpMethod || 'POST', url: node.data?.httpUrl } as any, input);
                     output = formatExecutionResult(result);
                     if (result.success) executionLogs.push(`✓ Send Data Success (${result.status})`);
                     else { executionLogs.push(`✗ Send Data Failed: ${result.error}`); success = false; }
                 } else {
                     executionLogs.push(`✓ Data sent to ${destinationType}`);
                     output = { success: true, timestamp: Date.now() };
                 }
            } else if (node.type === 'googleSheetNode') {
              if (!user || (!user.googleAccessToken && !user.googleRefreshToken)) {
                executionLogs.push('✗ Google Sheet: Auth required');
                output = { error: 'Auth missing' }; success = false;
              } else {
                const { executeGoogleSheetNode } = await import('@/lib/workflow/googleSheetExecutor');
                try {
                  const result = await executeGoogleSheetNode(node.data, input, { accessToken: user.googleAccessToken, refreshToken: user.googleRefreshToken }, executionLogs);
                  output = { success: true, insertedCount: result.insertedCount, columns: result.columns, timestamp: new Date().toISOString() };
                } catch (err: any) {
                  executionLogs.push(`✗ Google Sheet Failed: ${err.message}`);
                  output = { error: err.message }; success = false;
                }
              }
            } else if (node.type === 'mongoDBNode') {
              const { executeMongoDBNode } = await import('@/lib/workflow/mongoDBExecutor');
              try {
                const result = await executeMongoDBNode(node.data, input, executionLogs);
                output = result;
                executionLogs.push(`✓ MongoDB Success`);
              } catch (err: any) {
                executionLogs.push(`✗ MongoDB Failed: ${err.message}`);
                output = { error: err.message }; success = false;
              }
            } else if (node.type === 'whatsAppNode') {
              const { executeWhatsAppNode } = await import('@/lib/workflow/whatsAppExecutor');
              try {
                const result = await executeWhatsAppNode(node.data, input, executionLogs);
                output = result;
                executionLogs.push(`✓ WhatsApp Success`);
              } catch (err: any) {
                executionLogs.push(`✗ WhatsApp Failed: ${err.message}`);
                output = { error: err.message }; success = false;
              }
            }

            else if (['modelNode', 'agentNode', 'agent', 'groqNode', 'subAgent'].includes(node.type)) {
                 executionLogs.push(`🧠 AI Agent thinking...`);
                 await new Promise(r => setTimeout(r, 1000));
                 output = { response: "Processed by AI Simulator", tokens: 42 };
                 executionLogs.push(`✓ AI Response generated`);
            }
            else {
                 executionLogs.push(`ℹ Passing through ${node.type}`);
                 output = { ...input };
            }

            nodeExecution.output = output;
            nodeExecution.status = success ? 'success' : 'failed';
            nodeExecution.endTime = new Date();
            nodeExecutions.push(nodeExecution);
            finalOutput = output;

            if (!success) {
                status = 'failed';
                continue;
            }

            // --- FIND NEXT NODES ---
            if (edges && Array.isArray(edges)) {
                let outgoingEdges = edges.filter(e => e.source === node.id);
                
                // If the node has multiple outputs, filter outgoing edges by handle
                if (selectedHandle) {
                    outgoingEdges = outgoingEdges.filter(e => e.sourceHandle === selectedHandle);
                    console.log(`[Branching] Node ${node.type} followed handle: ${selectedHandle}`);
                }

                for (const edge of outgoingEdges) {
                    const nextNode = nodes.find(n => n.id === edge.target);
                    if (nextNode) {
                        // Use branch-specific data if available (e.g. from IF/Switch splitting)
                        let branchInput = output;
                        const branchOutputs = (nodeExecution as any).branchOutputs;
                        
                        if (branchOutputs && edge.sourceHandle && branchOutputs[edge.sourceHandle]) {
                            branchInput = branchOutputs[edge.sourceHandle];
                            
                            // Optimization: Don't trigger downstream nodes if there's no data for this branch
                            if (Array.isArray(branchInput) && branchInput.length === 0) {
                                executionLogs.push(`ℹ Branch ${edge.sourceHandle} has 0 items. Skipping path.`);
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
            nodeExecution.endTime = new Date();
            nodeExecutions.push(nodeExecution);
            executionLogs.push(`✗ Error in ${node.type}: ${error.message}`);
            status = 'failed';
        }
    }

    return NextResponse.json({
        success: status === 'success',
        logs: executionLogs,
        nodeExecutions,
        status,
        finalOutput
    });

  } catch (error: any) {
    console.error('[Test Workflow] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Test execution failed' },
      { status: 500 }
    );
  }
}

// Helper functions for nested object access
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

function setNestedValue(obj: any, path: string, value: any) {
    if (!path || !obj) return;
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!current[key] || typeof current[key] !== 'object') {
            current[key] = {};
        }
        current = current[key];
    }
    current[keys[keys.length - 1]] = value;
}

function deleteNestedValue(obj: any, path: string) {
    if (!path || !obj) return;
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!current[key]) return;
        current = current[key];
    }
    delete current[keys[keys.length - 1]];
}
