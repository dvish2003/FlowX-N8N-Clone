"use client"

import React, { useState, useCallback } from 'react'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Textarea } from '@/app/components/ui/textarea'
import { Button } from '@/app/components/ui/button'
import { useDispatch } from 'react-redux'
import { deleteNode } from '@/stores/FlowSlice'

type GmailConfigProps = {
  nodeId?: string
  nodeData?: Record<string, unknown>
  onChange?: (data: Record<string, unknown>) => void
}

export function GmailConfig({ nodeId, nodeData, onChange }: GmailConfigProps) {
  const dispatch = useDispatch()
  const [email, setEmail] = useState(String(nodeData?.email || ''))
  const [subject, setSubject] = useState(String(nodeData?.subject || ''))
  const [body, setBody] = useState(String(nodeData?.body || ''))
  const [recipients, setRecipients] = useState(String(nodeData?.recipients || ''))
  const [attachments, setAttachments] = useState(String(nodeData?.attachments || ''))
  const [isTrigger, setIsTrigger] = useState(Boolean(nodeData?.isTrigger || false))

  const handleSave = useCallback(() => {
    onChange?.({
      email,
      subject,
      body,
      recipients,
      attachments,
      isTrigger,
    })
  }, [email, subject, body, recipients, attachments, isTrigger, onChange])

  const handleRemove = useCallback(() => {
    if (nodeId && window.confirm('Are you sure you want to remove this node?')) {
      dispatch(deleteNode(nodeId))
    }
  }, [nodeId, dispatch])

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg">
      <h3 className="font-semibold text-lg">Gmail Configuration</h3>
      
      <div>
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="recipients">Recipients</Label>
        <Input
          id="recipients"
          placeholder="recipient1@example.com, recipient2@example.com"
          value={recipients}
          onChange={(e) => setRecipients(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          placeholder="Email subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="body">Message Body</Label>
        <Textarea
          id="body"
          placeholder="Email content"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="mt-1"
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="attachments">Attachments</Label>
        <Input
          id="attachments"
          placeholder="file1.pdf, file2.docx"
          value={attachments}
          onChange={(e) => setAttachments(e.target.value)}
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
