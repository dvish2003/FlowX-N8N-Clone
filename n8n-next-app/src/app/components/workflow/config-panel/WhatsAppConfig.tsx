
"use client"
import React, { useState, useCallback } from 'react'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Button } from '@/app/components/ui/button'
import { useDispatch } from 'react-redux'
import { deleteNode } from '@/stores/FlowSlice'
import { MessageCircle, MessageSquare, Phone } from 'lucide-react'

type WhatsAppConfigProps = {
  nodeId?: string
  nodeData?: Record<string, any>
  onChange?: (data: Record<string, any>) => void
}

export function WhatsAppConfig({ nodeId, nodeData, onChange }: WhatsAppConfigProps) {
  const dispatch = useDispatch()
  
  const [accessToken, setAccessToken] = useState(nodeData?.accessToken || '')
  const [phoneNumberId, setPhoneNumberId] = useState(nodeData?.phoneNumberId || '')
  const [recipientPhone, setRecipientPhone] = useState(nodeData?.recipientPhone || '')
  const [message, setMessage] = useState(nodeData?.message || '')

  const handleUpdate = (token: string, phoneId: string, recipient: string, msg: string) => {
    setAccessToken(token)
    setPhoneNumberId(phoneId)
    setRecipientPhone(recipient)
    setMessage(msg)
    onChange?.({
      ...nodeData,
      accessToken: token,
      phoneNumberId: phoneId,
      recipientPhone: recipient,
      message: msg
    })
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
           <div className="p-2 bg-green-50 rounded-lg">
              <MessageCircle className="w-5 h-5 text-green-600" />
           </div>
           <h3 className="font-bold text-slate-800">WhatsApp Notification</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={handleRemove} className="text-red-500">Remove</Button>
      </div>

      <div className="space-y-5">
        <div className="grid gap-2">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Access Token</Label>
            <Input 
                type="password"
                placeholder="EAAG..." 
                value={accessToken}
                onChange={(e) => handleUpdate(e.target.value, phoneNumberId, recipientPhone, message)}
                className="h-10 border-slate-200"
            />
            <p className="text-[10px] text-slate-400">Meta Apps Permanent Access Token.</p>
        </div>

        <div className="grid gap-2">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number ID</Label>
            <Input 
                placeholder="e.g. 106..." 
                value={phoneNumberId}
                onChange={(e) => handleUpdate(accessToken, e.target.value, recipientPhone, message)}
                className="h-10 border-slate-200"
            />
            <p className="text-[10px] text-slate-400">Found in WhatsApp Cloud API settings.</p>
        </div>

        <div className="grid gap-2">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recipient Phone</Label>
            <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                    placeholder="e.g. 94771234567" 
                    value={recipientPhone}
                    onChange={(e) => handleUpdate(accessToken, phoneNumberId, e.target.value, message)}
                    className="h-10 pl-9 border-slate-200"
                />
            </div>
            <p className="text-[10px] text-slate-400">Include country code without +.</p>
        </div>

        <div className="grid gap-2">
            <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Message</Label>
                <div className="flex items-center gap-1 text-green-600">
                    <MessageSquare className="w-3 h-3" />
                    <span className="text-[10px] font-bold">Dynamic Data Supported</span>
                </div>
            </div>
            <textarea 
                value={message} 
                onChange={(e) => handleUpdate(accessToken, phoneNumberId, recipientPhone, e.target.value)} 
                className="w-full min-h-[150px] p-3 text-sm border-2 rounded-xl focus:ring-4 focus:ring-green-50 focus:border-green-400 outline-none transition-all border-slate-100"
                placeholder="🚀 Workflow Completed!\n\nUser: {{data.user.name}}\nAction: {{data.action}}"
            />
        </div>
      </div>

      <div className="pt-4 border-t">
        <Button
          onClick={() => onChange?.({ accessToken, phoneNumberId, recipientPhone, message })}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-100 transition-all active:scale-[0.98]"
        >
          Save WhatsApp Config
        </Button>
      </div>
    </div>
  )
}
