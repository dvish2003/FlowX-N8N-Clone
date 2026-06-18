"use client"

import React, { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import Image from 'next/image'
import { Globe, Clock, Zap, Plus } from 'lucide-react'

// Generic Standard Node (Http, Trigger, etc)
export const StandardNode = memo(({ data, selected, type }: NodeProps) => {
  const isTrigger = type === 'scheduleTriggerNode'
  const isHttp = type === 'httpNode'

  return (
    <div className={`
      relative min-w-[180px] bg-white border-2 rounded-[1.5rem] transition-all duration-300 group
      ${selected ? 'border-[var(--primary)] shadow-2xl scale-[1.02]' : 'border-slate-100 shadow-xl shadow-slate-100/50 hover:border-blue-200'}
    `}>
      {!isTrigger && <Handle type="target" position={Position.Top} id="input" className="!w-4 !h-4 !bg-white !border-[3px] !border-[var(--primary)] !-top-2 !left-1/2 !-translate-x-1/2 shadow-lg z-50 transition-transform hover:scale-125 hover:bg-white" />}
      
      <div className="p-4 flex items-center gap-3">
        <div className="relative">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center p-2.5 transition-all duration-500 group-hover:scale-110 ${isTrigger ? 'bg-[var(--primary)] text-white shadow-lg shadow-blue-500/20' : 'bg-slate-50 border border-slate-100'}`}>
            {data.icon ? (
              <Image src={data.icon as string} alt="" width={24} height={24} className={`object-contain`} />
            ) : isTrigger ? <Clock className="w-5 h-5" /> : isHttp ? <Globe className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-slate-400 shadow-sm cursor-pointer hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all">
             <Plus className="w-3 h-3" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-bold text-slate-800 tracking-tight truncate">{data.label as string}</h3>
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest truncate block mt-0.5">{type?.replace('Node', '')}</span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} id="output" className="!w-4 !h-4 !bg-white !border-[3px] !border-[var(--primary)] !-bottom-2 !left-1/2 !-translate-x-1/2 shadow-lg z-50 transition-transform hover:scale-125 hover:bg-white" />
    </div>
  )
})


const ChatTriggerNodeComponent = memo(({ data, selected }: NodeProps) => {
  return (
    <div className={`
      relative min-w-[180px] bg-white border-2 rounded-[1.5rem] transition-all duration-300 group
      ${selected ? 'border-[var(--primary)] shadow-2xl scale-[1.02]' : 'border-slate-100 shadow-xl shadow-slate-100/50 hover:border-blue-200'}
    `}>
      <div className="p-4 flex items-center gap-3">
        <div className="relative">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center p-2.5 transition-all duration-500 group-hover:scale-110 bg-[var(--primary)] text-white shadow-lg shadow-blue-500/20`}>
             <Image src={data.icon as string || '/icons/chatbot.png'} alt="" width={24} height={24} className="object-contain" /> 
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-slate-400 shadow-sm cursor-pointer hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all">
             <Plus className="w-3 h-3" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-bold text-slate-800 tracking-tight truncate">{data.label as string || 'Chat Trigger'}</h3>
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest truncate block mt-0.5">TRIGGER</span>
        </div>
      </div>

      <Handle type="source" position={Position.Right} id="output" className="!w-4 !h-4 !bg-white !border-[3px] !border-[var(--primary)] !top-1/2 !-translate-y-1/2 !-right-2 shadow-lg z-50 transition-transform hover:scale-125 hover:bg-white" />
    </div>
  )
})
ChatTriggerNodeComponent.displayName = 'ChatTriggerNodeComponent'

