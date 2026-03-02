
"use client"
import React, { useState, useCallback } from 'react'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Button } from '@/app/components/ui/button'
import { useDispatch } from 'react-redux'
import { deleteNode } from '@/stores/FlowSlice'
import { AlertTriangle, RefreshCcw, Bell } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'

type ErrorHandlerConfigProps = {
  nodeId?: string
  nodeData?: Record<string, any>
  onChange?: (data: Record<string, any>) => void
}

export function ErrorHandlerConfig({ nodeId, nodeData, onChange }: ErrorHandlerConfigProps) {
  const dispatch = useDispatch()
  
  const [onFailure, setOnFailure] = useState(nodeData?.onFailure || 'retry')
  const [maxRetries, setMaxRetries] = useState(nodeData?.maxRetries || 3)

  const handleUpdate = (policy: string, retries: number) => {
    setOnFailure(policy)
    setMaxRetries(retries)
    onChange?.({
      ...nodeData,
      onFailure: policy,
      maxRetries: retries
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
           <div className="p-2 bg-pink-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-pink-600" />
           </div>
           <h3 className="font-bold text-slate-800">Error Handler</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={handleRemove} className="text-red-500">Remove</Button>
      </div>

      <div className="space-y-5">
        <div className="grid gap-2">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <RefreshCcw className="w-3.5 h-3.5" />
                Error Policy
            </Label>
            <Select value={onFailure} onValueChange={(val) => handleUpdate(val, maxRetries)}>
                <SelectTrigger className="h-10 border-slate-200">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="retry">Retry Execution</SelectItem>
                    <SelectItem value="stop">Stop Workflow Entirely</SelectItem>
                    <SelectItem value="continue">Ignore & Continue</SelectItem>
                    <SelectItem value="callback">Trigger Error Branch</SelectItem>
                </SelectContent>
            </Select>
        </div>

        {onFailure === 'retry' && (
            <div className="grid gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Max Retries</Label>
                <Input 
                    type="number"
                    value={maxRetries}
                    onChange={(e) => handleUpdate(onFailure, Number(e.target.value))}
                    className="h-10 border-slate-200"
                />
            </div>
        )}

        <div className="p-4 bg-pink-50 border border-pink-100 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-pink-700 font-bold text-[10px] uppercase">
                <Bell className="w-3.5 h-3.5" />
                Global Protection
            </div>
            <p className="text-[11px] text-pink-800 leading-relaxed font-medium">
                This node acts as a safety net. It will capture errors from any node and execute the defined policy to ensure system stability.
            </p>
        </div>

        <div className="bg-slate-50 p-4 border rounded-xl">
             <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-3">Error Payload</h4>
             <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-600">
                    <span>error.message</span>
                    <span className="text-slate-400">Human readable error</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-600">
                    <span>error.nodeId</span>
                    <span className="text-slate-400">Node that failed</span>
                </div>
             </div>
        </div>
      </div>

      <div className="pt-4 border-t">
        <Button
          onClick={() => onChange?.({ onFailure, maxRetries })}
          className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-pink-100 transition-all active:scale-[0.98]"
        >
          Secure Workflow
        </Button>
      </div>
    </div>
  )
}
