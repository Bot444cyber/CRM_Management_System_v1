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
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Activity Stats & Chart */}
            <div className="bg-card/50 border border-border/50 rounded-2xl p-6 overflow-hidden relative shadow-sm">
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-secondary border border-border rounded-xl flex items-center justify-center text-primary shadow-sm group-hover:bg-primary/5 transition-colors">
                                    <TrendingUp size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-foreground uppercase tracking-tight">Activity Overview</h3>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Event frequency over time</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                <Radio size={12} className="animate-pulse" /> Live
                            </div>
                        </div>

                        <div className="h-[140px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
                                    <XAxis dataKey="time" hide />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'var(--card)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '12px',
                                            fontSize: '10px',
                                            fontWeight: 'bold'
                                        }}
                                        itemStyle={{ color: 'var(--foreground)' }}
                                        labelStyle={{ color: 'var(--foreground)' }}
                                        cursor={{ fill: 'var(--accent)', fillOpacity: 0.1 }}
                                    />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? 'var(--primary)' : 'var(--muted-foreground)'} fillOpacity={index === chartData.length - 1 ? 1 : 0.1} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="w-px bg-border/50 hidden lg:block" />

                    <div className="lg:w-64 space-y-4">
                        {[
                            { label: 'Total Events', value: events.length, icon: History, color: 'text-primary' },
                            { label: 'High Priority', value: events.filter(e => e.type === 'CRITICAL').length, icon: AlertCircle, color: 'text-destructive' },
                            { label: 'Status', value: 'Healthy', icon: Zap, color: 'text-emerald-500' }
                        ].map(stat => (
                            <div key={stat.label} className="p-4 bg-secondary/30 border border-border/50 rounded-xl shadow-xs transition-transform hover:scale-[1.02]">
                                <div className="flex items-center justify-between mb-1">
                                    <stat.icon size={14} className={stat.color} />
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">{stat.label}</span>
                                </div>
                                <div className="text-xl font-black text-foreground italic transition-colors tracking-tighter">
                                    {stat.value}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-secondary border border-border text-primary rounded-lg flex items-center justify-center shadow-sm">
                    <Activity size={18} />
                </div>
                <h2 className="text-base font-black text-foreground uppercase tracking-tight">Activity Log</h2>
            </div>

            <div className="space-y-4 relative">
                <div className="absolute left-6 top-0 bottom-0 w-px bg-border/50 border-l border-dashed border-border/30" />

                <AnimatePresence mode="popLayout">
                    {events.length === 0 ? (
                        <div className="bg-card/20 border border-border/50 border-dashed rounded-2xl p-12 text-center shadow-inner">
                            <Target size={24} className="text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">No recent activity detected.</p>
                        </div>
                    ) : (
                        events.map((evt, idx) => (
                            <motion.div
                                key={evt.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group relative pl-16"
                            >
                                <div className={cn(
                                    "absolute left-6 top-7 w-2 h-2 rounded-full -translate-x-1/2 z-10 shadow-sm",
                                    evt.type === 'CRITICAL' ? 'bg-destructive shadow-[0_0_8px_rgba(var(--destructive),0.4)]' :
                                        evt.type === 'WARNING' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' :
                                            'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                                )} />

                                <div className={cn(
                                    "bg-card/40 border p-4 rounded-xl transition-all duration-300 group-hover:bg-accent/30 shadow-xs",
                                    evt.type === 'CRITICAL' ? 'border-destructive/20' : 'border-border/50 group-hover:border-primary/20'
                                )}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2.5">
                                            <div className="text-primary flex items-center justify-center w-5 h-5 bg-primary/5 rounded border border-primary/10">
                                                {evt.type === 'CRITICAL' ? <AlertCircle size={12} /> : <Zap size={12} />}
                                            </div>
                                            <h3 className="font-black text-sm text-foreground tracking-tight uppercase leading-none">{evt.title}</h3>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                                            <Clock size={10} className="text-muted-foreground/40" />
                                            {formatTime(evt.time)}
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed font-bold pl-7 opacity-80">{evt.message}</p>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
