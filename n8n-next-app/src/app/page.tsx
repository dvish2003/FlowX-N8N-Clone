import { Menu, ArrowRight, Zap, Play, ChevronRight, Activity, Cpu, ShieldCheck } from "lucide-react";
import AnimatedGrid from "./components/general/AnimatedGrid";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-slate-100 overflow-x-hidden font-sans relative">
      
      {/* ANIMATED GRID BACKGROUND */}
      <AnimatedGrid />

      {/* Top Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-16 py-6 bg-transparent border-b border-neutral-900/50 backdrop-blur-md">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 font-black group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-[0.9rem] bg-white text-black shadow-lg shadow-white/10 group-hover:rotate-6 transition-all duration-500">
            <Zap className="h-5 w-5 fill-black text-black" />
          </div>
          <span className="text-xl font-black tracking-tight text-white">
            Flow<span className="text-neutral-400 group-hover:text-white transition-colors">X</span>
          </span>
        </Link>
        
        {/* Links */}
        <div className="hidden md:flex items-center gap-10">
          {['HOME', 'FEATURES', 'INTEGRATIONS', 'DOCUMENTATION'].map(item => (
            <a key={item} href="#" className="text-[10px] font-black text-neutral-400 hover:text-white tracking-widest transition-colors">{item}</a>
          ))}
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden sm:inline-flex text-[10px] font-black tracking-widest uppercase text-neutral-400 hover:text-white px-4 py-2 transition-colors">
            Sign In
          </Link>
          <Link 
            href="/login" 
            className="flex h-9 items-center justify-center rounded-xl bg-white px-5 text-[10px] font-black text-black hover:bg-neutral-200 transition-all uppercase tracking-wider shadow-lg shadow-white/5 border border-white"
          >
            Start Free
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center text-center max-w-7xl mx-auto pt-20 md:pt-28 px-6 pb-24">
        
        {/* New Platform Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-950 border border-neutral-800 text-neutral-300 text-[8px] font-black uppercase tracking-wider mb-8 shadow-[0_0_15px_rgba(255,255,255,0.02)]">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          FLOWX INTELLIGENCE SYSTEM v1.0
        </div>
        
        {/* Main Headline */}
        <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.05] text-white max-w-4xl font-sans">
          Elevate Your Workflows Using <br />
          <span className="bg-gradient-to-r from-white via-neutral-400 to-neutral-700 bg-clip-text text-transparent animate-monochrome-gradient">
            AI-Driven Automation
          </span>
        </h1>

        <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          An intuitive node-based platform that simplifies your tasks, enhances efficiency, and scales your business processes seamlessly.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-20">
          <Link
            href="/login"
            className="flex h-12 items-center justify-center rounded-2xl bg-white px-8 text-xs font-black text-black hover:bg-neutral-200 transition-all uppercase tracking-wider shadow-xl shadow-white/10"
          >
            Start Free Trial
          </Link>
          <Link
            href="/login"
            className="flex h-12 items-center justify-center rounded-2xl bg-neutral-950/50 border border-neutral-800 px-8 text-xs font-black text-white hover:bg-neutral-900/45 transition-all uppercase tracking-wider backdrop-blur-sm"
          >
            Book a Demo
          </Link>
        </div>

        {/* Dashboard Preview */}
        <div className="relative w-full max-w-5xl rounded-[2.5rem] border border-neutral-800 bg-neutral-950/30 p-2 md:p-4 shadow-[0_0_80px_rgba(255,255,255,0.02)] overflow-hidden backdrop-blur-md animate-border-shimmer">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
          <div className="rounded-[1.8rem] overflow-hidden border border-neutral-800 relative aspect-[1.15/1] sm:aspect-[1.5/1] lg:aspect-[16/10]">
            <Image
              src="/hero-graphic.png"
              alt="FlowX Workflow Builder Preview"
              fill
              className="object-cover grayscale contrast-125 brightness-90"
              priority
            />
          </div>
        </div>
      </main>

      {/* Mid Segment Transition */}
      <div className="relative z-10 bg-black border-t border-neutral-900 py-24 px-6 flex flex-col items-center text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Accelerate your processes.
          </h2>
          <p className="text-lg md:text-xl font-light text-neutral-400 leading-relaxed max-w-2xl mx-auto">
            Design, deploy, and debug complex low-code node networks. Integrate with LLMs, APIs, and databases effortlessly.
          </p>
        </div>

        {/* Floating Centered App Icon with bottom line separator */}
        <div className="mt-16 relative flex flex-col items-center justify-center w-full">
          <div className="w-16 h-16 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center p-4 shadow-xl shadow-white/5">
            <Zap className="text-white w-8 h-8 fill-white/10" />
          </div>
          <div className="w-[1px] h-20 bg-gradient-to-b from-white to-transparent mt-4" />
        </div>
      </div>

      {/* Features Grid Grid Section */}
      <div className="relative z-10 bg-black pb-32 px-6 md:px-24 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-8 pt-10">
        
        {/* Feature 1 */}
        <div className="bg-neutral-950/40 border border-neutral-900 p-8 rounded-3xl backdrop-blur-sm hover:border-neutral-700/50 transition-all duration-300 group">
          <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Quantix AI Engine</h3>
          <p className="text-neutral-400 text-sm leading-relaxed">
            Harness powerful AI triggers and nodes to automate content creation, data categorization, and decision systems.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="bg-neutral-950/40 border border-neutral-900 p-8 rounded-3xl backdrop-blur-sm hover:border-neutral-700/50 transition-all duration-300 group">
          <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
            <Activity className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Live Data Streaming</h3>
          <p className="text-neutral-400 text-sm leading-relaxed">
            Monitor and visualise workflow metrics, payloads, and node transaction counts with real-time performance boards.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="bg-neutral-950/40 border border-neutral-900 p-8 rounded-3xl backdrop-blur-sm hover:border-neutral-700/50 transition-all duration-300 group">
          <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Enterprise Shield</h3>
          <p className="text-neutral-400 text-sm leading-relaxed">
            Keep pipeline data secure with robust end-to-end data encryption, custom API tokens, and access policy control.
          </p>
        </div>

      </div>
    </div>
  );
}
