
"use client"
import React, { useState, useCallback } from 'react'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Button } from '@/app/components/ui/button'
import { useDispatch } from 'react-redux'
import { deleteNode } from '@/stores/FlowSlice'
import { Send, MessageSquare } from 'lucide-react'

type TelegramConfigProps = {
  nodeId?: string
  nodeData?: Record<string, any>
  onChange?: (data: Record<string, any>) => void
}

export function TelegramConfig({ nodeId, nodeData, onChange }: TelegramConfigProps) {
  const dispatch = useDispatch()
  
  const [botToken, setBotToken] = useState(nodeData?.botToken || '')
  const [chatId, setChatId] = useState(nodeData?.chatId || '')
  const [message, setMessage] = useState(nodeData?.message || '')

  const handleUpdate = (token: string, chat: string, msg: string) => {
    setBotToken(token)
    setChatId(chat)
    setMessage(msg)
    onChange?.({
      ...nodeData,
      botToken: token,
      chatId: chat,
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
           <div className="p-2 bg-sky-50 rounded-lg">
              <Send className="w-5 h-5 text-sky-600" />
           </div>
           <h3 className="font-bold text-slate-800">Telegram Notify</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={handleRemove} className="text-red-500">Remove</Button>
      </div>

      <div className="space-y-5">
        <div className="grid gap-2">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bot API Token</Label>
            <Input 
                type="password"
                placeholder="123456789:ABCdef..." 
                value={botToken}
                onChange={(e) => handleUpdate(e.target.value, chatId, message)}
                className="h-10 border-slate-200"
            />
            <p className="text-[10px] text-slate-400">Get this from @BotFather on Telegram.</p>
        </div>

        <div className="grid gap-2">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chat ID</Label>
            <Input 
                placeholder="e.g. -100123456789" 
                value={chatId}
                onChange={(e) => handleUpdate(botToken, e.target.value, message)}
                className="h-10 border-slate-200"
            />
            <p className="text-[10px] text-slate-400">Personal ID or Group/Channel ID.</p>
        </div>

        <div className="grid gap-2">
            <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Message</Label>
                <div className="flex items-center gap-1 text-sky-600">
                    <MessageSquare className="w-3 h-3" />
                    <span className="text-[10px] font-bold">Markdown Supported</span>
                </div>
            </div>
            <textarea 
                value={message} 
                onChange={(e) => handleUpdate(botToken, chatId, e.target.value)} 
                className="w-full min-h-[150px] p-3 text-sm border-2 rounded-xl focus:ring-4 focus:ring-sky-50 focus:border-sky-400 outline-none transition-all border-slate-100"
                placeholder="🚀 Workflow Completed!\n\nStatus: {{data.status}}"
            />
        </div>
      </div>

      <div className="pt-4 border-t">
        <Button
          onClick={() => onChange?.({ botToken, chatId, message })}
          className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-sky-100 transition-all active:scale-[0.98]"
        >
          Save Telegram Bot
        </Button>
      </div>
    </div>
  )
}
