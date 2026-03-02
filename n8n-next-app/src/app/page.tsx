import Image from "next/image";
import { Zap, ArrowRight, Brain, Link as LinkIcon, Shield, Layers } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-20 py-5 bg-white/70 backdrop-blur-2xl border-b border-slate-100 shadow-sm transition-all duration-500">
        <div className="flex items-center gap-2.5 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:rotate-6 transition-all duration-500">
            <Zap className="h-5 w-5 fill-white" />
          </div>
          <span className="text-xl font-black tracking-tighter text-slate-900 uppercase">
             Flow<span className="text-blue-600">X</span>
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-10">
          {['Product', 'Pricing', 'Docs'].map(item => (
            <a key={item} href="#" className="text-sm font-bold text-slate-500 hover:text-slate-900 uppercase tracking-widest transition-colors">{item}</a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <a href="/login" className="px-6 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors uppercase tracking-widest">Login</a>
          <a href="/login" className="px-6 py-2.5 text-sm font-black bg-[var(--primary)] text-white rounded-xl shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest">Get Started</a>
        </div>
      </nav>

      <main className="relative z-10 flex flex-col items-center text-center max-w-7xl mx-auto pt-40 md:pt-56 px-6 pb-40">
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] mb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <SparkleIcon className="w-3 h-3 fill-current" /> Next-Gen Integration Hub
        </div>
        
        <h1 className="text-5xl md:text-8xl font-black tracking-tight mb-8 leading-[0.95] text-slate-900 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150">
          Automate Beyond <br />
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent italic">
            Limitations
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-500 mb-14 max-w-2xl mx-auto font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          FlowX empowers your team to build autonomous neural-based workflows. 
          Connect every tool in your stack with intelligence that learns.
        </p>

        <div className="flex flex-col sm:flex-row gap-5 mb-32 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
          <a
            href="/login"
            className="group flex h-16 items-center justify-center gap-3 rounded-[1.2rem] bg-slate-900 px-10 text-lg font-black text-white shadow-2xl transition-all hover:bg-black hover:scale-105 active:scale-95 uppercase tracking-widest"
          >
            Launch Sequence <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="https://github.com"
            className="flex h-16 items-center justify-center gap-3 rounded-[1.2rem] border-2 border-slate-100 bg-white px-10 text-lg font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 uppercase tracking-widest"
          >
            Core Repository
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-700">
           {[
             { title: 'Neural Nodes', icon: Brain, desc: 'AI units that understand context and perform complex logic.' },
             { title: 'Any-Connect', icon: LinkIcon, desc: 'Connect to 10,000+ APIs with advanced protocol handling.' },
             { title: 'Secure Flow', icon: Shield, desc: 'Enterprise-grade encryption for your mission critical data.' }
           ].map((feature, idx) => (
             <div key={idx} className="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 text-left hover:bg-white hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 group">
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-sm border border-slate-100 text-[var(--primary)] group-hover:scale-110 transition-transform">
                   <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
             </div>
           ))}
        </div>
      </main>

      <footer className="relative z-10 py-12 border-t border-slate-100 w-full text-center">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            &copy; 2025 FLOWX AEROSPACE SYSTEMS // BUILT FOR ELITE AUTOMATION
        </p>
      </footer>
    </div>
  );
}

function SparkleIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  )
}

