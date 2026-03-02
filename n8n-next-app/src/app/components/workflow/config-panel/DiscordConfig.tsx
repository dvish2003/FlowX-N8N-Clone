"use client"

import React, { useState, useCallback } from 'react'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Textarea } from '@/app/components/ui/textarea'
import { Button } from '@/app/components/ui/button'
import { useDispatch } from 'react-redux'
import { deleteNode } from '@/stores/FlowSlice'

type DiscordConfigProps = {
  nodeId?: string
  nodeData?: Record<string, unknown>
  onChange?: (data: Record<string, unknown>) => void
}

export function DiscordConfig({ nodeId, nodeData, onChange }: DiscordConfigProps) {
  const dispatch = useDispatch()
  const [server, setServer] = useState(String(nodeData?.server || ''))
  const [channel, setChannel] = useState(String(nodeData?.channel || ''))
  const [webhookUrl, setWebhookUrl] = useState(String(nodeData?.webhookUrl || ''))
  const [messageContent, setMessageContent] = useState(String(nodeData?.messageContent || ''))
  const [embedColor, setEmbedColor] = useState(String(nodeData?.embedColor || '#0099ff'))
  const [mentionRole, setMentionRole] = useState(String(nodeData?.mentionRole || ''))
  const [isTrigger, setIsTrigger] = useState(Boolean(nodeData?.isTrigger || false))

  const handleSave = useCallback(() => {
    onChange?.({
      server,
      channel,
      webhookUrl,
      messageContent,
      embedColor,
      mentionRole,
      isTrigger,
    })
  }, [server, channel, webhookUrl, messageContent, embedColor, mentionRole, isTrigger, onChange])

  const handleRemove = useCallback(() => {
    if (nodeId && window.confirm('Are you sure you want to remove this node?')) {
      dispatch(deleteNode(nodeId))
    }
  }, [nodeId, dispatch])

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg">
      <h3 className="font-semibold text-lg">Discord Configuration</h3>

      <div>
        <Label htmlFor="server">Server</Label>
        <Input
          id="server"
          placeholder="Server name"
          value={server}
          onChange={(e) => setServer(e.target.value)}
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
          placeholder="https://discordapp.com/api/webhooks/..."
          type="password"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="messageContent">Message Content</Label>
        <Textarea
          id="messageContent"
          placeholder="Your message here..."
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          className="mt-1"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="embedColor">Embed Color</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="embedColor"
            type="color"
            value={embedColor}
            onChange={(e) => setEmbedColor(e.target.value)}
            className="w-12 h-10"
          />
          <Input
            type="text"
            placeholder="#0099ff"
            value={embedColor}
            onChange={(e) => setEmbedColor(e.target.value)}
            className="flex-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="mentionRole">Mention Role</Label>
        <Input
          id="mentionRole"
          placeholder="@role-name"
          value={mentionRole}
          onChange={(e) => setMentionRole(e.target.value)}
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
