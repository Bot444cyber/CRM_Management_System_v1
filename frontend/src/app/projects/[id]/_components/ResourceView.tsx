"use client";

import React from 'react';
import { Box, Check, X, Clock, Terminal, ShieldCheck, Zap, PieChart as PieIcon, BarChart3, TrendingUp, Info } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { useSync } from '@/context/SyncContext';
import { apiFetch } from '@/lib/apiFetch';

export default function ResourceView({ projectId, requests, currentUserRole = 'user', refresh }: { projectId: string, requests: any[], currentUserRole?: string, refresh: () => void }) {
    const { triggerRefresh } = useSync();
    const canManage = ['admin', 'manager'].includes(currentUserRole);

    const handleAction = async (requestId: string, status: string) => {
        const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/${projectId}/resource-requests/${requestId}/approve`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
        if (res.ok) {
            toast.success(`Request ${status}`);
            triggerRefresh();
            refresh();
        } else {
            toast.error('Action failed');
        }
    };

    const allocationData = [
        { name: 'Approved', value: requests.filter(r => r.status === 'Approved').length, color: '#10b981' },
        { name: 'Pending', value: requests.filter(r => r.status === 'Pending').length, color: 'var(--color-primary)' },
        { name: 'Denied', value: requests.filter(r => r.status === 'Denied').length, color: '#f43f5e' },
    ].filter(d => d.value > 0);

    const resourceBreakdown = requests.reduce((acc: any[], r: any) => {
        const existing = acc.find(d => d.name === r.subProductName);
        if (existing) {
            existing.value += r.requestedQuantity;
        } else {
            acc.push({ name: r.subProductName, value: r.requestedQuantity });
        }
        return acc;
    }, []).slice(0, 5);

    return (
        <div className="space-y-10 pb-20">
            <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
                <div className="flex-1">
                    <h2 className="text-xl font-bold tracking-tight mb-1">Resource Allocation</h2>
                    <p className="text-xs text-muted-foreground font-medium flex items-center gap-2 opacity-70 italic uppercase tracking-wider">
                        <ShieldCheck size={14} className="text-primary" /> Managing resource requests and inventory for this project.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-zinc-900/60 px-4 py-2 rounded-xl border border-zinc-800 flex items-center gap-4 shadow-xl">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Active requests</span>
                            <span className="text-sm font-black text-primary tracking-widest italic">{requests.filter(r => r.status === 'Pending').length} Units</span>
                        </div>
                        <div className="w-px h-6 bg-white/5" />
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20 shadow-inner group">
                            <Terminal size={18} className="group-hover:scale-110 transition-transform" />
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-[10px] min-w-[800px]">

                        <thead>
                            <tr className="bg-zinc-950 border-b border-zinc-800">
                                <th className="px-6 py-4 font-black uppercase tracking-widest text-muted-foreground/40 italic">Resource Entity</th>
                                <th className="px-6 py-4 font-black uppercase tracking-widest text-muted-foreground/40 text-center italic">Volume</th>
                                <th className="px-6 py-4 font-black uppercase tracking-widest text-muted-foreground/40 italic">Origin</th>
                                <th className="px-6 py-4 font-black uppercase tracking-widest text-muted-foreground/40 text-center italic">State</th>
                                <th className="px-6 py-4 font-black uppercase tracking-widest text-muted-foreground/40 text-right italic">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/40">
                            <AnimatePresence mode="popLayout">
                                {requests.length === 0 ? (
                                    <motion.tr
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="bg-transparent"
                                    >
                                        <td colSpan={5} className="px-10 py-24 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-dashed border-white/10">
                                                    <Box size={24} className="text-muted-foreground/20" />
                                                </div>
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/30">No pending resource requests</p>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ) : (
                                    requests.map((r, idx) => (
                                        <motion.tr
                                            key={r.id}
                                            initial={{ opacity: 0, x: -5 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className="hover:bg-white/2 transition-colors group"
                                        >
                                            <td className="px-6 py-4 font-bold flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center transition-transform">
                                                    <Box size={14} className="text-primary/60" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm tracking-tight font-bold">{r.subProductName}</span>
                                                    <span className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-wider">ID: {r.id.split('-')[0]}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-lg font-bold text-foreground tracking-tighter">{r.requestedQuantity}</span>
                                                    <span className="text-[8px] font-bold text-primary/40 uppercase tracking-wider">Units</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[8px] font-bold border border-white/5">
                                                        {r.requestedByUserId}
                                                    </div>
                                                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">#User_{r.requestedByUserId}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className={cn(
                                                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-wider border",
                                                    r.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                        r.status === 'Denied' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                                            'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                )}>
                                                    <div className={cn("w-1 h-1 rounded-full",
                                                        r.status === 'Approved' ? 'bg-emerald-500' :
                                                            r.status === 'Denied' ? 'bg-rose-500' : 'bg-amber-500'
                                                    )} />
                                                    {r.status}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                {r.status === 'Pending' ? (
                                                    canManage ? (
                                                        <div className="flex justify-end gap-3">
                                                            <motion.button
                                                                whileHover={{ scale: 1.1, rotate: 5 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={() => handleAction(r.id, 'Approved')}
                                                                className="w-10 h-10 flex items-center justify-center bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/5 group/btn"
                                                            >
                                                                <Check size={18} className="transition-transform group-hover/btn:scale-110" />
                                                            </motion.button>
                                                            <motion.button
                                                                whileHover={{ scale: 1.1, rotate: -5 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={() => handleAction(r.id, 'Denied')}
                                                                className="w-10 h-10 flex items-center justify-center bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-500/5 group/btn"
                                                            >
                                                                <X size={18} className="transition-transform group-hover/btn:scale-110" />
                                                            </motion.button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex justify-end">
                                                            <div className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 italic">
                                                                Pending Approval
                                                            </div>
                                                        </div>
                                                    )
                                                ) : (
                                                    <div className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/20 bg-black/40 px-4 py-2 rounded-xl border border-white/5 shadow-inner italic">
                                                        <Clock size={12} className="text-primary/20" />
                                                        {new Date(r.processedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </div>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-6 p-6 md:p-8 bg-zinc-900/60 border border-zinc-800 rounded-[2rem] relative overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[100px] pointer-events-none" />
                <Zap size={24} className="text-primary shrink-0 mt-1 animate-pulse" />
                <div className="space-y-2">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic underline-offset-4 decoration-primary/20">Resource Management Policy</h4>
                    <p className="text-[11px] text-muted-foreground/70 leading-relaxed font-bold uppercase tracking-wider italic">
                        "Approving a request will automatically update the inventory. These actions are final and recorded in the system log."
                    </p>
                </div>
            </div>

        </div>
    );
}
