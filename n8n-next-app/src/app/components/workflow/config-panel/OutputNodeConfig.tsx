"use client"

import React, { useState, useCallback } from 'react'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Textarea } from '@/app/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'

type OutputNodeConfigProps = {
  nodeId?: string
  nodeData?: Record<string, unknown>
  onChange?: (data: Record<string, unknown>) => void
}

export function OutputNodeConfig({ nodeId, nodeData, onChange }: OutputNodeConfigProps) {
  const [label, setLabel] = useState(String(nodeData?.label || ''))
  const [outputFormat, setOutputFormat] = useState(String(nodeData?.outputFormat || 'json'))
  const [dataType, setDataType] = useState(String(nodeData?.dataType || 'any'))
  const [description, setDescription] = useState(String(nodeData?.description || ''))
  const [exportable, setExportable] = useState(Boolean(nodeData?.exportable || true))
  const [exportFormats, setExportFormats] = useState(String(nodeData?.exportFormats || 'json,csv'))

  const handleChange = useCallback(() => {
    onChange?.({
      label,
      outputFormat,
      dataType,
      description,
      exportable,
      exportFormats,
    })
  }, [label, outputFormat, dataType, description, exportable, exportFormats, onChange])

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg">
      <h3 className="font-semibold text-lg">Output Node Configuration</h3>

      <div>
        <Label htmlFor="label">Label</Label>
        <Input
          id="label"
          placeholder="Output label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="outputFormat">Output Format</Label>
        <Select value={outputFormat} onValueChange={setOutputFormat}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="json">JSON</SelectItem>
            <SelectItem value="csv">CSV</SelectItem>
            <SelectItem value="xml">XML</SelectItem>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="html">HTML</SelectItem>
            <SelectItem value="markdown">Markdown</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="dataType">Data Type</Label>
        <Select value={dataType} onValueChange={setDataType}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select data type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            <SelectItem value="string">String</SelectItem>
            <SelectItem value="number">Number</SelectItem>
            <SelectItem value="boolean">Boolean</SelectItem>
            <SelectItem value="array">Array</SelectItem>
            <SelectItem value="object">Object</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe the output..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1"
          rows={2}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="exportable"
          type="checkbox"
          checked={exportable}
          onChange={(e) => setExportable(e.target.checked)}
          className="w-4 h-4"
        />
        <Label htmlFor="exportable" className="mb-0">Exportable</Label>
      </div>

      <div>
        <Label htmlFor="exportFormats">Export Formats</Label>
        <Input
          id="exportFormats"
          placeholder="json,csv,xml"
          value={exportFormats}
          onChange={(e) => setExportFormats(e.target.value)}
          className="mt-1"
        />
      </div>
    </div>
  )
}
