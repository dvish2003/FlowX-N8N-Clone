"use client"

import React, { useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/stores'
import { clearLogs, setShowConsole } from '@/stores/FlowSlice'
import { Terminal, ChevronUp, ChevronDown, Trash2, Copy, Table as TableIcon, FileJson, X } from 'lucide-react'
import { toast } from 'react-toastify'

const BottomOutputPanel = () => {
    const [isExpanded, setIsExpanded] = useState(false)
    const [viewMode, setViewMode] = useState<'table' | 'json'>('table')
    const [expandedLogId, setExpandedLogId] = useState<string | null>(null)
    const [height, setHeight] = useState(300)
    const isResizing = React.useRef(false)
    const { logs, showConsole } = useSelector((state: RootState) => state.flow)
    const dispatch = useDispatch()

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isResizing.current) return
        const newHeight = window.innerHeight - e.clientY
        if (newHeight > 40 && newHeight < window.innerHeight * 0.8) {
            setHeight(newHeight)
            if (newHeight > 60) setIsExpanded(true)
            else setIsExpanded(false)
        }
    }, [])

    const stopResizing = useCallback(() => {
        isResizing.current = false
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', stopResizing)
    }, [handleMouseMove])

    const startResizing = useCallback((e: React.MouseEvent) => {
        e.preventDefault()
        isResizing.current = true
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', stopResizing)
    }, [handleMouseMove, stopResizing])

    React.useEffect(() => {
        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', stopResizing)
        }
    }, [handleMouseMove, stopResizing])

    const handleCopy = useCallback(() => {
        const text = JSON.stringify(logs, null, 2)
        navigator.clipboard.writeText(text)
        toast.info('LOG DATA SECURED TO CLIPBOARD')
    }, [logs])

    const JsonToTable = ({ data, title }: { data: any, title?: string }) => {
        if (!data || typeof data !== 'object') return null;
      
        let content;
        if (Array.isArray(data)) {
          if (data.length === 0) content = <div className="p-4 text-neutral-400 italic">Empty Array</div>;
          else {
            const firstItem = data[0];
            if (typeof firstItem === 'object' && firstItem !== null) {
              const keys = Object.keys(firstItem);
              content = (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-neutral-100/50 text-[9px] font-black uppercase text-neutral-500 tracking-wider">
                      <tr>
                        {keys.map(k => <th key={k} className="px-4 py-2 border-b border-neutral-200">{k}</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 bg-white">
                      {data.map((item, i) => (
                        <tr key={i} className="hover:bg-blue-50/20">
                          {keys.map(k => (
                            <td key={k} className="px-4 py-1.5 text-[10px] text-neutral-600 truncate max-w-[300px]">
                              {typeof item[k] === 'object' ? (
                                <span className="text-blue-500 cursor-help" title={JSON.stringify(item[k])}>Object</span>
                              ) : String(item[k])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            } else {
              content = (
                <div className="p-2 flex flex-wrap gap-1">
                   {data.map((item, i) => <span key={i} className="px-2 py-0.5 bg-neutral-100 rounded text-[10px]">{String(item)}</span>)}
                </div>
              );
            }
          }
        } else {
          const keys = Object.keys(data);
          content = (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-neutral-100/50 text-[9px] font-black uppercase text-neutral-500 tracking-wider border-b">
                  <tr>
                    <th className="px-4 py-2 w-1/3">Metric / Property</th>
                    <th className="px-4 py-2">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 bg-white">
                  {keys.map(k => (
                    <tr key={k} className="hover:bg-blue-50/20 text-[10px]">
                      <td className="px-4 py-1.5 font-bold text-neutral-500 bg-neutral-50/30 w-1/3">{k}</td>
                      <td className="px-4 py-1.5 text-neutral-700">
                        {typeof data[k] === 'object' && data[k] !== null ? (
                          <pre className="text-[9px] bg-neutral-50 p-2 rounded border border-neutral-100 overflow-auto max-h-40">
                             {JSON.stringify(data[k], null, 2)}
                          </pre>
                        ) : String(data[k])}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        return (
          <div className="mt-3 bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
             {title && <div className="px-4 py-2 bg-neutral-50 border-b border-neutral-200 text-[9px] font-black uppercase text-neutral-400 tracking-[0.2em]">{title}</div>}
             {content}
          </div>
        );
    };

    if (!showConsole && logs.length === 0) return null

    return (
        <div 
            className={`fixed bottom-0 left-0 bg-white border-t border-neutral-200 z-40 shadow-2xl transition-[height] ${!isResizing.current ? 'duration-300' : 'duration-0'}`} 
            style={{ 
                right: '420px', 
                height: isExpanded ? `${height}px` : '40px' 
            }}
        >
            {/* Resize Handle */}
            <div 
                onMouseDown={startResizing}
                className="absolute top-0 left-0 w-full h-1 cursor-ns-resize hover:bg-blue-500/50 transition-colors z-50"
            />

            {/* Industrial Header / Compact Toolbar */}
            <div className="flex items-center justify-between px-3 h-10 bg-neutral-50 border-b border-neutral-100 shrink-0 select-none">
                <div className="flex items-center gap-3">
                    <Terminal className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-900 leading-none">Sequence Stream</span>
                    <div className="h-3 w-px bg-neutral-200 mx-1" />
                    <div className="flex bg-neutral-100/40 p-0.5 rounded-lg border border-neutral-200">
                        <button 
                        onClick={() => setViewMode('table')}
                        className={`p-1 rounded-md transition-all ${viewMode === 'table' ? 'bg-[var(--primary)] shadow-sm text-white' : 'text-neutral-400 hover:text-neutral-600'}`}
                        title="Table View"
                        >
                        <TableIcon className="w-3.5 h-3.5" />
                        </button>
                        <button 
                        onClick={() => setViewMode('json')}
                        className={`p-1 rounded-md transition-all ${viewMode === 'json' ? 'bg-[var(--primary)] shadow-sm text-white' : 'text-neutral-400 hover:text-neutral-600'}`}
                        title="JSON View"
                        >
                        <FileJson className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button onClick={handleCopy} className="p-1 px-2 hover:bg-neutral-100 rounded-md flex items-center gap-1.5 text-neutral-500 transition-colors" title="Copy Logs">
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase overflow-hidden w-0 hover:w-auto transition-all">Copy</span>
                    </button>
                    <button onClick={() => dispatch(clearLogs())} className="p-1 px-2 hover:bg-neutral-100 rounded-md flex items-center gap-1.5 text-neutral-500 transition-colors" title="Clear Console">
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase overflow-hidden w-0 hover:w-auto transition-all">Clear</span>
                    </button>
                    <div className="h-4 w-px bg-neutral-200 mx-1" />
                    <button onClick={() => dispatch(setShowConsole(false))} className="p-1.5 hover:bg-neutral-100 rounded-md text-neutral-400 transition-colors">
                        <X className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 hover:bg-neutral-100 rounded-md text-neutral-900 transition-colors ml-1">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Data Stream */}
            <div className={`h-[calc(100%-40px)] overflow-auto bg-white font-mono ${!isExpanded && 'hidden'}`}>
                {viewMode === 'table' ? (
                <table className="w-full text-left text-[11px] border-collapse min-w-96">
                    <thead className="sticky top-0 bg-neutral-50 border-b border-neutral-200 z-10">
                    <tr>
                        <th className="px-5 py-2.5 font-bold uppercase text-neutral-500 w-32 tracking-wider">Timestamp</th>
                        <th className="px-5 py-2.5 font-bold uppercase text-neutral-500 w-24 tracking-wider">Level</th>
                        <th className="px-5 py-2.5 font-bold uppercase text-neutral-500 tracking-wider">Message</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                    {logs.map((log) => (
                        <React.Fragment key={log.id}>
                            <tr 
                                className={`transition-colors cursor-pointer ${expandedLogId === log.id ? 'bg-blue-50/50' : 'hover:bg-blue-50/30'}`}
                                onClick={() => log.data && setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                            >
                                <td className="px-5 py-2 text-neutral-500 border-r border-neutral-100">
                                    <div className="flex items-center gap-2">
                                        {log.data && (
                                            <div className={`w-1.5 h-1.5 rounded-full ${expandedLogId === log.id ? 'bg-blue-500 animate-pulse' : 'bg-neutral-300'}`} />
                                        )}
                                        {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        <span className="text-[9px] opacity-50">.{new Date(log.timestamp).getMilliseconds()}</span>
                                    </div>
                                </td>
                                <td className="px-5 py-2 border-r border-neutral-100">
                                    <span className={`font-bold uppercase text-[9px] px-2 py-0.5 rounded-full leading-none ${
                                        log.type === 'error' ? 'bg-red-100 text-red-600' : 
                                        log.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'
                                    }`}>
                                        {log.type}
                                    </span>
                                </td>
                                <td className="px-5 py-2 font-medium text-neutral-800 break-all">
                                    <div className="flex items-center justify-between gap-4">
                                        <span>{log.message}</span>
                                        {log.data && (
                                            <button 
                                                className={`text-[9px] font-black uppercase px-2 py-1 rounded border transition-all ${
                                                    expandedLogId === log.id 
                                                        ? 'bg-blue-500 border-blue-600 text-white shadow-sm' 
                                                        : 'bg-white border-neutral-200 text-neutral-400 hover:text-blue-500 hover:border-blue-200'
                                                }`}
                                            >
                                                {expandedLogId === log.id ? 'Collapse Data' : 'View Tabular Data'}
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                            {expandedLogId === log.id && log.data && (
                                <tr className="bg-neutral-50/50">
                                    <td colSpan={3} className="px-10 py-6 border-b border-neutral-200">
                                       <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                          <JsonToTable data={log.data} title={`Node Payload: ${log.nodeId || 'System'}`} />
                                          <div className="mt-4 flex items-center gap-4">
                                             <button 
                                                onClick={(e) => {
                                                   e.stopPropagation();
                                                   navigator.clipboard.writeText(JSON.stringify(log.data, null, 2));
                                                   toast.success('JSON PAYLOAD COPIED');
                                                }}
                                                className="text-[9px] font-bold text-neutral-400 hover:text-neutral-600 flex items-center gap-1.5 uppercase transition-colors"
                                             >
                                                <Copy className="w-3 h-3" /> Copy Raw JSON
                                             </button>
                                          </div>
                                       </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                        {logs.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-4 py-12 text-center text-neutral-300 font-black uppercase tracking-[0.2em]">Stream Idle</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                ) : (
                    <div className="p-4 bg-neutral-50/30">
                        <pre className="text-[10px] text-neutral-600 leading-relaxed">
                            {JSON.stringify(logs, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    )
}

export default BottomOutputPanel
