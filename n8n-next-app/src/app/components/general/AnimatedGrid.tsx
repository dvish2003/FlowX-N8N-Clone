'use client'

import React, { useEffect, useState } from 'react'

interface GridSquare {
  id: number
  row: number
  col: number
  size: number
  delay: number
}

export default function AnimatedGrid() {
  const [squares, setSquares] = useState<GridSquare[]>([])

  useEffect(() => {
    const numSquares = 25
    const newSquares = Array.from({ length: numSquares }).map((_, i) => ({
      id: i,
      row: Math.floor(Math.random() * 20) + 1,
      col: Math.floor(Math.random() * 15) + 1,
      size: Math.random() > 0.6 ? 80 : 40,
      delay: Math.random() * 5,
    }))
    setSquares(newSquares)
  }, [])

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
      {/* Radial ambient glow lights */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-white/5 blur-[120px] mix-blend-screen" />
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] rounded-full bg-neutral-800/10 blur-[130px] mix-blend-screen" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[350px] h-[350px] rounded-full bg-white/3 blur-[90px] mix-blend-screen" />

      {/* Grid Pattern Layout */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Glowing animated dots/squares */}
      <div className="absolute inset-0 opacity-20">
        {squares.map((sq) => (
          <div
            key={sq.id}
            className="absolute rounded-md bg-white animate-grid-glow shadow-[0_0_15px_rgba(255,255,255,0.8)]"
            style={{
              width: `${sq.size}px`,
              height: `${sq.size}px`,
              left: `${sq.col * 6.5}%`,
              top: `${sq.row * 5}%`,
              animationDelay: `${sq.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Futuristic technical detail lines */}
      <div className="absolute left-10 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent" />
      <div className="absolute right-10 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent" />
    </div>
  )
}
