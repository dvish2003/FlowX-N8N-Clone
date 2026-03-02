
"use client"
import React, { useState, useCallback } from 'react'
import { Label } from '@/app/components/ui/label'
import { Button } from '@/app/components/ui/button'
import { useDispatch } from 'react-redux'
import { deleteNode } from '@/stores/FlowSlice'
import { Code, Terminal, Save, Play } from 'lucide-react'

type CodeConfigProps = {
  nodeId?: string
  nodeData?: Record<string, any>
  onChange?: (data: Record<string, any>) => void
}

export function CodeConfig({ nodeId, nodeData, onChange }: CodeConfigProps) {
  const dispatch = useDispatch()
  
  const [code, setCode] = useState(nodeData?.code || '// Example: return { ...input, timestamp: Date.now() };\n\nreturn input;')

  const handleSave = () => {
    onChange?.({
      ...nodeData,
      code
    })
  }

  const handleRemove = useCallback(() => {
    if (nodeId && window.confirm('Are you sure you want to remove this node?')) {
      dispatch(deleteNode(nodeId))
    }
  }, [nodeId, dispatch])

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
           <div className="p-2 bg-slate-900 rounded-lg">
              <Code className="w-5 h-5 text-green-400" />
           </div>
           <h3 className="font-bold text-slate-800">Code / Function</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={handleRemove} className="text-red-500">Remove</Button>
      </div>

      <div className="flex-1 flex flex-col space-y-4">
        <div className="flex items-center justify-between">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3 h-3" />
                JavaScript Editor
            </Label>
            <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">Input: JSON</span>
            </div>
        </div>

        <div className="flex-1 min-h-[400px] border-2 border-slate-900 rounded-xl overflow-hidden relative shadow-2xl">
            <div className="absolute top-0 right-0 p-2 z-10">
                <div className="px-2 py-1 rounded bg-slate-800 text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    ES6+ Support
                </div>
            </div>
            <textarea 
                value={code} 
                onChange={(e) => setCode(e.target.value)} 
                className="w-full h-full p-6 text-sm font-mono bg-slate-900 text-slate-300 focus:outline-none resize-none leading-relaxed"
                spellCheck={false}
            />
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      async/await
                   </div>
                   <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                      axios
                   </div>
                </div>
                <Button size="sm" className="h-7 text-[10px] bg-green-500 hover:bg-green-600 text-slate-900 font-bold px-3">
                    <Play className="w-3 h-3 mr-1.5 fill-current" />
                    Test Code
                </Button>
            </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Available Variables</h4>
            <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                    <code className="px-1.5 py-0.5 rounded bg-white border text-[10px] text-blue-600 font-bold">input</code>
                    <span className="text-[10px] text-slate-400">Previous node data</span>
                </div>
                <div className="flex items-center gap-2">
                    <code className="px-1.5 py-0.5 rounded bg-white border text-[10px] text-blue-600 font-bold">env</code>
                    <span className="text-[10px] text-slate-400">Environment vars</span>
                </div>
            </div>
        </div>
      </div>

      <div className="pt-4 border-t">
        <Button
          onClick={handleSave}
          className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          Deploy Function
        </Button>
      </div>
    </div>
  )
}
