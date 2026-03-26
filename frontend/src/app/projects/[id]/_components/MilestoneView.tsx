"use client";

import React, { useState } from 'react';
import {
    Flag, Plus, Check, Clock, AlertTriangle, Zap, Calendar, TrendingUp,
    Filter, ChevronDown, BarChart3, Target, Info, Sparkles, Layers,
    ChevronRight, ArrowUpRight, Layout, LayoutPanelLeft, Activity
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { useSync } from '@/context/SyncContext';
import { apiFetch } from '@/lib/apiFetch';

function getDueDateUrgency(dueDate: string | null, status: string) {
    if (status === 'Completed' || !dueDate) return { color: '', label: '', bg: '', shadow: '' };
    const days = (new Date(dueDate).getTime() - Date.now()) / (1000 * 3600 * 24);
    if (days < 0) return { color: 'text-rose-500', label: 'Overdue', bg: 'bg-rose-500/10', shadow: 'shadow-rose-500/10' };
    if (days < 3) return { color: 'text-rose-400', label: `${Math.ceil(days)}d left`, bg: 'bg-rose-500/10', shadow: 'shadow-rose-500/10' };
    if (days < 7) return { color: 'text-amber-500', label: `${Math.ceil(days)}d left`, bg: 'bg-amber-500/10', shadow: 'shadow-amber-500/10' };
    return { color: 'text-muted-foreground/60', label: new Date(dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), bg: 'bg-white/5', shadow: '' };
}

export default function MilestoneView({ projectId, milestones = [], currentUserRole = 'user', refresh }: {
    projectId: string; milestones?: any[]; currentUserRole?: string; refresh: () => void;
}) {
    const { triggerRefresh } = useSync();
    const canManage = ['admin', 'manager', 'team_leader'].includes(currentUserRole);

    const [isCreating, setIsCreating] = useState(false);
    const [name, setName] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const handleCreate = async () => {
        if (!name) return;
        const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/${projectId}/milestones`, {
            method: 'POST',
            body: JSON.stringify({ name, dueDate })
        });
        if (res.ok) {
            toast.success('Milestone added');
            setIsCreating(false); setName(''); setDueDate('');
            triggerRefresh();
            refresh();
        } else {
            toast.error('Failed to add milestone');
        }
    };

    const updateStatus = async (id: string, status: string, progress: number) => {
        const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/${projectId}/milestones/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ status, progress })
        });
        if (res.ok) {
            toast.success('Status updated');
            triggerRefresh();
            refresh();
        }
    };

    const setReminder = async (m: any) => {
        const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/${projectId}/reminders`, {
            method: 'POST',
            body: JSON.stringify({
                title: `Reminder: ${m.name}`,
                message: `Milestone "${m.name}" is due on ${new Date(m.dueDate).toLocaleDateString()}.`,
                dueDate: m.dueDate
            })
        });
        if (res.ok) {
            toast.success('Reminder set');
        }
    };

    const filteredMilestones = (milestones || []).filter(m => {
        if (filterStatus === 'all') return true;
        return m.status === filterStatus;
    });

    const stats = {
        total: milestones.length,
        completed: milestones.filter(m => m.status === 'Completed').length,
        ongoing: milestones.filter(m => m.status === 'In Progress').length,
        atRisk: milestones.filter(m => {
            if (m.status === 'Completed' || !m.dueDate) return false;
            return (new Date(m.dueDate).getTime() - Date.now()) < 0;
        }).length
    };

    return (
        <div className="space-y-12 pb-20">
            {/* Executive Summary Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Matrix', value: stats.total, icon: Layers, color: 'text-primary', bg: 'bg-primary/5' },
                    { label: 'Synchronized', value: stats.completed, icon: Check, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
                    { label: 'Active Process', value: stats.ongoing, icon: Activity, color: 'text-sky-500', bg: 'bg-sky-500/5' },
                    { label: 'Risk Factor', value: stats.atRisk, icon: AlertTriangle, color: stats.atRisk > 0 ? 'text-rose-500' : 'text-emerald-500', bg: stats.atRisk > 0 ? 'bg-rose-500/5' : 'bg-emerald-500/5' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-zinc-900/40 backdrop-blur-3xl border border-zinc-800/50 p-5 rounded-[2rem] hover:border-zinc-700 transition-all group"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center border border-current/10", stat.color, stat.bg)}>
                                <stat.icon size={14} />
                            </div>
                            <span className="text-[10px] font-black text-muted-foreground/20 uppercase tracking-widest italic group-hover:text-muted-foreground/40 transition-colors">Nominal</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className={cn("text-2xl font-black italic tracking-tighter", stat.color)}>{stat.value}</span>
                            <span className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">{stat.label}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Header / Control Section */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-zinc-900/40 backdrop-blur-3xl border border-zinc-800/50 p-6 rounded-[2.5rem] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none group-hover:bg-primary/10 transition-colors duration-1000" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                            <Sparkles size={20} className="animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black tracking-tight uppercase italic group-hover:text-primary transition-colors">Strategic Objectives</h2>
                            <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">Neural Path & Milestone Synthesis</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 relative z-10">
                    <div className="relative group/filter">
                        <Filter size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 group-hover/filter:text-primary transition-colors" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-black/40 border border-zinc-800 rounded-2xl pl-11 pr-10 py-3 text-[9px] font-black uppercase tracking-[0.3em] outline-none focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer text-muted-foreground hover:text-foreground"
                        >
                            <option value="all">Full Spectrum</option>
                            <option value="Not Started">Standby</option>
                            <option value="In Progress">Active</option>
                            <option value="Completed">Synchronized</option>
                        </select>
                        <ChevronDown size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/20" />
                    </div>

                    {canManage && (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setIsCreating(!isCreating)}
                            className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.25em] shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-all border border-primary/20"
                        >
                            <Plus size={16} /> Deploy Objective
                        </motion.button>
                    )}
                </div>
            </div>

            {/* Creation Form Overlay */}
            <AnimatePresence>
                {isCreating && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.98 }}
                        className="bg-zinc-900/60 backdrop-blur-3xl border border-primary/20 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group/form"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                        <div className="flex flex-col lg:flex-row items-end gap-6 relative z-10">
                            <div className="flex-1 space-y-3 w-full">
                                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/40 ml-4 italic">Objective Designation</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="w-full bg-black/60 border border-zinc-800 rounded-2xl px-6 py-4 text-xs font-black focus:ring-4 focus:ring-primary/10 transition-all outline-none placeholder:opacity-20 italic italic underline-offset-8 decoration-primary/10"
                                        placeholder="ENTER OBJECTIVE NAME..."
                                    />
                                    <Target size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-primary/20 group-hover/form:text-primary/40 transition-all" />
                                </div>
                            </div>
                            <div className="w-full lg:w-64 space-y-3">
                                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/40 ml-4 italic">Temporal Limit</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={e => setDueDate(e.target.value)}
                                        className="w-full bg-black/60 border border-zinc-800 rounded-2xl px-6 py-4 text-xs font-black focus:ring-4 focus:ring-primary/10 transition-all outline-none scheme-dark uppercase tracking-widest"
                                    />
                                    <Calendar size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-primary/20 pointer-events-none" />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 w-full lg:w-auto">
                                <button onClick={handleCreate} className="flex-1 lg:flex-none bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-primary/20 hover:scale-[1.05] transition-all">Initialize</button>
                                <button onClick={() => setIsCreating(false)} className="px-6 py-4 text-muted-foreground/40 hover:text-foreground font-black uppercase tracking-[0.2em] text-[10px] transition-colors">Abort</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Timeline UI */}
            <div className="relative space-y-24 before:absolute before:inset-0 before:ml-[1.75rem] before:h-full before:w-[2px] before:bg-linear-to-b before:from-transparent before:via-zinc-800 before:to-transparent lg:before:left-1/2 lg:before:ml-0 lg:before:-translate-x-1/2">

                {filteredMilestones.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-32 bg-zinc-900/20 border border-dashed border-zinc-800/50 rounded-[4rem] relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-primary/5 blur-[120px]" />
                        <Flag size={48} className="text-muted-foreground/10 mx-auto mb-6 transform -rotate-12" />
                        <p className="font-black text-xs uppercase tracking-[0.4em] text-muted-foreground/20 italic mb-2">Neural Path Empty</p>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/10">Awaiting strategic deployment commands...</p>
                    </motion.div>
                ) : (
                    <div className="space-y-32">
                        {filteredMilestones.map((m, idx) => {
                            const isCompleted = m.status === 'Completed';
                            const urgency = getDueDateUrgency(m.dueDate, m.status);
                            const isOdd = idx % 2 !== 0;

                            return (
                                <motion.div
                                    key={m.id}
                                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.8, ease: "circOut", delay: idx * 0.05 }}
                                    className={cn(
                                        "relative flex flex-col lg:flex-row items-center justify-between lg:justify-normal gap-12 group",
                                        isOdd && "lg:flex-row-reverse"
                                    )}
                                >
                                    {/* Timeline Node */}
                                    <div className={cn(
                                        "absolute top-0 left-0 lg:left-1/2 lg:-translate-x-1/2 w-14 h-14 rounded-[2rem] border-4 border-[#09090b] shadow-2xl z-20 flex items-center justify-center transition-all duration-700 group-hover:scale-125 group-hover:rotate-[360deg] group-hover:border-primary/50",
                                        isCompleted ? "bg-emerald-500 text-black shadow-emerald-500/20" : "bg-zinc-950 text-primary border-zinc-800 group-hover:bg-primary group-hover:text-primary-foreground"
                                    )}>
                                        {isCompleted ? <Check size={24} strokeWidth={3} /> : <Zap size={24} className={m.status === 'In Progress' ? 'animate-pulse' : ''} />}
                                        <div className="absolute inset-0 rounded-[2rem] bg-current opacity-0 group-hover:opacity-20 blur-xl transition-opacity" />
                                    </div>

                                    {/* Content Card */}
                                    <div className={cn(
                                        "w-[calc(100%-4rem)] ml-16 lg:ml-0 lg:w-[calc(50%-4rem)] p-8 bg-zinc-900/40 backdrop-blur-3xl border rounded-[3rem] shadow-2xl transition-all duration-700 relative overflow-hidden group/card",
                                        isCompleted ? "border-emerald-500/20 shadow-emerald-500/5 hover:border-emerald-500/40" :
                                            urgency.label === 'Overdue' ? "border-rose-500/30 bg-rose-500/5" :
                                                "border-zinc-800/80 hover:border-primary/30"
                                    )}>
                                        {/* Status & Urgency Header */}
                                        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 relative z-10">
                                            <div className={cn(
                                                "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.25em] border backdrop-blur-3xl shadow-lg",
                                                isCompleted ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-emerald-500/10" :
                                                    m.status === 'In Progress' ? "bg-sky-500/10 text-sky-500 border-sky-500/20 shadow-sky-500/10" :
                                                        "bg-white/5 text-muted-foreground/30 border-white/5"
                                            )}>
                                                {m.status === 'Not Started' ? 'Standby' : m.status === 'In Progress' ? 'Active Matrix' : 'Synchronized'}
                                            </div>

                                            {urgency.label && (
                                                <div className={cn(
                                                    "flex items-center gap-2 px-4 py-1.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.25em] shadow-lg",
                                                    urgency.bg, urgency.color, urgency.shadow
                                                )}>
                                                    {urgency.label === 'Overdue' ? <AlertTriangle size={12} className="animate-pulse" /> : <Clock size={12} />}
                                                    {urgency.label}
                                                </div>
                                            )}
                                        </div>

                                        {/* Milestone Identity */}
                                        <div className="relative z-10 space-y-2 mb-10">
                                            <h3 className="text-xl font-black tracking-tighter italic uppercase group-hover/card:text-primary transition-colors decoration-primary/20 underline-offset-8 group-hover/card:underline">
                                                {m.name}
                                            </h3>
                                            <p className="text-[8px] font-black text-muted-foreground/20 uppercase tracking-[0.4em] italic flex items-center gap-2 group-hover/card:text-muted-foreground/40 transition-colors">
                                                <Target size={10} /> Neural Reference Point {idx + 1}
                                            </p>
                                        </div>

                                        {/* Progress Interface */}
                                        <div className="space-y-4 mb-10 relative z-10">
                                            <div className="flex justify-between items-end">
                                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 italic group-hover/card:text-muted-foreground/40 transition-colors">Efficiency Sync</span>
                                                <span className={cn("text-xl font-black tracking-tighter italic", isCompleted ? "text-emerald-500" : "text-primary")}>
                                                    {m.progress}%
                                                </span>
                                            </div>
                                            <div className="w-full h-3 bg-black border border-white/5 rounded-full overflow-hidden shadow-inner p-0.5">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    whileInView={{ width: `${m.progress}%` }}
                                                    transition={{ duration: 1.5, ease: "circOut" }}
                                                    className={cn(
                                                        "h-full rounded-full relative overflow-hidden",
                                                        isCompleted ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" :
                                                            urgency.label === 'Overdue' ? "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]" :
                                                                "bg-linear-to-r from-primary/20 via-primary/60 to-primary shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)]"
                                                    )}
                                                >
                                                    {!isCompleted && (
                                                        <motion.div
                                                            animate={{ x: ['-100%', '200%'] }}
                                                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                                            className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent w-1/2 skew-x-[-20deg]"
                                                        />
                                                    )}
                                                </motion.div>
                                            </div>
                                        </div>

                                        {/* Dynamic Controls */}
                                        {!isCompleted && canManage && (
                                            <div className="grid grid-cols-2 gap-4 pt-10 border-t border-white/5 relative z-10">
                                                <button
                                                    onClick={() => updateStatus(m.id, 'In Progress', 50)}
                                                    className={cn(
                                                        "flex items-center justify-center gap-3 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl group/btn overflow-hidden relative",
                                                        m.status === 'In Progress' ? "bg-zinc-950 text-muted-foreground/20 border border-zinc-900 cursor-not-allowed" : "bg-white/5 hover:bg-white/10 text-foreground/40 hover:text-foreground border border-white/5"
                                                    )}
                                                    disabled={m.status === 'In Progress'}
                                                >
                                                    <ArrowUpRight size={14} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                                    {m.status === 'In Progress' ? 'Locked' : 'Initiate'}
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(m.id, 'Completed', 100)}
                                                    className="flex items-center justify-center gap-3 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black border border-emerald-500/20 transition-all shadow-xl shadow-emerald-500/5 group/btn"
                                                >
                                                    <Check size={14} strokeWidth={4} className="group-hover/btn:scale-125 transition-transform" />
                                                    Synchronize
                                                </button>
                                                <button
                                                    onClick={() => setReminder(m)}
                                                    className="col-span-2 flex items-center justify-center gap-3 py-3 rounded-2xl bg-black/40 text-muted-foreground/20 hover:text-primary border border-white/5 hover:border-primary/20 transition-all text-[9px] font-black uppercase tracking-[0.3em] group/btn"
                                                >
                                                    <Clock size={12} className="group-hover/btn:rotate-[360deg] transition-transform duration-700" />
                                                    Register Temporal Beacon
                                                </button>
                                            </div>
                                        )}

                                        {/* Card Decoration */}
                                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/card:opacity-10 transition-opacity">
                                            <Flag size={80} className="transform rotate-12" />
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
