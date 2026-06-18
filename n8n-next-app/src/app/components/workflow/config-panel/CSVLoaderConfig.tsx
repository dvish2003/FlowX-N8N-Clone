"use client"

import React, { useState, useEffect } from 'react'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Switch } from '@/app/components/ui/switch'
import { FileSpreadsheet, Plus, HelpCircle, Check, FileText } from 'lucide-react'
import Image from 'next/image'

type CSVLoaderConfigProps = {
  nodeId?: string
  nodeData?: Record<string, any>
  onChange?: (data: Record<string, any>) => void
}

export function CSVLoaderConfig({ nodeId, nodeData, onChange }: CSVLoaderConfigProps) {
  const [label, setLabel] = useState(nodeData?.label || 'CSV Loader')
  const [fileName, setFileName] = useState(nodeData?.fileName || '')
  const [csvData, setCsvData] = useState(nodeData?.csvData || '')
  const [loadData, setLoadData] = useState(nodeData?.loadData !== false)
  const [preview, setPreview] = useState<string[][]>([])

  useEffect(() => {
    onChange?.({
      ...nodeData,
      label,
      fileName,
      csvData,
      loadData,
    })
  }, [label, fileName, csvData, loadData])

  // Parse CSV helper for visual preview
  useEffect(() => {
    if (csvData) {
      const lines = csvData.split('\n').filter((l: string) => l.trim() !== '')
      const parsed = lines.slice(0, 5).map((line: string) => {
        // Simple comma split (ignoring quotes for preview simplicity)
        return line.split(',').map((cell: string) => cell.replace(/^["']|["']$/g, '').trim())
      })
      setPreview(parsed)
    } else {
      setPreview([])
    }
  }, [csvData])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        setCsvData(text || '')
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-5 py-5 border-b border-slate-100 bg-slate-50">
        <h3 className="font-black text-slate-800 flex items-center gap-3 text-base uppercase tracking-tight">
          <span className="p-2 bg-green-600 text-white rounded-xl shadow-lg shadow-green-200">
            <FileSpreadsheet className="w-5 h-5" />
          </span>
          CSV Loader
        </h3>
        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest leading-none">Import Structured CSV Datasets</p>
      </div>

      <div className="p-5 space-y-6 overflow-y-auto font-medium">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
           <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-3 shadow-sm shrink-0">
              <Image src="/icons/sheet.png" alt="CSV Loader" width={40} height={40} className="object-contain" />
           </div>
           <div className="flex-1">
              <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-2">Display Label</Label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="h-10 bg-white border-slate-200 rounded-xl font-bold text-xs"
              />
           </div>
        </div>

        {/* Load Data Switch */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="space-y-1">
            <Label className="text-[11px] font-black uppercase text-slate-700 tracking-tight">Active Load State</Label>
            <p className="text-[10px] text-slate-400">Load records during execution</p>
          </div>
          <Switch checked={loadData} onCheckedChange={setLoadData} />
        </div>

        {/* File Upload */}
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
            Upload CSV File
          </Label>
          <Input 
            type="file" 
            accept=".csv"
            onChange={handleFileUpload}
            className="h-11 bg-slate-50 border-slate-200 rounded-xl font-bold text-xs cursor-pointer file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-green-600 file:text-white hover:file:bg-green-700 transition-all"
          />
          {fileName && (
            <div className="flex items-center justify-between px-3 py-2 bg-green-50 border border-green-100 rounded-lg">
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                 <p className="text-[10px] font-bold text-green-700 truncate max-w-[200px]">{fileName}</p>
               </div>
               <span className="text-[8px] font-black bg-green-600 text-white px-2 py-0.5 rounded uppercase">Loaded</span>
            </div>
          )}
        </div>

        {/* Raw Text Fallback Area */}
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
            Or Paste CSV Content
          </Label>
          <textarea
            value={csvData}
            onChange={(e) => setCsvData(e.target.value)}
            placeholder="name,email,role&#10;Alice,alice@example.com,Admin&#10;Bob,bob@example.com,User"
            className="w-full h-32 p-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/5 transition-all text-slate-800 placeholder:text-slate-300"
          />
        </div>

        {/* Visual Preview */}
        {preview.length > 0 && (
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block">
              Dataset Preview (First 5 Rows)
            </Label>
            <div className="border border-slate-200 rounded-xl overflow-hidden text-[10px] font-bold">
              <div className="bg-slate-50 border-b border-slate-200 p-2 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400">
                      {preview[0]?.map((head, i) => (
                        <th key={i} className="pb-1.5 pr-4 font-black">{head}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-slate-600">
                    {preview.slice(1).map((row, rIdx) => (
                      <tr key={rIdx} className="border-b border-slate-100 last:border-0">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="py-1.5 pr-4 font-mono">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
