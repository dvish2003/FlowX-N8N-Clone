
"use client"
import React, { useState, useCallback } from 'react'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Button } from '@/app/components/ui/button'
import { useDispatch } from 'react-redux'
import { deleteNode } from '@/stores/FlowSlice'
import { Plus, Trash2, Split } from 'lucide-react'

type SwitchConfigProps = {
  nodeId?: string
  nodeData?: Record<string, any>
  onChange?: (data: Record<string, any>) => void
}

export function SwitchConfig({ nodeId, nodeData, onChange }: SwitchConfigProps) {
  const dispatch = useDispatch()
  
  const [variable, setVariable] = useState(nodeData?.variable || '')
  const [cases, setCases] = useState<any[]>(nodeData?.cases || [
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
  ])

  const updateCases = (newCases: any[]) => {
    setCases(newCases)
    onChange?.({
      ...nodeData,
      variable,
      cases: newCases
    })
  }

  const addCase = () => {
    updateCases([...cases, { value: '', label: '' }])
  }

  const removeCase = (index: number) => {
    const newCases = cases.filter((_, i) => i !== index)
    updateCases(newCases)
  }

  const handleCaseChange = (index: number, field: string, value: string) => {
    const newCases = [...cases]
    newCases[index] = { ...newCases[index], [field]: value }
    updateCases(newCases)
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
           <div className="p-2 bg-purple-50 rounded-lg">
              <Split className="w-5 h-5 text-purple-600" />
           </div>
           <h3 className="font-bold text-slate-800">Switch</h3>
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
        <div className="grid gap-2">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Input Variable</Label>
            <Input 
                placeholder="e.g. data.status" 
                value={variable}
                onChange={(e) => {
                    setVariable(e.target.value)
                    onChange?.({ ...nodeData, variable: e.target.value, cases })
                }}
                className="h-10 text-sm font-semibold border-slate-200"
            />
        </div>

        <div className="space-y-3">
          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Output Paths</Label>
          
          {cases.map((path, index) => (
            <div key={index} className="flex gap-2 items-start group">
                <div className="flex-1 grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="grid gap-1.5">
                        <Label className="text-[10px] text-slate-400">Match Value</Label>
                        <Input 
                            placeholder="Value" 
                            value={path.value}
                            onChange={(e) => handleCaseChange(index, 'value', e.target.value)}
                            className="h-8 text-xs bg-white"
                        />
                    </div>
                    <div className="grid gap-1.5">
                        <Label className="text-[10px] text-slate-400">Handle Label</Label>
                        <Input 
                            placeholder="Label" 
                            value={path.label}
                            onChange={(e) => handleCaseChange(index, 'label', e.target.value)}
                            className="h-8 text-xs bg-white"
                        />
                    </div>
                </div>
                <button 
                    onClick={() => removeCase(index)}
                    className="mt-4 p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
          ))}

          <Button 
            onClick={addCase}
            variant="outline"
            size="sm"
            className="w-full border-dashed py-5 text-slate-500 hover:text-purple-600 hover:border-purple-200 hover:bg-purple-50"
          >
             <Plus className="w-4 h-4 mr-2" />
             Add Path
          </Button>
        </div>
      </div>

      <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
         <p className="text-[10px] text-purple-700 leading-relaxed">
            The switch node evaluate the input variable and routes the workflow through the first matching path.
         </p>
      </div>

      <div className="pt-4 border-t">
        <Button
          onClick={() => onChange?.({ ...nodeData, variable, cases })}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-xl"
        >
          Update Router
        </Button>
      </div>
    </div>
  )
}