const IfNodeComponent = memo(({ data, selected }: NodeProps) => {
  return (
    <div className={`
      relative min-w-[200px] bg-white border-2 rounded-[1.5rem] transition-all duration-300 group
      ${selected ? 'border-[var(--primary)] shadow-2xl scale-[1.02]' : 'border-slate-100 shadow-xl shadow-slate-100/50 hover:border-blue-200'}
    `}>
      <Handle type="target" position={Position.Top} id="input" className="!w-4 !h-4 !bg-white !border-[3px] !border-[var(--primary)] !-top-2 !left-1/2 !-translate-x-1/2 shadow-lg z-50 transition-transform hover:scale-125 hover:bg-white" />
      
      <div className="p-4 flex items-center gap-3">
        <div className="relative">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center p-2.5 bg-blue-50 border border-blue-100 transition-all duration-500 group-hover:scale-110">
             <Image src={data.icon as string || '/icons/if.png'} alt="" width={24} height={24} className="object-contain" /> 
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-bold text-slate-800 tracking-tight truncate">{data.label as string || 'IF Condition'}</h3>
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest truncate block mt-0.5">LOGIC</span>
        </div>
      </div>

      <div className="flex justify-between px-6 pb-2 text-[10px] font-black tracking-tighter uppercase">
         <div className="text-green-500">True</div>
         <div className="text-red-500">False</div>
      </div>

      <Handle type="source" position={Position.Bottom} id="true" className="!w-4 !h-4 !bg-white !border-[3px] !border-[var(--primary)] !-bottom-2 !left-1/4 !-translate-x-1/2 shadow-lg z-50 transition-transform hover:scale-125 hover:bg-white" />
      <Handle type="source" position={Position.Bottom} id="false" className="!w-4 !h-4 !bg-white !border-[3px] !border-[var(--primary)] !-bottom-2 !left-3/4 !-translate-x-1/2 shadow-lg z-50 transition-transform hover:scale-125 hover:bg-white" />
    </div>
  )
})
IfNodeComponent.displayName = 'IfNodeComponent'

const SwitchNodeComponent = memo(({ data, selected }: NodeProps) => {
  const cases = (data.cases as any[]) || [];
  
  return (
    <div className={`
      relative min-w-[200px] bg-white border-2 rounded-[1.5rem] transition-all duration-300 group
      ${selected ? 'border-[var(--primary)] shadow-2xl scale-[1.02]' : 'border-slate-100 shadow-xl shadow-slate-100/50 hover:border-blue-200'}
    `}>
      <Handle type="target" position={Position.Top} id="input" className="!w-4 !h-4 !bg-white !border-[3px] !border-[var(--primary)] !-top-2 !left-1/2 !-translate-x-1/2 shadow-lg z-50 transition-transform hover:scale-125 hover:bg-white" />
      
      <div className="p-4 flex items-center gap-3">
        <div className="relative">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center p-2.5 bg-purple-50 border border-purple-100 transition-all duration-500 group-hover:scale-110">
             <Image src={data.icon as string || '/icons/switch.png'} alt="" width={24} height={24} className="object-contain" /> 
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-bold text-slate-800 tracking-tight truncate">{data.label as string || 'Switch'}</h3>
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest truncate block mt-0.5">ROUTER</span>
        </div>
      </div>

      <div className="space-y-1 pb-4">
        {cases.map((c, i) => (
            <div key={i} className="relative h-9 flex items-center justify-between pl-4 pr-10 bg-slate-50/50 border-y border-slate-100/50 first:border-t-0 last:border-b-0 hover:bg-slate-100/50 transition-colors">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Case {i + 1}</span>
                <span className="text-[10px] font-black text-slate-700 truncate max-w-[100px]">{c.label || c.value}</span>
                <Handle 
                    type="source" 
                    position={Position.Right} 
                    id={`case-${i}`} 
                    className="!w-4 !h-4 !bg-white !border-[3px] !border-[var(--primary)] !-right-2 !top-1/2 !-translate-y-1/2 shadow-lg z-50 transition-transform hover:scale-125 hover:bg-white" 
                />
            </div>
        ))}
      </div>
    </div>
  )
})
SwitchNodeComponent.displayName = 'SwitchNodeComponent'

