"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UserPlus, Shield, AlertCircle, Loader2, Link, Zap, Plus, Home, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { ThemeToggle } from '@/components/ThemeToggle';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/apiFetch';

export default function JoinProjectPage() {
    const router = useRouter();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/join/code`, {
                method: 'POST',
                body: JSON.stringify({ code })
            });

            if (res.ok) {
                const data = await res.json();
                toast.success('Initiative Joined');
                router.push(`/projects/${data.projectId}`);
            } else {
                const errData = await res.json().catch(() => ({}));
                const msg = errData.error || errData.message || 'Authorization failed';
                setError(msg);
                toast.error(msg);
            }
        } catch (e: any) {
            setError(e.message ?? 'Network disruption detected.');
            toast.error('Sync failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background/50 h-full overflow-y-auto custom-scrollbar flex flex-col">
            {/* Standardized Compact Header */}
            <header className="sticky top-0 z-50 bg-black/40 backdrop-blur-3xl border-b border-white/5 px-6 md:px-10 py-1 flex items-center justify-between gap-8 h-12">
                <div className="flex items-center gap-6 min-w-0">
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="w-6 h-6 bg-primary/10 rounded-md border border-primary/20 flex items-center justify-center">
                            <UserPlus size={12} className="text-primary" />
                        </div>
                        <h1 className="text-xs font-black tracking-tight text-foreground uppercase italic truncate max-w-[200px]">
                            Join Initiative
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        className="h-8 px-4 bg-white/5 text-muted-foreground text-[8px] font-black uppercase tracking-widest rounded-lg hover:bg-white/10 transition-all"
                        onClick={() => router.push('/projects')}
                    >
                        Portfolio
                    </button>
                    <ThemeToggle />
                </div>
            </header>

            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="max-w-md w-full bg-card/40 border border-white/5 rounded-2xl p-8 shadow-2xl relative overflow-hidden group"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <Shield size={16} className="text-primary" />
                        <h2 className="text-xs font-black uppercase tracking-tight italic opacity-40">Security Clearance</h2>
                    </div>

                    <div className="text-center mb-10">
                        <h1 className="text-2xl font-black tracking-tight mb-2 uppercase italic">Join Authority</h1>
                        <p className="text-[10px] font-medium text-muted-foreground/60 leading-relaxed uppercase tracking-widest">
                            Input a unique invitation signature to establish secure access.
                        </p>
                    </div>

                    <form onSubmit={handleJoin} className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 ml-1">Access Protocol Code</label>
                            <div className="relative group/input">
                                <input
                                    type="text"
                                    required
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                                    placeholder="SIG-XXXX-XXXX"
                                    className="w-full bg-black/40 border border-white/5 rounded-lg px-6 py-4 text-sm font-black tracking-[0.2em] focus:ring-1 focus:ring-primary/20 transition-all text-center outline-none uppercase placeholder:opacity-20 placeholder:tracking-normal font-mono"
                                />
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/20 group-focus-within/input:text-primary transition-all">
                                    <Link size={14} />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-3 p-3 bg-rose-500/5 border border-rose-500/10 rounded-lg text-rose-500 text-[9px] font-black uppercase tracking-widest"
                            >
                                <AlertCircle size={14} className="shrink-0" />
                                <p className="flex-1">{error}</p>
                            </motion.div>
                        )}

                        <div className="pt-6 border-t border-white/5">
                            <button
                                type="submit"
                                disabled={loading || !code || code.length < 4}
                                className="w-full bg-primary text-primary-foreground h-12 rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group/btn"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        VERIFYING...
                                    </>
                                ) : (
                                    <>
                                        <Zap size={16} className="group-hover:rotate-12 transition-transform" />
                                        AUTHORIZE LINK
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>

                <footer className="mt-12 text-center opacity-10">
                    <p className="text-[7px] font-black uppercase tracking-[0.5em] text-muted-foreground italic">Strategic Protocol Layer • AntiGravity Command</p>
                </footer>
            </div>
        </div>
    );
}
