"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useWorkspace } from '@/context/WorkspaceContext';
import {
    ArrowLeft, Calendar, FileText, Activity, Flag, Box, Users, Zap,
    TrendingUp, Clock, Settings, Plus, X, GripVertical, ChevronUp, ChevronDown,
    ChevronRight, Layout,
    BarChart3,
    Check,
    PieChart,
    Shield

} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, Pie } from 'recharts';
import { motion, Reorder, AnimatePresence, LayoutGroup } from 'motion/react';
import MilestoneView from './_components/MilestoneView';
import ResourceView from './_components/ResourceView';
import PulseView from './_components/PulseView';
import TeamView, { RoleBadge } from './_components/TeamView';
import SettingsView from './_components/SettingsView';
import { cn } from '@/lib/utils';
import { useSync } from '@/context/SyncContext';
import { apiFetch } from '@/lib/apiFetch';
import toast from 'react-hot-toast';
import { ThemeToggle } from '@/components/ThemeToggle';

type Tab = 'overview' | 'milestones' | 'resources' | 'team' | 'pulse' | 'settings';
type WidgetId = 'health' | 'tasks' | 'activity' | 'deadlines';

interface WidgetConfig {
    id: WidgetId;
    label: string;
    visible: boolean;
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
    { id: 'health', label: 'Velocity Matrix', visible: true },
    { id: 'tasks', label: 'Resource Allocation', visible: true },
    { id: 'activity', label: 'Team Tactical Matrix', visible: true },
    { id: 'deadlines', label: 'Project Pulse', visible: true },
];

const TABS: { id: Tab; icon: React.ElementType; label: string }[] = [
    { id: 'overview', icon: Layout, label: 'Control Center' },
    { id: 'milestones', icon: Flag, label: 'Milestones' },
    { id: 'resources', icon: Box, label: 'Resources' },
    { id: 'team', icon: Users, label: 'Team' },
    { id: 'pulse', icon: Activity, label: 'Activity' },
    { id: 'settings', icon: Settings, label: 'Settings' },
];

