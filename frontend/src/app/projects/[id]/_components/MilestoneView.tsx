"use client";

import React, { useState, useMemo } from 'react';
import {
    Flag, Plus, Check, Clock, AlertTriangle, Zap, Calendar, TrendingUp,
    Filter, ChevronDown, BarChart3, Target, Info, Sparkles, Layers,
    ChevronRight, ArrowUpRight, Layout, LayoutPanelLeft, Activity,
    User, List, Kanban, PieChart as PieIcon, Search, MoreVertical,
    ArrowRight, Star, ShieldCheck
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Sector } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { useSync } from '@/context/SyncContext';
import { apiFetch } from '@/lib/apiFetch';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface Milestone {
    id: string;
    projectId: string;
    name: string;
    description: string | null;
    status: 'Pending' | 'In Progress' | 'Completed';
    dueDate: string | null;
    progress: number;
    assignedTo: number | null;
    priority: 'Low' | 'Medium' | 'High';
    tags: string[];
    estimatedHours: number;
    actualHours: number;
    checklists: { id: string; text: string; completed: boolean }[];
    assigneeName?: string;
    assigneeEmail?: string;
    createdAt: string;
}

const PRIORITY_STYLES = {
    Low: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    Medium: 'bg-primary/10 text-primary border-primary/20',
    High: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
};

const STATUS_COLUMNS = [
    { id: 'Pending', label: 'To Do', color: 'bg-zinc-500/10 hover:bg-zinc-500/20' },
    { id: 'In Progress', label: 'In Progress', color: 'bg-primary/10 hover:bg-primary/20' },
    { id: 'Completed', label: 'Done', color: 'bg-emerald-500/10 hover:bg-emerald-500/20' },
];

function getDueDateUrgency(dueDate: string | null, status: string) {
    if (status === 'Completed' || !dueDate) return { color: '', label: '', bg: '' };
    const days = (new Date(dueDate).getTime() - Date.now()) / (1000 * 3600 * 24);
    if (days < 0) return { color: 'text-destructive', label: 'Overdue', bg: 'bg-destructive/10' };
    if (days < 3) return { color: 'text-destructive', label: `${Math.ceil(days)}d left`, bg: 'bg-destructive/10' };
    if (days < 7) return { color: 'text-amber-500', label: `${Math.ceil(days)}d left`, bg: 'bg-amber-500/10' };
    return { color: 'text-muted-foreground', label: new Date(dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), bg: 'bg-secondary' };
}

const formatName = (name: string | null | undefined, email: string) => {
    if (name) return name;
    if (!email) return 'Unknown User';
    const prefix = email.split('@')[0];
    return prefix
        .split(/[._-]/)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ');
};

const getInitials = (nameOrEmail: string | null | undefined) => {
    if (!nameOrEmail) return '??';
    const name = nameOrEmail.includes('@') ? nameOrEmail.split('@')[0] : nameOrEmail;
    const parts = name.split(/[._\s-]/).filter(Boolean);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0]?.substring(0, 2).toUpperCase() || '??';
};

