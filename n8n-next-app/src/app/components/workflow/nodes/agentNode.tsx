"use client"

import React, { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import Image from 'next/image'
import { Sparkles, BrainCircuit, Plus } from 'lucide-react'

const AgentNode = ({ data, selected }: NodeProps) => {
  return (
    <div className={`
      relative min-w-[220px] bg-white border-2 rounded-[2rem] transition-all duration-500 group
      ${selected ? 'border-[var(--primary)] shadow-2xl shadow-blue-500/20 scale-[1.03]' : 'border-slate-100 shadow-xl shadow-slate-200/50 hover:border-blue-200'}
    `}>
      <Handle type="target" position={Position.Left} className="!w-4 !h-4 !bg-white !border-[3px] !border-[var(--primary)] !top-1/2 !-translate-y-1/2 !-left-2 shadow-lg z-50 transition-transform hover:scale-125 hover:bg-white" />
      
      <div className="p-5 flex items-center gap-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-3 border border-blue-100 shadow-sm transition-transform duration-500 group-hover:rotate-6">
            {data.icon ? (
              <Image src={data.icon as string} alt="Node Icon" width={32} height={32} className="object-contain" />
            ) : (
              <Sparkles className="w-6 h-6 text-[var(--primary)]" />
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border-2 border-[var(--primary)] flex items-center justify-center text-[var(--primary)] shadow-sm cursor-pointer hover:scale-110 transition-transform">
             <Plus className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight truncate">{data.label as string || 'AI UNIT'}</h3>
          <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest flex items-center gap-1.5 leading-none">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Neural Core
          </p>
        </div>
      </div>

      <div className="px-5 pb-5">
        <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
          {selected && <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 animate-shimmer" style={{ width: '60%' }} />}
        </div>
      </div>

      <Handle type="source" position={Position.Right} id="output-right" className="!w-4 !h-4 !bg-white !border-[3px] !border-[var(--primary)] !top-1/2 !-translate-y-1/2 !-right-2 shadow-lg z-50 transition-transform hover:scale-125 hover:bg-white" />
      
      {/* Top Indicators */}
      <div className="absolute -top-12 left-0 right-0 flex flex-col items-center gap-1.5 pointer-events-none">
        {!!data.activeModel && (
          <div className="px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-full shadow-2xl z-[60] animate-in fade-in slide-in-from-top-2 duration-500">
            <p className="text-[7px] font-black text-white uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Engine: {String(data.activeModel)}
            </p>
          </div>
        )}
        {!!data.activeMemory && (
          <div className="px-3 py-1 bg-blue-600 border border-blue-500 rounded-full shadow-xl z-[60] animate-in fade-in slide-in-from-top-1 duration-700">
            <p className="text-[7px] font-black text-white uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Memory: {String(data.activeMemory)}
            </p>
          </div>
        )}
      </div>

      {/* Three Bottom Handles */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-around px-8 translate-y-6">
        <div className="flex flex-col items-center">
          <Handle 
            type="source" 
            position={Position.Bottom} 
            id="chat-model" 
            className="!w-3 !h-3 !bg-white !border-[2.5px] !border-[var(--primary)] !static !translate-x-0 rotate-45 shadow-md z-50 transition-transform hover:scale-125 hover:rotate-45"
          />
          <span className="text-[7px] font-black text-slate-500 uppercase mt-2 tracking-tighter bg-white/80 backdrop-blur-sm px-1.5 py-0.5 rounded shadow-sm">Chat Model</span>
        </div>
        
        <div className="flex flex-col items-center">
          <Handle 
            type="source" 
            position={Position.Bottom} 
            id="memory" 
            className="!w-3 !h-3 !bg-white !border-[2.5px] !border-[var(--primary)] !static !translate-x-0 rotate-45 shadow-md z-50 transition-transform hover:scale-125 hover:rotate-45"
          />
          <span className="text-[7px] font-black text-slate-500 uppercase mt-2 tracking-tighter bg-white/80 backdrop-blur-sm px-1.5 py-0.5 rounded shadow-sm">Memory</span>
        </div>

        <div className="flex flex-col items-center">
          <Handle 
            type="source" 
            position={Position.Bottom} 
            id="tool" 
            className="!w-3 !h-3 !bg-white !border-[2.5px] !border(--primary) !static !translate-x-0 rotate-45 shadow-md z-50 transition-transform hover:scale-125 hover:rotate-45"
          />
          <span className="text-[7px] font-black text-slate-500 uppercase mt-2 tracking-tighter bg-white/80 backdrop-blur-sm px-1.5 py-0.5 rounded shadow-sm">Tool</span>
        </div>
      </div>
    </div>
  )
}

export default memo(AgentNode)

export const SubAgentNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div className={`
      relative min-w-[200px] bg-white border-2 rounded-[1.5rem] transition-all duration-300 group
      ${selected ? 'border-[var(--primary)] shadow-2xl scale-[1.02]' : 'border-slate-100 shadow-lg border-dashed'}
    `}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-white !border-[2.5px] !border-[var(--primary)] !-top-1.5 !left-1/2 !-translate-x-1/2 shadow-lg z-50 transition-transform hover:scale-125 hover:bg-white" />
      <div className="p-4 flex items-center gap-3">
        <div className="relative">
          <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2.5">
             <BrainCircuit className="w-6 h-6 text-slate-400" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-slate-400 shadow-sm cursor-pointer hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all">
             <Plus className="w-3 h-3" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">{data.label as string || 'SUB-PROCESSOR'}</h3>
          <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Satellite Unit</p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-white !border-[2.5px] !border-[var(--primary)] !-bottom-1.5 !left-1/2 !-translate-x-1/2 shadow-lg z-50 transition-transform hover:scale-125 hover:bg-white" />
    </div>
  )
})

SubAgentNode.displayName = 'SubAgentNode'
