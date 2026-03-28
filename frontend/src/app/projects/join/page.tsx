"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UserPlus, Shield, AlertCircle, Loader2, Link, Zap, Plus, Home, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { ThemeToggle } from '@/components/ThemeToggle';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/apiFetch';
import { useSidebar } from '@/context/SidebarContext';
import { Menu } from 'lucide-react';

export default function JoinProjectPage() {
    const router = useRouter();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { setIsMobileOpen } = useSidebar();

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
        <div className="bg-background h-full overflow-hidden flex flex-col">
            {/* Standardized Header */}
            <header className="h-16 border-b border-border bg-card/80 backdrop-blur-xl px-6 flex items-center justify-between shrink-0 z-50 shadow-sm">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => setIsMobileOpen(true)}
                        className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground transition-all shrink-0"
                    >
                        <Menu size={18} />
                    </button>

                    <div className="flex items-center gap-4 shrink-0">
                        <div className="w-9 h-9 bg-secondary border border-border rounded-xl flex items-center justify-center shadow-xs">
                            <UserPlus size={16} className="text-primary" />
                        </div>
                        <h1 className="text-sm font-black tracking-tight text-foreground uppercase leading-none">
                            Join Initiative
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        className="h-9 px-6 bg-secondary text-muted-foreground text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-accent border border-border transition-all shadow-xs"
                        onClick={() => router.push('/projects')}
                    >
                        Portfolio
                    </button>
                    <ThemeToggle />
                </div>
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center justify-center p-6 md:p-10 relative">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-size-[50px_50px] pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="max-w-md w-full bg-card border border-border/50 rounded-[2rem] p-10 shadow-2xl relative overflow-hidden group backdrop-blur-md"
                >
                    <div className="flex items-center gap-3 mb-10">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Shield size={18} />
                        </div>
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40">Security Authorization</h2>
                    </div>

                    <div className="text-center mb-12">
                        <h1 className="text-3xl font-black tracking-tighter mb-3 uppercase leading-none text-foreground">Access Protocol</h1>
                        <p className="text-[10px] font-bold text-muted-foreground/60 leading-relaxed uppercase tracking-widest max-w-[200px] mx-auto">
                            Input a unique invitation signature to establish secure access.
                        </p>
                    </div>

                    <form onSubmit={handleJoin} className="space-y-10">
                        <div className="space-y-3">
                            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 ml-4">Deployment Code</label>
                            <div className="relative group/input">
                                <input
                                    type="text"
                                    required
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                                    placeholder="SIG-XXXX-XXXX"
                                    className="w-full bg-secondary/50 border border-border/50 rounded-2xl px-6 py-5 text-base font-black tracking-[0.3em] focus:ring-4 focus:ring-primary/5 focus:border-primary/50 transition-all text-center outline-none uppercase placeholder:opacity-20 placeholder:tracking-widest font-mono shadow-inner"
                                />
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/20 group-focus-within/input:text-primary transition-all">
                                    <Link size={18} />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-start gap-4 p-4 bg-destructive/5 border border-destructive/20 rounded-2xl text-destructive text-[10px] font-black uppercase tracking-widest leading-relaxed"
                            >
                                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                <p className="flex-1">{error}</p>
                            </motion.div>
                        )}

                        <div className="pt-6 border-t border-border/50">
                            <button
                                type="submit"
                                disabled={loading || !code || code.length < 4}
                                className="w-full bg-primary text-primary-foreground h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-4 group/btn disabled:opacity-50 disabled:scale-100"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        SYNCHRONIZING...
                                    </>
                                ) : (
                                    <>
                                        <Zap size={20} className="group-hover:rotate-12 transition-transform" />
                                        AUTHORIZE NODE
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-primary/10 transition-all duration-700" />
                </motion.div>

                <footer className="mt-16 text-center opacity-20">
                    <p className="text-[8px] font-black uppercase tracking-[0.6em] text-muted-foreground">Strategic Protocol Layer • AntiGravity v4.0</p>
                </footer>
            </div>
        </div>
    );
}
