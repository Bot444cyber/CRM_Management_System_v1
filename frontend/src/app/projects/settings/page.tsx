"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Settings, Shield, Globe, Trash2, Save, Fingerprint, Box, Cpu, HardDrive } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { useSync } from '@/context/SyncContext';
import { apiFetch } from '@/lib/apiFetch';
import toast from 'react-hot-toast';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useRouter } from 'next/navigation';

export default function GlobalSettingsPage() {
    const [workspace, setWorkspace] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [saving, setSaving] = useState(false);
    const { triggerRefresh } = useSync();
    const router = useRouter();

    const fetchWorkspace = async () => {
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/workspaces`);
            const data = await res.json();
            if (data?.length > 0) {
                setWorkspace(data[0]);
                setName(data[0].name);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkspace();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/workspaces/${workspace.id}`, {
                method: 'PUT',
                body: JSON.stringify({ name })
            });
            if (res.ok) {
                toast.success('HQ Parameters Locked');
                triggerRefresh();
                fetchWorkspace();
            }
        } catch (e) {
            toast.error('Sync failed with mainframe');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex-1 flex flex-col items-center justify-center bg-background">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-sm font-black uppercase tracking-widest animate-pulse opacity-40">Accessing HQ Secure Storage...</p>
        </div>
    );

    if (!workspace) return (
        <div className="flex-1 flex flex-col items-center justify-center bg-background p-10 text-center">
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mb-8 border border-primary/20">
                <Shield size={40} />
            </div>
            <h2 className="text-3xl font-black mb-4">No Workspace Found</h2>
            <p className="text-muted-foreground max-w-md mb-10 font-medium leading-relaxed uppercase tracking-widest text-xs">You must initialize your organization before accessing HQ parameters.</p>
            <Link href="/projects" className="bg-primary text-primary-foreground px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-2xl">
                Go to Mission Control
            </Link>
        </div>
    );

    return (
        <div className="bg-background/50 h-full overflow-y-auto custom-scrollbar flex flex-col">
            {/* Standardized Compact Header */}
            <header className="sticky top-0 z-50 bg-black/40 backdrop-blur-3xl border-b border-white/5 px-6 md:px-10 py-1 flex items-center justify-between gap-8 h-12">
                <div className="flex items-center gap-6 min-w-0">
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="w-6 h-6 bg-primary/10 rounded-md border border-primary/20 flex items-center justify-center">
                            <Settings size={12} className="text-primary" />
                        </div>
                        <h1 className="text-xs font-black tracking-tight text-foreground uppercase italic truncate max-w-[200px]">
                            HQ Settings
                        </h1>
                    </div>

                    <div className="h-4 w-px bg-white/5" />

                    <div className="hidden md:flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black italic text-primary">{workspace.name}</span>
                            <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground/30">Organization</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        className="h-8 px-4 bg-primary text-primary-foreground text-[8px] font-black uppercase tracking-widest rounded-lg hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                        onClick={() => router.push('/projects')}
                    >
                        View Projects
                    </button>
                    <ThemeToggle />
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 md:px-10 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <section className="bg-card/40 border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                            <div className="flex items-center gap-3 mb-6">
                                <Fingerprint size={16} className="text-primary" />
                                <h2 className="text-xs font-black uppercase tracking-tight italic opacity-40">Identity Parameters</h2>
                            </div>

                            <form onSubmit={handleSave} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 ml-1">Official Designation</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="w-full bg-black/40 border border-white/5 rounded-lg px-4 py-2.5 text-[11px] font-black focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 ml-1">Primary Domain</label>
                                        <div className="bg-black/40 border border-white/5 rounded-lg px-4 py-2 flex items-center gap-2 text-[9px] font-bold opacity-40 truncate">
                                            <Globe size={10} /> nexus.cybernetics.io
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 ml-1">Security ID</label>
                                        <div className="bg-black/40 border border-white/5 rounded-lg px-4 py-2 flex items-center gap-2 text-[9px] font-bold opacity-40 truncate">
                                            <Shield size={10} /> {workspace.id.substring(0, 8)}...
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/5">
                                    <button
                                        type="submit"
                                        disabled={saving || !name}
                                        className="bg-primary text-primary-foreground h-9 px-6 rounded-lg font-black uppercase tracking-widest text-[9px] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                                    >
                                        <Save size={12} /> {saving ? 'LOCKING...' : 'LOCK PARAMETERS'}
                                    </button>
                                </div>
                            </form>
                        </section>

                        <section className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-6 shadow-xl group">
                            <h2 className="text-[10px] font-black mb-1 text-rose-500 flex items-center gap-2 uppercase italic">
                                Danger Zone
                            </h2>
                            <p className="text-[8px] text-muted-foreground/40 mb-6 font-black uppercase tracking-widest">Action is terminal.</p>
                            <button className="bg-rose-500/10 text-rose-500 border border-rose-500/20 h-9 px-6 rounded-lg font-black uppercase tracking-widest text-[9px] hover:bg-rose-500 hover:text-white transition-all">Self-Destruct</button>
                        </section>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-card/40 border border-white/5 rounded-2xl p-6 shadow-lg overflow-hidden relative group">
                            <h3 className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/20 mb-6 pb-2 border-b border-white/5 italic">System Resources</h3>
                            <div className="space-y-4">
                                {[
                                    { label: 'CALC', value: 'High', icon: Cpu },
                                    { label: 'DISK', value: 'Optimized', icon: HardDrive },
                                    { label: 'NODE', value: '0.12ms', icon: Globe },
                                    { label: 'CORE', value: 'Nominal', icon: Box },
                                ].map(res => (
                                    <div key={res.label} className="flex items-center justify-between group/res">
                                        <div className="flex items-center gap-2">
                                            <res.icon size={10} className="text-muted-foreground/20 group-hover/res:text-primary transition-all" />
                                            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">{res.label}</span>
                                        </div>
                                        <span className="text-[10px] font-black tracking-tighter italic">{res.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl flex items-center gap-4">
                            <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                                <Settings size={18} />
                            </div>
                            <div>
                                <h3 className="text-[10px] font-black tracking-widest uppercase italic">Nexus Support</h3>
                                <p className="text-[7px] font-black text-muted-foreground/40 uppercase tracking-widest">Connect for overrides.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
