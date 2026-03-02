"use client"

import React, { useState, useCallback } from 'react'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Textarea } from '@/app/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'

type InputNodeConfigProps = {
  nodeId?: string
  nodeData?: Record<string, unknown>
  onChange?: (data: Record<string, unknown>) => void
}

export function InputNodeConfig({ nodeId, nodeData, onChange }: InputNodeConfigProps) {
  const [label, setLabel] = useState(String(nodeData?.label || ''))
  const [inputType, setInputType] = useState(String(nodeData?.inputType || 'text'))
  const [defaultValue, setDefaultValue] = useState(String(nodeData?.defaultValue || ''))
  const [placeholder, setPlaceholder] = useState(String(nodeData?.placeholder || ''))
  const [required, setRequired] = useState(Boolean(nodeData?.required || false))
  const [validation, setValidation] = useState(String(nodeData?.validation || ''))
  const [description, setDescription] = useState(String(nodeData?.description || ''))

  const handleChange = useCallback(() => {
    onChange?.({
      label,
      inputType,
      defaultValue,
      placeholder,
      required,
      validation,
      description,
    })
  }, [label, inputType, defaultValue, placeholder, required, validation, description, onChange])

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg">
      <h3 className="font-semibold text-lg">Input Node Configuration</h3>

      <div>
        <Label htmlFor="label">Label</Label>
        <Input
          id="label"
          placeholder="Input label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="inputType">Input Type</Label>
        <Select value={inputType} onValueChange={setInputType}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select input type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="number">Number</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="password">Password</SelectItem>
            <SelectItem value="textarea">Text Area</SelectItem>
            <SelectItem value="select">Select</SelectItem>
            <SelectItem value="checkbox">Checkbox</SelectItem>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="file">File</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="defaultValue">Default Value</Label>
        <Input
          id="defaultValue"
          placeholder="Default value"
          value={defaultValue}
          onChange={(e) => setDefaultValue(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="placeholder">Placeholder</Label>
        <Input
          id="placeholder"
          placeholder="Placeholder text"
          value={placeholder}
          onChange={(e) => setPlaceholder(e.target.value)}
          className="mt-1"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="required"
          type="checkbox"
          checked={required}
          onChange={(e) => setRequired(e.target.checked)}
          className="w-4 h-4"
        />
        <Label htmlFor="required" className="mb-0">Required</Label>
      </div>

      <div>
        <Label htmlFor="validation">Validation Rule</Label>
        <Input
          id="validation"
          placeholder="e.g., /^[a-zA-Z]+$/ for letters only"
          value={validation}
          onChange={(e) => setValidation(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Help text for users..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1"
          rows={2}
        />
      </div>
    </div>
  )
}
