"use client"

import React, { useState, useEffect } from 'react'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Textarea } from '@/app/components/ui/textarea'
import { Bot, Target, BookOpen, Zap } from 'lucide-react'

type AgentConfigProps = {
  nodeId?: string
  nodeData?: Record<string, unknown>
  onChange?: (data: Record<string, unknown>) => void
}

export function AgentConfig({ nodeId, nodeData, onChange }: AgentConfigProps) {
  const [agentName, setAgentName] = useState(String(nodeData?.agentName || nodeData?.name || ''))
  const [task, setTask] = useState(String(nodeData?.task || ''))
  const [instruction, setInstruction] = useState(String(nodeData?.instruction || nodeData?.systemPrompt || ''))

  useEffect(() => {
    // Only update if values actually changed to avoid infinite loop
    if (
      nodeData?.agentName !== agentName ||
      nodeData?.task !== task ||
      nodeData?.instruction !== instruction
    ) {
      onChange?.({
        ...nodeData,
        agentName,
        name: agentName,
        task,
        instruction,
        systemPrompt: instruction,
      })
    }
  }, [agentName, task, instruction, onChange, nodeData])

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-5 py-5 border-b border-slate-100 bg-slate-50">
        <h3 className="font-black text-slate-800 flex items-center gap-3 text-base uppercase tracking-tight">
          <span className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200">
            <Bot className="w-5 h-5" />
          </span>
          AI Agent Unit
        </h3>
        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest leading-none">Decision Engine Core</p>
      </div>

      <div className="p-5 space-y-6 overflow-y-auto font-medium">
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
            <Bot className="w-3.5 h-3.5" /> Unit Designation
          </Label>
          <Input
            placeholder="e.g. Research Assistant"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            className="h-11 bg-slate-50 border-slate-200 rounded-xl font-bold text-xs"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
            <Target className="w-3.5 h-3.5" /> Operational Objective
          </Label>
          <Textarea
            placeholder="Define the primary mission..."
            value={task}
            onChange={(e) => setTask(e.target.value)}
            className="bg-slate-50 border-slate-200 rounded-xl font-bold text-xs min-h-[80px]"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5" /> Introduction / Core Instructions
          </Label>
          <Textarea
            placeholder="System behavior and constraints..."
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            className="bg-slate-50 border-slate-200 rounded-xl font-bold text-xs min-h-[120px]"
          />
        </div>

        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center gap-3">
          <Zap className="w-5 h-5 text-indigo-400 fill-current" />
          <p className="text-[10px] text-indigo-600 leading-relaxed font-semibold">
            This unit operates as an autonomous agent using the connected LLM and tools to achieve its target task.
          </p>
        </div>
      </div>
    </div>
  )
}
