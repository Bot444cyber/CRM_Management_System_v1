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
    if (status === 'Completed' || !dueDate) return { color: '', label: '', bg: '' };
    const days = (new Date(dueDate).getTime() - Date.now()) / (1000 * 3600 * 24);
    if (days < 0) return { color: 'text-destructive', label: 'Overdue', bg: 'bg-destructive/10' };
    if (days < 3) return { color: 'text-destructive', label: `${Math.ceil(days)}d left`, bg: 'bg-destructive/10' };
    if (days < 7) return { color: 'text-amber-500', label: `${Math.ceil(days)}d left`, bg: 'bg-amber-500/10' };
    return { color: 'text-muted-foreground', label: new Date(dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), bg: 'bg-secondary/50' };
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
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Tasks', value: stats.total, icon: Layers, color: 'text-primary' },
                    { label: 'Completed', value: stats.completed, icon: Check, color: 'text-emerald-500' },
                    { label: 'In Progress', value: stats.ongoing, icon: Activity, color: 'text-blue-500' },
                    { label: 'At Risk', value: stats.atRisk, icon: AlertTriangle, color: stats.atRisk > 0 ? 'text-destructive' : 'text-muted-foreground' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-card border border-border/50 p-4 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <stat.icon size={14} className={stat.color} />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                        </div>
                        <p className="text-xl font-bold text-foreground">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-secondary border border-border rounded-xl flex items-center justify-center text-primary shadow-sm">
                        <Target size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-foreground">Project Milestones</h2>
                        <p className="text-xs text-muted-foreground">Track key objectives and delivery timelines.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group/filter">
                        <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-secondary border border-border rounded-xl pl-9 pr-8 py-2 text-xs font-bold text-foreground outline-none hover:bg-accent transition-all appearance-none cursor-pointer uppercase tracking-tight"
                        >
                            <option value="all">Priority All</option>
                            <option value="Not Started">Standby</option>
                            <option value="In Progress">Active</option>
                            <option value="Completed">Success</option>
                        </select>
                        <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                    {canManage && (
                        <button
                            onClick={() => setIsCreating(!isCreating)}
                            className="flex items-center gap-2 bg-primary hover:opacity-90 text-primary-foreground px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-primary/20"
                        >
                            <Plus size={16} /> New Milestone
                        </button>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {isCreating && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="bg-card border border-border/50 p-6 rounded-2xl shadow-xl"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Milestone Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs font-bold text-foreground outline-none focus:border-primary/50 transition-all"
                                    placeholder="Enter objective..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Target Date</label>
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={e => setDueDate(e.target.value)}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs font-bold text-foreground outline-none focus:border-primary/50 transition-all"
                                />
                            </div>
                            <div className="flex items-end gap-3">
                                <button onClick={handleCreate} className="flex-1 bg-primary hover:opacity-90 text-primary-foreground h-11 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20">Create Milestone</button>
                                <button onClick={() => setIsCreating(false)} className="px-6 h-11 text-muted-foreground hover:text-foreground text-xs font-bold transition-colors">Cancel</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="relative pt-4 pl-4 border-l border-border/50 ml-2 space-y-12">
                {filteredMilestones.length === 0 ? (
                    <div className="py-20 text-center opacity-40">
                        <Flag size={32} className="mx-auto mb-4" />
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No milestones found.</p>
                    </div>
                ) : (
                    filteredMilestones.map((m, idx) => {
                        const isCompleted = m.status === 'Completed';
                        const urgency = getDueDateUrgency(m.dueDate, m.status);

                        return (
                            <motion.div
                                key={m.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="relative flex flex-col gap-4 group"
                            >
                                {/* Timeline Dot */}
                                <div className={cn(
                                    "absolute -left-[21px] top-4 w-2.5 h-2.5 rounded-full border-2 border-background z-10 shadow-sm",
                                    isCompleted ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : m.status === 'In Progress' ? "bg-primary shadow-[0_0_8px_rgba(var(--primary),0.4)]" : "bg-muted-foreground"
                                )} />

                                <div className={cn(
                                    "p-6 rounded-2xl border transition-all duration-300",
                                    isCompleted ? "bg-emerald-500/5 border-emerald-500/20 shadow-sm" :
                                        urgency.label === 'Overdue' ? "bg-destructive/5 border-destructive/20 shadow-sm" :
                                            "bg-card/40 border-border group-hover:border-primary/30 shadow-sm hover:shadow-md"
                                )}>
                                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                                        <div className="flex items-center gap-3">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border",
                                                isCompleted ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                                    m.status === 'In Progress' ? "bg-primary/10 text-primary border-primary/20" :
                                                        "bg-secondary text-muted-foreground border-border"
                                            )}>
                                                {m.status}
                                            </span>
                                            {urgency.label && (
                                                <span className={cn(
                                                    "flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-black uppercase border tracking-widest",
                                                    urgency.color, urgency.bg, "border-current/10"
                                                )}>
                                                    <Clock size={10} />
                                                    {urgency.label}
                                                </span>
                                            )}
                                        </div>
                                        {canManage && !isCompleted && (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateStatus(m.id, 'In Progress', 50)}
                                                    className="p-2 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-all border border-transparent hover:border-border shadow-xs"
                                                    title="Mark as Current"
                                                >
                                                    <Target size={14} />
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(m.id, 'Completed', 100)}
                                                    className="p-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-lg transition-all border border-emerald-500/20 shadow-xs"
                                                    title="Mark as Done"
                                                >
                                                    <Check size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-base font-black text-foreground mb-1 group-hover:text-primary transition-colors uppercase tracking-tight leading-tight">{m.name}</h3>
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Phase Objective {idx + 1}</p>
                                        </div>

                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
                                                <span className="text-muted-foreground">Execution Progress</span>
                                                <span className={isCompleted ? 'text-emerald-500' : 'text-foreground'}>{m.progress}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden border border-border/30 shadow-inner">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${m.progress}%` }}
                                                    className={cn(
                                                        "h-full rounded-full transition-all",
                                                        isCompleted ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" :
                                                            urgency.label === 'Overdue' ? "bg-destructive shadow-[0_0_10px_rgba(var(--destructive),0.3)]" :
                                                                "bg-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]"
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
