"use client";

import React, { useEffect, useState } from 'react';
import { Activity, Clock, Zap, Target, AlertCircle, Radio, BarChart3, TrendingUp, History } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { useSync } from '@/context/SyncContext';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/apiFetch';

export default function PulseView({ projectId }: { projectId: string }) {
    const [events, setEvents] = useState<any[]>([]);
    const { refreshSignal } = useSync();

    const fetchPulse = async () => {
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/${projectId}/pulse`);
            if (res.ok) {
                const data = await res.json();
                setEvents(data.sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime()));
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchPulse();
    }, [projectId, refreshSignal]);

    const formatTime = (timeStr: string) => {
        const date = new Date(timeStr);
        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 8400) return `${Math.floor(diff / 3600)}h ago`;
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    const chartData = events.reduce((acc: any[], evt: any) => {
        const time = new Date(evt.time).toLocaleTimeString([], { hour: '2-digit' });
        const existing = acc.find(d => d.time === time);
        if (existing) {
            existing.count += 1;
        } else {
            acc.push({ time, count: 1 });
        }
        return acc;
    }, []).reverse().slice(-12);

    return (
        <div className="space-y-12 max-w-5xl mx-auto px-4 pb-20">
            {/* Pulse Stats & Chart */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-8 overflow-hidden relative group">
                <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none group-hover:bg-primary/10 transition-colors" />

                <div className="flex flex-col lg:flex-row gap-10">
                    <div className="flex-1 space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                                    <TrendingUp size={20} className="animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-widest italic">Signal Density</h3>
                                    <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">Temporal Activity Frequency</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[8px] font-black uppercase tracking-widest text-emerald-500 shadow-lg">
                                <Radio size={10} className="animate-pulse" /> Live Stream
                            </div>
                        </div>

                        <div className="h-[180px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.01)" />
                                    <XAxis dataKey="time" hide />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#09090b',
                                            border: '1px solid #27272a',
                                            borderRadius: '16px',
                                            fontSize: '10px',
                                            fontWeight: '900',
                                            textTransform: 'uppercase'
                                        }}
                                        cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                    />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="w-px bg-zinc-800/50 hidden lg:block" />

                    <div className="lg:w-72 space-y-6">
                        {[
                            { label: 'Total Events', value: events.length, icon: History, color: 'text-primary' },
                            { label: 'Critical Signals', value: events.filter(e => e.type === 'CRITICAL').length, icon: AlertCircle, color: 'text-rose-500' },
                            { label: 'System Health', value: 'Optimal', icon: Zap, color: 'text-emerald-500' }
                        ].map(stat => (
                            <div key={stat.label} className="p-4 bg-zinc-950/50 border border-zinc-800/40 rounded-3xl hover:border-zinc-700 transition-all group/stat">
                                <div className="flex items-center justify-between mb-2">
                                    <stat.icon size={14} className={stat.color} />
                                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/20">{stat.label}</span>
                                </div>
                                <div className="text-xl font-black italic tracking-tighter group-hover/stat:text-primary transition-colors">
                                    {stat.value}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-left relative py-2"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 text-primary rounded-xl flex items-center justify-center shadow-xl">
                        <Activity size={18} />
                    </div>
                    <h2 className="text-lg font-black italic tracking-tight uppercase text-foreground">Sequential Feed</h2>
                </div>
            </motion.div>

            <div className="space-y-4 relative">
                <div className="absolute left-6 top-0 bottom-0 w-px bg-zinc-800/50 border-l border-dashed border-zinc-800" />

                <AnimatePresence mode="popLayout">
                    {events.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white/5 border border-white/5 rounded-2xl p-12 text-center border-dashed"
                        >
                            <Target size={24} className="text-muted-foreground/20 mx-auto mb-3" />
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/30">No recent activity to display.</p>
                        </motion.div>
                    ) : (
                        events.map((evt, idx) => (
                            <motion.div
                                key={evt.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group relative pl-16"
                            >
                                <div className={cn(
                                    "absolute left-5 top-8 w-2 h-2 rounded-full -translate-x-1/2 z-10 transition-all duration-500 group-hover:scale-150",
                                    evt.type === 'CRITICAL' ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]' :
                                        evt.type === 'WARNING' ? 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]' :
                                            'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                                )} />

                                <div className={cn(
                                    "bg-zinc-900/40 border p-5 rounded-2xl shadow-lg transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900/60 hover:translate-x-1 relative overflow-hidden",
                                    evt.type === 'CRITICAL' ? 'border-rose-500/10' : 'border-zinc-800'
                                )}>
                                    <div className="flex items-center justify-between mb-3 relative z-10">
                                        <div className="flex items-center gap-2.5">
                                            <div className={cn(
                                                "w-7 h-7 rounded-lg flex items-center justify-center bg-black/20 border border-white/5 group-hover:text-primary transition-all",
                                            )}>
                                                {evt.type === 'CRITICAL' ? <AlertCircle size={14} /> : <Zap size={14} />}
                                            </div>
                                            <h3 className="font-bold text-sm tracking-tight transition-colors">{evt.title}</h3>
                                        </div>
                                        <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-black/20 border border-white/5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40">
                                            <Clock size={10} className="text-primary/40" />
                                            {formatTime(evt.time)}
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground/70 leading-relaxed font-medium relative z-10 pl-9">{evt.message}</p>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            <div className="text-center pt-8">
                <div className="inline-flex items-center gap-4 px-6 py-3 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                    End of Activity Log <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                </div>
            </div>
        </div>
    );
}
