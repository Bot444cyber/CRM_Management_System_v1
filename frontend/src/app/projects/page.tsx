"use client";

import { useSync } from '@/context/SyncContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/apiFetch';
import {
    Zap, Loader2, Briefcase, Plus, Users, TrendingUp, AlertTriangle,
    CheckCircle2, Search, Filter, SortAsc, ChevronRight, Calendar, Clock,
    Hash, Eye, EyeOff, LayoutPanelLeft, ShieldCheck, ArrowRight, Building2, Globe, ArrowLeft, Home,
    MoreHorizontal, GripVertical, Menu, FilterX, Box, Star
} from 'lucide-react';

import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, JSX, useMemo } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useSidebar } from '@/context/SidebarContext';
import Link from 'next/link';

const STATUS_CONFIG: Record<string, { label: string; cls: string; color: string }> = {
    Green: { label: 'On Track', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', color: '#10b981' },
    Yellow: { label: 'At Risk', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20', color: '#f59e0b' },
    Red: { label: 'Critical', cls: 'bg-rose-500/10 text-rose-400 border-rose-500/20', color: '#ef4444' },
};

const KANBAN_COLUMNS = [
    { id: 'Planning', title: 'Backlog', color: 'bg-blue-500' },
    { id: 'Active', title: 'In Progress', color: 'bg-zinc-900 dark:bg-white' },
    { id: 'Completed', title: 'Completed', color: 'bg-emerald-500' },

    { id: 'Archived', title: 'Archived', color: 'bg-muted-foreground' },
];

export default function ProjectsPortfolioPage() {
    const { activeWorkspace, workspaces, setActiveWorkspace, refreshWorkspaces, loading: wsLoading, workspaceRole } = useWorkspace();
    const { setIsMobileOpen } = useSidebar();
    const canManage = workspaceRole === 'owner' || workspaceRole === 'manager' || workspaceRole === 'admin';

    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();
    const { refreshSignal } = useSync();

    useEffect(() => {
        if (activeWorkspace) fetchProjects(activeWorkspace.id);
    }, [activeWorkspace, refreshSignal]);

    const fetchProjects = async (wsId: string) => {
        setLoading(true);
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/workspaces/${wsId}`);
            setProjects(res.ok ? await res.json() : []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;
        if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;

        const prjId = draggableId;
        const newStatus = destination.droppableId;

        setProjects(prev => prev.map(p => p.id === prjId ? { ...p, status: newStatus } : p));

        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/${prjId}`, {
                method: 'PATCH',
                body: JSON.stringify({ status: newStatus })
            });
            if (!res.ok) fetchProjects(activeWorkspace!.id);
        } catch (e) {
            console.error(e);
            fetchProjects(activeWorkspace!.id);
        }
    };

    const columnsData = useMemo(() => {
        const data: Record<string, any[]> = { Planning: [], Active: [], Completed: [], Archived: [] };
        projects.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .forEach(p => {
                if (data[p.status]) data[p.status].push(p);
                else data['Planning'].push(p);
            });
        return data;
    }, [projects, searchQuery]);

    if (wsLoading || loading) return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-background min-h-[400px] transition-colors duration-500">
            <div className="relative mb-8">
                <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Box size={24} className="text-primary animate-pulse" />
                </div>
            </div>
            <div className="space-y-2 text-center">
                <h3 className="text-xs font-black text-foreground uppercase tracking-[0.4em] animate-pulse">
                    Accessing Portfolio
                </h3>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-40">
                    Decrypting Workspace Assets...
                </p>
            </div>
        </div>
    );

    return (
        <div className="h-full bg-background flex flex-col overflow-hidden text-foreground">
            {/* Header */}
            <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-50">
                <div className="flex items-center gap-6">
                    <button onClick={() => setIsMobileOpen(true)} className="lg:hidden text-muted-foreground hover:text-foreground"><Menu size={20} /></button>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20"><Box size={16} /></div>
                        <h1 className="text-sm font-bold text-foreground">{activeWorkspace?.name || 'Workspace Portfolio'}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative w-64 hidden md:block">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            placeholder="Filter projects..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full h-9 bg-accent/50 border border-border rounded-xl pl-9 pr-4 text-xs outline-none focus:ring-1 focus:ring-primary/50 transition-all font-medium"
                        />
                    </div>
                    <ThemeToggle />
                </div>
            </header>

            <main className="flex-1 overflow-x-auto custom-scrollbar p-6 md:p-8">
                <DragDropContext onDragEnd={handleDragEnd}>
                    <div className="flex gap-6 min-h-full">
                        {KANBAN_COLUMNS.map(col => (
                            <KanbanColumn
                                key={col.id}
                                col={col}
                                projects={columnsData[col.id]}
                                canManage={canManage}
                            />
                        ))}
                    </div>
                </DragDropContext>
            </main>

            {canManage && activeWorkspace && (
                <button
                    onClick={() => router.push('/projects/new')}
                    className="fixed bottom-8 right-8 h-12 px-6 bg-zinc-100 dark:bg-white hover:bg-zinc-200 dark:hover:bg-zinc-100 text-zinc-950 rounded-2xl shadow-xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95 z-50 group font-bold text-sm"
                >
                    <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                    <span>New Project</span>
                </button>
            )}
        </div>
    );
}

