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
                    // Pre-select first available if none active
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
                toast.success('Organization Launched');
                await checkWorkspace();
            }
        } catch (e) {
            toast.error('Launch sequence failed');
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
                toast.success('Initiative Secured');
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
        <div className="bg-background/50 h-full overflow-y-auto custom-scrollbar flex flex-col">
            {/* Standardized Compact Header */}
            <header className="sticky top-0 z-50 bg-black/40 backdrop-blur-3xl border-b border-white/5 px-6 md:px-10 py-1 flex items-center justify-between gap-8 h-12">
                <div className="flex items-center gap-6 min-w-0">
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="w-6 h-6 bg-primary/10 rounded-md border border-primary/20 flex items-center justify-center">
                            <Plus size={12} className="text-primary" />
                        </div>
                        <h1 className="text-xs font-black tracking-tight text-foreground uppercase italic truncate max-w-[200px]">
                            Initialize Initiative
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        className="h-8 px-4 bg-white/5 text-muted-foreground text-[8px] font-black uppercase tracking-widest rounded-lg hover:bg-white/10 transition-all"
                        onClick={() => router.push('/projects')}
                    >
                        Abort
                    </button>
                    <ThemeToggle />
                </div>
            </header>

            <div className="max-w-3xl mx-auto px-6 md:px-10 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card/40 border border-white/5 rounded-2xl p-8 shadow-2xl relative overflow-hidden group"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <Terminal size={16} className="text-primary" />
                        <h2 className="text-xs font-black uppercase tracking-tight italic opacity-40">Project Initialization Protocol</h2>
                    </div>

                    {wsError === "MISSING_CONTEXT" ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertCircle size={32} />
                            </div>
                            <h3 className="text-lg font-black uppercase mb-2">No Active Organization</h3>
                            <p className="text-xs text-muted-foreground mb-8">You must be part of an organization to initialize projects.</p>
                            <form onSubmit={handleCreateWorkspace} className="max-w-xs mx-auto space-y-4">
                                <input
                                    type="text"
                                    placeholder="Organization Name..."
                                    value={newWsName}
                                    onChange={e => setNewWsName(e.target.value)}
                                    className="w-full bg-black/40 border border-white/5 rounded-lg px-4 py-3 text-xs font-black uppercase shadow-inner outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={creatingWs}
                                    className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-black uppercase text-[10px] hover:scale-105 transition-all shadow-lg shadow-primary/20"
                                >
                                    {creatingWs ? 'Launching...' : 'Launch Organization'}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 ml-1">Initiative Name</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="E.G. PROJECT OMEGA"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-black/40 border border-white/5 rounded-lg px-4 py-3 text-xs font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-primary/20 transition-all shadow-inner"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 ml-1">Strategy Brief</label>
                                        <textarea
                                            rows={4}
                                            placeholder="DEFINE OBJECTIVES..."
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full bg-black/40 border border-white/5 rounded-lg px-4 py-3 text-xs font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-primary/20 transition-all shadow-inner resize-none h-32"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 ml-1">Operation Status</label>
                                        <select
                                            defaultValue={"Active"}
                                            className="w-full bg-black/40 border border-white/5 rounded-lg px-4 py-3 text-xs font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-primary/20 transition-all shadow-inner"
                                        >
                                            <option value="Active">ACTIVE</option>
                                            <option value="On Hold">ON HOLD</option>
                                            <option value="Completed">COMPLETED</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 ml-1">Health Metric</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {['Green', 'Yellow', 'Red'].map(h => (
                                                <button
                                                    key={h}
                                                    type="button"
                                                    className={cn(
                                                        "py-3 rounded-lg border text-[8px] font-black uppercase tracking-widest transition-all",
                                                        'bg-black/20 border-white/5 text-muted-foreground/30 hover:border-white/10'
                                                    )}
                                                >
                                                    {h}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 ml-1">Completion Deadline</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.deadline}
                                            onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                                            className="w-full bg-black/40 border border-white/5 rounded-lg px-4 py-3 text-xs font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-primary/20 transition-all shadow-inner [color-scheme:dark]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {submitError && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-start gap-4 p-6 bg-rose-500/10 border border-rose-500/20 rounded-[2rem]"
                                >
                                    <AlertCircle size={20} className="text-rose-500 shrink-0 mt-0.5" />
                                    <p className="text-sm font-black text-rose-500">{submitError}</p>
                                </motion.div>
                            )}

                            <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                                <div className="hidden md:flex items-center gap-3 text-muted-foreground/20">
                                    <ShieldCheck size={14} />
                                    <span className="text-[7px] font-black uppercase tracking-widest">Secure Initialization Protocol v4.0</span>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full md:w-auto bg-primary text-primary-foreground h-11 px-10 rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            DEPLOYING...
                                        </>
                                    ) : (
                                        <>
                                            <Zap size={16} />
                                            DEPLOY INITIATIVE
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
