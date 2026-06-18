"use client"

import React, { useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/stores'
import { clearLogs, setShowConsole } from '@/stores/FlowSlice'
import { Terminal, ChevronUp, ChevronDown, Trash2, Copy, Table as TableIcon, FileJson, X, Download, FileText } from 'lucide-react'
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

    // CSV Downloader Logic
    const downloadCSV = (data: any) => {
        let csvContent = "";
        let fileName = "export.csv";

        if (!data) return;

        if (data.csvData) {
            csvContent = data.csvData;
            if (data.fileName) fileName = data.fileName;
        } else {
            let records = [];
            if (Array.isArray(data)) records = data;
            else if (data.records && Array.isArray(data.records)) records = data.records;
            else if (data.data && Array.isArray(data.data)) records = data.data;
            else records = [data];

            if (records.length > 0) {
                const headers = Object.keys(records[0]);
                csvContent = [
                    headers.join(','),
                    ...records.map((row: any) => headers.map(h => {
                        const cellVal = row[h] === null || row[h] === undefined ? "" : String(row[h]);
                        return `"${cellVal.replace(/"/g, '""')}"`;
                    }).join(','))
                ].join('\n');
            }
        }

        if (!csvContent) {
            toast.error("No exportable CSV data found");
            return;
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`Downloaded: ${fileName}`);
    };

    // PDF Printer / Exporter Logic
    const downloadPDF = (data: any) => {
        let records = [];
        if (Array.isArray(data)) records = data;
        else if (data.records && Array.isArray(data.records)) records = data.records;
        else if (data.data && Array.isArray(data.data)) records = data.data;
        else records = [data];

        if (records.length === 0) {
            toast.error("No exportable tabular data found for PDF");
            return;
        }

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast.error("Popup blocked! Allow popups to print/save PDF.");
            return;
        }

        const headers = Object.keys(records[0]);
        const rowsHtml = records.map((r: any) => `
            <tr>
                ${headers.map((h: string) => `<td>${r[h] === null || r[h] === undefined ? "" : String(r[h])}</td>`).join('')}
            </tr>
        `).join('');

        printWindow.document.write(`
            <html>
            <head>
                <title>FlowX Data Export</title>
                <style>
                    body { font-family: sans-serif; padding: 40px; color: #171717; background-color: #ffffff; }
                    h1 { color: #000000; border-bottom: 2px solid #ddd; padding-bottom: 10px; font-weight: 800; font-size: 24px; }
                    .meta { font-size: 11px; color: #6b7280; margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    th, td { border: 1px solid #e5e7eb; padding: 10px 12px; text-align: left; font-size: 11px; }
                    th { background-color: #f9fafb; font-weight: bold; color: #4b5563; }
                    tr:nth-child(even) { background-color: #f9fafb; }
                    .footer { margin-top: 40px; font-size: 10px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 15px; }
                </style>
            </head>
            <body>
                <h1>FlowX - Pipeline Output Document</h1>
                <div class="meta">
                    <strong>Export Mode:</strong> PDF Document Report<br/>
                    <strong>Timestamp:</strong> ${new Date().toLocaleString()}
                </div>
                <table>
                    <thead>
                        <tr>
                            ${headers.map(h => `<th>${h}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
                <div class="footer">
                    FlowX Pipeline Automation Engine - Secure Document Export System
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                        window.close();
                    }
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
        toast.success("PDF conversion window initialized");
    };

    const JsonToTable = ({ data, title }: { data: any, title?: string }) => {
        if (!data || typeof data !== 'object') return null;
      
        let content;
        let showExportButtons = false;

        if (Array.isArray(data)) {
          if (data.length === 0) content = <div className="p-4 text-neutral-400 italic">Empty Array</div>;
          else {
            const firstItem = data[0];
            if (typeof firstItem === 'object' && firstItem !== null) {
              showExportButtons = true;
              const keys = Object.keys(firstItem);
              content = (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-neutral-100 text-[9px] font-black uppercase text-neutral-600 tracking-wider">
                      <tr>
                        {keys.map(k => <th key={k} className="px-4 py-2 border-b border-neutral-200">{k}</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 bg-neutral-50">
                      {data.map((item, i) => (
                        <tr key={i} className="hover:bg-neutral-100">
                          {keys.map(k => (
                            <td key={k} className="px-4 py-1.5 text-[10px] text-neutral-800 truncate max-w-[300px]">
                              {typeof item[k] === 'object' ? (
                                <span className="text-neutral-550 cursor-help" title={JSON.stringify(item[k])}>Object</span>
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
                   {data.map((item, i) => <span key={i} className="px-2 py-0.5 bg-neutral-100 rounded text-[10px] text-neutral-700">{String(item)}</span>)}
                </div>
              );
            }
          }
        } else {
          // Check if it wraps an array
          const subData = data.records || data.data || data.json;
          if (Array.isArray(subData) && subData.length > 0) {
              showExportButtons = true;
          }
          if (data.csvData) {
              showExportButtons = true;
          }

          const keys = Object.keys(data);
          content = (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-neutral-100 text-[9px] font-black uppercase text-neutral-600 tracking-wider border-b border-neutral-200">
                  <tr>
                    <th className="px-4 py-2 w-1/3">Metric / Property</th>
                    <th className="px-4 py-2">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 bg-neutral-50">
                  {keys.map(k => (
                    <tr key={k} className="hover:bg-neutral-100 text-[10px]">
                      <td className="px-4 py-1.5 font-bold text-neutral-600 bg-neutral-50 w-1/3">{k}</td>
                      <td className="px-4 py-1.5 text-neutral-800">
                        {typeof data[k] === 'object' && data[k] !== null ? (
                          <pre className="text-[9px] bg-neutral-50 p-2 rounded border border-neutral-200 overflow-auto max-h-40 text-neutral-700">
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
          <div className="mt-3 bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-md">
             {title && <div className="px-4 py-2 bg-neutral-50 border-b border-neutral-200 text-[9px] font-black uppercase text-neutral-550 tracking-[0.2em]">{title}</div>}
             {content}
             {showExportButtons && (
                 <div className="px-4 py-2.5 bg-neutral-50 border-t border-neutral-200 flex items-center gap-3">
                     <button
                        onClick={(e) => { e.stopPropagation(); downloadCSV(data); }}
                        className="text-[9px] font-bold bg-neutral-100 text-neutral-700 border border-neutral-200 px-2.5 py-1 rounded-lg hover:bg-neutral-200 hover:text-neutral-900 flex items-center gap-1 uppercase transition-all duration-200 cursor-pointer"
                     >
                        <Download className="w-3 h-3 text-neutral-600" /> Download CSV
                     </button>
                     <button
                        onClick={(e) => { e.stopPropagation(); downloadPDF(data); }}
                        className="text-[9px] font-bold bg-neutral-100 text-neutral-700 border border-neutral-200 px-2.5 py-1 rounded-lg hover:bg-neutral-200 hover:text-neutral-900 flex items-center gap-1 uppercase transition-all duration-200 cursor-pointer"
                     >
                        <FileText className="w-3 h-3 text-neutral-600" /> Convert PDF
                     </button>
                 </div>
             )}
          </div>
        );
    };

    if (!showConsole && logs.length === 0) return null

    return (
        <div 
            className={`fixed bottom-0 left-0 bg-white/85 backdrop-blur-xl border-t border-neutral-200 z-40 shadow-2xl transition-[height] text-neutral-900 ${!isResizing.current ? 'duration-300' : 'duration-0'}`} 
            style={{ 
                right: '420px', 
                height: isExpanded ? `${height}px` : '40px' 
            }}
        >
            {/* Resize Handle */}
            <div 
                onMouseDown={startResizing}
                className="absolute top-0 left-0 w-full h-1 cursor-ns-resize hover:bg-neutral-500/50 transition-colors z-50"
            />

            {/* Compact Toolbar */}
            <div className="flex items-center justify-between px-3 h-10 bg-neutral-100/40 border-b border-neutral-200 shrink-0 select-none">
                <div className="flex items-center gap-3">
                    <Terminal className="w-3.5 h-3.5 text-neutral-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-900 leading-none">Sequence Stream</span>
                    <div className="h-3 w-px bg-neutral-200 mx-1" />
                    <div className="flex bg-neutral-100 p-0.5 rounded-lg border border-neutral-200">
                        <button 
                        onClick={() => setViewMode('table')}
                        className={`p-1 rounded-md transition-all cursor-pointer ${viewMode === 'table' ? 'bg-white shadow-sm text-neutral-900 border border-neutral-300' : 'text-neutral-400 hover:text-neutral-900'}`}
                        title="Table View"
                        >
                        <TableIcon className="w-3.5 h-3.5" />
                        </button>
                        <button 
                        onClick={() => setViewMode('json')}
                        className={`p-1 rounded-md transition-all cursor-pointer ${viewMode === 'json' ? 'bg-white shadow-sm text-neutral-900 border border-neutral-300' : 'text-neutral-400 hover:text-neutral-900'}`}
                        title="JSON View"
                        >
                        <FileJson className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button onClick={handleCopy} className="p-1 px-2 hover:bg-neutral-100 rounded-md flex items-center gap-1.5 text-neutral-605 transition-colors cursor-pointer" title="Copy Logs">
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase overflow-hidden w-0 hover:w-auto transition-all">Copy</span>
                    </button>
                    <button onClick={() => dispatch(clearLogs())} className="p-1 px-2 hover:bg-neutral-100 rounded-md flex items-center gap-1.5 text-neutral-605 transition-colors cursor-pointer" title="Clear Console">
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase overflow-hidden w-0 hover:w-auto transition-all">Clear</span>
                    </button>
                    <div className="h-4 w-px bg-neutral-200 mx-1" />
                    <button onClick={() => dispatch(setShowConsole(false))} className="p-1.5 hover:bg-neutral-100 rounded-md text-neutral-500 transition-colors cursor-pointer">
                        <X className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 hover:bg-neutral-100 rounded-md text-neutral-805 transition-colors ml-1 cursor-pointer">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Data Stream */}
            <div className={`h-[calc(100%-40px)] overflow-auto bg-white font-mono ${!isExpanded && 'hidden'}`}>
                {viewMode === 'table' ? (
                <table className="w-full text-left text-[11px] border-collapse min-w-96">
                    <thead className="sticky top-0 bg-neutral-50 border-b border-neutral-200 z-10 text-neutral-600">
                    <tr>
                        <th className="px-5 py-2.5 font-bold uppercase w-32 tracking-wider">Timestamp</th>
                        <th className="px-5 py-2.5 font-bold uppercase w-24 tracking-wider">Level</th>
                        <th className="px-5 py-2.5 font-bold uppercase tracking-wider">Message</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                    {logs.map((log) => (
                        <React.Fragment key={log.id}>
                            <tr 
                                className={`transition-colors cursor-pointer ${expandedLogId === log.id ? 'bg-neutral-50' : 'hover:bg-neutral-100'}`}
                                onClick={() => log.data && setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                            >
                                <td className="px-5 py-2 text-neutral-500 border-r border-neutral-200">
                                    <div className="flex items-center gap-2">
                                        {log.data && (
                                            <div className={`w-1.5 h-1.5 rounded-full ${expandedLogId === log.id ? 'bg-neutral-900 animate-pulse' : 'bg-neutral-200'}`} />
                                        )}
                                        {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        <span className="text-[9px] opacity-40">.{new Date(log.timestamp).getMilliseconds()}</span>
                                    </div>
                                </td>
                                <td className="px-5 py-2 border-r border-neutral-200">
                                    <span className={`font-bold uppercase text-[9px] px-2 py-0.5 rounded-full leading-none ${
                                        log.type === 'error' ? 'bg-red-100 text-red-700 border border-red-200' : 
                                        log.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-neutral-100 text-neutral-700 border border-neutral-200'
                                    }`}>
                                        {log.type}
                                    </span>
                                </td>
                                <td className="px-5 py-2 font-medium text-neutral-900 break-all">
                                    <div className="flex items-center justify-between gap-4">
                                        <span>{log.message}</span>
                                        {log.data && (
                                            <button 
                                                className={`text-[9px] font-black uppercase px-2 py-1 rounded border transition-all cursor-pointer ${
                                                    expandedLogId === log.id 
                                                        ? 'bg-black border-black text-white shadow-sm' 
                                                        : 'bg-neutral-100 border-neutral-200 text-neutral-600 hover:text-neutral-900'
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
                                                className="text-[9px] font-bold text-neutral-500 hover:text-neutral-900 flex items-center gap-1.5 uppercase transition-colors cursor-pointer"
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
                                <td colSpan={3} className="px-4 py-12 text-center text-neutral-400 font-black uppercase tracking-[0.2em]">Stream Idle</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                ) : (
                    <div className="p-4 bg-neutral-50">
                        <pre className="text-[10px] text-neutral-700 leading-relaxed">
                            {JSON.stringify(logs, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    )
}

export default BottomOutputPanel
