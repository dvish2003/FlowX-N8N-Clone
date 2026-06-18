"use client"

import React from 'react'
import { Home, Settings, Bot, Plus, Workflow, Grid3x3, Package, Zap } from 'lucide-react'
import Image from 'next/image'
import { useDispatch } from 'react-redux'
import { addNode } from '@/stores/FlowSlice'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/components/ui/tooltip'

const IconButton = ({ 
  children, 
  label,
  active = false,
  onClick 
}: { 
  children: React.ReactNode
  label: string
  active?: boolean
  onClick?: () => void
}) => (
  <TooltipProvider delayDuration={0}>
    <Tooltip>
      <TooltipTrigger asChild>
        <button 
          className={`
            w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-250 cursor-pointer
            ${active 
              ? 'bg-neutral-200 text-neutral-900 shadow-md border border-neutral-300 scale-105' 
              : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 border border-transparent'
            }
          `}
          aria-label={label}
          onClick={onClick}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" className="bg-white text-neutral-900 text-[10px] font-black uppercase tracking-widest border border-neutral-200 shadow-2xl">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
)

const LeftPanel = () => {
  const [activeTab, setActiveTab] = React.useState('workflow')
  const dispatch = useDispatch()

  const handleAddAgent = () => {
    dispatch(addNode({
      node: 'agent',
      icon: '/icons/bot.png',
      label: 'AI Agent',
    }))
  }

  const handleAddSubAgent = () => {
    dispatch(addNode({
      node: 'subAgent',
      icon: '/icons/chatbot.png',
      label: 'Sub Agent',
    }))
  }

  return (
    <aside className="w-16 border-r border-neutral-200 bg-neutral-50/60 backdrop-blur-xl flex flex-col items-center py-4 gap-3 z-20 shadow-2xl">
      {/* Brand / Logo Area */}
      <div className="mb-2">
         <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-neutral-200 to-neutral-100 border border-neutral-300 flex items-center justify-center shadow-sm">
            <Zap className="text-neutral-800 w-6 h-6 fill-neutral-800" />
         </div>
      </div>

      <div className="w-8 h-px bg-neutral-200 my-1" />

      {/* Main Navigation */}
      <nav className="flex flex-col items-center gap-3 w-full px-2">
        <IconButton 
          label="Overview" 
          active={activeTab === 'home'}
          onClick={() => setActiveTab('home')}
        >
          <Home className="h-5 w-5" />
        </IconButton>

        <IconButton 
          label="Workspace" 
          active={activeTab === 'workflow'}
          onClick={() => setActiveTab('workflow')}
        >
          <Workflow className="h-5 w-5" />
        </IconButton>

        <IconButton 
          label="Neural Nodes" 
          active={activeTab === 'agents'}
          onClick={() => setActiveTab('agents')}
        >
          <Bot className="h-5 w-5" />
        </IconButton>

        <IconButton 
          label="Inventory" 
          active={activeTab === 'components'}
          onClick={() => setActiveTab('components')}
        >
          <Package className="h-5 w-5" />
        </IconButton>
      </nav>

      {/* Quick Actions Group */}
      <div className="w-full px-2 mt-4 space-y-3">
         <div className="w-full h-px bg-neutral-200" />
         
         <button 
          className="w-10 h-10 mx-auto rounded-xl border-2 border-dashed border-neutral-200 flex items-center justify-center hover:bg-neutral-100 hover:border-neutral-300 transition-all text-neutral-450 cursor-pointer" 
          aria-label="New Sequence"
        >
          <Plus className="h-5 w-5" />
        </button>

         <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
               <button 
                  className="w-10 h-10 mx-auto rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center hover:bg-neutral-200 hover:border-neutral-300 transition-all group cursor-pointer" 
                  onClick={handleAddAgent}
                >
                  <Image src="/icons/bot.png" alt="Agent" width={24} height={24} className="object-contain opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all" />
                </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-white text-neutral-900 text-[10px] font-black uppercase tracking-widest border border-neutral-200 shadow-2xl">
              <p>Deploy AI Unit</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
               <button 
                  className="w-10 h-10 mx-auto rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center hover:bg-neutral-200 hover:border-neutral-300 transition-all group cursor-pointer" 
                  onClick={handleAddSubAgent}
                >
                  <Image src="/icons/chatbot.png" alt="Sub-Agent" width={24} height={24} className="object-contain opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all" />
                </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-white text-neutral-900 text-[10px] font-black uppercase tracking-widest border border-neutral-200 shadow-2xl">
              <p>Deploy Sub-Unit</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex-1" />

      {/* Bottom Actions */}
      <div className="w-8 h-px bg-neutral-200 my-1" />

      <nav className="flex flex-col items-center gap-3 mb-4">
        <IconButton 
          label="Visual Grid" 
          active={activeTab === 'canvas'}
          onClick={() => setActiveTab('canvas')}
        >
          <Grid3x3 className="h-5 w-5" />
        </IconButton>

        <IconButton 
          label="Settings" 
          active={activeTab === 'settings'}
          onClick={() => setActiveTab('settings')}
        >
          <Settings className="h-5 w-5" />
        </IconButton>
      </nav>
    </aside>
  )
}

export default LeftPanel