'use client'

import React, { useEffect, useState } from 'react'
import { Sun } from 'lucide-react'

const ThemeSwitch = () => {
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatches by rendering only after mount
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <div className="flex items-center justify-center h-10 w-10">
      <Sun className="h-5 w-5" />
    </div>
  )
}

export default ThemeSwitch
