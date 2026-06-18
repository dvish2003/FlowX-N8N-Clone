import { Menu, ArrowRight, Zap, Play, ChevronRight, Activity, Cpu, ShieldCheck } from "lucide-react";
import AnimatedGrid from "./components/general/AnimatedGrid";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#04020a] text-slate-100 overflow-x-hidden font-sans relative">
      
      {/* ANIMATED GRID BACKGROUND */}
      <AnimatedGrid />

      {/* Top Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-16 py-6 bg-transparent border-b border-purple-500/5 backdrop-blur-md">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 font-black group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-[0.9rem] bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20 group-hover:rotate-6 transition-all duration-500">
            <Zap className="h-5 w-5 fill-white text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-white">
            Flow<span className="text-purple-500">X</span>
          </span>
        </Link>
        
        {/* Links */}
        <div className="hidden md:flex items-center gap-10">
          {['HOME', 'FEATURES', 'INTEGRATIONS', 'DOCUMENTATION'].map(item => (
            <a key={item} href="#" className="text-[10px] font-black text-slate-400 hover:text-purple-400 tracking-widest transition-colors">{item}</a>
          ))}
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden sm:inline-flex text-[10px] font-black tracking-widest uppercase text-slate-300 hover:text-white px-4 py-2">
            Sign In
          </Link>
          <Link 
            href="/login" 
            className="flex h-9 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 text-[10px] font-black text-white hover:from-purple-500 hover:to-indigo-500 transition-all uppercase tracking-wider shadow-lg shadow-purple-500/20"
          >
            Start Free
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center text-center max-w-7xl mx-auto pt-20 md:pt-28 px-6 pb-24">
        
        {/* New Platform Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-950/45 border border-purple-500/35 text-purple-200 text-[8px] font-black uppercase tracking-wider mb-8 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
          FLOWX INTELLIGENCE SYSTEM v1.0
        </div>
        
        {/* Main Headline */}
        <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.05] text-white max-w-4xl font-sans">
          Elevate Your Workflows Using <br />
          <span className="bg-gradient-to-r from-purple-400 via-fuchsia-500 to-blue-400 bg-clip-text text-transparent">
            AI-Driven Automation
          </span>
        </h1>

        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          An intuitive node-based platform that simplifies your tasks, enhances efficiency, and scales your business processes seamlessly.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-20">
          <Link
            href="/login"
            className="flex h-12 items-center justify-center rounded-2xl bg-white px-8 text-xs font-black text-slate-950 hover:bg-slate-100 transition-all uppercase tracking-wider shadow-xl shadow-white/10"
          >
            Start Free Trial
          </Link>
          <Link
            href="/login"
            className="flex h-12 items-center justify-center rounded-2xl bg-purple-950/50 border border-purple-500/20 px-8 text-xs font-black text-white hover:bg-purple-900/40 transition-all uppercase tracking-wider backdrop-blur-sm"
          >
            Book a Demo
          </Link>
        </div>

        {/* Generated Image Centerpiece (Dashboard Preview) */}
        <div className="relative w-full max-w-5xl rounded-[2.5rem] border border-purple-500/20 bg-purple-950/10 p-2 md:p-4 shadow-[0_0_80px_rgba(139,92,246,0.15)] overflow-hidden backdrop-blur-md">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />
          <div className="rounded-[1.8rem] overflow-hidden border border-purple-500/10 relative aspect-[1.15/1] sm:aspect-[1.5/1] lg:aspect-[16/10]">
            <Image
              src="/hero-graphic.png"
              alt="FlowX Workflow Builder Preview"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </main>

      {/* Mid Segment Transition */}
      <div className="relative z-10 bg-[#06030e] border-t border-purple-900/20 py-24 px-6 flex flex-col items-center text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Accelerate your processes.
          </h2>
          <p className="text-lg md:text-xl font-light text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Design, deploy, and debug complex low-code node networks. Integrate with LLMs, APIs, and databases effortlessly.
          </p>
        </div>

        {/* Floating Centered App Icon with bottom line separator */}
        <div className="mt-16 relative flex flex-col items-center justify-center w-full">
          <div className="w-16 h-16 rounded-2xl bg-[#0b071a] border border-purple-500/20 flex items-center justify-center p-4 shadow-xl shadow-purple-900/10">
            <Zap className="text-purple-500 w-8 h-8 fill-purple-500/20" />
          </div>
          <div className="w-[1px] h-20 bg-gradient-to-b from-purple-500 to-transparent mt-4" />
        </div>
      </div>

      {/* Features Grid Section */}
      <div className="relative z-10 bg-[#06030e] pb-32 px-6 md:px-24 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-8 pt-10">
        
        {/* Feature 1 */}
        <div className="bg-[#0b071a]/50 border border-purple-900/20 p-8 rounded-3xl backdrop-blur-sm hover:border-purple-500/40 transition-all duration-300 group">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Quantix AI Engine</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Harness powerful AI triggers and nodes to automate content creation, data categorization, and decision systems.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="bg-[#0b071a]/50 border border-purple-900/20 p-8 rounded-3xl backdrop-blur-sm hover:border-purple-500/40 transition-all duration-300 group">
          <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-400 mb-6 group-hover:scale-110 transition-transform">
            <Activity className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Live Data Streaming</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Monitor and visualise workflow metrics, payloads, and node transaction counts with real-time performance boards.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="bg-[#0b071a]/50 border border-purple-900/20 p-8 rounded-3xl backdrop-blur-sm hover:border-purple-500/40 transition-all duration-300 group">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Enterprise Shield</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Keep pipeline data secure with robust end-to-end data encryption, custom API tokens, and access policy control.
          </p>
        </div>

      </div>
    </div>
  );
}
