"use client"

import React, { useState, useCallback } from 'react'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Textarea } from '@/app/components/ui/textarea'
import { Button } from '@/app/components/ui/button'
import { useDispatch } from 'react-redux'
import { deleteNode } from '@/stores/FlowSlice'

type SlackConfigProps = {
  nodeId?: string
  nodeData?: Record<string, unknown>
  onChange?: (data: Record<string, unknown>) => void
}

export function SlackConfig({ nodeId, nodeData, onChange }: SlackConfigProps) {
  const dispatch = useDispatch()
  const [workspace, setWorkspace] = useState(String(nodeData?.workspace || ''))
  const [channel, setChannel] = useState(String(nodeData?.channel || ''))
  const [webhookUrl, setWebhookUrl] = useState(String(nodeData?.webhookUrl || ''))
  const [messageTemplate, setMessageTemplate] = useState(String(nodeData?.messageTemplate || ''))
  const [mentionUsers, setMentionUsers] = useState(String(nodeData?.mentionUsers || ''))
  const [threadId, setThreadId] = useState(String(nodeData?.threadId || ''))
  const [isTrigger, setIsTrigger] = useState(Boolean(nodeData?.isTrigger || false))

  const handleSave = useCallback(() => {
    onChange?.({
      workspace,
      channel,
      webhookUrl,
      messageTemplate,
      mentionUsers,
      threadId,
      isTrigger,
    })
  }, [workspace, channel, webhookUrl, messageTemplate, mentionUsers, threadId, isTrigger, onChange])

  const handleRemove = useCallback(() => {
    if (nodeId && window.confirm('Are you sure you want to remove this node?')) {
      dispatch(deleteNode(nodeId))
    }
  }, [nodeId, dispatch])

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg">
      <h3 className="font-semibold text-lg">Slack Configuration</h3>

      <div>
        <Label htmlFor="workspace">Workspace</Label>
        <Input
          id="workspace"
          placeholder="workspace-name"
          value={workspace}
          onChange={(e) => setWorkspace(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="channel">Channel</Label>
        <Input
          id="channel"
          placeholder="#channel-name"
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="webhookUrl">Webhook URL</Label>
        <Input
          id="webhookUrl"
          placeholder="https://hooks.slack.com/..."
          type="password"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="messageTemplate">Message Template</Label>
        <Textarea
          id="messageTemplate"
          placeholder="Hi {{name}}, your message here..."
          value={messageTemplate}
          onChange={(e) => setMessageTemplate(e.target.value)}
          className="mt-1"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="mentionUsers">Mention Users</Label>
        <Input
          id="mentionUsers"
          placeholder="@user1 @user2"
          value={mentionUsers}
          onChange={(e) => setMentionUsers(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="threadId">Thread ID (Optional)</Label>
        <Input
          id="threadId"
          placeholder="Message timestamp for threading"
          value={threadId}
          onChange={(e) => setThreadId(e.target.value)}
          className="mt-1"
        />
      </div>

      <div className="border-t pt-4 mt-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isTrigger"
            checked={isTrigger}
            onChange={(e) => setIsTrigger(e.target.checked)}
            className="w-4 h-4 cursor-pointer"
          />
          <Label htmlFor="isTrigger" className="cursor-pointer font-normal">
            This is a Trigger Event
          </Label>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {isTrigger ? '🔄 Trigger Event' : '⚙️ Performs Action'}
        </p>
      </div>

      <div className="flex gap-2 mt-4 pt-4 border-t">
        <Button
          onClick={handleSave}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg"
        >
          Save Configuration
        </Button>
        <Button
          onClick={handleRemove}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg"
        >
          Remove Node
        </Button>
      </div>
    </div>
  )
}
