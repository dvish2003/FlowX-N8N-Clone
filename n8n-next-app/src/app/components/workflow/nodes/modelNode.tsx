"use client"

import React, { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import Image from 'next/image'
import { BrainCircuit, Plus } from 'lucide-react'

const ModelNode = ({ data, selected }: NodeProps) => {
  return (
    <div className={`
      relative w-32 h-32 bg-white border-2 rounded-full transition-all duration-500 group flex flex-col items-center justify-center
      ${selected ? 'border-[var(--primary)] shadow-2xl shadow-blue-500/20 scale-105' : 'border-slate-200 shadow-xl shadow-slate-100 hover:border-blue-300'}
    `}>
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!w-3 !h-3 !bg-white !border-[2.5px] !border-[var(--primary)] !-top-1.5 !left-1/2 !-translate-x-1/2 rotate-45 shadow-lg z-50 transition-transform hover:scale-125 hover:rotate-45" 
      />

      {!!data.isInUse && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-green-50 border border-green-200 rounded-full shadow-sm z-50 animate-bounce">
           <span className="text-[6px] font-black text-green-600 uppercase tracking-widest flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
              Connected
           </span>
        </div>
      )}
      
      <div className="flex flex-col items-center gap-2 p-4 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center p-2.5 border border-slate-100 shadow-sm transition-transform duration-500 group-hover:scale-110">
          {data.icon ? (
            <Image src={data.icon as string} alt="Icon" width={32} height={32} className="object-contain" />
          ) : (
            <BrainCircuit className="w-6 h-6 text-slate-400" />
          )}
        </div>
        <div className="min-w-0">
          <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-tighter leading-tight line-clamp-2">{data.label as string || 'AI UNIT'}</h3>
          <p className="text-[7px] font-bold text-slate-400 uppercase mt-0.5 tracking-tight">Processor</p>
        </div>
      </div>

      <div className="absolute -bottom-2 -right-2 transform transition-transform group-hover:scale-110">
        <div className={`w-6 h-6 rounded-full bg-white border-2 flex items-center justify-center text-[10px] shadow-sm ${selected ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-slate-200 text-slate-400'}`}>
          <Plus className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  )
}

export default memo(ModelNode)
