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

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-secondary border border-border rounded-xl flex items-center justify-center text-primary shadow-sm group-hover:bg-primary/5 transition-colors">
                        <Box size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-foreground uppercase tracking-tight">Resource Allocation</h2>
                        <p className="text-xs text-muted-foreground opacity-80 uppercase font-black tracking-widest leading-none">Manage resource inventory and project requests.</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-secondary/30 border border-border/50 px-4 py-2.5 rounded-xl shadow-xs">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Pending Tasks</span>
                        <span className="text-sm font-black text-primary uppercase tracking-tighter">{requests.filter(r => r.status === 'Pending').length} Active Requests</span>
                    </div>
                </div>
            </div>

            <div className="bg-card/40 border border-border/50 rounded-2xl overflow-hidden shadow-sm backdrop-blur-md">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-secondary/50 border-b border-border/50">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Resource Item</th>
                                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Quantity</th>
                                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Requested By</th>
                                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            <AnimatePresence mode="popLayout">
                                {requests.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-24 text-center">
                                            <div className="flex flex-col items-center gap-4 opacity-30">
                                                <div className="p-4 bg-secondary rounded-2xl border border-dashed border-border/50">
                                                    <Box size={32} className="text-muted-foreground" />
                                                </div>
                                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">No resource requests detected.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    requests.map((r, idx) => (
                                        <motion.tr
                                            key={r.id}
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className="hover:bg-accent/30 transition-colors group"
                                        >
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-secondary border border-border/50 flex items-center justify-center text-primary shadow-xs transition-transform group-hover:scale-105">
                                                        <Box size={16} />
                                                    </div>
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-sm font-black text-foreground uppercase tracking-tight">{r.subProductName}</span>
                                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">NODE ID: {r.id.split('-')[0]}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-lg font-black text-foreground tracking-tighter">{r.requestedQuantity}</span>
                                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-50">Units</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-secondary border border-border/50 flex items-center justify-center text-[10px] font-black text-muted-foreground uppercase shadow-inner">
                                                        {r.requestedByUserId.toString().slice(0, 2)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] font-black text-foreground uppercase tracking-tight">Agent #{r.requestedByUserId}</span>
                                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">System Role</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className={cn(
                                                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-xs transition-all",
                                                    r.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                        r.status === 'Denied' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                                                            'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                )}>
                                                    <div className={cn("w-1 h-1 rounded-full animate-pulse shadow-[0_0_8px_currentColor]",
                                                        r.status === 'Approved' ? 'bg-emerald-500' :
                                                            r.status === 'Denied' ? 'bg-destructive' : 'bg-amber-500'
                                                    )} />
                                                    {r.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                {r.status === 'Pending' ? (
                                                    canManage ? (
                                                        <div className="flex justify-end gap-2 pr-2">
                                                            <button
                                                                onClick={() => handleAction(r.id, 'Approved')}
                                                                className="w-9 h-9 flex items-center justify-center bg-background hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-500 rounded-xl border border-border hover:border-emerald-500/50 transition-all shadow-xs group/btn"
                                                                title="Approve Request"
                                                            >
                                                                <Check size={16} className="group-hover/btn:scale-110 transition-transform" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleAction(r.id, 'Denied')}
                                                                className="w-9 h-9 flex items-center justify-center bg-background hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-xl border border-border hover:border-destructive/50 transition-all shadow-xs group/btn"
                                                                title="Deny Request"
                                                            >
                                                                <X size={16} className="group-hover/btn:scale-110 transition-transform" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40 italic">Awaiting Uplink</span>
                                                    )
                                                ) : (
                                                    <div className="flex items-center justify-end gap-2 text-muted-foreground font-black text-[10px] uppercase tracking-widest opacity-60">
                                                        <Clock size={11} className="text-muted-foreground/30" />
                                                        {new Date(r.processedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
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

            <div className="bg-secondary/20 border border-dashed border-border/50 p-6 rounded-2xl flex items-start gap-4 transition-all hover:bg-secondary/30">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0 mt-0.5 border border-primary/20">
                    <Info size={16} />
                </div>
                <div className="space-y-1.5 pt-0.5">
                    <h4 className="text-[11px] font-black text-foreground uppercase tracking-widest">Resource Allocation Protocol</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed font-bold opacity-80 uppercase tracking-tight">
                        Approved requests automatically update the project inventory and are recorded in the central ledger. Inventory changes are irreversible once confirmed by a commanding node. All transactions are encrypted and audited.
                    </p>
                </div>
            </div>
        </div>
    );
}
