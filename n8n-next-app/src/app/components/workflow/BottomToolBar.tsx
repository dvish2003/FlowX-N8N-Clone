"use client"

import React from 'react'
import { Hand, Play, Square, RotateCcw, RotateCw, Loader2, MousePointer2, Save, FolderOpen, Terminal } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/components/ui/tooltip'
import { useDispatch, useSelector } from 'react-redux'
import { toggleShowConsole } from '@/stores/FlowSlice'
import { RootState } from '@/stores'

type BottomToolBarProps = {
  onRun?: () => void
  onStop?: () => void
  isRunning?: boolean
  isSchedulerActive?: boolean
  onSave?: () => void
  onLoad?: () => void
  isSaving?: boolean
  onNew?: () => void
}

const IconButton = ({ children, label, onClick, disabled, variant = 'default', active = false, className = '' }: { children: React.ReactNode; label: string, onClick?: () => void, disabled?: boolean, variant?: 'default' | 'primary' | 'secondary', active?: boolean, className?: string }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        aria-label={label}
        onClick={onClick}
        disabled={disabled}
        className={`
          h-10 w-10 flex items-center justify-center rounded-2xl border transition-all duration-300 cursor-pointer
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variant === 'primary' 
            ? 'bg-black text-white border-black shadow-lg shadow-black/10 hover:scale-110 active:scale-95 hover:bg-neutral-850' 
            : variant === 'secondary'
            ? 'bg-neutral-100 text-neutral-900 border-neutral-200 hover:bg-neutral-200 shadow-sm'
            : active 
              ? 'bg-neutral-200 text-neutral-900 border border-neutral-350 shadow-md scale-105' 
              : 'bg-neutral-100/40 backdrop-blur-md border border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 hover:border-neutral-300 hover:scale-105'
          }
          ${className}
        `}
      >
        {children}
      </button>
    </TooltipTrigger>
    <TooltipContent side="top" className="mb-2 bg-white border border-neutral-200 text-neutral-800 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-2xl">
      <p>{label}</p>
    </TooltipContent>
  </Tooltip>
)

const BottomToolBar = ({ onRun, onStop, isRunning, isSchedulerActive, onSave, onLoad, isSaving, onNew }: BottomToolBarProps) => {
  const dispatch = useDispatch()
  const showConsole = useSelector((state: RootState) => state.flow.showConsole)

  return (
    <div className="flex items-center gap-2 p-1.5 rounded-2xl border border-neutral-200 bg-white/70 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center gap-1 pr-2 border-r border-neutral-200">
        <IconButton label="Selection Mode"><MousePointer2 className="h-4 w-4" /></IconButton>
        <IconButton label="Panning Mode"><Hand className="h-4 w-4" /></IconButton>
      </div>

      <div className="flex items-center gap-2 px-2">
         <IconButton label="New Project" onClick={onNew}><Square className="h-4 w-4 rotate-45" /></IconButton>
         <IconButton label="Open Archives" onClick={onLoad}><FolderOpen className="h-4 w-4" /></IconButton>
         <IconButton label="Secure State" onClick={onSave} disabled={isSaving} variant="secondary">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin text-neutral-500" /> : <Save className="h-4 w-4" />}
         </IconButton>
         <IconButton label="Toggle Console" onClick={() => dispatch(toggleShowConsole())} active={showConsole}>
            <Terminal className="h-4 w-4" />
         </IconButton>
      </div>

      <div className="flex items-center gap-1 px-1 border-x border-neutral-200">
         <IconButton label="Step Back"><RotateCcw className="h-4 w-4" /></IconButton>
         <IconButton label="Step Forward"><RotateCw className="h-4 w-4" /></IconButton>
      </div>
      
      <div className="pl-2 flex items-center gap-2">
         {isSchedulerActive ? (
            <IconButton label="Stop Execution" onClick={onStop} variant="primary" className="bg-red-500 hover:bg-red-600 shadow-red-500/20 text-white border-red-500">
               <Square className="h-4 w-4 fill-current" />
            </IconButton>
         ) : (
            <IconButton label="Engage Sequence" onClick={onRun} disabled={isRunning} variant="primary">
               {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
            </IconButton>
         )}
      </div>
    </div>
  )
}

export default BottomToolBar
