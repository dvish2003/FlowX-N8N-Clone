"use client"

import React, { useCallback, useRef, useState, useEffect, Suspense } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  BackgroundVariant,
  Panel,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type ReactFlowInstance,
  type Edge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import BottomToolBar from './BottomToolBar'
import { useDispatch, useSelector } from 'react-redux'
import { useSession } from 'next-auth/react'
import { nodeTypes } from './nodes/nodesType'
import { RootState } from '@/stores'
import { useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { NodeObjType } from '@/stores/workflow/node-config/nodes/types/node-types'
import BottomOutputPanel from './BottomOutputPanel'
import {
  onNodesChange as onNodesChangeAction,
  onEdgesChange as onEdgesChangeAction,
  onConnect as onConnectAction,
  setSelectedNode,
  addNode,
  addLog,
  clearLogs,
  setIsRunning as setIsRunningAction,
  setIsSchedulerActive as setIsSchedulerActiveAction,
  setNodes,
  setEdges,
  syncIdCount,
  setShowToolsPanel,
} from '@/stores/FlowSlice'
import { LoadWorkflowModal } from './LoadWorkflowModal'
import { toast } from 'react-toastify'

const CanvasFlowContent = () => {
  const dispatch = useDispatch()
  const searchParams = useSearchParams()
  const urlId = searchParams.get('id')
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false)
  const [workflowId, setWorkflowId] = useState<string | null>(null)
  const [workflowName, setWorkflowName] = useState('New Workflow')

  const { nodes, edges, isRunning, isSchedulerActive, showToolsPanel } = useSelector((state: RootState) => state.flow)
  const { data: session } = useSession()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSelectWorkflow = useCallback((wf: Record<string, unknown>) => {
    setWorkflowId(wf._id as string)
    setWorkflowName(wf.name as string)
    
    // Map backend nodes back to React Flow format with industrial defaults
    const restoredNodes = (wf.nodes as Array<Record<string, any>>).map((n: Record<string, any>) => {
      const nodeData = n.data || n.config || {};
      return {
        id: n.id as string,
        type: n.type as string,
        data: {
            ...nodeData,
            label: nodeData.label || n.type,
            icon: nodeData.icon || '/icons/default.png'
        },
        position: (n.position || { x: Math.random() * 400, y: Math.random() * 400 }) as { x: number; y: number }
      };
    })

    const seenEdgeIds = new Set<string>()
    const restoredEdges = (wf.edges as Array<Record<string, any>> || []).map((e: Record<string, any>) => {
      const source = e.source as string
      const target = e.target as string
      const sHandle = (e.sourceHandle || 'output') as string
      const tHandle = (e.targetHandle || 'input') as string
      
      let edgeId = e.id || `edge-${source}-${sHandle}-${target}-${tHandle}`
      
      let finalId = edgeId
      let counter = 1
      while (seenEdgeIds.has(finalId)) {
        finalId = `${edgeId}-${counter}`
        counter++
      }
      seenEdgeIds.add(finalId)

      return {
        id: finalId,
        source: source,
        target: target,
        sourceHandle: sHandle,
        targetHandle: tHandle,
        animated: true,
      };
    })

    dispatch(setNodes(restoredNodes as NodeObjType[]))
    dispatch(setEdges(restoredEdges as Edge[]))
    dispatch(syncIdCount())
    dispatch(setIsSchedulerActiveAction(wf.isActive === true))
    setIsLoadModalOpen(false)
    toast.info(`LOADED: ${wf.name}`)
  }, [dispatch])

  // 🛡️ Automatic Deep-Link Loading
  useEffect(() => {
    if (mounted && urlId && urlId !== workflowId) {
        const fetchWorkflow = async () => {
            try {
                const res = await fetch(`/api/workflows/${urlId}`)
                const data = await res.json()
                if (data.success && data.workflow) {
                    handleSelectWorkflow(data.workflow)
                }
            } catch (err) {
                console.error('Failed to auto-load workflow:', err)
                toast.error('Failed to load project sequence')
            }
        }
        fetchWorkflow()
    }
  }, [mounted, urlId, workflowId, handleSelectWorkflow])

  const handleStop = useCallback(() => {
    dispatch(setIsSchedulerActiveAction(false))
    dispatch(addLog({ type: 'info', message: '🛑 Sequence terminated by user.' }))
    toast.info('SEQUENCE STOPPED')

    if (workflowId) {
        fetch('/api/workflows/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: workflowId, name: workflowName, nodes, edges, isActive: false })
        }).catch(err => console.error('Failed to sync stop state', err))
    }
  }, [dispatch, workflowId, workflowName, nodes, edges])

  const handleRun = useCallback(async () => {
    if (isRunning) return
    
    dispatch(setIsRunningAction(true))
    dispatch(setIsSchedulerActiveAction(true));

    const now = new Date();
    if (workflowId) {
        fetch('/api/workflows/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                id: workflowId, 
                name: workflowName, 
                nodes, 
                edges, 
                isActive: true,
                lastExecuted: now.toISOString() 
            })
        }).catch(err => console.error('Failed to sync run state', err))
    }

    dispatch(clearLogs())
    dispatch(addLog({ type: 'info', message: '🚀 Sequence initiated...' }))
    
    try {
      const response = await fetch('/api/workflows/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges }),
      })

      const result = await response.json()

      if (result.logs) {
        result.logs.forEach((log: string) => {
            dispatch(addLog({ type: log.includes('✗') ? 'error' : 'info', message: log }))
        })
      }

      if (result.nodeExecutions) {
        result.nodeExecutions.forEach((exec: Record<string, unknown>) => {
          dispatch(addLog({
            type: (exec.status as string) === 'success' ? 'success' : 'error',
            message: `Unit ${exec.nodeId} execution ${exec.status}`,
            nodeId: exec.nodeId as string,
            data: exec.output,
          }))
        })
      }

      if (result.success) {
        dispatch(addLog({ type: 'success', message: '✓ Project sequence completed.' }))
      } else {
        dispatch(addLog({ type: 'error', message: '❌ Project sequence failed', data: result.error }))
      }

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      dispatch(addLog({ type: 'error', message: `Interface error: ${message}` }))
    } finally {
      dispatch(setIsRunningAction(false))
    }
  }, [isRunning, nodes, edges, dispatch, workflowId, workflowName])
  
  const handleNewWorkflow = useCallback(() => {
    if (nodes.length > 0) {
        if (!window.confirm('Start new project? Unsaved progress will be lost.')) return;
    }
    
    setWorkflowId(null);
    setWorkflowName('New Workflow');
    dispatch(setNodes([]));
    dispatch(setEdges([]));
    dispatch(clearLogs());
    dispatch(setIsSchedulerActiveAction(false));
    
    if (urlId) {
        window.history.replaceState({}, '', '/workflows');
    }
    
    toast.info('NEW PROJECT INITIALIZED');
  }, [nodes.length, dispatch, urlId]);

  const handleSave = useCallback(async () => {
    if (!session?.user) {
        toast.error('Identity Error: Sign in required.')
        return
    }

    let nameToSave = workflowName
    if (workflowId === null || nameToSave === 'New Workflow') {
        const inputName = window.prompt("Project Codename:", nameToSave)
        if (!inputName) return
        nameToSave = inputName
        setWorkflowName(inputName)
    }

    setIsSaving(true)
    try {
      const res = await fetch('/api/workflows/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: workflowId,
          name: nameToSave,
          nodes: nodes.map(n => ({
              id: n.id,
              type: n.type,
              data: { ...n.data },
              position: n.position
          })),
          edges: edges,
          isActive: isSchedulerActive,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setWorkflowId(data.workflow._id)
        toast.success(`DATA SECURED: ${nameToSave}`)
        
        dispatch(addLog({
           type: 'success',
           message: `SNAPSHOT PERSISTED: ${nameToSave}`,
           data: {
              timestamp: new Date().toISOString(),
              project: nameToSave,
              nodeCount: nodes.length,
              payload: nodes.map(n => ({ id: n.id, type: n.type }))
           }
        }))

      } else {
        toast.error(`SAVE FAILED: ${data.error}`)
      }
    } catch {
      toast.error('CONNECTION BREACHED')
    } finally {
      setIsSaving(false)
    }
  }, [nodes, edges, workflowId, workflowName, session, dispatch, isSchedulerActive])

  const handleRunRef = useRef(handleRun)
  useEffect(() => { handleRunRef.current = handleRun }, [handleRun])

  useEffect(() => {
    if (!mounted || !workflowId) return

    const seenExecIds = new Set<string>()

    const pollExecutions = async () => {
        try {
            const res = await fetch(`/api/workflows/${workflowId}/execute`)
            const data = await res.json()
            
            if (data.success && data.executions) {
                const newExecutions = (data.executions as any[]).filter(exec => !seenExecIds.has(exec._id))
                
                if (newExecutions.length > 0) {
                    newExecutions.reverse().forEach(exec => {
                        seenExecIds.add(exec._id)
                        
                        dispatch(addLog({
                            type: exec.status === 'success' ? 'success' : 'error',
                            message: `🔄 Backend Sync: Execution ${exec.status} (${exec.duration}ms)`,
                            data: {
                                triggeredAt: exec.createdAt,
                                nodeCount: exec.nodeExecutions?.length || 0,
                                logs: exec.logs || []
                            }
                        }))

                        if (exec.logs && Array.isArray(exec.logs)) {
                           exec.logs.forEach((msg: string) => {
                               dispatch(addLog({ 
                                 type: msg.includes('✓') ? 'success' : msg.includes('✗') ? 'error' : 'info', 
                                 message: `  ↳ ${msg}` 
                               }))
                           })
                        }
                    })
                }
            }
        } catch (err) {
            console.error('[Execution Poll Error]', err)
        }
    }

    let interval: NodeJS.Timeout | null = null;
    if (isSchedulerActive) {
        pollExecutions()
        interval = setInterval(pollExecutions, 5000)
    }
    
    return () => {
        if (interval) clearInterval(interval)
    }
  }, [mounted, workflowId, dispatch, isSchedulerActive])

  useEffect(() => {
    if (!mounted || !isSchedulerActive) return
    
    const triggerNode = nodes.find(n => n.type === 'scheduleTriggerNode')
    if (!triggerNode) {
       dispatch(setIsSchedulerActiveAction(false));
       return
    }

    const executionMode = triggerNode.data?.executionMode
    const intervalType = triggerNode.data?.triggerInterval || 'seconds'
    
    if (executionMode === 'auto') return

    let intervalMs = 0
    switch (intervalType) {
      case 'seconds': intervalMs = Number(triggerNode.data?.customSeconds || 60) * 1000; break
      case 'minutes': intervalMs = Number(triggerNode.data?.customMinutes || 1) * 60 * 1000; break
      case 'hours': intervalMs = Number(triggerNode.data?.customHours || 1) * 60 * 60 * 1000; break
      case 'days': intervalMs = Number(triggerNode.data?.daysBetween || 1) * 24 * 60 * 60 * 1000; break
      default: intervalMs = 60 * 1000
    }

    if (intervalMs <= 100) return 

    const interval = setInterval(() => {
      handleRunRef.current()
    }, intervalMs)

    return () => clearInterval(interval)
  }, [mounted, isSchedulerActive, nodes])

  useEffect(() => {
    if (!mounted) return

    let nodeDataChanged = false
    const updatedNodes = nodes.map(node => {
      if (node.type === 'agent') {
        const modelEdge = edges.find(e => e.target === node.id && e.targetHandle === 'chat-model')
        const memoryEdge = edges.find(e => e.target === node.id && e.targetHandle === 'memory')
        
        const modelNode = modelEdge ? nodes.find(n => n.id === modelEdge.source) : null
        const memoryNode = memoryEdge ? nodes.find(n => n.id === memoryEdge.source) : null

        const activeModel = modelNode ? (modelNode.data.customModel || modelNode.data.label) : null
        const activeMemory = memoryNode ? memoryNode.data.label : null

        if (node.data.activeModel !== activeModel || node.data.activeMemory !== activeMemory) {
          nodeDataChanged = true
          return {
            ...node,
            data: {
              ...node.data,
              activeModel,
              activeMemory
            }
          }
        }
      } else if (['modelNode', 'agentNode', 'agent', 'groqNode', 'subAgent'].includes(node.type) || node.type === 'mongoDBNode') {
        const isInUse = edges.some(e => e.source === node.id)
        if (node.data.isInUse !== isInUse) {
          nodeDataChanged = true
          return {
            ...node,
            data: {
              ...node.data,
              isInUse
            }
          }
        }
      }
      return node
    })

    if (nodeDataChanged) {
      dispatch(setNodes(updatedNodes))
    }
  }, [edges, nodes, mounted, dispatch])

  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => dispatch(onNodesChangeAction(changes)),
    [dispatch]
  )

  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes) => dispatch(onEdgesChangeAction(changes)),
    [dispatch]
  )

  const handleConnect: OnConnect = useCallback(
    (connection) => dispatch(onConnectAction(connection)),
    [dispatch]
  )

  const onSelectionChange = useCallback(
    (params: {nodes: unknown[]; edges: unknown[]}) => {
      if (params.nodes && params.nodes.length > 0) {
        dispatch(setSelectedNode(params.nodes[0] as NodeObjType))
      } else {
        dispatch(setSelectedNode(null))
      }
    },
    [dispatch]
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      if (!rfInstance) return

      const raw = event.dataTransfer.getData('application/reactflow')
      if (!raw) return

      let item: { name?: string; iconPath?: string; type?: string } | null = null
      try {
        item = JSON.parse(raw)
      } catch {
        item = null
      }

      if (!item || !item.type) return

      dispatch(addNode({
        node: item.type as string,
        icon: item.iconPath ?? '',
        label: item.name ?? item.type,
      }))
    },
    [dispatch, rfInstance]
  )

  return (
    <div className="w-full h-full relative bg-white" ref={reactFlowWrapper} suppressHydrationWarning>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={4}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onSelectionChange={onSelectionChange}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={(instance: unknown) => setRfInstance(instance as ReactFlowInstance | null)}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={30}
          size={2}
          color="#000000"
          className="opacity-5"
        />
        <Controls position="bottom-left" />
        <MiniMap pannable zoomable />
        
        <Panel position="bottom-right" className="m-6">
            <button
                onClick={() => dispatch(setShowToolsPanel(!showToolsPanel))}
                className={`
                    w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 cursor-pointer
                    ${showToolsPanel ? 'bg-neutral-100 border border-neutral-200 rotate-45 scale-90 text-neutral-800' : 'bg-black hover:scale-110 active:scale-95 text-white'}
                    group pointer-events-auto
                `}
                title="Assemble System Component"
            >
                <div className="relative">
                    {!showToolsPanel && <div className="absolute inset-0 bg-white/20 rounded-full animate-ping group-hover:hidden" />}
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </div>
            </button>
        </Panel>
        
        <Panel position="top-left" className="flex flex-col gap-3 pointer-events-auto m-6">
          <div className="px-5 py-2.5 rounded-2xl border border-neutral-200 bg-white/70 backdrop-blur-md shadow-xl text-neutral-900">
              <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Project Active</div>
              <div className="text-sm font-black text-neutral-900 tracking-tight">
                  {workflowName}
              </div>
          </div>
          <div className="px-4 py-2 rounded-xl border border-neutral-200 bg-neutral-100/40 backdrop-blur-sm flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-neutral-600 animate-pulse" />
              <span className="text-[10px] font-bold text-neutral-600 uppercase">
                  {nodes.length} Nodes · {edges.length} Links
              </span>
          </div>
        </Panel>

          <Panel position="top-right" className="m-6">
             <div className={`backdrop-blur-md px-5 py-3 rounded-2xl border transition-all duration-500 shadow-2xl flex items-center gap-4 ${isSchedulerActive ? 'bg-neutral-50/85 border-neutral-200 shadow-[0_0_15px_rgba(0,0,0,0.05)] text-neutral-800' : 'bg-white/80 border-neutral-200 opacity-70 text-neutral-500'}`}>
                <div className="relative flex h-3 w-3">
                  {isSchedulerActive && <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />}
                  <div className={`relative inline-flex rounded-full h-3 w-3 ${isSchedulerActive ? 'bg-red-500' : 'bg-neutral-300'}`}  />
                </div>
                <div className="flex flex-col">
                  <span className={`text-[10px] font-bold uppercase tracking-widest leading-none ${isSchedulerActive ? 'text-neutral-900' : 'text-neutral-650'}`}>
                      {isSchedulerActive ? 'AI Scheduler Active' : 'Scheduler Standby'}
                  </span>
                  <span className="text-[9px] font-medium text-neutral-400 mt-1">
                      {isSchedulerActive ? 'Real-time automation monitoring' : 'Ready for execution sequence'}
                  </span>
                </div>
                {isSchedulerActive && (
                  <button 
                    onClick={handleStop}
                    className="ml-2 p-1.5 rounded-lg bg-red-950/45 text-red-400 hover:bg-red-900 hover:text-white transition-colors border border-red-900/35 cursor-pointer"
                    title="Stop Scheduler"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect></svg>
                  </button>
                )}
             </div>
          </Panel>
      </ReactFlow>

      <div className="pointer-events-none absolute bottom-16 left-1/2 -translate-x-1/2 z-50">
        <div className="pointer-events-auto">
          <BottomToolBar 
            onRun={handleRun}
            onStop={handleStop}
            isRunning={isRunning} 
            isSchedulerActive={isSchedulerActive}
            onSave={handleSave}
            onLoad={() => setIsLoadModalOpen(true)}
            isSaving={isSaving}
            onNew={handleNewWorkflow}
          />
        </div>
      </div>
      
      <BottomOutputPanel />

      <LoadWorkflowModal 
        isOpen={isLoadModalOpen} 
        onClose={() => setIsLoadModalOpen(false)} 
        onSelect={handleSelectWorkflow}
      />
    </div>
  )
}

const CanvasFlow = () => {
  return (
    <ReactFlowProvider>
      <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-4">
             <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
             <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Initializing Grid...</span>
          </div>
        </div>
      }>
        <CanvasFlowContent />
      </Suspense>
    </ReactFlowProvider>
  )
}

export default CanvasFlow