export default function MilestoneView({ projectId, milestones = [], members = [], currentUser, currentUserRole = 'user', refresh, viewMode: initialViewMode }: {
    projectId: string; milestones?: Milestone[]; members?: any[]; currentUser?: any; currentUserRole?: string; refresh: () => void;
    viewMode?: 'list' | 'board' | 'analytics';
}) {
    const { triggerRefresh } = useSync();
    const canManage = ['owner', 'manager', 'admin'].includes(currentUserRole);

    const [isCreating, setIsCreating] = useState(false);
    const [name, setName] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [assignedTo, setAssignedTo] = useState<string>('');
    const [priority, setPriority] = useState<string>('Medium');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [onlyMyTasks, setOnlyMyTasks] = useState(false);
    const [tagsInput, setTagsInput] = useState('');
    const [estimatedHours, setEstimatedHours] = useState('0');
    const [viewMode, setViewMode] = useState<'list' | 'board' | 'analytics'>(initialViewMode || (canManage ? 'list' : 'board'));

    React.useEffect(() => {
        if (initialViewMode) setViewMode(initialViewMode);
    }, [initialViewMode]);

    const handleCreate = async () => {
        if (!name) return;
        const tags = tagsInput.split(',').map(tag => tag.trim()).filter(Boolean);
        const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/${projectId}/milestones`, {
            method: 'POST',
            body: JSON.stringify({
                name, dueDate,
                assignedTo: assignedTo ? parseInt(assignedTo) : null,
                priority,
                tags,
                estimatedHours: parseInt(estimatedHours) || 0
            })
        });
        if (res.ok) {
            toast.success('Task assigned successfully');
            setIsCreating(false); setName(''); setDueDate(''); setAssignedTo(''); setPriority('Medium');
            setTagsInput(''); setEstimatedHours('0');
            triggerRefresh();
            refresh();
        } else {
            toast.error('Failed to create task');
        }
    };

    const updateTask = async (id: string, updates: Partial<Milestone>) => {
        const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/${projectId}/milestones/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
        if (res.ok) {
            if (updates.status) toast.success(`Moved to ${updates.status}`);
            triggerRefresh();
            refresh();
        }
    };

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const { draggableId, destination } = result;
        const newStatus = destination.droppableId as Milestone['status'];
        const task = milestones.find(m => m.id === draggableId);
        if (task && task.status !== newStatus) {
            updateTask(draggableId, { status: newStatus, progress: newStatus === 'Completed' ? 100 : task.progress });
        }
    };

    const filteredMilestones = milestones.filter(m => {
        if (!canManage && m.assignedTo !== currentUser?.userId) return false;
        if (onlyMyTasks && m.assignedTo !== currentUser?.userId) return false;
        if (filterStatus === 'all') return true;
        return m.status === filterStatus;
    });

    const stats = useMemo(() => {
        const myTasks = milestones.filter(m => m.assignedTo === currentUser?.userId);
        const myTotal = myTasks.length;
        const myCompleted = myTasks.filter(m => m.status === 'Completed').length;
        const myProgress = myTotal > 0 ? Math.round((myCompleted / myTotal) * 100) : 0;
        const myAtRisk = myTasks.filter(m => {
            if (m.status === 'Completed' || !m.dueDate) return false;
            return (new Date(m.dueDate).getTime() - Date.now()) < 0;
        }).length;

        const globalTotal = milestones.length;
        const globalCompleted = milestones.filter(m => m.status === 'Completed').length;
        const globalAtRisk = milestones.filter(m => {
            if (m.status === 'Completed' || !m.dueDate) return false;
            return (new Date(m.dueDate).getTime() - Date.now()) < 0;
        }).length;
        const globalProgress = globalTotal > 0 ? Math.round((globalCompleted / globalTotal) * 100) : 0;

        const showGlobal = canManage && !onlyMyTasks;

        return {
            displayTotal: showGlobal ? globalTotal : myTotal,
            displayCompleted: showGlobal ? globalCompleted : myCompleted,
            displayAtRisk: showGlobal ? globalAtRisk : myAtRisk,
            displayProgress: showGlobal ? globalProgress : myProgress,
            myProgress,
            myTotal,
            myCompleted
        };
    }, [milestones, currentUser, canManage, onlyMyTasks]);

    const analyticsData = useMemo(() => {
        const activeMilestones = milestones.filter(m => {
            return (canManage && !onlyMyTasks) || m.assignedTo === currentUser?.userId;
        });

        const statusDist = STATUS_COLUMNS.map(col => ({
            name: col.label,
            value: activeMilestones.filter(m => m.status === col.id).length,
            id: col.id
        }));

        const priorityDist = ['Low', 'Medium', 'High'].map(p => ({
            name: p,
            value: activeMilestones.filter(m => m.priority === p).length
        }));

        const memberDist = canManage ? members.map(m => {
            const count = milestones.filter(ms => ms.assignedTo === m.userId).length;
            return {
                name: m.name || m.email?.split('@')[0] || 'User',
                value: count
            };
        }).filter(m => m.value > 0).sort((a, b) => b.value - a.value) : [];

        return { byStatus: statusDist, byPriority: priorityDist, byMember: memberDist };
    }, [milestones, members, canManage, onlyMyTasks, currentUser]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header & Main Controls */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                        <Target size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-foreground tracking-tight uppercase italic underline decoration-primary/30 underline-offset-4">Project Tasks</h2>
                        <p className="text-xs text-muted-foreground font-black uppercase tracking-[0.2em] opacity-60">Track and manage team tasks</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">


                    {canManage && (
                        <div className={cn(
                            "flex items-center gap-3 px-4 py-2 rounded-xl transition-all border shadow-xs cursor-pointer group",
                            onlyMyTasks ? "bg-primary border-primary text-primary-foreground" : "bg-card border-border text-muted-foreground hover:border-primary/30"
                        )} onClick={() => setOnlyMyTasks(!onlyMyTasks)}>
                            <User size={14} className={onlyMyTasks ? "text-white" : "group-hover:text-primary"} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Show Only My Tasks</span>
                        </div>
                    )}

                    {canManage && (
                        <button
                            onClick={() => setIsCreating(!isCreating)}
                            className="flex items-center gap-2 bg-primary hover:opacity-90 text-primary-foreground px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-primary/20"
                        >
                            <Plus size={16} /> Add New Task
                        </button>
                    )}
                </div>
            </div>

            {/* Quick Stats Section */}
            {viewMode !== 'analytics' && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="My Completion" value={`${stats.myProgress}%`} icon={Zap} color="text-yellow-500" sub={`${stats.myCompleted}/${stats.myTotal} Done`} />
                    <StatCard label={canManage ? "Total Tasks" : "My Tasks"} value={stats.displayTotal} icon={Layers} color="text-primary" />
                    <StatCard label={canManage ? "Overdue Tasks" : "My Overdue Tasks"} value={stats.displayAtRisk} icon={AlertTriangle} color={stats.displayAtRisk > 0 ? "text-rose-500" : "text-muted-foreground"} />
                    <StatCard label={canManage ? "Project Progress" : "My Overall Score"} value={`${stats.displayProgress}%`} icon={Activity} color="text-emerald-500" />
                </div>
            )}

            <AnimatePresence>
                {isCreating && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-card/40 backdrop-blur-md border border-primary/20 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">What needs to be done?</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 text-xs font-bold text-foreground outline-none focus:border-primary transition-all shadow-inner"
                                    placeholder="What needs to be done?"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Who is doing this?</label>
                                <select
                                    value={assignedTo}
                                    onChange={e => setAssignedTo(e.target.value)}
                                    className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 text-xs font-bold text-foreground outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Unassigned</option>
                                    {members.map((m: any) => (
                                        <option key={m.userId} value={m.userId}>
                                            [{m.projectRole?.replace('_', ' ').toUpperCase() || 'MEMBER'}] {formatName(m.name, m.email || m.userName)} - {m.email || m.userName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">How important is this?</label>
                                <select
                                    value={priority}
                                    onChange={e => setPriority(e.target.value)}
                                    className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 text-xs font-bold text-foreground outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High Priority</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Due Date</label>
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={e => setDueDate(e.target.value)}
                                    className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 text-xs font-bold text-foreground outline-none focus:border-primary transition-all"
                                />
                            </div>

                            <div className="space-y-2 lg:col-span-3">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Category Tags (comma separated)</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                                        <Filter size={14} />
                                    </div>
                                    <input
                                        type="text"
                                        value={tagsInput}
                                        onChange={e => setTagsInput(e.target.value)}
                                        className="w-full bg-background/50 border border-border rounded-xl pl-10 pr-4 py-3 text-xs font-bold text-foreground outline-none focus:border-primary transition-all"
                                        placeholder="frontend, bug, v1.0..."
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Expected Time (Hours)</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                                        <Clock size={14} />
                                    </div>
                                    <input
                                        type="number"
                                        value={estimatedHours}
                                        onChange={e => setEstimatedHours(e.target.value)}
                                        className="w-full bg-background/50 border border-border rounded-xl pl-10 pr-4 py-3 text-xs font-bold text-foreground outline-none focus:border-primary transition-all"
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-border/50">
                            <button onClick={() => setIsCreating(false)} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all">Cancel</button>
                            <button onClick={handleCreate} className="px-8 py-3 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all">Create Task</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Views Content */}
            <div className="min-h-[400px]">
                {viewMode === 'list' && (
                    <div className="relative pt-4 pl-4 border-l border-border/50 ml-2 space-y-10">
                        {filteredMilestones.length === 0 ? (
                            <div className="py-20 text-center opacity-40">
                                <Search size={32} className="mx-auto mb-4" />
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">No matching tasks active</p>
                            </div>
                        ) : (
                            filteredMilestones.map((m, idx) => (
                                <TaskListItem
                                    key={m.id}
                                    task={m}
                                    idx={idx}
                                    canManage={canManage}
                                    isMyTask={m.assignedTo === currentUser?.userId}
                                    onUpdate={(updates) => updateTask(m.id, updates)}
                                />
                            ))
                        )}
                    </div>
                )}

                {viewMode === 'board' && (
                    <DragDropContext onDragEnd={onDragEnd}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                            {STATUS_COLUMNS.map(col => (
                                <Droppable droppableId={col.id} key={col.id}>
                                    {(provided, snapshot) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className={cn(
                                                "flex flex-col gap-4 p-4 rounded-3xl min-h-[500px] transition-all",
                                                col.color,
                                                snapshot.isDraggingOver ? "ring-2 ring-primary/40 ring-offset-4 ring-offset-background" : ""
                                            )}
                                        >
                                            <div className="flex items-center justify-between mb-2 px-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                                    <h3 className="text-xs font-black uppercase tracking-widest">{col.label}</h3>
                                                </div>
                                                <span className="text-[10px] font-black bg-background/50 px-3 py-1 rounded-full border border-border/50">
                                                    {milestones.filter(m => m.status === col.id && (canManage || m.assignedTo === currentUser?.userId) && (!onlyMyTasks || m.assignedTo === currentUser?.userId)).length}
                                                </span>
                                            </div>
                                            <div className="flex-1 space-y-4">
                                                {milestones
                                                    .filter(m => m.status === col.id)
                                                    .filter(m => canManage || m.assignedTo === currentUser?.userId)
                                                    .filter(m => !onlyMyTasks || m.assignedTo === currentUser?.userId)
                                                    .map((m, index) => (
                                                        <Draggable key={m.id} draggableId={m.id} index={index}>
                                                            {(provided) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                >
                                                                    <TaskCard
                                                                        task={m}
                                                                        onUpdate={(updates) => updateTask(m.id, updates)}
                                                                    />
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                {provided.placeholder}
                                            </div>
                                        </div>
                                    )}
                                </Droppable>
                            ))}
                        </div>
                    </DragDropContext>
                )}

                {viewMode === 'analytics' && (
                    <div className="space-y-8">
                        {/* High-Level Productivity Insights */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <StatCard label={canManage ? "Tasks Started" : "My Tasks Started"} value={stats.displayTotal} icon={LayoutPanelLeft} color="text-primary" sub={canManage ? "All tasks in this project" : "Tasks assigned to you"} />
                            <StatCard label={canManage ? "Team Workload" : "My Tasks"} value={canManage ? analyticsData.byMember.length : 1} icon={User} color="text-amber-500" sub={canManage ? "Members working right now" : "Your work in this project"} />
                            <StatCard label="Completion Rate" value={`${stats.displayProgress}%`} icon={Zap} color="text-emerald-500" sub={canManage ? "Project completion speed" : "Your completion speed"} />
                        </div>

                        <div className={cn("grid grid-cols-1 gap-8", canManage ? "lg:grid-cols-2 xl:grid-cols-3" : "lg:grid-cols-2")}>
                            {/* Delivery Status - Donut Chart */}
                            <div className="bg-card/40 backdrop-blur-xl border border-border/50 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none group-hover:bg-primary/10 transition-all duration-700" />
                                <div className="flex items-center gap-4 mb-8 relative z-10">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><BarChart3 size={20} /></div>
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-widest">Progress Update</h3>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter opacity-70">Finished vs. Unfinished tasks</p>
                                    </div>
                                </div>
                                <div className="h-[300px] relative z-10">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <defs>
                                                <filter id="glowPie">
                                                    <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                                                    <feMerge>
                                                        <feMergeNode in="coloredBlur" />
                                                        <feMergeNode in="SourceGraphic" />
                                                    </feMerge>
                                                </filter>
                                                <linearGradient id="gradDone" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#10b981" />
                                                    <stop offset="100%" stopColor="#059669" />
                                                </linearGradient>
                                                <linearGradient id="gradProgress" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="var(--primary)" />
                                                    <stop offset="100%" stopColor="#2563eb" />
                                                </linearGradient>
                                                <linearGradient id="gradPending" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="var(--muted-foreground)" />
                                                    <stop offset="100%" stopColor="#64748b" />
                                                </linearGradient>
                                            </defs>
                                            <Pie
                                                data={analyticsData.byStatus}
                                                innerRadius={85}
                                                outerRadius={110}
                                                paddingAngle={6}
                                                dataKey="value"
                                                stroke="none"
                                                activeShape={(props: any) => {
                                                    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
                                                    return (
                                                        <g>
                                                            <Sector
                                                                cx={cx} cy={cy}
                                                                innerRadius={innerRadius}
                                                                outerRadius={outerRadius + 8}
                                                                startAngle={startAngle}
                                                                endAngle={endAngle}
                                                                fill={fill}
                                                                filter="url(#glowPie)" />
                                                        </g>
                                                    );
                                                }}
                                            >
                                                {analyticsData.byStatus.map((entry, index) => (
                                                    <Cell
                                                        key={index}
                                                        fill={entry.id === 'Completed' ? 'url(#gradDone)' : entry.id === 'In Progress' ? 'url(#gradProgress)' : 'url(#gradPending)'}
                                                        style={{ cursor: 'pointer', outline: 'none' }} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    background: 'hsl(var(--card))',
                                                    border: '1.5px solid hsl(var(--primary) / 0.5)',
                                                    borderRadius: '20px',
                                                    boxShadow: '0 25px 60px -15px rgba(0,0,0,0.5)',
                                                    backdropFilter: 'blur(20px)',
                                                    color: 'hsl(var(--foreground))',
                                                    padding: '12px 16px'
                                                }}
                                                itemStyle={{
                                                    fontSize: '9px',
                                                    fontWeight: 900,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '1.5px',
                                                    color: 'hsl(var(--foreground))'
                                                }}
                                                cursor={{ stroke: 'var(--primary)', strokeWidth: 2 }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-3xl font-black text-foreground tracking-tighter leading-none">{stats.displayProgress}%</span>
                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Completion</span>
                                    </div>
                                </div>
                            </div>

                            {/* Resource Distribution - Bar Chart (Management Only) */}
                            {canManage && !onlyMyTasks && (
                                <div className="bg-card/40 backdrop-blur-xl border border-border/50 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none group-hover:bg-amber-500/10 transition-all duration-700" />
                                    <div className="flex items-center gap-4 mb-8 relative z-10">
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500"><User size={20} /></div>
                                        <div>
                                            <h3 className="text-sm font-black uppercase tracking-widest">Team Workload</h3>
                                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter opacity-70">Who currently has the most tasks</p>
                                        </div>
                                    </div>
                                    <div className="h-[300px] relative z-10">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={analyticsData.byMember}>
                                                <defs>
                                                    <linearGradient id="gradMember" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="var(--primary)" />
                                                        <stop offset="100%" stopColor="#2563eb" />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: 'var(--muted-foreground)' }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} />
                                                <Tooltip cursor={{ fill: 'var(--secondary)', opacity: 0.2 }} contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px' }} />
                                                <Bar dataKey="value" fill="url(#gradMember)" radius={[10, 10, 0, 0]} barSize={40} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}

                            {/* Priority Intensity - Vertical Bar Chart */}
                            <div className={cn(
                                "bg-card/40 backdrop-blur-xl border border-border/50 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden group",
                                (canManage && !onlyMyTasks) ? "lg:col-span-2 xl:col-span-1" : "lg:col-span-1"
                            )}>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none group-hover:bg-rose-500/10 transition-all duration-700" />
                                <div className="flex items-center gap-4 mb-8 relative z-10">
                                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500"><TrendingUp size={20} /></div>
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-widest">Task Importance</h3>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter opacity-70">Tasks grouped by urgency</p>
                                    </div>
                                </div>
                                <div className="h-[300px] relative z-10">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={analyticsData.byPriority} layout="vertical">
                                            <defs>
                                                <linearGradient id="gradPriority" x1="1" y1="0" x2="0" y2="0">
                                                    <stop offset="0%" stopColor="#f43f5e" />
                                                    <stop offset="100%" stopColor="#fb7185" />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.05} />
                                            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} />
                                            <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: 'var(--foreground)' }} />
                                            <Tooltip cursor={{ fill: 'var(--secondary)', opacity: 0.2 }} contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px' }} />
                                            <Bar dataKey="value" fill="url(#gradPriority)" radius={[0, 10, 10, 0]} barSize={32} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color, sub }: { label: string; value: any; icon: any; color: string; sub?: string }) {
    return (
        <div className="bg-card/50 backdrop-blur-md border border-border/50 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between mb-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-secondary transition-all group-hover:scale-110", color)}>
                    <Icon size={18} />
                </div>
                {sub && <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none bg-accent/50 px-2 py-1 rounded-full">{sub}</span>}
            </div>
            <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">{label}</p>
                <p className="text-2xl font-black text-foreground tracking-tight">{value}</p>
            </div>
        </div>
    );
}

function TaskListItem({ task, idx, canManage, isMyTask, onUpdate }: { task: Milestone; idx: number; canManage: boolean; isMyTask: boolean; onUpdate: (updates: Partial<Milestone>) => void }) {
    const isCompleted = task.status === 'Completed';
    const urgency = getDueDateUrgency(task.dueDate, task.status);

    return (
        <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="group relative"
        >
            <div className={cn(
                "absolute -left-[21px] top-6 w-2.5 h-2.5 rounded-full border-2 border-background z-10",
                isCompleted ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : task.status === 'In Progress' ? "bg-primary" : "bg-muted-foreground"
            )} />

            <div className={cn(
                "p-6 rounded-[2rem] border transition-all duration-500 hover:shadow-xl",
                isCompleted ? "bg-emerald-500/5 border-emerald-500/20" : "bg-card border-border hover:border-primary/20 shadow-sm"
            )}>
                <div className="flex flex-wrap items-center justify-between gap-6 mb-6">
                    <div className="flex items-center gap-3">
                        <span className={cn(
                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                            isCompleted ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/30" :
                                task.status === 'In Progress' ? "bg-primary/20 text-primary border-primary/30" :
                                    "bg-zinc-500/10 text-muted-foreground border-border"
                        )}>{task.status}</span>

                        <span className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border", PRIORITY_STYLES[task.priority])}>
                            {task.priority} Priority
                        </span>

                        {urgency.label && (
                            <span className={cn("flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border", urgency.color, urgency.bg, "border-current/10")}>
                                <Calendar size={10} /> {urgency.label}
                            </span>
                        )}

                        {isMyTask && (
                            <span className="bg-yellow-400/10 text-yellow-500 border border-yellow-400/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                                <Star size={10} className="fill-current" /> My Personal Task
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {(() => {
                            const assigneeName = task.assigneeName;
                            const assigneeEmail = task.assigneeEmail;

                            return (
                                <div className="flex items-center gap-4 pr-4 border-r border-border/10">
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-black uppercase shadow-sm overflow-hidden">
                                            {getInitials(assigneeName || assigneeEmail || 'Unassigned')}
                                            <div className="absolute inset-0 bg-linear-to-tr from-primary/10 to-transparent" />
                                        </div>
                                        {assigneeName && (
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary text-primary-foreground rounded-full border-2 border-background flex items-center justify-center shadow-sm">
                                                <ShieldCheck size={10} strokeWidth={3} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em] leading-none mb-1">
                                            {assigneeName ? "Assigned To" : "Task Unassigned"}
                                        </span>
                                        <span className="text-xs font-black text-foreground leading-tight truncate max-w-[150px] tracking-tight">
                                            {assigneeName ? formatName(assigneeName, assigneeEmail || '') : "Everyone / Open"}
                                        </span>
                                    </div>
                                </div>
                            );
                        })()}

                        <div className="flex flex-col items-end gap-1.5 px-4 border-l border-border/10">
                            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em]">Estimation</span>
                            <div className="flex items-center gap-1.5 text-xs font-black text-foreground">
                                <Clock size={12} className="text-primary" />
                                {task.estimatedHours || 0}h
                            </div>
                        </div>

                        {(canManage || isMyTask) && !isCompleted && (
                            <div className="flex items-center gap-2">
                                <button onClick={() => onUpdate({ status: 'In Progress' })} className="p-2.5 rounded-xl border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary/30 transition-all shadow-xs"><Activity size={14} /></button>
                                <button onClick={() => onUpdate({ status: 'Completed', progress: 100 })} className="p-2.5 rounded-xl border border-border bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-xs"><Check size={14} /></button>
                            </div>
                        )}
                    </div>
                </div>

                {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {task.tags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 rounded-md bg-secondary/50 text-[8px] font-bold text-muted-foreground uppercase tracking-wider border border-border/50">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-[1fr,250px] gap-8 items-end">
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-black text-foreground uppercase tracking-tight mb-2 group-hover:text-primary transition-colors">{task.name}</h3>
                            <p className="text-xs text-muted-foreground font-medium opacity-80 leading-relaxed max-w-2xl">{task.description || "No detailed description provided for this task objective."}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                            <span className="text-muted-foreground">How far along are you?</span>
                            <span className={cn(isCompleted ? "text-emerald-500" : "text-primary")}>{task.progress}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={task.progress}
                            onChange={(e) => onUpdate({ progress: parseInt(e.target.value) })}
                            disabled={!canManage && !isMyTask}
                            className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between mt-1 opacity-40">
                            {[0, 25, 50, 75, 100].map(v => <span key={v} className="text-[8px] font-black">{v}%</span>)}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function TaskCard({ task, onUpdate }: { task: Milestone; onUpdate: (updates: Partial<Milestone>) => void }) {
    const urgency = getDueDateUrgency(task.dueDate, task.status);

    return (
        <div className="bg-card/40 backdrop-blur-xl border border-border/50 p-5 rounded-[2rem] group shadow-xs hover:shadow-2xl hover:-translate-y-1 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none group-hover:bg-primary/20 transition-all duration-700" />

            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex gap-1.5 overflow-hidden">
                    <span className={cn("px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border shrink-0", PRIORITY_STYLES[task.priority])}>
                        {task.priority}
                    </span>
                    {urgency.label && (
                        <span className={cn("px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border shrink-0", urgency.bg, urgency.color, "border-current/10")}>
                            {urgency.label}
                        </span>
                    )}
                </div>
            </div>

            <h4 className="text-xs font-black text-foreground uppercase tracking-tight mb-3 group-hover:text-primary transition-colors line-clamp-3 leading-relaxed relative z-10">{task.name}</h4>

            {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4 relative z-10">
                    {task.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[7px] font-bold text-muted-foreground/60 uppercase tracking-tighter">#{tag}</span>
                    ))}
                    {task.tags.length > 3 && <span className="text-[7px] font-bold text-muted-foreground/60 tracking-tighter">+{task.tags.length - 3}</span>}
                </div>
            )}

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/10 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-9 h-9 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-center text-primary text-[10px] font-black uppercase overflow-hidden shadow-inner">
                            {getInitials(task.assigneeName || task.assigneeEmail || '?')}
                            <div className="absolute inset-0 bg-linear-to-tr from-primary/10 to-transparent" />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-foreground/80">{task.progress}%</span>
                        <div className="w-10 h-1 bg-secondary/30 rounded-full overflow-hidden">
                            <div className={cn("h-full transition-all duration-1000", task.status === 'Completed' ? "bg-emerald-500" : "bg-primary")} style={{ width: `${task.progress}%` }} />
                        </div>
                    </div>
                    {task.estimatedHours > 0 && (
                        <div className="flex items-center gap-1 opacity-40 scale-75 origin-right">
                            <Clock size={10} />
                            <span className="text-[10px] font-bold">{task.estimatedHours}h</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