export default function ProjectDashboardPage() {
    const params = useParams();
    const projectId = params.id as string;
    const router = useRouter();
    const searchParams = useSearchParams();
    const { refreshSignal } = useSync();
    const { workspaceRole } = useWorkspace();

    const [project, setProject] = useState<any>(null);
    const [milestones, setMilestones] = useState<any[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [reminders, setReminders] = useState<any[]>([]);
    const [pulse, setPulse] = useState<any[]>([]);
    const activeTab = (searchParams.get('tab') as Tab) || 'overview';
    const [loading, setLoading] = useState(true);
    const [showCustomizer, setShowCustomizer] = useState(false);
    const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);

    const fetchProjectData = async () => {
        try {
            const [pRes, mRes, rRes, remRes, pulseRes, meRes, memRes] = await Promise.all([
                apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/${projectId}`),
                apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/${projectId}/milestones`),
                apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/${projectId}/resource-requests`),
                apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/${projectId}/reminders`),
                apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/${projectId}/pulse`),
                apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`),
                apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/${projectId}/members`),
            ]);
            if (pRes.ok) setProject(await pRes.json());
            if (mRes.ok) setMilestones(await mRes.json());
            if (rRes.ok) setRequests(await rRes.json());
            if (remRes.ok) setReminders(await remRes.json());
            if (pulseRes.ok) setPulse(await pulseRes.json());
            if (meRes.ok) {
                const meData = await meRes.json();
                setCurrentUser(meData.user);
            }
            if (memRes.ok) setMembers(await memRes.json());
        } catch (e) {
            console.error(e);
            toast.error("Failed to sync project data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const saved = localStorage.getItem(`pms_widgets_${projectId}`);
        if (saved) setWidgets(JSON.parse(saved));

        if (projectId) {
            fetchProjectData();
        }
    }, [projectId, refreshSignal]);

    useEffect(() => {
        localStorage.setItem(`pms_widgets_${projectId}`, JSON.stringify(widgets));
    }, [widgets, projectId]);

    const setActiveTab = (tab: Tab) => {
        const params = new URLSearchParams(searchParams);
        params.set('tab', tab);
        router.push(`?${params.toString()}`);
    };

    const getEffectiveRole = () => {
        if (!currentUser || !project || !members) return 'user';

        // Check if user is the organization owner or admin
        if (project.workspace?.userId === currentUser.userId || workspaceRole === 'owner' || workspaceRole === 'admin') return 'admin';

        // Check project-specific membership role
        const member = members.find(m => m.userId === currentUser.userId);
        return member?.projectRole || 'user';
    };

    const currentUserRole = getEffectiveRole();

    if (loading) return (
        <div className="flex-1 flex flex-col items-center justify-center bg-background">
            <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-xs font-semibold text-muted-foreground/40 animate-pulse">Loading project details...</p>
        </div>
    );

    if (!project) return (
        <div className="flex-1 flex items-center justify-center bg-background p-6 text-center">
            <div className="max-w-md">
                <div className="w-14 h-14 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <X size={24} />
                </div>
                <h2 className="text-xl font-bold mb-2">Project Not Found</h2>
                <p className="text-xs font-medium text-muted-foreground mb-8">The requested project does not exist or you do not have permission to view it.</p>
                <button onClick={() => router.push('/projects')} className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold text-[11px] uppercase tracking-wider">Back to Projects</button>
            </div>
        </div>
    );

    const completedMilestones = (milestones || []).filter(m => m.status === 'Completed').length;
    const totalProgress = (milestones || []).length > 0 ? Math.round(milestones.reduce((a, m) => a + (m.progress || 0), 0) / milestones.length) : 0;
    const pendingRequests = (requests || []).filter(r => r.status === 'Pending').length;

    const getHealthAnalysis = () => {
        const pendingRequestsCount = (requests || []).filter(r => r.status === 'Pending').length;
        if (pendingRequestsCount > 0) return "Awaiting resource approvals.";
        if (project.health === 'Green') return "Project is on track.";
        if (project.health === 'Yellow') return "Minor delays detected.";
        return "Critical issues require attention.";
    };

    const chartData = (milestones || [])
        .filter(m => m.dueDate)
        .map(m => ({
            name: m.name.length > 10 ? m.name.substring(0, 10) + '...' : m.name,
            progress: m.progress,
            date: new Date(m.dueDate).getTime()
        }))
        .sort((a, b) => a.date - b.date);

    const allocationData = [
        { name: 'Approved', value: (requests || []).filter(r => r.status === 'Approved').length, color: '#10b981' },
        { name: 'Pending', value: (requests || []).filter(r => r.status === 'Pending').length, color: 'var(--color-primary)' },
        { name: 'Denied', value: (requests || []).filter(r => r.status === 'Denied').length, color: '#f43f5e' },
    ].filter(d => d.value > 0);

    const resourceBreakdown = (requests || []).reduce((acc: any[], r: any) => {
        const existing = acc.find(d => d.name === r.subProductName);
        if (existing) {
            existing.value += r.requestedQuantity;
        } else {
            acc.push({ name: r.subProductName, value: r.requestedQuantity });
        }
        return acc;
    }, []).slice(0, 5);

    const ROLES_STYLE = [
        { value: 'admin', color: '#f43f5e' },
        { value: 'manager', color: '#a855f7' },
        { value: 'team_leader', color: '#3b82f6' },
        { value: 'developer', color: '#10b981' },
        { value: 'designer', color: '#f59e0b' },
        { value: 'customer', color: '#06b6d4' },
    ];

    const roleDistribution = ROLES_STYLE.map(r => ({
        name: r.value.replace('_', ' ').toUpperCase(),
        value: members.filter(m => m.projectRole === r.value).length,
        color: r.color
    })).filter(d => d.value > 0);

    const joinTimeline = members.reduce((acc: any[], m: any) => {
        const date = new Date(m.joinedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        const existing = acc.find(d => d.date === date);
        if (existing) {
            existing.count += 1;
        } else {
            acc.push({ date, count: 1 });
        }
        return acc;
    }, []).reverse().slice(-10);

    const toggleWidget = (id: WidgetId) => {
        setWidgets(prev => prev.map(w => w.id === id ? { ...w, visible: !w.visible } : w));
    };

    const moveWidget = (id: WidgetId, direction: 'up' | 'down') => {
        const index = widgets.findIndex(w => w.id === id);
        if (index === -1) return;
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= widgets.length) return;

        const newWidgets = [...widgets];
        [newWidgets[index], newWidgets[newIndex]] = [newWidgets[newIndex], newWidgets[index]];
        setWidgets(newWidgets);
    };

    const handleSaveLayout = () => {
        setSaving(true);
        // We simulate a small delay to make it feel like it's persisting
        setTimeout(() => {
            setSaving(false);
            setShowCustomizer(false);
            toast.success("Dashboard Layout Updated");
        }, 800);
    };

    const renderWidget = (id: WidgetId) => {
        switch (id) {
            case 'health':
                return (
                    <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-8 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none group-hover:bg-primary/10 transition-colors" />

                        <div className="flex flex-col lg:flex-row gap-10">
                            <div className="flex-1 space-y-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center text-primary shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.1)] group-hover:shadow-[0_0_40px_rgba(var(--color-primary-rgb),0.2)] transition-all duration-700">
                                            <Zap size={24} className="animate-pulse" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black uppercase tracking-widest italic group-hover:text-primary transition-colors">Velocity Matrix</h3>
                                            <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] group-hover:text-muted-foreground/50 transition-colors">Milestone Burn Rate & Momentum</p>
                                        </div>
                                    </div>
                                    <div className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 bg-primary/5 px-4 py-1.5 rounded-full border border-primary/10 italic shadow-2xl backdrop-blur-md">
                                        <div className="w-1 h-1 rounded-full bg-primary animate-ping" />
                                        Live Spectrum
                                    </div>
                                </div>

                                <div className="h-[220px] w-full mt-6 relative">
                                    <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="mile_grad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.02)" />
                                            <XAxis dataKey="name" hide />
                                            <YAxis hide domain={[0, 100]} />
                                            <Tooltip
                                                cursor={{ stroke: 'rgba(var(--color-primary-rgb), 0.2)', strokeWidth: 2 }}
                                                contentStyle={{
                                                    backgroundColor: 'rgba(9, 9, 11, 0.95)',
                                                    border: '1px solid rgba(39, 39, 42, 0.5)',
                                                    borderRadius: '20px',
                                                    fontSize: '10px',
                                                    fontWeight: '900',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.1em',
                                                    backdropFilter: 'blur(10px)',
                                                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                                                }}
                                                itemStyle={{ color: 'var(--color-primary)' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="progress"
                                                stroke="var(--color-primary)"
                                                strokeWidth={3}
                                                fill="url(#mile_grad)"
                                                animationDuration={2500}
                                                dot={{ r: 4, fill: '#09090b', strokeWidth: 2, stroke: 'var(--color-primary)', opacity: 0 }}
                                                activeDot={{ r: 6, fill: 'var(--color-primary)', strokeWidth: 0 }}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="w-px bg-gradient-to-b from-transparent via-zinc-800/50 to-transparent hidden lg:block" />

                            <div className="lg:w-80 space-y-4">
                                {[
                                    { label: 'Completed Phase', value: completedMilestones, total: milestones.length, icon: Check, color: 'text-emerald-500', bg: 'bg-emerald-500/5', border: 'border-emerald-500/10' },
                                    { label: 'Pending Burn', value: milestones.length - completedMilestones, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/5', border: 'border-amber-500/10' },
                                    { label: 'Success Rate', value: `${totalProgress}%`, icon: Zap, color: 'text-primary', bg: 'bg-primary/5', border: 'border-primary/10' }
                                ].map((stat, i) => (
                                    <motion.div
                                        key={stat.label}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 + 0.5 }}
                                        className={cn(
                                            "p-5 rounded-[2rem] border transition-all duration-500 group/stat relative overflow-hidden",
                                            "bg-zinc-950/40 border-zinc-800/40 hover:border-zinc-700 hover:bg-zinc-900/40",
                                            stat.border
                                        )}
                                    >
                                        <div className={cn("absolute inset-0 opacity-0 group-hover/stat:opacity-100 transition-opacity duration-1000", stat.bg)} />
                                        <div className="flex items-center justify-between mb-3 relative z-10">
                                            <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center border border-current/10 bg-current/5", stat.color, stat.bg)}>
                                                <stat.icon size={14} />
                                            </div>
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 group-hover/stat:text-muted-foreground/60 transition-colors">{stat.label}</span>
                                        </div>
                                        <div className="flex items-baseline gap-3 relative z-10">
                                            <span className="text-3xl font-black italic tracking-tighter transition-transform group-hover/stat:scale-110 origin-left duration-700">
                                                {stat.total ? `${stat.value}` : stat.value}
                                            </span>
                                            {stat.total && (
                                                <span className="text-[10px] font-black text-muted-foreground/20 uppercase tracking-widest italic">
                                                    of {stat.total} Modules
                                                </span>
                                            )}
                                            {!stat.total && (
                                                <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest italic">Precision</span>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 'tasks':
                return (
                    <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-8 overflow-hidden relative group">
                        <div className="flex flex-col lg:flex-row gap-12">
                            {/* Status Matrix */}
                            <div className="lg:w-2/5 space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center text-primary shadow-inner group-hover:border-primary/20 transition-all duration-700">
                                        <PieChart size={24} className="text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-widest italic group-hover:text-primary transition-colors">Request Matrix</h3>
                                        <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">Approval Distribution Logic</p>
                                    </div>
                                </div>

                                <div className="h-[220px] w-full relative group/pie">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={allocationData}
                                                innerRadius={65}
                                                outerRadius={85}
                                                paddingAngle={8}
                                                dataKey="value"
                                                animationDuration={2000}
                                                stroke="none"
                                            >
                                                {allocationData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: 'rgba(9, 9, 11, 0.95)', border: '1px solid rgba(39, 39, 42, 0.5)', borderRadius: '16px', fontSize: '10px', fontWeight: '900', backdropFilter: 'blur(10px)' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none group-hover/pie:scale-110 transition-transform duration-700">
                                        <span className="text-4xl font-black italic tracking-tighter drop-shadow-2xl">{requests.length}</span>
                                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/20">Operational Units</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    {allocationData.map(d => (
                                        <div key={d.name} className="flex items-center gap-3 p-3 bg-zinc-950/30 rounded-2xl border border-zinc-800/30 hover:border-zinc-700 transition-colors">
                                            <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ color: d.color, backgroundColor: d.color }} />
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">{d.name}</span>
                                                <span className="text-xs font-black italic">{d.value}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="w-px bg-gradient-to-b from-transparent via-zinc-800/50 to-transparent hidden lg:block" />

                            {/* Inventory Load */}
                            <div className="flex-1 space-y-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center text-primary shadow-inner group-hover:border-primary/20 transition-all duration-700">
                                            <BarChart3 size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black uppercase tracking-widest italic group-hover:text-primary transition-colors">Consumption Pulse</h3>
                                            <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">Inventory Pressure Analysis</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10">
                                            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                            Optimal
                                        </div>
                                    </div>
                                </div>

                                <div className="h-[260px] w-full mt-6">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={resourceBreakdown} layout="vertical" margin={{ left: 20 }}>
                                            <XAxis type="number" hide />
                                            <YAxis
                                                dataKey="name"
                                                type="category"
                                                width={100}
                                                tick={{ fill: 'rgba(255,255,255,0.4)', style: { fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' } }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                                contentStyle={{ backgroundColor: 'rgba(9, 9, 11, 0.95)', border: '1px solid rgba(39, 39, 42, 0.5)', borderRadius: '16px', fontSize: '10px', fontWeight: '900', backdropFilter: 'blur(10px)' }}
                                            />
                                            <Bar
                                                dataKey="value"
                                                fill="var(--color-primary)"
                                                radius={[0, 8, 8, 0]}
                                                barSize={24}
                                                animationDuration={2500}
                                            >
                                                {resourceBreakdown.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fillOpacity={0.8 + (index * 0.05)} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'activity':
                return (
                    <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-8 overflow-hidden relative group">
                        <div className="flex flex-col lg:flex-row gap-12">
                            {/* Role Distribution Pie */}
                            <div className="lg:w-2/5 space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center text-primary shadow-inner group-hover:border-primary/20 transition-all duration-700">
                                        <Shield size={24} className="animate-pulse" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-widest italic group-hover:text-primary transition-colors">Tactical Matrix</h3>
                                        <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">Personnel Role Distribution</p>
                                    </div>
                                </div>

                                <div className="h-[220px] w-full relative group/pie">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={roleDistribution}
                                                innerRadius={65}
                                                outerRadius={85}
                                                paddingAngle={8}
                                                dataKey="value"
                                                animationDuration={2000}
                                                stroke="none"
                                            >
                                                {roleDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: 'rgba(9, 9, 11, 0.95)', border: '1px solid rgba(39, 39, 42, 0.5)', borderRadius: '16px', fontSize: '10px', fontWeight: '900', backdropFilter: 'blur(10px)' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none group-hover/pie:scale-110 transition-transform duration-700">
                                        <span className="text-4xl font-black italic tracking-tighter drop-shadow-2xl">{members.length}</span>
                                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/20">Active Personnel</span>
                                    </div>
                                </div>

                                <div className="space-y-2 mt-4">
                                    {roleDistribution.slice(0, 4).map(d => (
                                        <div key={d.name} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-xl transition-colors group/row">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ color: d.color, backgroundColor: d.color }} />
                                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 group-hover/row:text-muted-foreground transition-colors">{d.name}</span>
                                            </div>
                                            <span className="text-[10px] font-black italic tracking-tighter opacity-20 group-hover/row:opacity-100 transition-opacity">{d.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="w-px bg-gradient-to-b from-transparent via-zinc-800/50 to-transparent hidden lg:block" />

                            {/* Join Velocity Bar */}
                            <div className="flex-1 space-y-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center text-primary shadow-inner group-hover:border-primary/20 transition-all duration-700">
                                            <TrendingUp size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black uppercase tracking-widest italic group-hover:text-primary transition-colors">Onboarding Pulse</h3>
                                            <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">Personnel Acquisition Speed</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-primary bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                                            <div className="w-1 h-1 rounded-full bg-primary animate-ping" />
                                            Steady
                                        </div>
                                    </div>
                                </div>

                                <div className="h-[220px] w-full mt-6">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={joinTimeline} margin={{ bottom: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.01)" />
                                            <XAxis
                                                dataKey="date"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: 'rgba(255,255,255,0.2)', style: { fontSize: 8, fontWeight: 900, textTransform: 'uppercase' } }}
                                                dy={10}
                                            />
                                            <YAxis hide />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                                contentStyle={{ backgroundColor: 'rgba(9, 9, 11, 0.95)', border: '1px solid rgba(39, 39, 42, 0.5)', borderRadius: '16px', fontSize: '10px', fontWeight: '900', backdropFilter: 'blur(10px)' }}
                                            />
                                            <Bar dataKey="count" fill="var(--color-primary)" radius={[6, 6, 0, 0]} barSize={24} animationDuration={2500}>
                                                {joinTimeline.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fillOpacity={0.6 + (index * 0.1)} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'deadlines':
                return (
                    <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-8 overflow-hidden relative group">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center text-primary shadow-inner group-hover:border-primary/20 transition-all duration-700">
                                    <Activity size={24} className="animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-widest italic group-hover:text-primary transition-colors">Neural Pulse</h3>
                                    <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">Real-time Event Stream Analysis</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col items-end hidden sm:flex">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/20">Stream Status</span>
                                    <span className="text-xs font-black text-emerald-500 italic">Synchronized</span>
                                </div>
                                <div className="w-px h-8 bg-zinc-800/50 hidden sm:block" />
                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40 bg-primary/5 px-4 py-1.5 rounded-full border border-primary/10 italic">
                                    {pulse.length} Events
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pulse.slice(0, 6).map((evt, i) => (
                                <motion.div
                                    key={evt.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="group/evt relative p-5 bg-zinc-950/40 border border-zinc-800/30 rounded-3xl hover:border-zinc-700 transition-all duration-500 hover:-translate-y-1"
                                >
                                    <div className="absolute top-0 right-0 p-3 opacity-0 group-hover/evt:opacity-100 transition-opacity">
                                        <ChevronRight size={10} className="text-primary" />
                                    </div>
                                    <div className="flex items-start gap-4 h-full">
                                        <div className={cn(
                                            "w-2 h-2 mt-2 rounded-full shrink-0 shadow-[0_0_12px_currentColor] animate-pulse",
                                            evt.type === 'CRITICAL' ? 'text-rose-500 bg-rose-500' :
                                                evt.type === 'WARNING' ? 'text-amber-500 bg-amber-500' :
                                                    'text-emerald-500 bg-emerald-500'
                                        )} />
                                        <div className="flex-1 min-w-0 space-y-1.4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/20 italic">{evt.type}</span>
                                                <span className="text-[8px] text-muted-foreground/40 font-black tracking-widest shrink-0 ml-2 bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-800">
                                                    {new Date(evt.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-xs font-black truncate group-hover/evt:text-primary transition-colors uppercase italic tracking-tight">{evt.title}</p>
                                            <p className="text-[9px] text-muted-foreground/40 line-clamp-2 leading-relaxed font-bold uppercase tracking-wide group-hover/evt:text-muted-foreground/60 transition-colors">{evt.message}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {pulse.length === 0 && (
                                <div className="col-span-full py-16 text-center border-2 border-dashed border-zinc-800 rounded-[2.5rem] bg-zinc-950/20 group-hover:bg-zinc-950/40 transition-colors duration-700">
                                    <Activity size={32} className="text-muted-foreground/10 mx-auto mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/20">Neural Pulse Inactive</p>
                                    <p className="text-[9px] text-muted-foreground/10 uppercase tracking-widest mt-2">Awaiting system broadcast...</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col bg-background text-foreground h-screen overflow-hidden selection:bg-primary/20">

            {/* Compact Context & Navigation Bar */}
            <header className="sticky top-0 z-50 bg-zinc-950/40 backdrop-blur-3xl border-b border-zinc-800 px-6 md:px-10 py-1 flex items-center justify-between gap-8 h-12">
                <div className="flex items-center gap-6 min-w-0">
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="w-6 h-6 bg-zinc-900 rounded-md border border-zinc-800 flex items-center justify-center shadow-inner">
                            <Box size={12} className="text-primary" />
                        </div>
                        <h1 className="text-xs font-black tracking-tight text-foreground uppercase italic truncate max-w-[200px]">
                            {project.name}
                        </h1>
                    </div>

                    <div className="h-4 w-px bg-zinc-800/50" />

                    <nav className="flex items-center gap-1">
                        {TABS.filter(tab => currentUserRole === 'admin' || tab.id !== 'settings').map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "h-8 px-3 flex items-center gap-2 text-[8px] font-black uppercase tracking-wider transition-all relative group whitespace-nowrap rounded-lg hover:bg-zinc-900/40",
                                    activeTab === tab.id ? "text-primary bg-zinc-900/60 border border-zinc-800 shadow-inner" : "text-muted-foreground/30"
                                )}
                            >
                                <tab.icon size={10} />
                                {tab.label}
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="pro_tab_indicator"
                                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary/80 rounded-full"
                                    />
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-6 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border backdrop-blur-md",
                            project.health === 'Green' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' :
                                project.health === 'Yellow' ? 'bg-amber-500/10 text-amber-500 border-amber-500/10' :
                                    'bg-rose-500/10 text-rose-500 border-rose-500/10'
                        )}>
                            <div className="w-1 h-1 rounded-full bg-current animate-pulse" />
                            {project.health}
                        </div>
                        <RoleBadge role={currentUserRole || 'user'} />
                    </div>

                    <div className="hidden xl:flex items-center gap-6 border-l border-white/5 pl-6">
                        <div className="flex flex-col items-end">
                            <span className="text-[7px] font-black text-muted-foreground/20 uppercase tracking-widest">Progress</span>
                            <span className="text-[10px] font-black italic tracking-tighter text-primary">{totalProgress}%</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[7px] font-black text-muted-foreground/20 uppercase tracking-widest">Deadline</span>
                            <span className="text-[10px] font-black italic tracking-tighter">
                                {project.deadline ? new Date(project.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'OPEN'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {currentUserRole === 'admin' && activeTab === 'overview' && (
                            <button
                                onClick={() => setShowCustomizer(true)}
                                className="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/5 hover:bg-white/10 rounded-lg transition-all text-muted-foreground/40 hover:text-primary"
                                title="Modify Layout"
                            >
                                <Layout size={14} />
                            </button>
                        )}
                        <ThemeToggle />
                    </div>
                </div>
            </header>




            {/* Content Area - Independent Scroll */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 custom-scrollbar scroll-smooth">

                <div className="max-w-7xl mx-auto h-full">
                    {activeTab === 'overview' && (
                        <div className="space-y-8 pb-32">
                            {/* Executive Summary Header */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                                {[
                                    { label: 'Project Health', value: project.health, icon: Zap, trend: '+2.4%', color: project.health === 'Green' ? 'text-emerald-500' : 'text-amber-500', desc: 'Neural calculation based on current velocity' },
                                    { label: 'Active Efficiency', value: `${totalProgress}%`, icon: Activity, trend: '+12.1%', color: 'text-primary', desc: 'Overall milestone completion factor' },
                                    { label: 'Personnel Sync', value: members.length, icon: Users, trend: 'Optimal', color: 'text-sky-500', desc: 'Tactical role distribution stability' },
                                    { label: 'Operation Risk', value: 'Low', icon: Shield, trend: '-4.2%', color: 'text-emerald-400', desc: 'Incident frequency & burn rate analysis' },
                                ].map((stat, i) => (
                                    <motion.div
                                        key={stat.label}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="relative group cursor-default"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-1000 -z-10" />
                                        <div className="bg-zinc-900/60 backdrop-blur-2xl border border-zinc-800/50 p-6 rounded-[2.5rem] hover:border-zinc-700/50 transition-all duration-500 group-hover:-translate-y-1 shadow-2xl">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center border border-current/10 bg-current/5", stat.color)}>
                                                    <stat.icon size={18} />
                                                </div>
                                                <div className={cn("text-[9px] font-black px-3 py-1 rounded-full border border-current/10 bg-current/5", stat.color)}>
                                                    {stat.trend}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">{stat.label}</h4>
                                                <div className="flex items-baseline gap-2">
                                                    <span className={cn("text-3xl font-black italic tracking-tighter drop-shadow-md", stat.color)}>{stat.value}</span>
                                                    <span className="text-[10px] font-black text-muted-foreground/10 uppercase italic">Nominal</span>
                                                </div>
                                            </div>
                                            <p className="mt-4 text-[9px] text-muted-foreground/20 font-bold leading-relaxed uppercase tracking-wide group-hover:text-muted-foreground/40 transition-colors">{stat.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            <AnimatePresence mode="popLayout">
                                {widgets.filter(w => w.visible).map((widget) => (
                                    <motion.div
                                        key={widget.id}
                                        layout
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        transition={{ duration: 0.3, ease: 'easeOut' }}
                                        className="relative"
                                    >
                                        {renderWidget(widget.id)}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {widgets.filter(w => w.visible).length === 0 && (
                                <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-3xl bg-card/10">
                                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                        <Layout size={32} className="text-muted-foreground/10" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Dashboard Empty</p>
                                    <p className="text-[9px] text-muted-foreground/20 uppercase tracking-tight mb-8">No widgets are currently visible.</p>
                                    <button
                                        onClick={() => setShowCustomizer(true)}
                                        className="bg-primary/10 text-primary border border-primary/20 px-6 py-2.5 rounded-xl font-black uppercase tracking-[0.2em] text-[9px] hover:bg-primary/20 transition-all"
                                    >
                                        Add Widgets
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="pb-20 h-full">
                        {activeTab === 'milestones' && <MilestoneView projectId={projectId} milestones={milestones} currentUserRole={currentUserRole} refresh={fetchProjectData} />}
                        {activeTab === 'resources' && <ResourceView projectId={projectId} requests={requests} currentUserRole={currentUserRole} refresh={fetchProjectData} />}

                        {activeTab === 'team' && <TeamView projectId={projectId} workspaceId={project.workspaceId} currentUserRole={currentUserRole} refresh={fetchProjectData} />}
                        {activeTab === 'pulse' && <PulseView projectId={projectId} />}
                        {activeTab === 'settings' && <SettingsView projectId={projectId} project={project} currentUserRole={currentUserRole} refresh={fetchProjectData} />}
                    </div>
                </div>
            </main>


            {/* Customizer Modal */}
            <AnimatePresence>
                {showCustomizer && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCustomizer(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 10 }} className="bg-card border border-white/5 w-full max-w-sm rounded-[2rem] shadow-2xl p-8 relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                                        <Layout size={20} />
                                    </div>
                                    <h3 className="text-lg font-bold tracking-tight">Layout Settings</h3>
                                </div>
                                <button onClick={() => setShowCustomizer(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-3 mb-8">
                                {widgets.map((w, index) => (
                                    <div
                                        key={w.id}
                                        className={cn(
                                            "flex items-center justify-between p-4 rounded-2xl border transition-all",
                                            w.visible ? "bg-white/5 border-primary/20 shadow-sm" : "bg-black/20 border-transparent opacity-40 grayscale"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex flex-col gap-1">
                                                <button
                                                    onClick={() => moveWidget(w.id, 'up')}
                                                    disabled={index === 0}
                                                    className="text-muted-foreground/20 hover:text-primary transition-colors disabled:opacity-0"
                                                >
                                                    <ChevronUp size={14} />
                                                </button>
                                                <button
                                                    onClick={() => moveWidget(w.id, 'down')}
                                                    disabled={index === widgets.length - 1}
                                                    className="text-muted-foreground/20 hover:text-primary transition-colors disabled:opacity-0"
                                                >
                                                    <ChevronDown size={14} />
                                                </button>
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest">{w.label}</span>
                                        </div>
                                        <button
                                            onClick={() => toggleWidget(w.id)}
                                            className={cn(
                                                "w-10 h-5 rounded-full transition-all relative border border-white/10",
                                                w.visible ? "bg-primary" : "bg-white/5"
                                            )}
                                        >
                                            <div className={cn(
                                                "absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all shadow-sm",
                                                w.visible ? "left-5.5" : "left-0.5"
                                            )} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleSaveLayout}
                                disabled={saving}
                                className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:-translate-y-px transition-all disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save Layout'}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >


    );
}
