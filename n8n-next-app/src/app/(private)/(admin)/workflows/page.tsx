'use client'

import TopNav from '@/app/components/topnav/TopNav'
import React from 'react'
import LeftPanel from '@/app/components/sidebars/LeftPanel'
import CanvasFlow from '@/app/components/workflow/CanvasFlow'
import RightPanel from '@/app/components/workflow/RightPanel'

export default function Page() {
  const [rightWidth] = React.useState(420);


  return (
    <div className='h-screen flex flex-col bg-white'>
      <TopNav />

      <div className='flex flex-1 overflow-hidden'>
        <LeftPanel />

        <div className="flex-1 relative">
          <CanvasFlow />
        </div>
         
        <aside 
          className='bg-white border-l border-white overflow-hidden'
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
