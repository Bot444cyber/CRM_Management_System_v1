"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    BarChart3, TrendingUp, Users, Shield, Zap, Globe, PieChart,
    Layers, ArrowUpRight, ArrowDownRight, Menu, Building2,
    Activity, Target, Clock, AlertCircle, ChevronRight, Layout,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart as RePieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { useSidebar } from '@/context/SidebarContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useSync } from '@/context/SyncContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { apiFetch } from '@/lib/apiFetch';
import { cn } from '@/lib/utils';

// Premium Theme-Aware Color Palette for Charts
const CHART_COLORS = ['var(--primary)', 'color-mix(in oklch, var(--primary), transparent 25%)', 'color-mix(in oklch, var(--primary), transparent 50%)', 'color-mix(in oklch, var(--primary), transparent 75%)', 'color-mix(in oklch, var(--primary), transparent 90%)'];
const STATUS_COLORS = {
    'Active': 'var(--primary)',
    'Completed': '#3b82f6',
    'At Risk': 'var(--destructive)',
    'Pending': 'var(--muted-foreground)'
};

interface PMSSummary {
    workspaces: { total: number; list: Array<{ id: string; name: string }> };
    projects: {
        total: number;
        statusDistribution: Array<{ name: string; value: number }>;
        list: Array<{ id: string; name: string; status: string; workspaceId: string; deadline: string | null }>;
    };
    team: {
        total: number;
        roleDistribution: Array<{ name: string; value: number }>;
        list: Array<{ userId: number; role: string; workspaceId: string }>;
    };
    activity: Array<{ id: string; type: string; title: string; message: string; time: string; workspaceId: string }>;
}

