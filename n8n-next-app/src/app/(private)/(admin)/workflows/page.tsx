'use client'

import TopNav from '@/app/components/topnav/TopNav'
import React from 'react'
import LeftPanel from '@/app/components/sidebars/LeftPanel'
import CanvasFlow from '@/app/components/workflow/CanvasFlow'
import RightPanel from '@/app/components/workflow/RightPanel'

export default function Page() {
  const [rightWidth] = React.useState(420);


  return (
    <div className='h-screen flex flex-col bg-white text-neutral-900'>
      <TopNav />

      <div className='flex flex-1 overflow-hidden'>
        <LeftPanel />

        <div className="flex-1 relative bg-white">
          <CanvasFlow />
        </div>
         
        <aside 
          className='bg-neutral-50 border-l border-neutral-200 overflow-hidden'
          style={{
            width: rightWidth
          }}
        >
          <RightPanel />
        </aside>

      </div>
      
    </div>
  )
}
