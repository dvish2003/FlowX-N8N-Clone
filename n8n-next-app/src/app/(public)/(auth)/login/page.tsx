"use client"
import Image from 'next/image';
import React, { useState } from 'react'
import { signIn } from 'next-auth/react';
import { Zap, ShieldCheck, ArrowLeft, Loader2, Mail, Lock, User, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

const LoginPage = () => {
    const router = useRouter();
    const [isRegister, setIsRegister] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [code, setCode] = useState('');

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isRegister && !isVerifying) {
                // Register Step
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, name }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message);
                
                toast.success("Verification code sent to your email!");
                setIsVerifying(true);
            } else if (isVerifying) {
                // Verify Step
                const res = await fetch('/api/auth/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, code }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message);
                
                toast.success("Account verified! You can now login.");
                setIsVerifying(false);
                setIsRegister(false);
            } else {
                // Login Step
                const result = await signIn('credentials', {
                    redirect: false,
                    email,
                    password,
                });

                if (result?.error) {
                   toast.error(result.error);
                } else {
                    router.push('/projects');
                    router.refresh();
                }
            }
        } catch (error: any) {
            toast.error(error.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className='min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden font-sans'>
            <div className='absolute top-0 left-0 w-full h-full pointer-events-none'>
                <div className='absolute -top-24 -left-24 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl' />
                <div className='absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl' />
            </div>

            <div className='relative z-10 w-full max-w-[480px] px-6 py-12'>
                <div className='flex flex-col items-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700'>
                    <Link href="/" className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white shadow-xl shadow-blue-500/5 border border-slate-100 hover:scale-105 active:scale-95 transition-all group">
                         <ArrowLeft className='w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors' />
                         <span className='text-[10px] font-black uppercase tracking-widest text-slate-500'>Back to Core</span>
                    </Link>
                </div>

                <div className='bg-white rounded-[2.5rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.08)] border border-slate-100 p-8 md:p-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150'>
                    <div className='flex flex-col items-center mb-8 text-center'>
                         <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-blue-500/20 mb-6">
                            <Zap className="w-8 h-8 fill-white" />
                         </div>
                         <h1 className='text-3xl font-black text-slate-900 tracking-tight'>
                            {isVerifying ? "Verify Email" : isRegister ? "Create Account" : "Welcome Back"}
                         </h1>
                         <p className='text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-3'>
                            {isVerifying ? "Enter the 6-digit code sent to your mail" : "Identify to access the Hub"}
                         </p>
                    </div>

                    {!isVerifying ? (
                        <form onSubmit={handleEmailAuth} className='space-y-4'>
                            {isRegister && (
                                <div className='space-y-2'>
                                    <div className='relative'>
                                        <User className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
                                        <input 
                                            type="text" 
                                            placeholder="Full Name" 
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className='w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-medium text-slate-900'
                                            required={isRegister}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className='space-y-4'>
                                <div className='relative'>
                                    <Mail className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
                                    <input 
                                        type="email" 
                                        placeholder="Email Address" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className='w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-medium text-slate-900'
                                        required
                                    />
                                </div>
                                <div className='relative'>
                                    <Lock className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
                                    <input 
                                        type="password" 
                                        placeholder="Password" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className='w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-medium text-slate-900'
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className='w-full h-14 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:pointer-events-none'
                            >
                                {loading && <Loader2 className='w-4 h-4 animate-spin' />}
                                {isRegister ? "Start Activation" : "Authorize Access"}
                            </button>

                            <div className='flex items-center gap-4 py-2'>
                                <div className='h-[1px] flex-1 bg-slate-100' />
                                <span className='text-[10px] font-bold text-slate-300 uppercase tracking-widest'>OR</span>
                                <div className='h-[1px] flex-1 bg-slate-100' />
                            </div>

                            <button
                                type="button"
                                onClick={() => signIn('google', { callbackUrl: '/projects' })}
                                className='w-full flex items-center justify-center gap-4 h-14 px-6 rounded-2xl border-2 border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-200 transition-all duration-300 group'
                            >
                                <Image src='/icons/google.png' alt='Google Logo' width={22} height={22} className='transition-transform group-hover:scale-110' />
                                <span className='text-sm font-black text-slate-700 uppercase tracking-widest'>Core Identity</span>
                            </button>

                            <p className='text-center mt-6'>
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setIsRegister(!isRegister);
                                        setIsVerifying(false);
                                    }}
                                    className='text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-blue-500 transition-colors'
                                >
                                    {isRegister ? "Already have access? Authorize" : "New Operator? Create Account"}
                                </button>
                            </p>
                        </form>
                    ) : (
                        <form onSubmit={handleEmailAuth} className='space-y-6'>
                            <div className='flex justify-center'>
                                <div className='w-full max-w-[280px]'>
                                    <input 
                                        type="text" 
                                        maxLength={6}
                                        placeholder="000000" 
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                        className='w-full h-20 text-center text-4xl font-black tracking-[0.5em] rounded-3xl bg-slate-50 border-2 border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-8 focus:ring-blue-500/5 outline-none transition-all text-slate-900 placeholder:opacity-20'
                                        required
                                    />
                                </div>
                            </div>
                            
                            <button
                                type="submit"
                                disabled={loading || code.length !== 6}
                                className='w-full h-14 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:pointer-events-none'
                            >
                                {loading ? <Loader2 className='w-4 h-4 animate-spin' /> : <CheckCircle2 className='w-4 h-4' />}
                                Verify Terminal Code
                            </button>

                            <button 
                                type="button"
                                onClick={() => setIsVerifying(false)}
                                className='w-full text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors'
                            >
                                Re-enter email or password
                            </button>
                        </form>
                    )}

                    <div className='pt-8 mt-8 border-t border-slate-50 flex flex-col items-center gap-4'>
                        <div className='flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full border border-green-100'>
                            <ShieldCheck className='w-3.5 h-3.5' />
                            <span className='text-[9px] font-black uppercase tracking-wider'>Quantum Cryptography Secured</span>
                        </div>
                    </div>
                </div>

                <div className='mt-10 text-center opacity-40 hover:opacity-100 transition-opacity duration-500'>
                    <p className='text-[10px] font-black text-slate-500 uppercase tracking-widest leading-loose'>
                        FlowX Intelligence Systems <br />
                        Global Authorization Terminal v1.0.42
                    </p>
                </div>
            </div>
        </section>
    )
}

export default LoginPage 
