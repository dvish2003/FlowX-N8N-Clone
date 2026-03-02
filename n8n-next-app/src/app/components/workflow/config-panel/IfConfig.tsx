
"use client"
import React, { useState, useCallback } from 'react'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Button } from '@/app/components/ui/button'
import { useDispatch } from 'react-redux'
import { deleteNode } from '@/stores/FlowSlice'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import { Plus, Trash2, GitBranch } from 'lucide-react'

type IfConfigProps = {
  nodeId?: string
  nodeData?: Record<string, any>
  onChange?: (data: Record<string, any>) => void
}

export function IfConfig({ nodeId, nodeData, onChange }: IfConfigProps) {
  const dispatch = useDispatch()
  
  const [conditions, setConditions] = useState<any[]>(nodeData?.conditions || [{ variable: '', operator: 'equal', value: '' }])
  const [combineOperation, setCombineOperation] = useState(nodeData?.combineOperation || 'AND')

  const updateConditions = (newConditions: any[]) => {
    setConditions(newConditions)
    onChange?.({
      ...nodeData,
      conditions: newConditions,
      combineOperation
    })
  }

  const addCondition = () => {
    updateConditions([...conditions, { variable: '', operator: 'equal', value: '' }])
  }

  const removeCondition = (index: number) => {
    const newConditions = conditions.filter((_, i) => i !== index)
    updateConditions(newConditions)
  }

  const handleConditionChange = (index: number, field: string, value: string) => {
    const newConditions = [...conditions]
    newConditions[index] = { ...newConditions[index], [field]: value }
    updateConditions(newConditions)
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
           <div className="p-2 bg-blue-50 rounded-lg">
              <GitBranch className="w-5 h-5 text-blue-600" />
           </div>
           <h3 className="font-bold text-slate-800">IF / Condition</h3>
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
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Conditions</Label>
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
             <button 
                onClick={() => { setCombineOperation('AND'); onChange?.({ ...nodeData, conditions, combineOperation: 'AND' }) }}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${combineOperation === 'AND' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
             >
                AND
             </button>
             <button 
                onClick={() => { setCombineOperation('OR'); onChange?.({ ...nodeData, conditions, combineOperation: 'OR' }) }}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${combineOperation === 'OR' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
             >
                OR
             </button>
          </div>
        </div>

        {conditions.map((condition, index) => (
          <div key={index} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3 relative group">
             {conditions.length > 1 && (
               <button 
                  onClick={() => removeCondition(index)}
                  className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
               >
                  <Trash2 className="w-3.5 h-3.5" />
               </button>
             )}
             
             <div className="grid gap-2">
                <Label className="text-[10px] font-semibold text-slate-400">Variable</Label>
                <Input 
                   placeholder="e.g. data.status" 
                   value={condition.variable}
                   onChange={(e) => handleConditionChange(index, 'variable', e.target.value)}
                   className="h-9 text-sm"
                />
             </div>

             <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-2">
                   <Label className="text-[10px] font-semibold text-slate-400">Operator</Label>
                   <Select 
                      value={condition.operator} 
                      onValueChange={(val) => handleConditionChange(index, 'operator', val)}
                   >
                      <SelectTrigger className="h-9 text-sm">
                         <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                         <SelectItem value="equal">Equals</SelectItem>
                         <SelectItem value="notEqual">Not Equals</SelectItem>
                         <SelectItem value="contains">Contains</SelectItem>
                         <SelectItem value="greater">Greater Than</SelectItem>
                         <SelectItem value="less">Less Than</SelectItem>
                         <SelectItem value="exists">Exists</SelectItem>
                      </SelectContent>
                   </Select>
                </div>
                <div className="grid gap-2">
                   <Label className="text-[10px] font-semibold text-slate-400">Value</Label>
                   <Input 
                      placeholder="Value" 
                      value={condition.value}
                      onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
                      className="h-9 text-sm"
                   />
                </div>
             </div>
          </div>
        ))}

        <Button 
          onClick={addCondition}
          variant="outline"
          className="w-full border-dashed border-2 py-6 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all"
        >
           <Plus className="w-4 h-4 mr-2" />
           Add Condition
        </Button>
      </div>

      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
         <p className="text-[10px] text-blue-700 leading-relaxed font-medium">
            <strong>Rule:</strong> If {combineOperation === 'AND' ? 'all' : 'any'} conditions are met, the workflow continues through the <strong>TRUE</strong> output. Otherwise, it follows the <strong>FALSE</strong> output.
         </p>
      </div>

      <div className="pt-4 border-t">
        <Button
          onClick={() => onChange?.({ ...nodeData, conditions, combineOperation })}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl shadow-lg shadow-blue-200 transition-all transform active:scale-[0.98]"
        >
          Save Logic
        </Button>
      </div>
    </div>
  )
}
