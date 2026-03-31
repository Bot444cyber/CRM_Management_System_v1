"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Briefcase, Calendar, AlertCircle, Loader2, Zap, Target, TrendingUp, Plus, Terminal, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { useSync } from '@/context/SyncContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/apiFetch';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useSidebar } from '@/context/SidebarContext';
import { Menu } from 'lucide-react';

export default function NewProjectPage() {
    const router = useRouter();
    const { triggerRefresh } = useSync();
    const [loading, setLoading] = useState(false);
    const [wsLoading, setWsLoading] = useState(true);
    const [wsError, setWsError] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [workspaceId, setWorkspaceId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        deadline: ''
    });
    const [newWsName, setNewWsName] = useState('');
    const [creatingWs, setCreatingWs] = useState(false);

    const { activeWorkspace, setActiveWorkspace } = useWorkspace();
    const { setIsMobileOpen } = useSidebar();

    useEffect(() => {
        if (activeWorkspace) {
            setWorkspaceId(activeWorkspace.id);
            setWsLoading(false);
        } else {
            checkWorkspace();
        }
    }, [activeWorkspace]);

    const checkWorkspace = async () => {
        setWsLoading(true);
        setWsError(null);
        try {
            const wsRes = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/workspaces`);
            if (wsRes.ok) {
                const wsData = await wsRes.json();
                if (wsData && wsData.length > 0) {
                    setWorkspaceId(wsData[0].id);
                    setActiveWorkspace(wsData[0]);
                } else {
                    setWsError("MISSING_CONTEXT");
                }
            } else {
                setWsError("Unauthorized access to workspace layer.");
            }
        } catch (e: any) {
            setWsError(e.message ?? 'Could not verify organization status.');
        } finally {
            setWsLoading(false);
        }
    };

    const handleCreateWorkspace = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newWsName.trim()) return;
        setCreatingWs(true);
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/workspaces`, {
                method: 'POST',
                body: JSON.stringify({ name: newWsName })
            });
            if (res.ok) {
                toast.success('Workspace Created');
                await checkWorkspace();
            }
        } catch (e) {
            toast.error('Creation failed');
        } finally {
            setCreatingWs(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!workspaceId) return;

        setLoading(true);
        setSubmitError(null);

        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms`, {
                method: 'POST',
                body: JSON.stringify({ ...formData, workspaceId }),
            });

            if (res.ok) {
                const data = await res.json();
                toast.success('Project Created');
                triggerRefresh();
                router.push(`/projects/${data.id}`);
            } else {
                const errData = await res.json().catch(() => ({}));
                const msg = errData.error || errData.message || `Server Error ${res.status}`;
                setSubmitError(msg);
                toast.error(msg);
                setLoading(false);
            }
        } catch (error: any) {
            setSubmitError(error.message ?? 'Network disruption detected.');
            toast.error('Sync failed');
            setLoading(false);
        }
    };

    return (
        <div className="bg-background h-full overflow-hidden flex flex-col">
            {/* Standardized Header */}
            <header className="h-16 border-b border-border bg-card/80 backdrop-blur-xl px-6 flex items-center justify-between shrink-0 z-50 shadow-sm">
                <div className="flex items-center gap-6">
                    <button onClick={() => setIsMobileOpen(true)} className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground transition-all shrink-0">
                        <Menu size={18} />
                    </button>
                    <div className="flex items-center gap-4 shrink-0">
                        <div className="w-9 h-9 bg-secondary border border-border rounded-xl flex items-center justify-center shadow-xs">
                            <Plus size={16} className="text-primary" />
                        </div>
                        <h1 className="text-sm font-black tracking-tight text-foreground uppercase leading-none">
                            Create Project
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        className="h-9 px-6 bg-secondary text-muted-foreground text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-destructive hover:text-white border border-border transition-all shadow-xs"
                        onClick={() => router.push('/projects')}
                    >
                        Cancel
                    </button>
                    <ThemeToggle />
                </div>
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center p-6 md:p-12 relative">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-size-[40px_40px] pointer-events-none" />

                <div className="max-w-4xl w-full z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-card border border-border/50 rounded-[2.5rem] p-10 md:p-12 shadow-2xl relative overflow-hidden group backdrop-blur-md"
                    >
                        <div className="flex items-center gap-3 mb-10">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <Terminal size={18} />
                            </div>
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40">Project Creation</h2>
                        </div>

                        {wsError === "MISSING_CONTEXT" ? (
                            <div className="text-center py-16 space-y-10">
                                <div className="space-y-4">
                                    <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-destructive/10 border border-destructive/20 animate-pulse">
                                        <AlertCircle size={40} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tight text-foreground">No Active Workspace</h3>
                                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-60">You need a workspace to create projects.</p>
                                    </div>
                                </div>
                                <form onSubmit={handleCreateWorkspace} className="max-w-xs mx-auto space-y-6">
                                    <div className="space-y-2 text-left">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40 ml-4">Workspace Name</label>
                                        <input
                                            type="text"
                                            placeholder="ORGANIZATION NAME..."
                                            value={newWsName}
                                            onChange={e => setNewWsName(e.target.value)}
                                            className="w-full bg-secondary/50 border border-border/50 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest shadow-inner outline-none focus:ring-4 focus:ring-primary/5 transition-all text-center"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={creatingWs}
                                        className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:scale-105 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
                                    >
                                        {creatingWs ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                                        {creatingWs ? 'CREATING...' : 'CREATE WORKSPACE'}
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-12">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-10">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-4">Project Name</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="E.G. PROJECT OMEGA"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-secondary/50 border border-border/50 rounded-2xl px-6 py-5 text-sm font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50 transition-all shadow-inner"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-4">Description</label>
                                            <textarea
                                                rows={5}
                                                placeholder="Describe the project..."
                                                value={formData.description}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                className="w-full bg-secondary/50 border border-border/50 rounded-2xl px-6 py-5 text-sm font-bold uppercase outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50 transition-all shadow-inner resize-none h-48 leading-relaxed"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-10">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-4">Status</label>
                                            <div className="relative">
                                                <select
                                                    defaultValue={"Active"}
                                                    className="w-full bg-secondary/50 border border-border/50 rounded-2xl px-6 py-5 text-sm font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50 transition-all shadow-inner appearance-none cursor-pointer"
                                                >
                                                    <option value="Active">ACTIVE</option>
                                                    <option value="On Hold">ON HOLD</option>
                                                    <option value="Completed">COMPLETED</option>
                                                </select>
                                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/30">
                                                    <TrendingUp size={16} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-4">Priority</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {['Low', 'Med', 'High'].map(h => (
                                                    <button
                                                        key={h}
                                                        type="button"
                                                        className={cn(
                                                            "py-4 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all",
                                                            'bg-secondary/30 border-border/50 text-muted-foreground/40 hover:border-primary/30 hover:text-primary'
                                                        )}
                                                    >
                                                        {h}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-4">Deadline</label>
                                            <div className="relative">
                                                <input
                                                    type="date"
                                                    required
                                                    value={formData.deadline}
                                                    onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                                                    className="w-full bg-secondary/50 border border-border/50 rounded-2xl px-6 py-5 text-sm font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50 transition-all shadow-inner cursor-pointer"
                                                />
                                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/30">
                                                    <Calendar size={16} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {submitError && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-start gap-4 p-6 bg-destructive/5 border border-destructive/20 rounded-[2rem] shadow-sm"
                                    >
                                        <AlertCircle size={20} className="text-destructive shrink-0 mt-0.5" />
                                        <p className="text-xs font-black text-destructive uppercase tracking-widest leading-relaxed">{submitError}</p>
                                    </motion.div>
                                )}

                                <div className="pt-12 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-8">
                                    <div className="flex items-center gap-4 text-muted-foreground/20">
                                        <div className="p-2 bg-secondary rounded-lg">
                                            <ShieldCheck size={18} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black uppercase tracking-[0.3em]">Project System</span>
                                            <span className="text-[7px] font-bold opacity-60 uppercase">AntiGravity Command Protocol v4.0</span>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full md:w-auto bg-primary text-primary-foreground h-16 px-12 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-primary/20 flex items-center justify-center gap-4 group/btn disabled:opacity-50"
                                    >
                                        {loading ? "CREATING..." : "CREATE PROJECT"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
