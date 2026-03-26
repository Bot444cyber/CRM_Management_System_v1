'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { EyeOff, Eye, Loader2, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';

function LoginContent() {
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<'login' | 'otp'>('login');
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // OTP State
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const toastId = toast.loading('Signing in...');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error?.issues?.[0]?.message || data.error || "Failed to login", { id: toastId });
                setIsLoading(false);
                return;
            }

            if (data.isTwoFactorEnabled) {
                toast.dismiss(toastId);
                toast.success('Check your email for OTP');
                setStep('otp');
            } else {
                if (data.accessToken) localStorage.setItem("accessToken", data.accessToken);
                if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
                toast.success('Signed in successfully!', { id: toastId });
                window.location.href = "/"; // redirect to dashboard

            }
        } catch (err: any) {
            toast.error(err.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        try {
            const toastId = toast.loading('Signing in with Google...');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: credentialResponse.credential })
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error?.issues?.[0]?.message || data.error || "Google login failed", { id: toastId });
                return;
            }

            if (data.isTwoFactorEnabled) {
                toast.dismiss(toastId);
                toast.success('Check your email for OTP');
                setStep('otp'); // Could happen if user enforced 2FA
            } else {
                if (data.accessToken) localStorage.setItem("accessToken", data.accessToken);
                if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
                toast.success('Signed in successfully!', { id: toastId });
                window.location.href = "/";

            }
        } catch (err: any) {
            toast.error(err.message || 'An error occurred with Google login');
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) value = value[0];
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value !== '' && index < 5 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && otp[index] === '' && index > 0 && inputRefs.current[index - 1]) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const otpString = otp.join('');
            const toastId = toast.loading('Verifying OTP...');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp: otpString })
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error?.issues?.[0]?.message || data.error || "Invalid OTP", { id: toastId });
                setIsLoading(false);
                return;
            }

            if (data.accessToken) localStorage.setItem("accessToken", data.accessToken);
            if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
            toast.success('OTP Verified. Signed in successfully!', { id: toastId });
            window.location.href = "/";
        } catch (err: any) {
            toast.error(err.message || 'OTP verification failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white flex flex-col lg:flex-row w-full font-sans selection:bg-orange-500/30 overflow-hidden">

            {/* Left Side (Professional Image Canvas) */}
            <div className="hidden lg:flex w-[45%] xl:w-[50%] relative overflow-hidden bg-black flex-col justify-between">
                {/* Stunning Professional Unsplash Image */}
                <Image
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
                    alt="Data Analytics"
                    fill
                    className="object-cover opacity-60"
                    priority
                />

                {/* Advanced Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0a0a0a]" />

                {/* Content Overlay */}
                <div className="relative z-10 p-12 lg:p-16 h-full flex flex-col justify-between">
                    <div>
                        <Link href="/" className="flex items-center gap-2 mb-12 w-fit">
                            <div className="w-8 h-8 rounded-full bg-white p-[2px]">
                                <div className="w-full h-full bg-black rounded-full flex items-center justify-center border border-white/20">
                                    <div className="w-3.5 h-3.5 bg-white rounded-full" />
                                </div>
                            </div>
                            <span className="font-semibold text-2xl tracking-tight text-white drop-shadow-md">Nexus</span>
                        </Link>
                    </div>

                    <div className="max-w-xl">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-5xl xl:text-7xl font-medium tracking-tight mb-6 leading-[1.1] text-white"
                        >
                            Elevate your<br />business.
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            className="text-white/70 text-lg max-w-md font-light leading-relaxed"
                        >
                            Global management made simple. Powerful online CRM solutions tailored for your scale.
                        </motion.p>
                    </div>
                </div>
            </div>

            {/* Right Side (Form) */}
            <div className="w-full lg:w-[55%] xl:w-[50%] p-8 sm:p-12 lg:p-20 flex flex-col justify-center relative bg-[#0a0a0a] min-h-screen">

                {/* Background glow specific to the form side */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.03)_0%,transparent_80%)] pointer-events-none" />

                <div className="absolute top-8 right-8 text-sm z-20">
                    <span className="text-white/40">New to Nexus? </span>
                    <Link href="/register" className="text-white hover:text-white/80 transition-colors font-medium border-b border-transparent hover:border-white pb-0.5">Sign Up</Link>
                </div>

                <div className="w-full max-w-[400px] mx-auto lg:ml-auto lg:mr-24 relative z-10">
                    {/* Mobile Logo */}
                    <Link href="/" className="flex lg:hidden items-center gap-2 mb-12">
                        <div className="w-8 h-8 rounded-full bg-white p-[2px]">
                            <div className="w-full h-full bg-black rounded-full flex items-center justify-center border border-white/20">
                                <div className="w-3.5 h-3.5 bg-white rounded-full" />
                            </div>
                        </div>
                        <span className="font-semibold text-2xl tracking-tight text-white">Nexus</span>
                    </Link>

                    {step === 'login' ? (
                        <motion.div
                            key="login"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 className="text-4xl font-medium tracking-tight mb-10">Sign In</h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Email Address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-white text-[15px] focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all placeholder:text-white/30"
                                        required
                                    />
                                </div>

                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-6 pr-12 text-white text-[15px] focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all placeholder:text-white/30"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors p-1"
                                    >
                                        {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>
                                </div>

                                <div className="flex justify-start pt-1 pb-4">
                                    <Link href="/forgot-password" className="text-sm text-white/40 hover:text-white transition-colors">
                                        Forgot password?
                                    </Link>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-white text-black font-semibold rounded-xl py-4 text-[15px] hover:bg-white/90 transition-colors active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                        <>
                                            Sign In
                                            <ArrowRight className="w-4 h-4 opacity-70 ml-1" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-10 flex justify-center w-full">
                                <div className="w-full h-[54px] rounded-xl overflow-hidden [&>div]:w-full [&>div>div]:w-full!">
                                    <GoogleLogin
                                        onSuccess={handleGoogleSuccess}
                                        onError={() => toast.error('Google Authentication Failed')}
                                        theme="filled_black"
                                        size="large"
                                        shape="pill"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="otp"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 className="text-4xl font-medium tracking-tight mb-2">Two-Step Verification</h2>
                            <p className="text-white/40 mb-10 text-[15px]">We sent a verification code to <span className="text-white font-medium">{email}</span>.</p>

                            <form onSubmit={handleOtpSubmit} className="space-y-8">
                                <div className="flex justify-between gap-2 sm:gap-4">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => { inputRefs.current[index] = el; }}
                                            type="text"
                                            inputMode="numeric"
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            className="w-12 h-14 sm:w-14 sm:h-16 bg-white/5 border border-white/10 rounded-2xl text-center text-xl font-bold text-white focus:outline-none focus:border-white/40 transition-colors focus:bg-white/10"
                                        />
                                    ))}
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        disabled={isLoading || otp.some(d => d === '')}
                                        className="w-full bg-white text-black font-semibold rounded-xl py-4 text-[15px] hover:bg-white/90 transition-colors active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                    >
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Login'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setStep('login')}
                                        className="w-full text-white/40 hover:text-white text-[15px] py-4 mt-2 transition-colors font-medium"
                                    >
                                        Back to Login
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </div>

                {/* Footer links */}
                <div className="absolute bottom-8 right-8 left-8 lg:left-0 lg:pl-20 text-[11px] text-white/30 font-medium flex justify-between items-center z-20">
                    <div>© 2005-2025 Nexus Inc.</div>
                    <div className="flex gap-4 sm:gap-6 items-center">
                        <Link href="#" className="hover:text-white transition-colors hidden sm:block">Privacy</Link>
                        <Link href="#" className="hover:text-white transition-colors hidden sm:block">Terms</Link>
                        <button className="flex items-center gap-1 hover:text-white transition-colors">
                            English
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function LoginPage() {
    return (
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "your_google_client_id_here"}>
            <LoginContent />
        </GoogleOAuthProvider>
    );
}
