
"use client"
import React, { useState, useCallback } from 'react'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Button } from '@/app/components/ui/button'
import { useDispatch } from 'react-redux'
import { deleteNode } from '@/stores/FlowSlice'
import { ArrowRightLeft, Plus, Trash2, Zap } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'

type DataFormatterConfigProps = {
  nodeId?: string
  nodeData?: Record<string, any>
  onChange?: (data: Record<string, any>) => void
}

export function DataFormatterConfig({ nodeId, nodeData, onChange }: DataFormatterConfigProps) {
  const dispatch = useDispatch()
  
  const [mode, setMode] = useState(nodeData?.mode || 'map')
  const [mappings, setMappings] = useState<any[]>(nodeData?.mappings || [{ from: '', to: '' }])

  const handleUpdate = (m: string, maps: any[]) => {
    setMode(m)
    setMappings(maps)
    onChange?.({
      ...nodeData,
      mode: m,
      mappings: maps
    })
  }

  const addMapping = () => {
    handleUpdate(mode, [...mappings, { from: '', to: '' }])
  }

  const removeMapping = (index: number) => {
    handleUpdate(mode, mappings.filter((_, i) => i !== index))
  }

  const handleMappingChange = (index: number, field: string, value: string) => {
    const newMappings = [...mappings]
    newMappings[index] = { ...newMappings[index], [field]: value }
    handleUpdate(mode, newMappings)
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
           <div className="p-2 bg-indigo-50 rounded-lg">
              <ArrowRightLeft className="w-5 h-5 text-indigo-600" />
           </div>
           <h3 className="font-bold text-slate-800">Data Formatter</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={handleRemove} className="text-red-500">Remove</Button>
      </div>

      <div className="space-y-5">
        <div className="grid gap-2">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Formatting Mode</Label>
            <Select value={mode} onValueChange={(val) => handleUpdate(val, mappings)}>
                <SelectTrigger className="h-10 border-slate-200">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="map">Map Data (Remap Fields)</SelectItem>
                    <SelectItem value="rename">Rename Keys</SelectItem>
                    <SelectItem value="add">Add New Fields</SelectItem>
                    <SelectItem value="filter">Filter Fields (Keep Only These)</SelectItem>
                </SelectContent>
            </Select>
        </div>

        <div className="space-y-3">
          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Field Mappings</Label>
          
          {mappings.map((mapping, index) => (
            <div key={index} className="flex gap-2 items-center group">
                <div className="flex-1 grid grid-cols-[1fr,auto,1fr] items-center gap-2">
                    <Input 
                        placeholder="Source Key" 
                        value={mapping.from}
                        onChange={(e) => handleMappingChange(index, 'from', e.target.value)}
                        className="h-9 text-xs font-mono"
                    />
                    <ArrowRightLeft className="w-3 h-3 text-slate-300" />
                    <Input 
                        placeholder="Target Key" 
                        value={mapping.to}
                        onChange={(e) => handleMappingChange(index, 'to', e.target.value)}
                        className="h-9 text-xs font-mono"
                    />
                </div>
                <button 
                    onClick={() => removeMapping(index)}
                    className="p-1.5 text-slate-300 hover:text-red-500 transition-colors shrink-0"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
          ))}

          <Button 
            onClick={addMapping}
            variant="outline"
            className="w-full border-dashed py-6 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50"
          >
             <Plus className="w-4 h-4 mr-2" />
             Add New Field
          </Button>
        </div>

        <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-start gap-3">
            <Zap className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-indigo-700 leading-relaxed font-medium">
                Example: <code>full_name</code> → <code>user.profile.name</code>. Use dot notation for nested objects.
            </p>
        </div>
      </div>

      <div className="pt-4 border-t">
        <Button
          onClick={() => onChange?.({ mode, mappings })}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
        >
          Apply Transformation
        </Button>
      </div>
    </div>
  )
}
