"use client"
import React, { useState } from 'react'
import { signIn } from 'next-auth/react';
import { Zap, ShieldCheck, ArrowLeft, Loader2, Mail, Lock, User, CheckCircle2, KeyRound } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import AnimatedGrid from '@/app/components/general/AnimatedGrid';

const LoginPage = () => {
    const router = useRouter();
    const [isRegister, setIsRegister] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');

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

    const handleForgotPasswordRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            
            toast.success("Reset code sent to your email!");
            setIsResetting(true);
        } catch (error: any) {
            toast.error(error.message || "Failed to request reset code");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: resetCode, password: newPassword }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            
            toast.success("Password updated successfully! Please login.");
            setIsForgotPassword(false);
            setIsResetting(false);
            setResetCode('');
            setNewPassword('');
        } catch (error: any) {
            toast.error(error.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className='min-h-screen flex items-center justify-center bg-black relative overflow-hidden font-sans text-slate-200'>
            {/* ANIMATED GRID BACKDROP */}
            <AnimatedGrid />

            <div className='relative z-10 w-full max-w-[480px] px-6 py-12'>
                <div className='flex flex-col items-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700'>
                    <Link href="/" className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-neutral-950/80 backdrop-blur-md shadow-xl border border-neutral-800/80 hover:scale-105 active:scale-95 transition-all group">
                         <ArrowLeft className='w-4 h-4 text-neutral-400 group-hover:text-white transition-colors' />
                         <span className='text-[10px] font-black uppercase tracking-widest text-neutral-400 group-hover:text-white'>Back to Home</span>
                    </Link>
                </div>

                <div className='bg-neutral-950/75 rounded-[2.5rem] shadow-[0_32px_128px_rgba(0,0,0,0.6)] border border-neutral-900/80 p-8 md:p-12 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 animate-border-shimmer'>
                    <div className='flex flex-col items-center mb-8 text-center'>
                         <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-black shadow-2xl shadow-white/5 mb-6">
                            {isForgotPassword ? <KeyRound className="w-8 h-8 text-black" /> : <Zap className="w-8 h-8 fill-black text-black" />}
                         </div>
                         <h1 className='text-3xl font-black text-white tracking-tight'>
                            {isForgotPassword 
                                ? (isResetting ? "Reset Password" : "Forgot Password")
                                : isVerifying ? "Verify Email" : isRegister ? "Create Account" : "Welcome Back"
                            }
                         </h1>
                         <p className='text-neutral-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-3'>
                            {isForgotPassword 
                                ? (isResetting ? "Set a new login credential" : "Enter your email to receive a code")
                                : isVerifying ? "Enter the 6-digit code sent to your mail" : "Identify to access the Hub"
                            }
                         </p>
                    </div>

                    {isForgotPassword ? (
                        // FORGOT PASSWORD FLOW
                        !isResetting ? (
                            <form onSubmit={handleForgotPasswordRequest} className='space-y-4'>
                                <div className='relative'>
                                    <Mail className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400' />
                                    <input 
                                        type="email" 
                                        placeholder="Email Address" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className='w-full h-14 pl-12 pr-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 focus:bg-neutral-900 focus:border-white focus:ring-4 focus:ring-white/5 outline-none transition-all font-medium text-white placeholder-neutral-600'
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className='w-full h-14 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-neutral-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-white/5 border border-white'
                                >
                                    {loading && <Loader2 className='w-4 h-4 animate-spin' />}
                                    Send Reset Code
                                </button>

                                <p className='text-center mt-6'>
                                    <button 
                                        type="button"
                                        onClick={() => setIsForgotPassword(false)}
                                        className='text-[11px] font-bold text-neutral-400/80 uppercase tracking-widest hover:text-white transition-colors'
                                    >
                                        Back to Login
                                    </button>
                                </p>
                            </form>
                        ) : (
                            <form onSubmit={handleResetPasswordSubmit} className='space-y-4'>
                                <div className='flex justify-center mb-2'>
                                    <div className='w-full max-w-[280px]'>
                                        <input 
                                            type="text" 
                                            maxLength={6}
                                            placeholder="000000" 
                                            value={resetCode}
                                            onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                                            className='w-full h-20 text-center text-4xl font-black tracking-[0.5em] rounded-3xl bg-neutral-900/60 border-2 border-neutral-800 focus:bg-neutral-900 focus:border-white focus:ring-8 focus:ring-white/5 outline-none transition-all text-white placeholder-neutral-800'
                                            required
                                        />
                                    </div>
                                </div>

                                <div className='relative'>
                                    <Lock className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400' />
                                    <input 
                                        type="password" 
                                        placeholder="New Password" 
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className='w-full h-14 pl-12 pr-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 focus:bg-neutral-900 focus:border-white focus:ring-4 focus:ring-white/5 outline-none transition-all font-medium text-white placeholder-neutral-600'
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || resetCode.length !== 6 || !newPassword}
                                    className='w-full h-14 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-neutral-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-white/5 border border-white'
                                >
                                    {loading ? <Loader2 className='w-4 h-4 animate-spin' /> : <CheckCircle2 className='w-4 h-4' />}
                                    Reset Password
                                </button>

                                <button 
                                    type="button"
                                    onClick={() => setIsResetting(false)}
                                    className='w-full text-[11px] font-bold text-neutral-400/60 uppercase tracking-widest hover:text-white transition-colors'
                                >
                                    Re-enter email
                                </button>
                            </form>
                        )
                    ) : (
                        // STANDARD LOGIN / REGISTRATION FLOW
                        !isVerifying ? (
                            <form onSubmit={handleEmailAuth} className='space-y-4'>
                                {isRegister && (
                                    <div className='space-y-2'>
                                        <div className='relative'>
                                            <User className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400' />
                                            <input 
                                                type="text" 
                                                placeholder="Full Name" 
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className='w-full h-14 pl-12 pr-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 focus:bg-neutral-900 focus:border-white focus:ring-4 focus:ring-white/5 outline-none transition-all font-medium text-white placeholder-neutral-600'
                                                required={isRegister}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className='space-y-4'>
                                    <div className='relative'>
                                        <Mail className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400' />
                                        <input 
                                            type="email" 
                                            placeholder="Email Address" 
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className='w-full h-14 pl-12 pr-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 focus:bg-neutral-900 focus:border-white focus:ring-4 focus:ring-white/5 outline-none transition-all font-medium text-white placeholder-neutral-600'
                                            required
                                        />
                                    </div>
                                    <div className='relative'>
                                        <Lock className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400' />
                                        <input 
                                            type="password" 
                                            placeholder="Password" 
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className='w-full h-14 pl-12 pr-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 focus:bg-neutral-900 focus:border-white focus:ring-4 focus:ring-white/5 outline-none transition-all font-medium text-white placeholder-neutral-600'
                                            required
                                        />
                                    </div>
                                </div>

                                {!isRegister && (
                                    <div className='flex justify-end px-1'>
                                        <button 
                                            type="button" 
                                            onClick={() => setIsForgotPassword(true)}
                                            className='text-[10px] font-bold text-neutral-400 hover:text-white transition-colors uppercase tracking-wider'
                                        >
                                            Forgot Password?
                                        </button>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className='w-full h-14 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-neutral-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-white/5 border border-white'
                                >
                                    {loading && <Loader2 className='w-4 h-4 animate-spin' />}
                                    {isRegister ? "Start Activation" : "Authorize Access"}
                                </button>

                                <p className='text-center mt-6'>
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setIsRegister(!isRegister);
                                            setIsVerifying(false);
                                        }}
                                        className='text-[11px] font-bold text-neutral-400/80 uppercase tracking-widest hover:text-white transition-colors'
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
                                            className='w-full h-20 text-center text-4xl font-black tracking-[0.5em] rounded-3xl bg-neutral-900/60 border-2 border-neutral-800 focus:bg-neutral-900 focus:border-white focus:ring-8 focus:ring-white/5 outline-none transition-all text-white placeholder-neutral-800'
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <button
                                    type="submit"
                                    disabled={loading || code.length !== 6}
                                    className='w-full h-14 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-neutral-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-white/5 border border-white'
                                >
                                    {loading ? <Loader2 className='w-4 h-4 animate-spin' /> : <CheckCircle2 className='w-4 h-4' />}
                                    Verify Terminal Code
                                </button>

                                <button 
                                    type="button"
                                    onClick={() => setIsVerifying(false)}
                                    className='text-[11px] font-bold text-neutral-400/60 uppercase tracking-widest hover:text-white transition-colors'
                                >
                                    Re-enter email or password
                                </button>
                            </form>
                        )
                    )}

                    <div className='pt-8 mt-8 border-t border-neutral-900 flex flex-col items-center gap-4'>
                        <div className='flex items-center gap-2 px-3 py-1 bg-neutral-900 text-neutral-400 rounded-full border border-neutral-800'>
                            <ShieldCheck className='w-3.5 h-3.5' />
                            <span className='text-[9px] font-black uppercase tracking-wider'>Quantum Cryptography Secured</span>
                        </div>
                    </div>
                </div>

                <div className='mt-10 text-center opacity-40 hover:opacity-100 transition-opacity duration-500'>
                    <p className='text-[10px] font-black text-neutral-500 uppercase tracking-widest leading-loose'>
                        FlowX Intelligence Systems <br />
                        Global Authorization Terminal v1.0.42
                    </p>
                </div>
            </div>
        </section>
    )
}

export default LoginPage 
