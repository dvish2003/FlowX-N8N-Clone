'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Zap, LayoutGrid, Sliders, Box } from 'lucide-react'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu'
import AuthButton from '../auth/AuthButton'

const TopNav = () => {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { label: 'Workflows', href: '/workflows', icon: LayoutGrid },
    { label: 'Automation Hub', href: '/projects', icon: Box },
    { label: 'System Admin', href: '/settings', icon: Sliders },
  ]

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/70 backdrop-blur-2xl transition-all duration-300">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6 md:px-8">
        <div className="flex items-center gap-10">
           <Link href="/" className="flex items-center gap-3 font-black group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-[0.9rem] bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 group-hover:rotate-6 transition-all duration-500">
              <Zap className="h-5 w-5 fill-white" />
            </div>
            <span className="hidden sm:inline text-xl font-black tracking-tight text-slate-900">
              Flow<span className="text-blue-600">X</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/30">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2.5 ${
                  isActive(item.href)
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50 scale-[1.02]'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                {item.icon && <item.icon className={`w-4 h-4 ${isActive(item.href) ? 'text-blue-600' : 'text-slate-400'}`}/>}
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-1">
             <div className="px-3 py-1 rounded-full bg-blue-50 text-[10px] font-bold text-blue-600 tracking-widest uppercase border border-blue-100">AI Enabled</div>
          </div>
          <div className="h-6 w-px bg-slate-200 mx-1" />
          <AuthButton />

          <DropdownMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="hover:bg-slate-100 rounded-xl">
                {mobileMenuOpen ? (
                  <X className="h-5 w-5 text-slate-900" />
                ) : (
                  <Menu className="h-5 w-5 text-slate-900" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 border border-slate-200 p-2 shadow-2xl rounded-[2rem]">
              {navItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild className="rounded-xl mb-1">
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 cursor-pointer font-bold uppercase text-[10px] tracking-widest p-3 ${isActive(item.href) ? 'bg-blue-50 text-blue-600' : 'text-slate-600'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.icon && <item.icon className="w-4 h-4" />}
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="my-2 bg-slate-100" />
              <DropdownMenuItem className="cursor-pointer font-bold uppercase text-[10px] tracking-widest text-red-500 p-3 rounded-xl hover:bg-red-50 hover:text-red-600">
                Terminate Session
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

export default TopNav
