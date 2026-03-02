"use client"

import React, { useState, useCallback } from 'react'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Textarea } from '@/app/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'

type SubAgentConfigProps = {
  nodeId?: string
  nodeData?: Record<string, unknown>
  onChange?: (data: Record<string, unknown>) => void
}

export function SubAgentConfig({ nodeId, nodeData, onChange }: SubAgentConfigProps) {
  const [parentAgent, setParentAgent] = useState(String(nodeData?.parentAgent || ''))
  const [subAgentName, setSubAgentName] = useState(String(nodeData?.subAgentName || ''))
  const [responsibility, setResponsibility] = useState(String(nodeData?.responsibility || ''))
  const [tools, setTools] = useState(String(nodeData?.tools || ''))
  const [communicationProtocol, setCommunicationProtocol] = useState(String(nodeData?.communicationProtocol || 'http'))
  const [dataSharing, setDataSharing] = useState(String(nodeData?.dataSharing || 'enabled'))

  const handleChange = useCallback(() => {
    onChange?.({
      parentAgent,
      subAgentName,
      responsibility,
      tools,
      communicationProtocol,
      dataSharing,
    })
  }, [parentAgent, subAgentName, responsibility, tools, communicationProtocol, dataSharing, onChange])

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg">
      <h3 className="font-semibold text-lg">Sub-Agent Configuration</h3>

      <div>
        <Label htmlFor="parentAgent">Parent Agent</Label>
        <Input
          id="parentAgent"
          placeholder="Parent agent ID"
          value={parentAgent}
          onChange={(e) => setParentAgent(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="subAgentName">Sub-Agent Name</Label>
        <Input
          id="subAgentName"
          placeholder="Sub-agent name"
          value={subAgentName}
          onChange={(e) => setSubAgentName(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="responsibility">Responsibility</Label>
        <Textarea
          id="responsibility"
          placeholder="What is this sub-agent responsible for?"
          value={responsibility}
          onChange={(e) => setResponsibility(e.target.value)}
          className="mt-1"
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="tools">Tools (comma-separated)</Label>
        <Input
          id="tools"
          placeholder="tool1, tool2, tool3"
          value={tools}
          onChange={(e) => setTools(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="communicationProtocol">Communication Protocol</Label>
        <Select value={communicationProtocol} onValueChange={setCommunicationProtocol}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select protocol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="http">HTTP</SelectItem>
            <SelectItem value="websocket">WebSocket</SelectItem>
            <SelectItem value="grpc">gRPC</SelectItem>
            <SelectItem value="queue">Message Queue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="dataSharing">Data Sharing</Label>
        <Select value={dataSharing} onValueChange={setDataSharing}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select data sharing" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="enabled">Enabled</SelectItem>
            <SelectItem value="disabled">Disabled</SelectItem>
            <SelectItem value="restricted">Restricted</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
