import React from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from './button'
import { Input } from './input'

interface KeyValuePair {
  id: string
  key: string
  value: string
}

interface KeyValueEditorProps {
  items: KeyValuePair[]
  onChange: (items: KeyValuePair[]) => void
  title?: string
  addButtonLabel?: string
}

export function KeyValueEditor({ 
  items, 
  onChange, 
  title = 'Items', 
  addButtonLabel = 'Add Item' 
}: KeyValueEditorProps) {
  
  const handleAdd = () => {
    onChange([...items, { id: Math.random().toString(36).substr(2, 9), key: '', value: '' }])
  }

  const handleRemove = (id: string) => {
    onChange(items.filter(item => item.id !== id))
  }

  const handleChange = (id: string, field: 'key' | 'value', value: string) => {
    onChange(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-200">{title}</label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          className="h-7 text-xs bg-slate-700/50 border-slate-600 hover:bg-slate-700 hover:text-white"
        >
          <Plus className="w-3 h-3 mr-1" />
          {addButtonLabel}
        </Button>
      </div>

      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2 text-center border border-dashed border-slate-700 rounded-md">
            No items defined
          </p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex gap-2 items-center">
              <Input
                placeholder="Key"
                value={item.key}
                onChange={(e) => handleChange(item.id, 'key', e.target.value)}
                className="h-8 text-xs bg-slate-700/50 border-slate-600/50 text-slate-100 placeholder-slate-500"
              />
              <Input
                placeholder="Value"
                value={item.value}
                onChange={(e) => handleChange(item.id, 'value', e.target.value)}
                className="h-8 text-xs bg-slate-700/50 border-slate-600/50 text-slate-100 placeholder-slate-500"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(item.id)}
                className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-slate-700/50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
