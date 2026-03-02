
"use client"
import React, { useState, useCallback } from 'react'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Button } from '@/app/components/ui/button'
import { useDispatch } from 'react-redux'
import { deleteNode } from '@/stores/FlowSlice'
import { Repeat, ListChecks, Info } from 'lucide-react'

type LoopConfigProps = {
  nodeId?: string
  nodeData?: Record<string, any>
  onChange?: (data: Record<string, any>) => void
}

export function LoopConfig({ nodeId, nodeData, onChange }: LoopConfigProps) {
  const dispatch = useDispatch()
  
  const [arrayPath, setArrayPath] = useState(nodeData?.arrayPath || 'items')

  const handleUpdate = (path: string) => {
    setArrayPath(path)
    onChange?.({
      ...nodeData,
      arrayPath: path
    })
  }

  const handleRemove = useCallback(() => {
    if (nodeId && window.confirm('Are you sure you want to remove this node?')) {
      dispatch(deleteNode(nodeId))
    }
  }, [nodeId, dispatch])

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
           <div className="p-2 bg-orange-50 rounded-lg">
              <Repeat className="w-5 h-5 text-orange-600" />
           </div>
           <h3 className="font-bold text-slate-800">Loop / For Each</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={handleRemove} className="text-red-500">Remove</Button>
      </div>

      <div className="space-y-5">
        <div className="grid gap-2">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <ListChecks className="w-3.5 h-3.5" />
                Array Target
            </Label>
            <Input 
                placeholder="e.g. data.users or items" 
                value={arrayPath}
                onChange={(e) => handleUpdate(e.target.value)}
                className="h-10 border-slate-200 font-mono text-sm"
            />
            <p className="text-[10px] text-slate-400">Specify the path to the array you want to iterate over.</p>
        </div>

        <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-orange-700 font-bold text-[10px] uppercase">
                <Info className="w-3.5 h-3.5" />
                Loop Mechanism
            </div>
            <p className="text-[11px] text-orange-800 leading-relaxed font-medium">
                The nodes connected to the <strong>LOOP</strong> handle will execute once for each item in the array. 
                After all items are processed, the workflow continues from the <strong>DONE</strong> handle.
            </p>
        </div>

        <div className="space-y-2">
            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Output Variables (Per Item)</Label>
            <div className="grid gap-1.5">
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border text-[10px]">
                    <span className="font-mono text-slate-600">$item</span>
                    <span className="text-slate-400 italic">The current element being processed</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border text-[10px]">
                    <span className="font-mono text-slate-600">$index</span>
                    <span className="text-slate-400 italic">The current iteration index (0-based)</span>
                </div>
            </div>
        </div>
      </div>

      <div className="pt-4 border-t">
        <Button
          onClick={() => onChange?.({ arrayPath })}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-100 transition-all active:scale-[0.98]"
        >
          Initialize Loop
        </Button>
      </div>
    </div>
  )
}
