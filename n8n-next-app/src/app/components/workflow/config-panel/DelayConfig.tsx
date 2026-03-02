
"use client"
import React, { useState, useCallback } from 'react'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Button } from '@/app/components/ui/button'
import { useDispatch } from 'react-redux'
import { deleteNode } from '@/stores/FlowSlice'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import { Hourglass } from 'lucide-react'

type DelayConfigProps = {
  nodeId?: string
  nodeData?: Record<string, any>
  onChange?: (data: Record<string, any>) => void
}

export function DelayConfig({ nodeId, nodeData, onChange }: DelayConfigProps) {
  const dispatch = useDispatch()
  
  const [delay, setDelay] = useState(nodeData?.delay || 5)
  const [unit, setUnit] = useState(nodeData?.unit || 'minutes')

  const handleUpdate = (val: number, u: string) => {
    setDelay(val)
    setUnit(u)
    onChange?.({
      ...nodeData,
      delay: val,
      unit: u
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
           <div className="p-2 bg-amber-50 rounded-lg">
              <Hourglass className="w-5 h-5 text-amber-600" />
           </div>
           <h3 className="font-bold text-slate-800">Delay / Wait</h3>
        </div>
        <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleRemove}
        >
            Remove
        </Button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Duration</Label>
                <Input 
                    type="number"
                    value={delay}
                    onChange={(e) => handleUpdate(Number(e.target.value), unit)}
                    className="h-10 border-slate-200"
                />
            </div>
            <div className="grid gap-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unit</Label>
                <Select 
                    value={unit} 
                    onValueChange={(val) => handleUpdate(delay, val)}
                >
                    <SelectTrigger className="h-10">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="seconds">Seconds</SelectItem>
                        <SelectItem value="minutes">Minutes</SelectItem>
                        <SelectItem value="hours">Hours</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
            <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                Workflow execution will pause for <strong>{delay} {unit}</strong> before moving to the next node. 
                Keep in mind that very long delays might be subject to system timeouts in serverless environments.
            </p>
        </div>
      </div>

      <div className="pt-4 border-t">
        <Button
          onClick={() => onChange?.({ ...nodeData, delay, unit })}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 rounded-xl shadow-lg shadow-amber-100"
        >
          Set Delay
        </Button>
      </div>
    </div>
  )
}
