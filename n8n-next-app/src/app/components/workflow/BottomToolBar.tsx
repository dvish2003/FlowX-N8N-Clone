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
          h-10 w-10 flex items-center justify-center rounded-2xl border transition-all duration-300
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variant === 'primary' 
            ? 'bg-[var(--primary)] text-[var(--primary-foreground)] border-transparent shadow-lg shadow-blue-500/20 hover:scale-110 active:scale-95' 
            : variant === 'secondary'
            ? 'bg-white text-[var(--foreground)] border-[var(--border)] hover:bg-slate-50 shadow-sm'
            : active 
              ? 'bg-[var(--primary)] text-white border-transparent shadow-md' 
              : 'bg-white/70 backdrop-blur-md border-[var(--border)] text-slate-500 hover:text-[var(--primary)] hover:bg-white hover:border-[var(--primary)]/30 hover:scale-105'
          }
          ${className}
        `}
      >
        {children}
      </button>
    </TooltipTrigger>
    <TooltipContent side="top" className="mb-2 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest border-none px-3 py-1.5 rounded-lg">
      <p>{label}</p>
    </TooltipContent>
  </Tooltip>
)

const BottomToolBar = ({ onRun, onStop, isRunning, isSchedulerActive, onSave, onLoad, isSaving, onNew }: BottomToolBarProps) => {
  const dispatch = useDispatch()
  const showConsole = useSelector((state: RootState) => state.flow.showConsole)

  return (
    <div className="flex items-center gap-2 p-1.5 rounded-2xl border-2 border-white bg-white/60 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center gap-1 pr-2 border-r border-white">
        <IconButton label="Selection Mode"><MousePointer2 className="h-4 w-4" /></IconButton>
        <IconButton label="Panning Mode"><Hand className="h-4 w-4" /></IconButton>
      </div>

      <div className="flex items-center gap-2 px-2">
         <IconButton label="New Project" onClick={onNew}><Square className="h-4 w-4 rotate-45" /></IconButton>
         <IconButton label="Open Archives" onClick={onLoad}><FolderOpen className="h-4 w-4" /></IconButton>
         <IconButton label="Secure State" onClick={onSave} disabled={isSaving} variant="secondary">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
         </IconButton>
         <IconButton label="Toggle Console" onClick={() => dispatch(toggleShowConsole())} active={showConsole}>
            <Terminal className="h-4 w-4" />
         </IconButton>
      </div>

      <div className="flex items-center gap-1 px-1 border-x border-white">
         <IconButton label="Step Back"><RotateCcw className="h-4 w-4" /></IconButton>
         <IconButton label="Step Forward"><RotateCw className="h-4 w-4" /></IconButton>
      </div>
      
      <div className="pl-2 flex items-center gap-2">
         {isSchedulerActive ? (
           <IconButton label="Stop Execution" onClick={onStop} variant="primary" className="bg-red-500 hover:bg-red-600 shadow-red-500/20">
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
