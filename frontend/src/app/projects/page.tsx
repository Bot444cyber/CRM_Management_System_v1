"use client";

import { useSync } from '@/context/SyncContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/apiFetch';
import {
    Zap, Loader2, Briefcase, Plus, Users, TrendingUp, AlertTriangle,
    CheckCircle2, Search, Filter, SortAsc, ChevronRight, Calendar, Clock,
    Hash, Eye, EyeOff, Copy, ShieldCheck, ArrowRight, Building2, Globe, ArrowLeft, Home,
    MoreHorizontal, GripVertical
} from 'lucide-react';

import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, JSX, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

const HEALTH_CONFIG: Record<string, { label: string; icon: JSX.Element; cls: string; color: string }> = {
    Green: { label: 'On Track', icon: <CheckCircle2 size={10} />, cls: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', color: '#10b981' },
    Yellow: { label: 'At Risk', icon: <Clock size={10} />, cls: 'bg-amber-500/10 text-amber-500 border-amber-500/20', color: '#f59e0b' },
    Red: { label: 'Critical', icon: <AlertTriangle size={10} />, cls: 'bg-rose-500/10 text-rose-500 border-rose-500/20', color: '#ef4444' },
};

const KANBAN_COLUMNS = [
    { id: 'Planning', title: 'Idea & Backlog', icon: <Hash size={14} />, color: 'text-blue-400' },
    { id: 'Active', title: 'In Progress', icon: <TrendingUp size={14} />, color: 'text-emerald-400' },
    { id: 'Completed', title: 'Completed', icon: <CheckCircle2 size={14} />, color: 'text-purple-400' },
    { id: 'Archived', title: 'Archived', icon: <Briefcase size={14} />, color: 'text-muted-foreground' },
];

export default function ProjectsPortfolioPage() {
    const { activeWorkspace, workspaces, setWorkspaces, setActiveWorkspace, refreshWorkspaces, loading: wsLoading, workspaceRole } = useWorkspace();
    const canCreate = workspaceRole === 'owner' || workspaceRole === 'admin';
    const canManage = workspaceRole === 'owner' || workspaceRole === 'manager' || workspaceRole === 'admin';

    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [creatingOrg, setCreatingOrg] = useState(false);
    const [joiningOrg, setJoiningOrg] = useState(false);
    const [wsMembers, setWsMembers] = useState<any[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(false);

    const [orgName, setOrgName] = useState('');
    const [orgDesc, setOrgDesc] = useState('');
    const [joinKey, setJoinKey] = useState('');

    const router = useRouter();
    const { refreshSignal } = useSync();

    useEffect(() => {
        if (activeWorkspace) {
            fetchProjects(activeWorkspace.id);
            fetchWorkspaceMembers(activeWorkspace.id);
        }
    }, [activeWorkspace, refreshSignal]);

    const fetchProjects = async (wsId: string) => {
        setLoading(true);
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/workspaces/${wsId}`);
            setProjects(res.ok ? await res.json() : []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchWorkspaceMembers = async (wsId: string) => {
        setLoadingMembers(true);
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/workspaces/${wsId}/members`);
            setWsMembers(res.ok ? await res.json() : []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingMembers(false);
        }
    };

    const handleDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        // Optimistic update
        const prjId = draggableId;
        const newStatus = destination.droppableId;

        const updatedProjects = projects.map(p =>
            p.id === prjId ? { ...p, status: newStatus } : p
        );
        setProjects(updatedProjects);

        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/${prjId}`, {
                method: 'PATCH',
                body: JSON.stringify({ status: newStatus })
            });
            if (!res.ok) {
                // Revert on failure
                fetchProjects(activeWorkspace!.id);
            }
        } catch (e) {
            console.error(e);
            fetchProjects(activeWorkspace!.id);
        }
    };

    const columnsData = useMemo(() => {
        const data: Record<string, any[]> = {
            Planning: [], Active: [], Completed: [], Archived: []
        };
        projects.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .forEach(p => {
                if (data[p.status]) data[p.status].push(p);
                else data['Planning'].push(p); // Fallback
            });
        return data;
    }, [projects, searchQuery]);

    const handleCreateOrg = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = orgName.trim();
        if (!trimmedName) return;

        setCreatingOrg(true);
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/workspaces`, {
                method: 'POST',
                body: JSON.stringify({ name: trimmedName, description: orgDesc })
            });
            if (res.ok) {
                await refreshWorkspaces();
                setOrgName(''); setOrgDesc('');
            }
        } catch (e) { console.error(e); }
        finally { setCreatingOrg(false); }
    };

    const handleJoinOrg = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!joinKey.trim()) return;
        setJoiningOrg(true);
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/workspaces/join`, {
                method: 'POST',
                body: JSON.stringify({ passKey: joinKey })
            });
            if (res.ok) await refreshWorkspaces();
            else {
                const data = await res.json();
                alert(data.message || "Failed to join workspace");
            }
        } catch (e) { console.error(e); }
        finally { setJoiningOrg(false); }
    };

    if (wsLoading || creatingOrg || joiningOrg) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-black/90 backdrop-blur-3xl fixed inset-0 z-[100]">
                <div className="text-center space-y-6">
                    <div className="relative w-24 h-24 mx-auto">
                        <div className="absolute inset-0 border-4 border-primary/10 rounded-2xl rotate-45" />
                        <div className="absolute inset-0 border-t-4 border-primary rounded-2xl rotate-45 animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center text-primary"><Zap size={32} className="animate-pulse" /></div>
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-sm font-black tracking-[0.3em] uppercase opacity-40 italic">Syncing Matrix...</h2>
                    </div>
                </div>
            </div>
        );
    }

    if (workspaces.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-background p-6 h-full">
                <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Simplified Creation Card */}
                    <div className="bg-card/40 border border-white/5 rounded-[2rem] p-10">
                        <Plus size={32} className="text-primary mb-6" />
                        <h2 className="text-xl font-black mb-2 uppercase italic">Initialize Node</h2>
                        <form onSubmit={handleCreateOrg} className="space-y-4 pt-6">
                            <input
                                placeholder="WORKSPACE IDENTIFIER"
                                className="w-full bg-black/40 border border-white/5 rounded-xl px-5 py-3 text-[10px] font-black uppercase outline-none focus:ring-1 focus:ring-primary/20"
                                value={orgName} onChange={e => setOrgName(e.target.value)} required
                            />
                            <button type="submit" className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-black text-[9px] uppercase tracking-widest hover:opacity-90">
                                Deploy Workspace
                            </button>
                        </form>
                    </div>
                    {/* Simplified Join Card */}
                    <div className="bg-card/20 border border-white/5 rounded-[2rem] p-10 flex flex-col">
                        <Hash size={32} className="text-blue-400 mb-6" />
                        <h2 className="text-xl font-black mb-2 uppercase italic">Join Network</h2>
                        <form onSubmit={handleJoinOrg} className="space-y-4 pt-6">
                            <input
                                placeholder="ENTER ACCESS CODE"
                                className="w-full bg-black/40 border border-white/5 rounded-xl px-5 py-3 text-[10px] font-black uppercase tracking-[0.5em] text-center outline-none"
                                value={joinKey} onChange={e => setJoinKey(e.target.value)}
                            />
                            <button type="submit" className="w-full bg-white/5 border border-white/5 py-3.5 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-white/10">
                                Establish Link
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    if (!activeWorkspace) {
        return (
            <div className="flex-1 flex flex-row items-center justify-center bg-background p-8 min-h-screen gap-8 flex-wrap">
                {workspaces.map(ws => (
                    <button key={ws.id} onClick={() => setActiveWorkspace(ws)} className="w-[300px] bg-card/40 border border-white/5 rounded-2xl p-8 hover:border-primary/40 transition-all text-left group">
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary"><Building2 size={20} /></div>
                            <ArrowRight size={16} className="text-primary opacity-0 group-hover:opacity-100 transition-all" />
                        </div>
                        <h3 className="text-sm font-black uppercase italic tracking-wider mb-2">{ws.name}</h3>
                        <p className="text-[9px] text-muted-foreground/40 font-bold uppercase tracking-widest line-clamp-2">{ws.description || "Active Command Node"}</p>
                    </button>
                ))}
            </div>
        );
    }

    const activeWs = activeWorkspace;

    return (
        <div className="min-h-screen bg-background/50 selection:bg-primary/20 flex flex-col">
            {/* Pro-Style Header */}
            <header className="h-12 sticky top-0 z-[100] bg-black/40 backdrop-blur-3xl border-b border-white/5 px-6 md:px-10 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 italic">Project</span>
                        <ChevronRight size={10} className="text-muted-foreground/20" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 italic">Dashboard</span>
                        <ChevronRight size={10} className="text-muted-foreground/20" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground italic">Project Board</span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="relative group overflow-hidden h-7 w-48 md:w-64 flex items-center">
                        <Search size={12} className="absolute left-3 text-muted-foreground/40" />
                        <input
                            placeholder="SEARCH SOMETHING..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full h-full bg-white/5 border border-white/5 rounded-md pl-9 pr-4 text-[9px] font-black uppercase tracking-widest outline-none focus:bg-white/10 transition-all placeholder:text-muted-foreground/20"
                        />
                    </div>
                    {/* Avatar Group Placeholder */}
                    <div className="hidden lg:flex items-center -space-x-2">
                        {wsMembers.slice(0, 4).map((m, i) => (
                            <div key={m.id} className="w-6 h-6 rounded-full border-2 border-background bg-accent text-[8px] font-black flex items-center justify-center uppercase" title={m.userName}>
                                {m.userName?.charAt(0)}
                            </div>
                        ))}
                        {wsMembers.length > 4 && (
                            <div className="w-6 h-6 rounded-full border-2 border-background bg-card text-[8px] font-black flex items-center justify-center text-muted-foreground">
                                +{wsMembers.length - 4}
                            </div>
                        )}
                        <button className="w-6 h-6 rounded-full border-2 border-background border-dashed flex items-center justify-center text-muted-foreground hover:bg-white/5 transition-all ml-2">
                            <Plus size={10} />
                        </button>
                    </div>
                    <ThemeToggle />
                </div>
            </header>

            {/* Kanban Board - Single Scroll Parent */}
            <main className="flex-1 overflow-auto custom-scrollbar p-6 md:p-8">
                <DragDropContext onDragEnd={handleDragEnd}>
                    <div className="flex gap-6 h-full min-w-max pb-32">
                        {KANBAN_COLUMNS.map(col => (
                            <div key={col.id} className="w-72 md:w-80 shrink-0 flex flex-col gap-6">
                                {/* Column Header */}
                                <div className="flex items-center justify-between px-3 sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-xl py-4 border-b border-zinc-800/50 mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-1.5 h-1.5 rounded-full", col.color.replace('text-', 'bg-'))} />
                                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] italic text-foreground">
                                            {col.title}
                                            <span className="ml-2 text-muted-foreground/30 font-bold tracking-tight">
                                                {columnsData[col.id]?.length || 0}
                                            </span>
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button className="p-1.5 text-muted-foreground/30 hover:text-foreground transition-all">
                                            <Plus size={14} />
                                        </button>
                                        <button className="p-1.5 text-muted-foreground/30 hover:text-foreground transition-all">
                                            <MoreHorizontal size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Column Droppable Area */}
                                <Droppable droppableId={col.id} ignoreContainerClipping={true}>
                                    {(provided, snapshot) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className={cn(
                                                "flex-1 rounded-2xl transition-all duration-300 min-h-[150px] space-y-4 pb-4 overflow-visible",
                                                snapshot.isDraggingOver && "bg-primary/[0.02]"
                                            )}
                                        >
                                            {columnsData[col.id]?.map((prj, index) => {
                                                const hCfg = HEALTH_CONFIG[prj.health as keyof typeof HEALTH_CONFIG] || HEALTH_CONFIG.Green;
                                                return (
                                                    <Draggable
                                                        key={prj.id}
                                                        draggableId={prj.id}
                                                        index={index}
                                                        isDragDisabled={!canManage}
                                                    >
                                                        {(provided, snapshot) => {
                                                            const cardContent = (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    className={cn(
                                                                        "group relative bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 hover:bg-zinc-900/60 hover:border-zinc-700 transition-all duration-500",
                                                                        snapshot.isDragging && "shadow-[0_40px_80px_rgba(0,0,0,0.8)] scale-[1.05] border-zinc-600 bg-zinc-800/80 rotate-2 z-[1000] ring-1 ring-zinc-500/20",
                                                                        !snapshot.isDragging && "hover:translate-y-[-4px]"
                                                                    )}
                                                                >
                                                                    {/* Card Label */}
                                                                    <div className="flex items-center gap-2 mb-4">
                                                                        <div className={cn("px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border flex items-center gap-1.5", hCfg.cls)}>
                                                                            <div className="w-1 h-1 rounded-full animate-pulse" style={{ backgroundColor: hCfg.color }} />
                                                                            {hCfg.label}
                                                                        </div>
                                                                    </div>

                                                                    <Link href={`/projects/${prj.id}`} className="block">
                                                                        <h4 className="text-sm md:text-base font-black uppercase italic tracking-tight mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                                                                            {prj.name}
                                                                        </h4>
                                                                        <div className="space-y-4">
                                                                            {/* Progress Pattern */}
                                                                            <div className="space-y-2">
                                                                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 italic">
                                                                                    <span>Operational Sync</span>
                                                                                    <span className="text-primary">{prj.priority === 'High' ? '80%' : '40%'}</span>
                                                                                </div>
                                                                                <div className="flex gap-1 h-[2px]">
                                                                                    {[...Array(10)].map((_, i) => (
                                                                                        <div
                                                                                            key={i}
                                                                                            className={cn(
                                                                                                "flex-1 rounded-full transition-all duration-700",
                                                                                                i < (prj.priority === 'High' ? 8 : 4) ? "bg-primary" : "bg-white/5"
                                                                                            )}
                                                                                            style={{ transitionDelay: `${i * 50}ms` }}
                                                                                        />
                                                                                    ))}
                                                                                </div>
                                                                            </div>

                                                                            <div className="flex items-center justify-between pt-5 border-t border-zinc-800/50">
                                                                                {/* Member Avatars Stack */}
                                                                                <div className="flex -space-x-1.5">
                                                                                    {[...Array(3)].map((_, i) => (
                                                                                        <div key={i} className="w-5 h-5 rounded-full border border-background bg-accent text-[7px] font-black flex items-center justify-center uppercase">
                                                                                            {String.fromCharCode(65 + (i + prj.name.length) % 26)}
                                                                                        </div>
                                                                                    ))}
                                                                                </div>

                                                                                <div className="flex items-center gap-2 text-muted-foreground/40">
                                                                                    <Calendar size={12} />
                                                                                    <span className="text-[10px] font-black uppercase tracking-widest">
                                                                                        {prj.deadline ? new Date(prj.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Open'}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </Link>
                                                                </div>
                                                            );

                                                            if (snapshot.isDragging) {
                                                                return createPortal(cardContent, document.body);
                                                            }
                                                            return cardContent;
                                                        }}
                                                    </Draggable>
                                                );
                                            })}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        ))}
                    </div>
                </DragDropContext>

                {/* Vertical Scroll Stopper */}
                <div className="w-10 shrink-0" />
            </main>

            {/* Floating Action Menu from image */}
            <div className="fixed bottom-10 right-10 flex flex-col items-end gap-4 z-[500]">
                {canCreate && (
                    <button
                        onClick={() => router.push('/projects/new')}
                        className="h-12 pl-6 pr-8 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-3 shadow-[0_20px_50px_rgba(var(--primary),0.3)] hover:scale-105 active:scale-95 transition-all group"
                    >
                        <Plus size={16} />
                        Add New Project
                        <kbd className="ml-2 px-1.5 py-0.5 rounded bg-black/20 text-[8px] opacity-40 group-hover:opacity-100">N</kbd>
                    </button>
                )}
                {/* Visual Circle Toggle from image */}
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 backdrop-blur-3xl flex items-center justify-center hover:bg-white/10 cursor-pointer shadow-2xl">
                    <TrendingUp size={16} className="text-white/40" />
                </div>
            </div>
        </div>
    );
}

