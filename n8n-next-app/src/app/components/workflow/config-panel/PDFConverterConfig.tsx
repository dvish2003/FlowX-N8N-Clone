"use client"

import React, { useState, useEffect } from 'react'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { FileText, ArrowRightLeft, Settings, HelpCircle, Check, Info } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import Image from 'next/image'

type PDFConverterConfigProps = {
  nodeId?: string
  nodeData?: Record<string, any>
  onChange?: (data: Record<string, any>) => void
}

export function PDFConverterConfig({ nodeId, nodeData, onChange }: PDFConverterConfigProps) {
  const [label, setLabel] = useState(nodeData?.label || 'PDF Converter')
  const [fileName, setFileName] = useState(nodeData?.fileName || '')
  const [outputFormat, setOutputFormat] = useState(nodeData?.outputFormat || 'csv')

  useEffect(() => {
    onChange?.({
      ...nodeData,
      label,
      fileName,
      outputFormat,
    })
  }, [label, fileName, outputFormat])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-5 py-5 border-b border-slate-100 bg-slate-50">
        <h3 className="font-black text-slate-800 flex items-center gap-3 text-base uppercase tracking-tight">
          <span className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200">
            <FileText className="w-5 h-5" />
          </span>
          PDF Converter
        </h3>
        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest leading-none">Convert PDF Documents to Tables</p>
      </div>

      <div className="p-5 space-y-6 overflow-y-auto font-medium">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
           <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-3 shadow-sm shrink-0">
              <Image src="/icons/retriever.png" alt="PDF Converter" width={40} height={40} className="object-contain" />
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

        {/* Output Format Select */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
            <ArrowRightLeft className="w-3.5 h-3.5" /> Output Format
          </Label>
          <Select value={outputFormat} onValueChange={setOutputFormat}>
            <SelectTrigger className="h-11 border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-bold text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv" className="font-bold text-xs">CSV (Comma Separated Values)</SelectItem>
              <SelectItem value="excel" className="font-bold text-xs">Excel Document (.xlsx)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* PDF File Upload */}
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
            Upload Source PDF
          </Label>
          <Input 
            type="file" 
            accept=".pdf"
            onChange={handleFileUpload}
            className="h-11 bg-slate-50 border-slate-200 rounded-xl font-bold text-xs cursor-pointer file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-all"
          />
          {fileName && (
            <div className="flex items-center justify-between px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg">
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                 <p className="text-[10px] font-bold text-blue-700 truncate max-w-[200px]">{fileName}</p>
               </div>
               <span className="text-[8px] font-black bg-blue-600 text-white px-2 py-0.5 rounded uppercase">Selected</span>
            </div>
          )}
        </div>

        {/* Informational Box */}
        <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="text-[11px] font-black text-indigo-700 uppercase tracking-tight">Parser Engine</span>
          </div>
          <p className="text-[10px] text-indigo-600 leading-relaxed font-semibold">
            During execution, the conversion process extracts tables and plaintext fields from your PDF, formatting them into structured {outputFormat.toUpperCase()} columns.
          </p>
        </div>
      </div>
    </div>
  )
}