const LoopNodeComponent = memo(({ data, selected }: NodeProps) => {
  return (
    <div className={`
      relative min-w-[180px] bg-white border-2 rounded-[1.5rem] transition-all duration-300 group
      ${selected ? 'border-[var(--primary)] shadow-2xl scale-[1.02]' : 'border-slate-100 shadow-xl shadow-slate-100/50 hover:border-blue-200'}
    `}>
      <Handle type="target" position={Position.Top} id="input" className="!w-4 !h-4 !bg-white !border-[3px] !border-[var(--primary)] !-top-2 !left-1/2 !-translate-x-1/2 shadow-lg z-50 transition-transform hover:scale-125 hover:bg-white" />
      
      <div className="p-4 flex items-center gap-3">
        <div className="relative">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center p-2.5 bg-orange-50 border border-orange-100 transition-all duration-500 group-hover:scale-110">
             <Image src={data.icon as string || '/icons/loop.png'} alt="" width={24} height={24} className="object-contain" /> 
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-bold text-slate-800 tracking-tight truncate">{data.label as string || 'Loop'}</h3>
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest truncate block mt-0.5">ITERATOR</span>
        </div>
      </div>

      <div className="flex justify-between px-6 pb-2 text-[10px] font-black tracking-tighter uppercase">
         <div className="text-orange-500">Loop</div>
         <div className="text-slate-400">Done</div>
      </div>

      <Handle type="source" position={Position.Bottom} id="loop" className="!w-4 !h-4 !bg-white !border-[3px] !border-[var(--primary)] !-bottom-2 !left-1/4 !-translate-x-1/2 shadow-lg z-50 transition-transform hover:scale-125 hover:bg-white" />
      <Handle type="source" position={Position.Bottom} id="done" className="!w-4 !h-4 !bg-white !border-[3px] !border-[var(--primary)] !-bottom-2 !left-3/4 !-translate-x-1/2 shadow-lg z-50 transition-transform hover:scale-125 hover:bg-white" />
    </div>
  )
})
LoopNodeComponent.displayName = 'LoopNodeComponent'

// Individual named exports for nodeTypes
export const ToolNode = (props: NodeProps) => <StandardNode {...props} />
export const InputNode = (props: NodeProps) => <StandardNode {...props} />
export const OutputNode = (props: NodeProps) => <StandardNode {...props} />
export const gmailNode = (props: NodeProps) => <StandardNode {...props} />
export const driveNode = (props: NodeProps) => <StandardNode {...props} />
export const notionNode = (props: NodeProps) => <StandardNode {...props} />
export const slackNode = (props: NodeProps) => <StandardNode {...props} />
export const vectordbNode = (props: NodeProps) => <StandardNode {...props} />
export const embeddingModelNode = (props: NodeProps) => <StandardNode {...props} />
export const calendarNode = (props: NodeProps) => <StandardNode {...props} />
export const discordNode = (props: NodeProps) => <StandardNode {...props} />
export const scheduleTriggerNode = (props: NodeProps) => <StandardNode {...props} />
export const httpNode = (props: NodeProps) => <StandardNode {...props} />
export const chatTriggerNode = (props: NodeProps) => <ChatTriggerNodeComponent {...props} />
export const retrieverNode = (props: NodeProps) => <StandardNode {...props} />
export const sendDataNode = (props: NodeProps) => <StandardNode {...props} />
export const googleSheetNode = (props: NodeProps) => <StandardNode {...props} />
export const ifNode = (props: NodeProps) => <IfNodeComponent {...props} />
export const switchNode = (props: NodeProps) => <SwitchNodeComponent {...props} />
export const loopNode = (props: NodeProps) => <LoopNodeComponent {...props} />
export const delayNode = (props: NodeProps) => <StandardNode {...props} />
export const emailNode = (props: NodeProps) => <StandardNode {...props} />
export const telegramNode = (props: NodeProps) => <StandardNode {...props} />
export const webhookNode = (props: NodeProps) => <StandardNode {...props} />
export const dataFormatterNode = (props: NodeProps) => <StandardNode {...props} />
export const csvLoaderNode = (props: NodeProps) => <StandardNode {...props} />
export const pdfConverterNode = (props: NodeProps) => <StandardNode {...props} />
export const codeNode = (props: NodeProps) => <StandardNode {...props} />
export const errorHandlerNode = (props: NodeProps) => <StandardNode {...props} />
export const whatsAppNode = (props: NodeProps) => <StandardNode {...props} />


StandardNode.displayName = 'StandardNode'
