"use client";

import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle2, Zap, Clock, TrendingUp, Search, Filter, Building2, Eye, EyeOff, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useSync } from '@/context/SyncContext';
import { apiFetch } from '@/lib/apiFetch';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function GlobalPulsePage() {
    const [pulse, setPulse] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [showKey, setShowKey] = useState(false);
    const { refreshSignal } = useSync();
    const { activeWorkspace } = useWorkspace();
    const router = useRouter();

    const fetchGlobalPulse = async () => {
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/pulse/global`);
            if (res.ok) {
                setPulse(await res.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGlobalPulse();
    }, [refreshSignal]);

    const filteredPulse = pulse
        .filter(p => filter === 'all' || p.type === filter)
        .filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.message.toLowerCase().includes(search.toLowerCase()));

    if (loading) return (
        <div className="flex-1 flex flex-col items-center justify-center bg-background">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-sm font-black text-muted-foreground uppercase tracking-widest animate-pulse">Synchronizing Global Signal...</p>
        </div>
    );

    return (
        <div className="bg-background/50 h-full overflow-y-auto custom-scrollbar flex flex-col">
            {/* Standardized Compact Header */}
            <header className="sticky top-0 z-50 bg-black/40 backdrop-blur-3xl border-b border-white/5 px-6 md:px-10 py-1 flex items-center justify-between gap-8 h-12">
                <div className="flex items-center gap-6 min-w-0">
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="w-6 h-6 bg-primary/10 rounded-md border border-primary/20 flex items-center justify-center">
                            <Activity size={12} className="text-primary" />
                        </div>
                        <h1 className="text-xs font-black tracking-tight text-foreground uppercase italic truncate max-w-[200px]">
                            Global Pulse
                        </h1>
                    </div>

                    <div className="h-4 w-px bg-white/5" />

                    <div className="hidden md:flex items-center gap-6">
                        {[
                            { label: 'Critical', count: pulse.filter(p => p.type === 'CRITICAL').length, color: 'text-rose-400' },
                            { label: 'Signals', count: pulse.length, color: 'text-muted-foreground' },
                        ].map((s) => (
                            <div key={s.label} className="flex items-center gap-2">
                                <span className={cn("text-[10px] font-black italic", s.color)}>{s.count}</span>
                                <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground/30">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {activeWorkspace && (
                        <div className="hidden lg:flex items-center gap-3 bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                            <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground/40">{activeWorkspace.name}</span>
                        </div>
                    )}
                    <button
                        className="h-8 px-4 bg-primary text-primary-foreground text-[8px] font-black uppercase tracking-widest rounded-lg hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                        onClick={() => router.push('/projects')}
                    >
                        View Projects
                    </button>
                    <ThemeToggle />
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 md:px-10 py-6 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/30 border border-white/5 p-4 rounded-xl">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative group/search w-full md:w-64">
                            <Search size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30" />
                            <input
                                type="text"
                                placeholder="SIGNAL SEARCH..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full bg-black/40 border border-white/5 rounded-lg pl-10 pr-4 py-2 text-[9px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter size={10} className="text-muted-foreground/40" />
                            <select
                                value={filter}
                                onChange={e => setFilter(e.target.value)}
                                className="bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-[8px] font-black uppercase tracking-widest focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                            >
                                <option value="all">FULL STREAM</option>
                                <option value="CRITICAL">CRITICAL</option>
                                <option value="WARNING">WARNING</option>
                                <option value="SUCCESS">SUCCESS</option>
                                <option value="INFO">ROUTINE</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <AnimatePresence mode='popLayout'>
                        {filteredPulse.map((evt, idx) => (
                            <motion.div
                                key={evt.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.03 }}
                                className="group relative"
                            >
                                <div className="p-3 bg-card/40 backdrop-blur-md border border-white/5 rounded-xl flex items-center gap-4 transition-all hover:bg-white/5 hover:border-primary/20 hover:translate-x-1 shadow-lg group/card overflow-hidden">
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border transition-all duration-300",
                                        evt.type === 'CRITICAL' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                                            evt.type === 'WARNING' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                                                'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                                    )}>
                                        {evt.type === 'CRITICAL' ? <AlertTriangle size={14} /> :
                                            evt.type === 'SUCCESS' ? <CheckCircle2 size={14} /> : <Zap size={14} />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <h3 className="text-xs font-black truncate group-hover:text-primary transition-colors tracking-tight uppercase italic">{evt.title}</h3>
                                            <span className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/5 text-[7px] font-black uppercase tracking-widest text-muted-foreground/40">{evt.projectName || 'SYSTEM'}</span>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground/60 font-medium leading-relaxed truncate">{evt.message}</p>
                                    </div>

                                    <div className="text-right shrink-0">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-primary flex items-center justify-end gap-1">
                                            <Clock size={8} /> {new Date(evt.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredPulse.length === 0 && (
                        <div className="py-32 text-center border-2 border-dashed border-white/5 rounded-[4rem] bg-card/10">
                            <Activity size={48} className="text-muted-foreground/20 mx-auto mb-6 transform rotate-12" />
                            <h3 className="text-2xl font-black mb-2 tracking-tight">Signal Loss</h3>
                            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/30">No telemetery identify in current scannable window.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