export default function AnalyticsPage() {
    const { setIsMobileOpen } = useSidebar();
    const { activeWorkspace } = useWorkspace();
    const { refreshSignal } = useSync();
    const [summary, setSummary] = useState<PMSSummary | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/analytics/summary`);
            if (res.ok) setSummary(await res.json());
        } catch (error) {
            console.error("Failed to fetch analytics summary:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [refreshSignal]);

    const filteredStats = useMemo(() => {
        if (!summary) return null;
        if (!activeWorkspace) return summary;

        const wsProjects = summary.projects.list.filter(p => p.workspaceId === activeWorkspace.id);
        const statusMap = new Map<string, number>();
        wsProjects.forEach(p => {
            const status = p.status || 'Active';
            statusMap.set(status, (statusMap.get(status) || 0) + 1);
        });

        const wsTeam = summary.team.list.filter(m => m.workspaceId === activeWorkspace.id);
        const roleMap = new Map<string, number>();
        const uniqueMembers = new Set<number>();
        wsTeam.forEach(m => {
            uniqueMembers.add(m.userId);
            roleMap.set(m.role, (roleMap.get(m.role) || 0) + 1);
        });

        const wsActivity = summary.activity.filter(a => a.workspaceId === activeWorkspace.id);

        return {
            ...summary,
            projects: {
                total: wsProjects.length,
                statusDistribution: Array.from(statusMap.entries()).map(([name, value]) => ({ name, value })),
                list: wsProjects
            },
            team: {
                total: uniqueMembers.size,
                roleDistribution: Array.from(roleMap.entries()).map(([name, value]) => ({ name, value })),
                list: wsTeam
            },
            activity: wsActivity
        };
    }, [summary, activeWorkspace]);

    if (loading) return (
        <div className="flex-1 flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <Loader2 size={32} className="animate-spin text-primary" />
                <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest animate-pulse">Aggregating Intelligence Nodes...</p>
            </div>
        </div>
    );

    return (
        <div className="bg-background h-full overflow-hidden flex flex-col">
            {/* Header */}
            <header className="h-16 border-b border-border bg-background/80 backdrop-blur-xl px-6 flex items-center justify-between shrink-0 z-50 shadow-sm">
                <div className="flex items-center gap-6">
                    <button onClick={() => setIsMobileOpen(true)} className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"><Menu size={18} /></button>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center shadow-xs">
                            <BarChart3 size={16} className="text-primary" />
                        </div>
                        <div className="flex items-center gap-2 text-sm font-black uppercase tracking-tight">
                            <span className="text-muted-foreground opacity-60">Analytics</span>
                            <ChevronRight size={14} className="text-border" />
                            <span className="text-foreground">{activeWorkspace?.name || 'Global Grid'}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-secondary/50 border border-border rounded-full shadow-inner">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-80">Real-time Stream</span>
                    </div>
                    <ThemeToggle />
                </div>
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar w-full">
                <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
                    {/* KPI Bento Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <KPICard
                            label="Active Workspaces"
                            value={summary?.workspaces.total.toString() || "0"}
                            trend="+2"
                            isUp={true}
                            icon={<Building2 size={20} />}
                        />
                        <KPICard
                            label="Target Initiatives"
                            value={filteredStats?.projects.total.toString() || "0"}
                            trend="+12%"
                            isUp={true}
                            icon={<Target size={20} />}
                        />
                        <KPICard
                            label="Team Headcount"
                            value={filteredStats?.team.total.toString() || "0"}
                            trend="-3"
                            isUp={false}
                            icon={<Users size={20} />}
                        />
                        <KPICard
                            label="Resource Velocity"
                            value="98.2%"
                            trend="+0.4%"
                            isUp={true}
                            icon={<Zap size={20} />}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Performance Distribution */}
                        <div className="lg:col-span-2 bg-card border border-border/50 rounded-2xl p-6 md:p-8 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                            <div className="flex items-center justify-between mb-8">
                                <div className="space-y-1">
                                    <h3 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">Initiative Status Distribution</h3>
                                    <p className="text-[10px] text-muted-foreground font-bold opacity-40 uppercase tracking-tight">Cross-workspace project phase metrics</p>
                                </div>
                                <div className="p-2 bg-secondary/50 rounded-lg text-muted-foreground">
                                    <TrendingUp size={16} />
                                </div>
                            </div>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={filteredStats?.projects.statusDistribution || []}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="color-mix(in oklch, var(--foreground), transparent 95%)" vertical={false} />
                                        <XAxis
                                            dataKey="name"
                                            stroke="var(--muted-foreground)"
                                            fontSize={9}
                                            fontWeight={900}
                                            tickLine={false}
                                            axisLine={false}
                                            className="uppercase tracking-widest opacity-60"
                                        />
                                        <YAxis hide />
                                        <Tooltip
                                            cursor={{ fill: 'color-mix(in oklch, var(--foreground), transparent 98%)' }}
                                            content={({ active, payload }) => {
                                                if (active && payload?.length) return (
                                                    <div className="bg-card border border-border p-3 rounded-xl shadow-2xl backdrop-blur-md">
                                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 opacity-60 border-b border-border/50 pb-1">{payload[0].payload.name}</p>
                                                        <p className="text-xl font-black text-foreground tracking-tighter">{payload[0].value} <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest ml-1 opacity-60">Units</span></p>
                                                    </div>
                                                );
                                                return null;
                                            }}
                                        />
                                        <Bar
                                            dataKey="value"
                                            radius={[6, 6, 0, 0]}
                                            barSize={40}
                                            activeBar={{ fillOpacity: 1, strokeWidth: 0 }}
                                        >
                                            {filteredStats?.projects.statusDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={(STATUS_COLORS as any)[entry.name] || 'var(--muted)'} fillOpacity={0.8} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Authority Matrix */}
                        <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col group hover:shadow-md transition-all">
                            <div className="flex items-center justify-between mb-8">
                                <div className="space-y-1">
                                    <h3 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">Role Distribution</h3>
                                    <p className="text-[10px] text-muted-foreground font-bold opacity-40 uppercase tracking-tight">Personnel allotment matrix</p>
                                </div>
                                <div className="p-2 bg-secondary/50 rounded-lg text-muted-foreground">
                                    <Shield size={16} />
                                </div>
                            </div>
                            <div className="flex-1 min-h-[180px] relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RePieChart>
                                        <Pie
                                            data={filteredStats?.team.roleDistribution || []}
                                            innerRadius={65}
                                            outerRadius={85}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {filteredStats?.team.roleDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} fillOpacity={0.8} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (active && payload?.length) return (
                                                    <div className="bg-card border border-border p-2.5 rounded-xl shadow-xl backdrop-blur-md">
                                                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">{payload[0].name}</p>
                                                        <p className="text-sm font-black text-foreground tracking-tight">{payload[0].value} NODES</p>
                                                    </div>
                                                );
                                                return null;
                                            }}
                                        />
                                    </RePieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-2xl font-black text-foreground tracking-tighter leading-none">{filteredStats?.team.total}</span>
                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Entities</span>
                                </div>
                            </div>
                            <div className="mt-8 space-y-3">
                                {filteredStats?.team.roleDistribution.slice(0, 4).map((entry, index) => (
                                    <div key={entry.name} className="flex items-center justify-between group/item">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-2 h-2 rounded-full shadow-xs" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60 group-hover/item:opacity-100 transition-opacity">{entry.name}</span>
                                        </div>
                                        <span className="text-[11px] font-black text-foreground tracking-tight border-b border-border/50 group-hover/item:border-primary/50 transition-all">{entry.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity Feed */}
                    <div className="bg-card/40 border border-border/50 rounded-[2rem] p-8 md:p-10 shadow-sm backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-10">
                            <div className="space-y-1">
                                <h3 className="text-sm font-black text-foreground uppercase tracking-[0.2em] leading-none">Global Sector Stream</h3>
                                <p className="text-[10px] text-muted-foreground font-bold opacity-40 uppercase tracking-widest pl-0.5">Real-time event monitor across active nodes</p>
                            </div>
                            <div className="p-2.5 bg-secondary/50 rounded-xl text-muted-foreground shadow-inner">
                                <Clock size={16} />
                            </div>
                        </div>

                        <div className="space-y-8 relative">
                            <div className="absolute left-[23px] top-6 bottom-6 w-px bg-border/50 border-l border-dashed border-border/30" />
                            <AnimatePresence mode='popLayout'>
                                {filteredStats?.activity.length ? filteredStats.activity.slice(0, 8).map((event, idx) => (
                                    <motion.div
                                        key={event.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="relative flex items-start gap-8 group"
                                    >
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border z-10 bg-background shadow-xs transition-all duration-500 group-hover:scale-110 group-hover:shadow-md",
                                            event.type === 'SUCCESS' ? "border-emerald-500/20 text-emerald-500 shadow-emerald-500/5" :
                                                event.type === 'CRITICAL' ? "border-destructive/20 text-destructive shadow-destructive/5" :
                                                    "border-border text-muted-foreground"
                                        )}>
                                            {event.type === 'SUCCESS' ? <CheckCircle2 size={18} /> : event.type === 'CRITICAL' ? <AlertCircle size={18} /> : <Activity size={18} />}
                                        </div>
                                        <div className="flex-1 pb-8 border-b border-border/30 last:border-0 group-hover:border-primary/20 transition-colors">
                                            <div className="flex items-center justify-between mb-2">
                                                <h5 className="text-xs font-black text-foreground uppercase tracking-tight leading-none group-hover:text-primary transition-colors">{event.title}</h5>
                                                <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-40 flex items-center gap-1.5 bg-secondary/30 px-2 py-0.5 rounded-full border border-border/50">
                                                    <div className="w-1 h-1 rounded-full bg-primary/40 animate-pulse" />
                                                    Live Node
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground leading-relaxed font-bold uppercase tracking-tight opacity-70 group-hover:opacity-100 transition-opacity max-w-2xl">{event.message}</p>
                                        </div>
                                    </motion.div>
                                )) : (
                                    <div className="py-24 flex flex-col items-center opacity-20">
                                        <Activity size={48} className="text-muted-foreground mb-6" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Sector Silence Detected</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function KPICard({ label, value, trend, isUp, icon }: { label: string, value: string, trend: string, isUp: boolean, icon: React.ReactNode }) {
    return (
        <div className="bg-card/40 border border-border/50 rounded-2xl p-6 hover:bg-card hover:shadow-lg transition-all group hover:translate-y-[-2px] backdrop-blur-md">
            <div className="flex items-center justify-between mb-6">
                <div className="w-11 h-11 rounded-xl bg-secondary/50 border border-border/50 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/5 transition-all shadow-inner group-hover:scale-110">
                    {icon}
                </div>
                <div className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xs",
                    isUp ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-destructive/10 text-destructive border border-destructive/20"
                )}>
                    {isUp ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                    {trend}
                </div>
            </div>
            <div className="space-y-0.5">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-50">{label}</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-foreground tracking-tighter">{value}</span>
                </div>
            </div>
        </div>
    );
}

const CheckCircle2 = ({ size, className }: { size: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);
