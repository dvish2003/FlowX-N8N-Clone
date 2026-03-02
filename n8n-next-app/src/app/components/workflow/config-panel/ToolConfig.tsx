"use client"

import React, { useState, useCallback } from 'react'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Textarea } from '@/app/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'

type ToolConfigProps = {
  nodeId?: string
  nodeData?: Record<string, unknown>
  onChange?: (data: Record<string, unknown>) => void
}

export function ToolConfig({ nodeId, nodeData, onChange }: ToolConfigProps) {
  const [toolName, setToolName] = useState(String(nodeData?.toolName || ''))
  const [toolType, setToolType] = useState(String(nodeData?.toolType || 'api'))
  const [description, setDescription] = useState(String(nodeData?.description || ''))
  const [endpoint, setEndpoint] = useState(String(nodeData?.endpoint || ''))
  const [method, setMethod] = useState(String(nodeData?.method || 'GET'))
  const [parameters, setParameters] = useState(String(nodeData?.parameters || ''))
  const [requiredAuth, setRequiredAuth] = useState(Boolean(nodeData?.requiredAuth || false))

  const handleChange = useCallback(() => {
    onChange?.({
      toolName,
      toolType,
      description,
      endpoint,
      method,
      parameters,
      requiredAuth,
    })
  }, [toolName, toolType, description, endpoint, method, parameters, requiredAuth, onChange])

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg">
      <h3 className="font-semibold text-lg">Tool Configuration</h3>

      <div>
        <Label htmlFor="toolName">Tool Name</Label>
        <Input
          id="toolName"
          placeholder="Tool name"
          value={toolName}
          onChange={(e) => setToolName(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="toolType">Tool Type</Label>
        <Select value={toolType} onValueChange={setToolType}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select tool type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="api">API</SelectItem>
            <SelectItem value="function">Function</SelectItem>
            <SelectItem value="webhook">Webhook</SelectItem>
            <SelectItem value="database">Database</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe what this tool does..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1"
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="endpoint">Endpoint</Label>
        <Input
          id="endpoint"
          placeholder="https://api.example.com/endpoint"
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="method">HTTP Method</Label>
        <Select value={method} onValueChange={setMethod}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
            <SelectItem value="PATCH">PATCH</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="parameters">Parameters (JSON)</Label>
        <Textarea
          id="parameters"
          placeholder='{"param1": "value1", "param2": "value2"}'
          value={parameters}
          onChange={(e) => setParameters(e.target.value)}
          className="mt-1"
          rows={2}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="requiredAuth"
          type="checkbox"
          checked={requiredAuth}
          onChange={(e) => setRequiredAuth(e.target.checked)}
          className="w-4 h-4"
        />
        <Label htmlFor="requiredAuth" className="mb-0">Requires Authentication</Label>
      </div>
    </div>
  )
}
