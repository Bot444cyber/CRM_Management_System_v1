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
    PieChart as PieIcon,
    Shield,
    CheckCircle2
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, Pie, PieChart } from 'recharts';
import { motion, Reorder, AnimatePresence, LayoutGroup } from 'motion/react';
import MilestoneView from './_components/MilestoneView';
import ResourceView from './_components/ResourceView';
import PulseView from './_components/PulseView';
import TeamView, { RoleBadge } from './_components/TeamView';
import SettingsView from './_components/SettingsView';
import { cn } from '@/lib/utils';
import { useSync } from '@/context/SyncContext';
import { useSidebar } from '@/context/SidebarContext';
import { Menu as MenuIcon } from 'lucide-react';
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
    { id: 'health', label: 'Progress Overview', visible: true },
    { id: 'tasks', label: 'Resource Allocation', visible: true },
    { id: 'activity', label: 'Team Composition', visible: true },
    { id: 'deadlines', label: 'Activity Distribution', visible: true },
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
    const { setIsMobileOpen } = useSidebar();

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
            <p className="text-xs font-semibold text-muted-foreground animate-pulse">Loading project details...</p>
        </div>
    );

    if (!project) return (
        <div className="flex-1 flex items-center justify-center bg-background p-6 text-center">
            <div className="max-w-md">
                <div className="w-14 h-14 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center mx-auto mb-6">
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
        { name: 'Pending', value: (requests || []).filter(r => r.status === 'Pending').length, color: 'var(--primary)' },
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
        setTimeout(() => {
            setSaving(false);
            setShowCustomizer(false);
            toast.success("Dashboard Layout Updated");
        }, 800);
    };

    const renderWidget = (id: WidgetId) => {
        const widgetWrapper = (title: string, subtitle: string, icon: React.ElementType, children: React.ReactNode, className?: string) => (
            <div className={cn("bg-card/50 border border-border/50 rounded-2xl p-6 flex flex-col h-full hover:border-border transition-all group shadow-sm", className)}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                            {React.createElement(icon, { size: 20 })}
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{subtitle}</p>
                        </div>
                    </div>
                </div>
                <div className="flex-1 min-h-0">
                    {children}
                </div>
            </div>
        );

        switch (id) {
            case 'health':
                return widgetWrapper(
                    "Project Progress",
                    "Milestone Completion & Velocity",
                    TrendingUp,
                    <div className="h-full flex flex-col gap-6">
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="area_grad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
                                    <XAxis dataKey="name" hide />
                                    <YAxis hide domain={[0, 100]} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '11px' }}
                                        itemStyle={{ color: 'var(--foreground)' }}
                                        labelStyle={{ color: 'var(--foreground)' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="progress"
                                        stroke="var(--primary)"
                                        strokeWidth={2}
                                        fill="url(#area_grad)"
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-3 rounded-xl bg-secondary/30 border border-border/30">
                                <p className="text-[10px] text-muted-foreground font-medium uppercase mb-1">Completed</p>
                                <p className="text-lg font-bold text-foreground">{completedMilestones}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-secondary/30 border border-border/30">
                                <p className="text-[10px] text-muted-foreground font-medium uppercase mb-1">Pending</p>
                                <p className="text-lg font-bold text-foreground">{milestones.length - completedMilestones}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-secondary/30 border border-border/30">
                                <p className="text-[10px] text-muted-foreground font-medium uppercase mb-1">Success</p>
                                <p className="text-lg font-bold text-primary">{totalProgress}%</p>
                            </div>
                        </div>
                    </div>,
                    "col-span-1 md:col-span-2"
                );
            case 'tasks':
                return widgetWrapper(
                    "Resource Distribution",
                    "Inventory & Allocation Load",
                    Box,
                    <div className="h-full flex flex-col gap-6">
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={resourceBreakdown} layout="vertical">
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={80} tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }}
                                        itemStyle={{ color: 'var(--foreground)' }}
                                        labelStyle={{ color: 'var(--foreground)' }}
                                    />
                                    <Bar dataKey="value" fill="var(--primary)" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-2">
                            {allocationData.map(d => (
                                <div key={d.name} className="flex items-center justify-between p-2 rounded-lg bg-secondary/20 text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                                        <span className="text-muted-foreground">{d.name}</span>
                                    </div>
                                    <span className="font-semibold text-foreground">{d.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'activity':
                return widgetWrapper(
                    "Team Overview",
                    "Role Distribution & Onboarding",
                    Users,
                    <div className="h-full flex flex-col gap-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="h-[140px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={roleDistribution} innerRadius={35} outerRadius={50} paddingAngle={5} dataKey="value" stroke="none">
                                            {roleDistribution.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }}
                                            itemStyle={{ color: 'var(--foreground)' }}
                                            labelStyle={{ color: 'var(--foreground)' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex flex-col justify-center gap-2">
                                {roleDistribution.slice(0, 3).map(d => (
                                    <div key={d.name} className="flex items-center gap-2 text-[10px]">
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                                        <span className="text-muted-foreground truncate">{d.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 space-y-3">
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Recent Joiners</p>
                            <div className="space-y-2">
                                {members.slice(0, 3).map(m => (
                                    <div key={m.id} className="flex items-center gap-3 p-2 rounded-xl bg-secondary/30 border border-border/30">
                                        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                                            {m.userName?.[0].toUpperCase() || 'U'}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-foreground truncate">{m.userName?.split('@')[0]}</p>
                                            <p className="text-[9px] text-muted-foreground capitalize">{m.projectRole?.replace('_', ' ')}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 'deadlines':
                return widgetWrapper(
                    "Activity Feed",
                    "Recent Events & Updates",
                    Activity,
                    <div className="space-y-4">
                        {pulse.slice(0, 4).map((evt) => (
                            <div key={evt.id} className="flex gap-4 p-3 rounded-xl bg-secondary/20 border border-border/20 hover:bg-secondary/40 transition-colors">
                                <div className={cn(
                                    "w-1.5 h-1.5 mt-1.5 rounded-full shrink-0",
                                    evt.type === 'CRITICAL' ? 'bg-destructive shadow-[0_0_8px_var(--destructive)] shadow-destructive/40' :
                                        evt.type === 'WARNING' ? 'bg-amber-500' : 'bg-emerald-500'
                                )} />
                                <div className="space-y-1 min-w-0">
                                    <div className="flex items-center justify-between gap-4">
                                        <p className="text-xs font-semibold text-foreground truncate">{evt.title}</p>
                                        <span className="text-[9px] text-muted-foreground shrink-0">{new Date(evt.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground line-clamp-1">{evt.message}</p>
                                </div>
                            </div>
                        ))}
                        {pulse.length === 0 && (
                            <div className="py-12 text-center text-muted-foreground">
                                <Activity size={24} className="mx-auto mb-2 opacity-20" />
                                <p className="text-xs">No recent activity</p>
                            </div>
                        )}
                    </div>,
                    "col-span-1 md:col-span-2"
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col bg-background text-foreground h-full overflow-hidden border-l border-border/50">
            {/* Header */}
            <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-50 shrink-0">
                <div className="flex items-center gap-6">
                    <button onClick={() => setIsMobileOpen(true)} className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"><MenuIcon size={20} /></button>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20"><Box size={16} /></div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <h1 className="text-sm font-black text-foreground uppercase tracking-tight leading-none">
                                    {project?.name || 'Loading Architecture...'}
                                </h1>
                                <RoleBadge role={currentUserRole} />
                            </div>
                            <p className="text-[10px] text-muted-foreground opacity-60 uppercase font-black tracking-widest mt-1">
                                Project Command Center v1.0
                            </p>
                        </div>
                    </div>
                    <nav className="hidden lg:flex items-center gap-1 p-1 rounded-xl bg-secondary border border-border">
                        {TABS.filter(tab => currentUserRole === 'admin' || tab.id !== 'settings').map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200 whitespace-nowrap uppercase tracking-wider",
                                    activeTab === tab.id ? "bg-background text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-4 px-4 py-1.5 rounded-xl bg-secondary/50 border border-border/50">
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Health</span>
                            <span className={cn("text-[10px] font-black", project.health === 'Green' ? 'text-emerald-500' : project.health === 'Yellow' ? 'text-amber-500' : 'text-destructive')}>{project.health}</span>
                        </div>
                        <div className="w-px h-6 bg-border/50" />
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Progress</span>
                            <span className="text-[10px] font-black text-primary">{totalProgress}%</span>
                        </div>
                    </div>
                    <ThemeToggle />
                </div>
            </header >

            {/* Mobile Tab Nav */}
            <div className="lg:hidden flex border-b border-border overflow-x-auto no-scrollbar bg-card/20 shrink-0">
                {TABS.filter(tab => currentUserRole === 'admin' || tab.id !== 'settings').map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "px-4 py-3 text-[10px] font-bold transition-all border-b-2 uppercase tracking-widest whitespace-nowrap",
                            activeTab === tab.id ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area - Independent Scroll */}
            < main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 custom-scrollbar scroll-smooth bg-background" >

                <div className="max-w-7xl mx-auto min-h-full">
                    {activeTab === 'overview' && (
                        <div className="space-y-8 pb-32">
                            {/* Summary Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { label: 'Operational Health', value: project.health, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                                    { label: 'Total Progress', value: `${totalProgress}%`, icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
                                    { label: 'Active Team', value: members.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                                    { label: 'Security Level', value: 'Verified', icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                                ].map((stat) => (
                                    <div key={stat.label} className="bg-card/40 border border-border/50 p-5 rounded-2xl hover:border-border transition-all shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.bg, stat.color)}>
                                                <stat.icon size={18} />
                                            </div>
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">Live</span>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                                            <p className={cn("text-2xl font-black tracking-tight text-foreground")}>{stat.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* Bento Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {widgets.filter(w => w.visible).map((widget) => (
                                    <React.Fragment key={widget.id}>
                                        {renderWidget(widget.id)}
                                    </React.Fragment>
                                ))}
                            </div>

                            {widgets.filter(w => w.visible).length === 0 && (
                                <div className="py-24 text-center border border-dashed border-border rounded-3xl bg-secondary/20">
                                    <div className="w-16 h-16 bg-card rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                                        <Layout size={32} className="text-muted-foreground/30" />
                                    </div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Control Center Empty</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-tight">No widgets are currently active in this workspace.</p>
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
            </main >

            {/* Customizer Modal */}
            <AnimatePresence>
                {
                    showCustomizer && (
                        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCustomizer(false)} className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
                            <motion.div initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 10 }} className="bg-card border border-border w-full max-w-sm rounded-[2rem] shadow-2xl p-8 relative z-10">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                                            <Layout size={20} />
                                        </div>
                                        <h3 className="text-lg font-bold tracking-tight">Layout Settings</h3>
                                    </div>
                                    <button onClick={() => setShowCustomizer(false)} className="p-2 hover:bg-accent rounded-lg transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="space-y-3 mb-8">
                                    {widgets.map((w, index) => (
                                        <div
                                            key={w.id}
                                            className={cn(
                                                "flex items-center justify-between p-4 rounded-2xl border transition-all",
                                                w.visible ? "bg-accent border-primary/20 shadow-sm" : "bg-secondary/40 border-transparent opacity-40 grayscale"
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
                                                    w.visible ? "bg-primary" : "bg-secondary"
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
                    )
                }
            </AnimatePresence >
        </div >
    );
}
