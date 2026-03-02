"use client"

import React, { useState, useEffect } from 'react'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { MessageSquare, Zap, Plus } from 'lucide-react'
import Image from 'next/image'

type ChatTriggerConfigProps = {
  nodeId?: string
  nodeData?: Record<string, unknown>
  onChange?: (data: Record<string, unknown>) => void
}

export function ChatTriggerConfig({ nodeId, nodeData, onChange }: ChatTriggerConfigProps) {
  const [label, setLabel] = useState(String(nodeData?.label || 'Chat Trigger'))
  const [icon, setIcon] = useState(String(nodeData?.icon || '/icons/chatbot.png'))

  useEffect(() => {
    if (nodeData?.label !== label || nodeData?.icon !== icon) {
      onChange?.({
        ...nodeData,
        label,
        icon
      })
    }
  }, [label, icon, onChange, nodeData])

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-5 py-5 border-b border-slate-100 bg-slate-50">
        <h3 className="font-black text-slate-800 flex items-center gap-3 text-base uppercase tracking-tight">
          <span className="p-2 bg-[var(--primary)] text-white rounded-xl shadow-lg shadow-blue-200">
            <MessageSquare className="w-5 h-5" />
          </span>
          Chat Trigger
        </h3>
        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest leading-none">Inbound Event Listener</p>
      </div>

      <div className="p-5 space-y-6 overflow-y-auto font-medium">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
           <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-3 shadow-sm relative group cursor-pointer">
              <Image src={icon} alt="Icon" width={40} height={40} className="object-contain" />
              <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <Plus className="w-5 h-5 text-white" />
              </div>
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

        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-500 fill-current" />
            <span className="text-[11px] font-black text-blue-700 uppercase tracking-tight">Real-time Activation</span>
          </div>
          <p className="text-[10px] text-blue-600/80 leading-relaxed font-semibold">
            This unit monitors connected chat interfaces. When a message is received, it triggers the downstream neural sequence.
          </p>
        </div>
      </div>
    </div>
  )
}
