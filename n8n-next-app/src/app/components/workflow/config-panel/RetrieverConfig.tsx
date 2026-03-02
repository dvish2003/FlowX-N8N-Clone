"use client"

import React, { useState, useEffect } from 'react'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Search, FileText, Plus, Zap } from 'lucide-react'
import Image from 'next/image'

type RetrieverConfigProps = {
  nodeId?: string
  nodeData?: Record<string, unknown>
  onChange?: (data: Record<string, unknown>) => void
}

export function RetrieverConfig({ nodeId, nodeData, onChange }: RetrieverConfigProps) {
  const [label, setLabel] = useState(String(nodeData?.label || 'Retriever'))
  const [fileName, setFileName] = useState(String(nodeData?.fileName || ''))
  const [icon, setIcon] = useState(String(nodeData?.icon || '/icons/retriever.png'))

  useEffect(() => {
    if (nodeData?.label !== label || nodeData?.fileName !== fileName || nodeData?.icon !== icon) {
      onChange?.({
        ...nodeData,
        label,
        fileName,
        icon
      })
    }
  }, [label, fileName, icon, onChange, nodeData])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setFileName(file.name)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-5 py-5 border-b border-slate-100 bg-slate-50">
        <h3 className="font-black text-slate-800 flex items-center gap-3 text-base uppercase tracking-tight">
          <span className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200">
            <Search className="w-5 h-5" />
          </span>
          Retriever
        </h3>
        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest leading-none">Semantic Search Engine</p>
      </div>

      <div className="p-5 space-y-6 overflow-y-auto font-medium">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
           <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-3 shadow-sm">
              <Image src={icon} alt="Icon" width={40} height={40} className="object-contain" />
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

        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
            <FileText className="w-3.5 h-3.5" /> Source Document
          </Label>
          <div className="relative">
             <Input 
                type="file" 
                accept=".pdf"
                onChange={handleFileChange}
                className="h-11 bg-slate-50 border-slate-200 rounded-xl font-bold text-xs cursor-pointer file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-all"
             />
          </div>
          {fileName && (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-100 rounded-lg">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
               <p className="text-[10px] font-bold text-green-700 truncate">{fileName}</p>
            </div>
          )}
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-slate-400 fill-current" />
            <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight">Context Expansion</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            This unit expands the agent's knowledge base by retrieving relevant segments from the uploaded document using semantic embeddings.
          </p>
        </div>
      </div>
    </div>
  )
}
