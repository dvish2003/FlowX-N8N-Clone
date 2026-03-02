"use client"

import React, { useState, useCallback, useEffect } from 'react'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { BrainCircuit } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'

type EmbeddingModelConfigProps = {
  nodeId?: string
  nodeData?: Record<string, unknown>
  onChange?: (data: Record<string, unknown>) => void
}

export function EmbeddingModelConfig({ nodeData, onChange }: EmbeddingModelConfigProps) {
  const [modelType, setModelType] = useState(String(nodeData?.modelType || 'openai'))
  const [modelName, setModelName] = useState(String(nodeData?.modelName || 'text-embedding-3-small'))
  const [apiKey, setApiKey] = useState(String(nodeData?.apiKey || ''))
  const [dimension, setDimension] = useState(String(nodeData?.dimension || '1536'))
  const [batchSize, setBatchSize] = useState(String(nodeData?.batchSize || '100'))
  const [normalization, setNormalization] = useState(String(nodeData?.normalization || 'none'))

  useEffect(() => {
    if (
      nodeData?.modelType !== modelType ||
      nodeData?.modelName !== modelName ||
      nodeData?.apiKey !== apiKey ||
      nodeData?.dimension !== dimension ||
      nodeData?.batchSize !== batchSize ||
      nodeData?.normalization !== normalization
    ) {
      onChange?.({
        ...nodeData,
        modelType,
        modelName,
        apiKey,
        dimension,
        batchSize,
        normalization,
      })
    }
  }, [modelType, modelName, apiKey, dimension, batchSize, normalization, onChange, nodeData])

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-5 py-5 border-b border-slate-100 bg-slate-50">
        <h3 className="font-black text-slate-800 flex items-center gap-3 text-base uppercase tracking-tight">
          <span className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200">
             <BrainCircuit className="w-5 h-5" />
          </span>
          Embedding Unit
        </h3>
        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest leading-none">Vector Space Generator</p>
      </div>

      <div className="p-5 space-y-6 overflow-y-auto font-medium">
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Model Provider</Label>
          <Select value={modelType} onValueChange={setModelType}>
            <SelectTrigger className="h-11 border-slate-200 rounded-xl font-bold text-xs uppercase">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-slate-200">
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="huggingface">Hugging Face</SelectItem>
              <SelectItem value="cohere">Cohere</SelectItem>
              <SelectItem value="local">Local</SelectItem>
              <SelectItem value="together">Together AI</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Model Selection</Label>
          <Select value={modelName} onValueChange={setModelName}>
            <SelectTrigger className="h-11 border-slate-200 rounded-xl font-bold text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-slate-200">
              {modelType === 'openai' && (
                <>
                  <SelectItem value="text-embedding-3-small">text-embedding-3-small</SelectItem>
                  <SelectItem value="text-embedding-3-large">text-embedding-3-large</SelectItem>
                  <SelectItem value="text-embedding-ada-002">text-embedding-ada-002</SelectItem>
                </>
              )}
              {modelType === 'huggingface' && (
                <>
                  <SelectItem value="BAAI/bge-small-en-v1.5">BAAI/bge-small-en-v1.5</SelectItem>
                  <SelectItem value="BAAI/bge-base-en-v1.5">BAAI/bge-base-en-v1.5</SelectItem>
                  <SelectItem value="sentence-transformers/all-MiniLM-L6-v2">all-MiniLM-L6-v2</SelectItem>
                </>
              )}
              {modelType === 'cohere' && (
                <>
                  <SelectItem value="embed-english-v3.0">embed-english-v3.0</SelectItem>
                  <SelectItem value="embed-english-light-v3.0">embed-english-light-v3.0</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center justify-between">
             API Key
             <span className="text-[8px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">Encrypted</span>
          </Label>
          <Input
            placeholder="sk-••••••••••••"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="h-11 bg-slate-50 border-slate-200 rounded-xl font-bold text-xs"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Dimension</Label>
            <Input
              type="number"
              placeholder="1536"
              value={dimension}
              onChange={(e) => setDimension(e.target.value)}
              className="h-11 bg-slate-50 border-slate-200 rounded-xl font-bold text-xs"
            />
          </div>
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Batch Size</Label>
            <Input
              type="number"
              placeholder="100"
              value={batchSize}
              onChange={(e) => setBatchSize(e.target.value)}
              className="h-11 bg-slate-50 border-slate-200 rounded-xl font-bold text-xs"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Normalization</Label>
          <Select value={normalization} onValueChange={setNormalization}>
            <SelectTrigger className="h-11 border-slate-200 rounded-xl font-bold text-xs uppercase">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-slate-200">
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="l2">L2</SelectItem>
              <SelectItem value="cosine">Cosine</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
