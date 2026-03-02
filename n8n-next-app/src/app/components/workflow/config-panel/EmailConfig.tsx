
"use client"
import React, { useState, useCallback } from 'react'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Button } from '@/app/components/ui/button'
import { useDispatch } from 'react-redux'
import { deleteNode } from '@/stores/FlowSlice'
import { Mail, ShieldCheck, Server } from 'lucide-react'
import { Checkbox } from '@/app/components/ui/checkbox'

type EmailConfigProps = {
  nodeId?: string
  nodeData?: Record<string, any>
  onChange?: (data: Record<string, any>) => void
}

export function EmailConfig({ nodeId, nodeData, onChange }: EmailConfigProps) {
  const dispatch = useDispatch()
  
  const [host, setHost] = useState(nodeData?.host || 'smtp.gmail.com')
  const [port, setPort] = useState(nodeData?.port || 465)
  const [user, setUser] = useState(nodeData?.auth?.user || '')
  const [pass, setPass] = useState(nodeData?.auth?.pass || '')
  const [from, setFrom] = useState(nodeData?.from || '')
  const [to, setTo] = useState(nodeData?.to || '')
  const [subject, setSubject] = useState(nodeData?.subject || '')
  const [body, setBody] = useState(nodeData?.body || '')
  const [isHtml, setIsHtml] = useState(nodeData?.isHtml || false)

  const handleUpdate = (updates: any) => {
    const newData = {
      ...nodeData,
      host, port, from, to, subject, body, isHtml,
      auth: { user, pass },
      ...updates
    }
    onChange?.(newData)
  }

  const handleRemove = useCallback(() => {
    if (nodeId && window.confirm('Are you sure you want to remove this node?')) {
      dispatch(deleteNode(nodeId))
    }
  }, [nodeId, dispatch])

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg overflow-y-auto max-h-[80vh]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
           <div className="p-2 bg-red-50 rounded-lg">
              <Mail className="w-5 h-5 text-red-600" />
           </div>
           <h3 className="font-bold text-slate-800">Email (SMTP)</h3>
        </div>
        <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRemove}
            className="text-red-500"
        >
            Remove
        </Button>
      </div>

      <div className="space-y-4">
        <div className="p-4 border rounded-xl bg-slate-50 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                <Server className="w-3.5 h-3.5" />
                SMTP Server
            </div>
            <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2 space-y-1.5">
                    <Label className="text-[10px]">Host</Label>
                    <Input value={host} onChange={(e) => { setHost(e.target.value); handleUpdate({ host: e.target.value }) }} className="h-8 text-xs" />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-[10px]">Port</Label>
                    <Input type="number" value={port} onChange={(e) => { setPort(Number(e.target.value)); handleUpdate({ port: Number(e.target.value) }) }} className="h-8 text-xs" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2 border-t pt-3">
                 <div className="space-y-1.5">
                    <Label className="text-[10px]">Username</Label>
                    <Input value={user} onChange={(e) => { setUser(e.target.value); handleUpdate({ auth: { user: e.target.value, pass } }) }} className="h-8 text-xs" />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-[10px]">Password</Label>
                    <Input type="password" value={pass} onChange={(e) => { setPass(e.target.value); handleUpdate({ auth: { user, pass: e.target.value } }) }} className="h-8 text-xs" />
                </div>
            </div>
        </div>

        <div className="space-y-4 border rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                <ShieldCheck className="w-3.5 h-3.5" />
                Message Content
            </div>
            <div className="space-y-3">
                <div className="grid gap-1.5">
                    <Label className="text-[10px]">From Address</Label>
                    <Input value={from} onChange={(e) => { setFrom(e.target.value); handleUpdate({ from: e.target.value }) }} placeholder="noreply@example.com" className="h-9 text-sm" />
                </div>
                <div className="grid gap-1.5">
                    <Label className="text-[10px]">Recipient (To)</Label>
                    <Input value={to} onChange={(e) => { setTo(e.target.value); handleUpdate({ to: e.target.value }) }} placeholder="customer@example.com" className="h-9 text-sm" />
                </div>
                <div className="grid gap-1.5">
                    <Label className="text-[10px]">Subject</Label>
                    <Input value={subject} onChange={(e) => { setSubject(e.target.value); handleUpdate({ subject: e.target.value }) }} placeholder="Hello from FlowX" className="h-9 text-sm" />
                </div>
                <div className="grid gap-1.5">
                    <div className="flex items-center justify-between">
                        <Label className="text-[10px]">Message Body</Label>
                        <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => { setIsHtml(!isHtml); handleUpdate({ isHtml: !isHtml }) }}>
                            <Checkbox checked={isHtml} className="w-3 h-3" />
                            <span className="text-[10px] text-slate-500">HTML Mode</span>
                        </div>
                    </div>
                    <textarea 
                        value={body} 
                        onChange={(e) => { setBody(e.target.value); handleUpdate({ body: e.target.value }) }} 
                        className="w-full min-h-[120px] p-3 text-sm border rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none transition-all"
                        placeholder="Type your message here... Use {{variable}} for dynamic data."
                    />
                </div>
            </div>
        </div>
      </div>

      <div className="pt-4 border-t">
        <Button
          onClick={() => onChange?.({ host, port, auth: { user, pass }, from, to, subject, body, isHtml })}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-xl"
        >
          Save Email Config
        </Button>
      </div>
    </div>
  )
}
