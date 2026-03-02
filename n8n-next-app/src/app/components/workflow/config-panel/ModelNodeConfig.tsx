"use client"

import React, { useState, useCallback, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { BrainCircuit, Sparkles, Zap, Cpu, KeyRound, Settings2 } from 'lucide-react'

type ModelNodeConfigProps = {
  nodeId?: string
  nodeData?: Record<string, unknown>
  onChange?: (data: Record<string, unknown>) => void
}

const MODELS = [
  { id: 'gpt-4o', name: 'OpenAI GPT-4o', icon: '/icons/openai-icon.svg' },
  { id: 'gemini-1.5-pro', name: 'Google Gemini 1.5 Pro', icon: '/icons/gemini.png' },
  { id: 'deepseek-coder', name: 'DeepSeek Coder V2', icon: '/icons/deepseek-icon.svg' },
  { id: 'mistral-large', name: 'Mistral Large', icon: '/icons/mistral-ai-icon.svg' },
  { id: 'qwen-max', name: 'Qwen Max', icon: '/icons/qwen-icon.svg' },
  { id: 'llama3-70b-8192', name: 'Groq Llama 3 70B', icon: '/icons/meta_nnmll6.webp' },
]

export function ModelNodeConfig({ nodeData, onChange }: ModelNodeConfigProps) {
  const [model, setModel] = useState(String(nodeData?.model || (nodeData?.label === 'Google Gemini' ? 'gemini-1.5-pro' : nodeData?.label === 'DeepSeek' ? 'deepseek-coder' : nodeData?.label === 'Mistral AI' ? 'mistral-large' : nodeData?.label === 'Qwen' ? 'qwen-max' : 'gpt-4o')))
  const [temperature, setTemperature] = useState(Number(nodeData?.temperature || 0.7))
  const [apiKey, setApiKey] = useState(String(nodeData?.apiKey || ''))
  const [customModel, setCustomModel] = useState(String(nodeData?.customModel || ''))

  const isCustom = model === 'custom'

  useEffect(() => {
    // Only update if values actually changed to avoid infinite loop
    const selectedModel = MODELS.find(m => m.id === model)
    const newLabel = isCustom ? customModel || 'Custom AI' : selectedModel?.name || nodeData?.label
    const newIcon = isCustom ? '/icons/brain.png' : selectedModel?.icon || nodeData?.icon

    if (
      nodeData?.model !== model || 
      nodeData?.temperature !== temperature ||
      nodeData?.apiKey !== apiKey ||
      nodeData?.customModel !== customModel ||
      nodeData?.label !== newLabel ||
      nodeData?.icon !== newIcon
    ) {
      onChange?.({
        ...nodeData,
        model,
        temperature,
        apiKey,
        customModel,
        label: newLabel,
        icon: newIcon
      })
    }
  }, [model, temperature, apiKey, customModel, onChange, nodeData, isCustom])

  return (
    <div className="flex flex-col h-full bg-white border-l border-neutral-200">
      <div className="px-4 py-4 border-b border-neutral-200 bg-white backdrop-blur-sm">
        <h3 className="font-bold text-neutral-900 flex items-center gap-2 text-base">
          <span className="p-1.5 bg-neutral-900 text-neutral-50 rounded">
            <BrainCircuit className="w-4 h-4" />
          </span>
          LLM Engine
        </h3>
        <p className="text-xs text-neutral-500 mt-1">Configure neural processing parameters</p>
      </div>

      <div className="p-4 space-y-6 overflow-y-auto font-medium">
        <div className="space-y-3">
          <Label className="text-neutral-900 font-semibold flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-neutral-400" /> AI Foundation Model
          </Label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger className="border-neutral-200  text-neutral-900 dark:text-neutral-200 h-11 font-bold shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-neutral-200  text-neutral-900 dark:text-neutral-200">
              {MODELS.map(m => (
                <SelectItem key={m.id} value={m.id} className="font-medium">{m.name}</SelectItem>
              ))}
              <SelectItem value="custom" className="font-bold text-blue-600">Manual Configuration</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4 p-4 rounded-xl bg-blue-50/50 border border-blue-100 animate-in slide-in-from-top-2 duration-300">
           {isCustom && (
             <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-blue-600 tracking-widest flex items-center gap-2">
                  <Settings2 className="w-3.5 h-3.5" /> Model ID
                </Label>
                <Input 
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  placeholder="e.g. llama3-70b-v1"
                  className="h-10 bg-white border-blue-200 font-bold text-xs"
                />
             </div>
           )}
           <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-blue-600 tracking-widest flex items-center gap-2">
                <KeyRound className="w-3.5 h-3.5" /> {isCustom ? 'Custom API Key' : `${MODELS.find(m => m.id === model)?.name || 'AI'} API Key`}
              </Label>
              <Input 
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-••••••••••••"
                className="h-10 bg-white border-blue-200 font-bold text-xs"
              />
              <p className="text-[9px] text-blue-400 font-bold leading-tight">
                Authentication required for secure neural link. Key is stored locally in this project session.
              </p>
           </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-neutral-900 font-semibold flex items-center gap-2">
               <Zap className="w-3.5 h-3.5 text-neutral-400" /> Creativity Index
            </Label>
            <span className="text-[10px] font-black bg-white px-2 py-0.5 rounded border border-white">
               {temperature.toFixed(1)}
            </span>
          </div>
          <input 
            type="range" 
            min="0" max="1" step="0.1" 
            value={temperature}
            onChange={e => setTemperature(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-white rounded-lg appearance-none cursor-pointer accent-black"
          />
          <div className="flex justify-between text-[8px] font-bold text-neutral-400 uppercase tracking-widest px-1">
             <span>Precise</span>
             <span>Balanced</span>
             <span>Creative</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-neutral-100 bg-neutral-50  flex items-start gap-3">
           <Cpu className="w-5 h-5 text-neutral-300 mt-1" />
           <div>
              <p className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">Processing Node ID</p>
              <p className="text-[10px] font-mono text-neutral-400 break-all">{String(nodeData?.id || 'UNASSIGNED')}</p>
              <div className="mt-2 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                 <span className="text-[8px] font-black text-neutral-400 uppercase">Neural Link Established</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
