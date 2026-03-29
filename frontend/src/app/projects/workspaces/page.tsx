"use client";

import React from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useSidebar } from '@/context/SidebarContext';
import { useRouter } from 'next/navigation';
import {
    Building2, Globe, Plus, Zap, ChevronRight,
    Shield, Users, Activity, Menu,
    ArrowUpRight, LayoutGrid, Search
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function AllWorkspacesPage() {
    const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspace();
    const { setIsMobileOpen } = useSidebar();
    const router = useRouter();

    const handleSwitchWorkspace = (ws: any) => {
        if (setActiveWorkspace) {
            setActiveWorkspace(ws);
            router.push('/projects');
        }
    };

    return (
        <div className="h-full bg-background flex flex-col overflow-hidden">
            {/* Header */}
            <header className="h-16 border-b border-border bg-background/80 backdrop-blur-xl px-6 flex items-center justify-between shrink-0 z-50 shadow-sm">
                <div className="flex items-center gap-6">
                    <button onClick={() => setIsMobileOpen(true)} className="lg:hidden text-muted-foreground hover:text-foreground transition-colors">
                        <Menu size={18} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center shadow-xs">
                            <Globe size={16} className="text-primary" />
                        </div>
                        <div className="flex items-center gap-2 text-sm font-black uppercase tracking-tight">
                            <span className="text-muted-foreground opacity-60">Network</span>
                            <ChevronRight size={14} className="text-border" />
                            <span className="text-foreground">Global Grid</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-secondary/50 border border-border rounded-full shadow-inner">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)] animate-pulse" />
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-80">Sync Active</span>
                    </div>
                    <ThemeToggle />
                </div>
            </header>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar w-full">
                <div className="p-6 md:p-8 space-y-12 max-w-7xl mx-auto">
                    {/* Stats Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-card/40 border border-border/50 rounded-2xl p-6 backdrop-blur-md shadow-sm">
                            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 opacity-50">Total Nodes</div>
                            <div className="text-3xl font-black text-foreground tracking-tighter">{workspaces.length}</div>
                        </div>
                        <div className="bg-card/40 border border-border/50 rounded-2xl p-6 backdrop-blur-md shadow-sm">
                            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 opacity-50">Active Uplink</div>
                            <div className="text-3xl font-black text-primary tracking-tighter">{activeWorkspace?.name || 'Null'}</div>
                        </div>
                        <div className="bg-card/40 border border-border/50 rounded-2xl p-6 backdrop-blur-md shadow-sm">
                            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 opacity-50">Network Status</div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                                <div className="text-3xl font-black text-foreground tracking-tighter">SECURE</div>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-border/50" />

                    {/* Workspace Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {workspaces.map((ws, idx) => (
                            <motion.div
                                key={ws.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={cn(
                                    "group relative bg-card/30 border rounded-2xl p-6 transition-all duration-500 hover:shadow-2xl hover:bg-card active:scale-[0.98]",
                                    activeWorkspace?.id === ws.id ? "border-primary shadow-lg shadow-primary/5" : "border-border/50 hover:border-primary/20"
                                )}
                            >
                                {activeWorkspace?.id === ws.id && (
                                    <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-full text-[8px] font-black text-primary uppercase tracking-widest">
                                        <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                                        Current
                                    </div>
                                )}

                                <div className="space-y-6">
                                    <div className="w-12 h-12 rounded-xl bg-secondary border border-border flex items-center justify-center text-xl font-black text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-inner group-hover:shadow-primary/20">
                                        {ws.name?.[0]?.toUpperCase() || "W"}
                                    </div>

                                    <div className="space-y-1">
                                        <h3 className="text-lg font-black text-foreground uppercase tracking-tight truncate">{ws.name}</h3>
                                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-40">Passkey: {ws.passKey || 'UNSECURED'}</p>
                                    </div>

                                    <p className="text-[11px] text-muted-foreground leading-relaxed font-bold uppercase tracking-tight opacity-70 group-hover:opacity-100 transition-opacity line-clamp-2 min-h-8">
                                        {ws.description || "Synchronized tactical environment for cross-workspace operations and mission logic."}
                                    </p>

                                    <div className="flex items-center justify-between pt-6 border-t border-border/50">
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Protocol</span>
                                                <span className="text-[10px] font-black text-foreground uppercase tracking-tight">{ws.role || 'Operative'}</span>
                                            </div>
                                            <div className="w-px h-6 bg-border/50" />
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Uplink</span>
                                                <span className="text-[10px] font-black text-foreground uppercase tracking-tight">Active</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleSwitchWorkspace(ws)}
                                            className="w-10 h-10 rounded-xl bg-foreground text-background flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg group-hover:shadow-primary/20"
                                        >
                                            <ArrowUpRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {/* Add New Node Placeholder */}
                        <div className="border-2 border-dashed border-border/50 rounded-2xl flex flex-col items-center justify-center p-8 text-center hover:border-primary/20 hover:bg-secondary/20 transition-all group cursor-pointer" onClick={() => router.push('/projects/join')}>
                            <div className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all shadow-sm">
                                <Plus size={24} />
                            </div>
                            <div className="mt-4 space-y-1">
                                <p className="text-xs font-black text-foreground uppercase tracking-widest">Connect New Node</p>
                                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight opacity-60">Expand network infrastructure</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
