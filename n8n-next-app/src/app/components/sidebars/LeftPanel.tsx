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
            w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200
            ${active 
              ? 'bg-neutral-900 text-white shadow-xl' 
              : 'text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50  border border-transparent'
            }
          `}
          aria-label={label}
          onClick={onClick}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" className="bg-neutral-900 text-white text-[10px] font-black uppercase tracking-widest border-none">
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
    <aside className="w-16 border-r border-neutral-200 bg-white  backdrop-blur-xl flex flex-col items-center py-4 gap-3 z-20 shadow-2xl">
      {/* Brand / Logo Area */}
      <div className="mb-2">
         <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center shadow-lg shadow-neutral-200">
            <Zap className="text-white w-6 h-6 fill-current" />
         </div>
      </div>

      <div className="w-8 h-px bg-neutral-100 my-1" />

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
         <div className="w-full h-px bg-neutral-100" />
         
         <button 
          className="w-10 h-10 mx-auto rounded-xl border-2 border-dashed border-neutral-200 flex items-center justify-center hover:bg-neutral-100 transition-all text-neutral-400" 
          aria-label="New Sequence"
        >
          <Plus className="h-5 w-5" />
        </button>

         <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
               <button 
                  className="w-10 h-10 mx-auto rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-center hover:bg-white hover:text-white transition-all group" 
                  onClick={handleAddAgent}
                >
                  <Image src="/icons/bot.png" alt="Agent" width={24} height={24} className="object-contain grayscale group-hover:invert transition-all" />
                </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-neutral-900 text-neutral-50 text-[10px] font-black uppercase tracking-widest border-none">
              <p>Deploy AI Unit</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
               <button 
                  className="w-10 h-10 mx-auto rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-center hover:bg-white hover:text-white transition-all group" 
                  onClick={handleAddSubAgent}
                >
                  <Image src="/icons/chatbot.png" alt="Sub-Agent" width={24} height={24} className="object-contain grayscale group-hover:invert transition-all" />
                </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-neutral-900 text-neutral-50 text-[10px] font-black uppercase tracking-widest border-none">
              <p>Deploy Sub-Unit</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex-1" />

      {/* Bottom Actions */}
      <div className="w-8 h-px bg-neutral-100 my-1" />

      <nav className="flex flex-col items-center gap-3 mb-4">
        <IconButton 
          label="Visual Grid" 
          active={activeTab === 'canvas'}
          onClick={() => setActiveTab('canvas')}
        >
          <Grid3x3 className="h-5 w-5" />
        </IconButton>

        <IconButton 
          label="System Core" 
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