function KanbanColumn({ col, projects, canManage }: { col: any, projects: any[], canManage: boolean }) {
    return (
        <div className="w-80 shrink-0 flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className={cn("w-1.5 h-1.5 rounded-full", col.color, "shadow-[0_0_8px_currentColor]")} />
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        {col.title}
                        <span className="bg-secondary text-muted-foreground px-2 py-0.5 rounded-full text-[9px] border border-border/50">
                            {projects?.length || 0}
                        </span>
                    </h3>
                </div>
                <MoreHorizontal size={14} className="text-muted-foreground/60 hover:text-foreground cursor-pointer transition-colors" />
            </div>

            <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                    <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={cn(
                            "flex-1 rounded-3xl p-3 transition-colors duration-300 min-h-[400px] border border-transparent",
                            snapshot.isDraggingOver ? "bg-accent/40 border-border/50" : "bg-accent/10"
                        )}
                    >
                        <div className="space-y-3">
                            {projects?.map((prj, index) => (
                                <ProjectCard key={prj.id} prj={prj} index={index} canManage={canManage} />
                            ))}
                        </div>
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
}

function ProjectCard({ prj, index, canManage }: { prj: any, index: number, canManage: boolean }) {
    const sCfg = STATUS_CONFIG[prj.health as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.Green;

    const formatName = (name: string | null, email: string) => {
        if (name) return name;
        const prefix = email.split('@')[0];
        return prefix
            .split(/[._-]/)
            .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join(' ');
    };

    const getInitials = (nameOrEmail: string) => {
        if (!nameOrEmail) return '??';
        const name = nameOrEmail.includes('@') ? nameOrEmail.split('@')[0] : nameOrEmail;
        const parts = name.split(/[._\s-]/).filter(Boolean);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return parts[0]?.substring(0, 2).toUpperCase() || '??';
    };

    const displayMembers = prj.projectMembers || [];
    const totalMembers = prj.totalMemberCount || 0;
    const remainingCount = totalMembers - displayMembers.length;

    return (
        <Draggable draggableId={prj.id} index={index} isDragDisabled={!canManage}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="outline-none"
                    style={provided.draggableProps.style}
                >
                    <motion.div
                        whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className={cn(
                            "bg-card/50 backdrop-blur-sm border border-border/50 rounded-[1.5rem] p-5 group cursor-grab active:cursor-grabbing relative overflow-hidden transition-all duration-300",
                            snapshot.isDragging ? "shadow-2xl border-primary scale-[1.02] bg-accent/80 z-100 ring-2 ring-primary/20" : "hover:border-primary/30 hover:bg-card"
                        )}
                    >
                        {/* Status Backdrop Gradient */}
                        <div className={cn(
                            "absolute -top-12 -right-12 w-32 h-32 opacity-[0.08] blur-3xl rounded-full transition-opacity group-hover:opacity-15",
                            sCfg.color === '#ef4444' ? 'bg-rose-500' : sCfg.color === '#f59e0b' ? 'bg-amber-500' : 'bg-emerald-500'
                        )} />

                        <div className="flex items-center justify-between mb-5 relative z-10">
                            <div className={cn("px-2.5 py-1 rounded-full text-[8px] font-black border flex items-center gap-1.5 uppercase tracking-widest backdrop-blur-md transition-all group-hover:scale-105", sCfg.cls)}>
                                <div className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor] animate-pulse" />
                                {sCfg.label}
                            </div>
                            <button className="p-1.5 rounded-lg hover:bg-secondary/80 text-muted-foreground/40 hover:text-primary transition-all active:scale-90">
                                <Star size={13} strokeWidth={2.5} />
                            </button>
                        </div>

                        <div className="relative z-10 mb-6">
                            <h4 className="text-[13px] font-black text-foreground group-hover:text-primary transition-colors leading-tight uppercase tracking-tight mb-1">
                                {prj.name}
                            </h4>
                            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest opacity-40">Phase: {prj.status || 'Evolution'}</p>
                        </div>

                        <div className="space-y-5 relative z-10">
                            {/* Sleek Progress Bar */}
                            <div className="space-y-2.5">
                                <div className="flex justify-between items-center px-0.5">
                                    <div className="flex items-center gap-1.5">
                                        <TrendingUp size={10} className="text-primary/60" />
                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.15em] opacity-60">Velocity Matrix</span>
                                    </div>
                                    <span className="text-[10px] font-black text-primary tracking-tighter">{prj.priority === 'High' ? '85' : '45'}%</span>
                                </div>
                                <div className="h-1 bg-secondary/50 rounded-full overflow-hidden border border-border/5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${prj.priority === 'High' ? 85 : 45}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="h-full bg-linear-to-r from-zinc-100 to-white dark:from-white dark:to-zinc-100 rounded-full relative"
                                    >
                                        <div className="absolute inset-0 bg-white/20 blur-[2px]" />
                                    </motion.div>
                                </div>
                            </div>

                            {/* Footer Bento Grid */}
                            <div className="pt-5 border-t border-border/10 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex -space-x-2.5">
                                        {displayMembers.map((member: { email: string, name: string | null }, i: number) => (
                                            <div key={i} title={formatName(member.name, member.email)} className="w-7 h-7 rounded-lg border-2 border-background bg-secondary/80 text-[9px] font-black flex items-center justify-center text-muted-foreground shadow-sm group-hover:border-primary/10 transition-colors">
                                                {getInitials(member.name || member.email)}
                                            </div>
                                        ))}
                                        {remainingCount > 0 && (
                                            <div className="w-7 h-7 rounded-lg border-2 border-background bg-primary/10 text-[9px] font-black flex items-center justify-center text-primary shadow-sm group-hover:border-primary/10 transition-colors">
                                                +{remainingCount}
                                            </div>
                                        )}
                                        {totalMembers === 0 && (
                                            <div className="w-7 h-7 rounded-lg border-2 border-background bg-secondary/20 text-[9px] font-black flex items-center justify-center text-muted-foreground/40 shadow-sm transition-colors italic">
                                                0
                                            </div>
                                        )}
                                    </div>

                                    <div className="h-5 w-px bg-border/20" />

                                    <div className="flex items-center gap-2 text-muted-foreground px-2 py-1 rounded-md bg-secondary/30 border border-border/5">
                                        <Calendar size={11} className="text-primary/40" />
                                        <span className="text-[9px] font-black uppercase tracking-tight opacity-70">
                                            {prj.deadline ? new Date(prj.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Mar 28'}
                                        </span>
                                    </div>
                                </div>

                                <Link
                                    href={`/projects/${prj.id}`}
                                    className="px-3 py-2 bg-foreground/5 hover:bg-foreground text-foreground hover:text-background rounded-xl border border-border/50 hover:border-foreground transition-all duration-500 active:scale-95 shadow-xs flex items-center justify-center group/btn shrink-0"
                                >
                                    <ArrowRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform duration-300" />
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </Draggable>
    );
}
