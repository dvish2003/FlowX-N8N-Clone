
"use client"
import React, { useState, useCallback } from 'react'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Button } from '@/app/components/ui/button'
import { useDispatch } from 'react-redux'
import { deleteNode } from '@/stores/FlowSlice'
import { Webhook, Copy, Check } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'

type WebhookConfigProps = {
  nodeId?: string
  nodeData?: Record<string, any>
  onChange?: (data: Record<string, any>) => void
}

export function WebhookConfig({ nodeId, nodeData, onChange }: WebhookConfigProps) {
  const dispatch = useDispatch()
  const [copied, setCopied] = useState(false)
  
  const [webhookPath, setWebhookPath] = useState(nodeData?.webhookPath || `w-${Math.random().toString(36).substring(7)}`)
  const [method, setMethod] = useState(nodeData?.method || 'POST')
  const [responseMode, setResponseMode] = useState(nodeData?.responseMode || 'onReceived')

  const handleUpdate = (updates: any) => {
    onChange?.({
      ...nodeData,
      webhookPath, method, responseMode,
      ...updates
    })
  }

  const copyUrl = () => {
    const url = `${window.location.origin}/api/webhooks/${webhookPath}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
           <div className="p-2 bg-emerald-50 rounded-lg">
              <Webhook className="w-5 h-5 text-emerald-600" />
           </div>
           <h3 className="font-bold text-slate-800">Webhook Trigger</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={handleRemove} className="text-red-500">Remove</Button>
      </div>

      <div className="space-y-5">
        <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-3">
            <Label className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Active Endpoint</Label>
            <div className="flex gap-2">
                <div className="flex-1 bg-white border border-emerald-200 rounded-lg px-3 py-2 text-xs font-mono truncate text-slate-600">
                    {typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/${webhookPath}` : `/api/webhooks/${webhookPath}`}
                </div>
                <Button size="icon" variant="outline" onClick={copyUrl} className="shrink-0 h-9 w-9 border-emerald-200 text-emerald-600 hover:bg-emerald-50">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
            </div>
        </div>

        <div className="grid gap-4">
            <div className="grid gap-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Path Selector</Label>
                <div className="flex gap-2">
                    <div className="bg-slate-100 flex items-center px-3 rounded-l-lg text-[11px] font-bold text-slate-400 border-r">/api/webhooks/</div>
                    <Input 
                        value={webhookPath}
                        onChange={(e) => { setWebhookPath(e.target.value); handleUpdate({ webhookPath: e.target.value }) }}
                        className="flex-1 h-10 rounded-l-none border-slate-200"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">HTTP Method</Label>
                    <Select value={method} onValueChange={(val) => { setMethod(val); handleUpdate({ method: val }) }}>
                        <SelectTrigger className="h-10 border-slate-200">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="GET">GET</SelectItem>
                            <SelectItem value="POST">POST</SelectItem>
                            <SelectItem value="PUT">PUT</SelectItem>
                            <SelectItem value="PATCH">PATCH</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Response</Label>
                    <Select value={responseMode} onValueChange={(val) => { setResponseMode(val); handleUpdate({ responseMode: val }) }}>
                        <SelectTrigger className="h-10 border-slate-200">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="onReceived">Immediate 200 OK</SelectItem>
                            <SelectItem value="lastNode">Last Node Output</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-[10px] text-slate-500 leading-relaxed">
                Send data to the URL above to trigger this workflow. The incoming JSON body will be available as the input for the next node.
            </p>
        </div>
      </div>

      <div className="pt-4 border-t">
        <Button
          onClick={() => onChange?.({ webhookPath, method, responseMode })}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-100 transition-all active:scale-[0.98]"
        >
          Save Webhook
        </Button>
      </div>
    </div>
  )
}
