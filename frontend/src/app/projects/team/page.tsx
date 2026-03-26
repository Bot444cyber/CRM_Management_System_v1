"use client";

import React, { useState, useEffect } from 'react';
import { Users, Mail, Shield, UserPlus, Search, Filter, Briefcase, Star, MoreVertical, X, RefreshCw, Box, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useSync } from '@/context/SyncContext';
import { apiFetch } from '@/lib/apiFetch';
import toast from 'react-hot-toast';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function GlobalTeamPage() {
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const { refreshSignal } = useSync();

    const VALID_WORKSPACE_ROLES = ["admin", "manager", "team_leader", "developer", "designer", "customer", "user", "member"];

    const fetchGlobalTeam = async () => {
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/team/global`);
            if (res.ok) {
                setMembers(await res.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGlobalTeam();
    }, [refreshSignal]);

    const handleUpdateRole = async (workspaceId: string, memberId: string, newRole: string) => {
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/workspaces/${workspaceId}/members/${memberId}`, {
                method: 'PATCH',
                body: JSON.stringify({ role: newRole })
            });
            if (res.ok) {
                toast.success('Role updated');
                fetchGlobalTeam();
            } else {
                const err = await res.json();
                toast.error(err.message || 'Update failed');
            }
        } catch (e) {
            toast.error('Network error');
        }
    };

    const handleRemoveMember = async (workspaceId: string, memberId: string) => {
        if (!confirm('Are you sure you want to remove this member from the workspace and all its projects?')) return;
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/workspaces/${workspaceId}/members/${memberId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                toast.success('Member removed');
                fetchGlobalTeam();
            } else {
                const err = await res.json();
                toast.error(err.message || 'Removal failed');
            }
        } catch (e) {
            toast.error('Network error');
        }
    };

    const uniqueWorkspaces = Array.from(new Map(members.map(m => [m.workspaceId, { id: m.workspaceId, name: m.workspaceName, passKey: m.passKey }])).values());

    const filteredMembers = members
        .filter(m => roleFilter === 'all' || m.role?.toLowerCase() === roleFilter.toLowerCase())
        .filter(m =>
            m.email.toLowerCase().includes(search.toLowerCase()) ||
            m.workspaceName?.toLowerCase().includes(search.toLowerCase())
        );

    if (loading) return (
        <div className="flex-1 flex flex-col items-center justify-center bg-background text-foreground">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-sm font-black uppercase tracking-widest animate-pulse opacity-40">Syncing Personnel Database...</p>
        </div>
    );

    return (
        <div className="bg-background/50 h-full overflow-y-auto custom-scrollbar flex flex-col">
            {/* Standardized Compact Header */}
            <header className="sticky top-0 z-50 bg-black/40 backdrop-blur-3xl border-b border-white/5 px-6 md:px-10 py-1 flex items-center justify-between gap-8 h-12">
                <div className="flex items-center gap-6 min-w-0">
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="w-6 h-6 bg-primary/10 rounded-md border border-primary/20 flex items-center justify-center">
                            <Users size={12} className="text-primary" />
                        </div>
                        <h1 className="text-xs font-black tracking-tight text-foreground uppercase italic truncate max-w-[200px]">
                            Global Team
                        </h1>
                    </div>

                    <div className="h-4 w-px bg-white/5" />

                    <div className="hidden md:flex items-center gap-6">
                        {[
                            { label: 'Personnel', count: members.length, color: 'text-primary' },
                            { label: 'Units', count: uniqueWorkspaces.length, color: 'text-muted-foreground' },
                        ].map((s) => (
                            <div key={s.label} className="flex items-center gap-2">
                                <span className={cn("text-[10px] font-black italic", s.color)}>{s.count}</span>
                                <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground/30">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <ThemeToggle />
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-10 py-8 space-y-12">
                {/* Recruitment HQ Section */}
                {uniqueWorkspaces.length > 0 && (
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 ml-1">
                            <UserPlus size={12} className="text-emerald-500" />
                            <h2 className="text-[10px] font-black tracking-tight uppercase italic opacity-40">Recruitment HQ</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {uniqueWorkspaces.map(ws => (
                                <div key={ws.id} className="bg-card/40 border border-white/5 rounded-xl p-4 relative overflow-hidden group/ws shadow-sm">
                                    <p className="text-[7px] font-black uppercase tracking-widest text-muted-foreground/40 mb-1 truncate">{ws.name}</p>
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-sm font-black tracking-[0.2em] font-mono text-emerald-500 truncate">{ws.passKey}</p>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(ws.passKey);
                                                toast.success('Copied');
                                            }}
                                            className="w-6 h-6 rounded-md bg-emerald-500/5 text-emerald-500 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                                        >
                                            <Box size={10} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/30 border border-white/5 p-4 rounded-xl">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="relative group/search w-full md:w-64">
                                <Search size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30" />
                                <input
                                    type="text"
                                    placeholder="AGENT SEARCH..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full bg-black/40 border border-white/5 rounded-lg pl-10 pr-4 py-2 text-[9px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-primary/20 transition-all italic shadow-inner"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Filter size={10} className="text-muted-foreground/40" />
                                <select
                                    value={roleFilter}
                                    onChange={e => setRoleFilter(e.target.value)}
                                    className="bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-[8px] font-black uppercase tracking-widest focus:ring-1 focus:ring-primary/20 transition-all outline-none min-w-[120px]"
                                >
                                    <option value="all">EVERY ROLE</option>
                                    <option value="owner">OWNER</option>
                                    {VALID_WORKSPACE_ROLES.map(r => (
                                        <option key={r} value={r}>{r.toUpperCase().replace('_', ' ')}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
                        <AnimatePresence mode='popLayout'>
                            {filteredMembers.map((m, idx) => (
                                <motion.div
                                    key={m.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: idx * 0.04 }}
                                    className="group h-full"
                                >
                                    <div className="h-full bg-card/40 border border-white/5 rounded-2xl p-4 flex flex-col transition-all duration-300 hover:border-primary/20 hover:bg-white/5 relative overflow-hidden group/card shadow-sm">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-10 h-10 bg-white/5 border border-white/5 text-foreground rounded-xl flex items-center justify-center text-xs font-black shrink-0">
                                                {m.email[0].toUpperCase()}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-xs font-black truncate group-hover/card:text-primary transition-colors tracking-tight uppercase italic">{m.email.split('@')[0]}</h3>
                                                <p className="text-[8px] font-medium text-muted-foreground/40 truncate uppercase tracking-widest">
                                                    {m.email}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest border flex items-center gap-1",
                                                    m.role?.toLowerCase() === 'owner' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                        m.role?.toLowerCase() === 'manager' ? 'bg-primary/10 text-primary border-primary/20' :
                                                            'bg-black/20 text-muted-foreground/40 border-white/5'
                                                )}>
                                                    <Shield size={8} /> {m.role}
                                                </div>
                                            </div>
                                            <div className="text-[7px] font-black uppercase tracking-widest text-muted-foreground/20 flex items-center gap-1.5 truncate">
                                                <Briefcase size={8} /> {m.workspaceName}
                                            </div>
                                        </div>

                                        {m.role !== 'owner' && (
                                            <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                                                <select
                                                    value={m.role}
                                                    onChange={(e) => handleUpdateRole(m.workspaceId, m.id, e.target.value)}
                                                    className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[7px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-primary/30 transition-all flex-1"
                                                >
                                                    {VALID_WORKSPACE_ROLES.map(r => (
                                                        <option key={r} value={r}>{r.toUpperCase().replace('_', ' ')}</option>
                                                    ))}
                                                </select>
                                                <button
                                                    onClick={() => handleRemoveMember(m.workspaceId, m.id)}
                                                    className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                                    title="Remove"
                                                >
                                                    <Trash2 size={10} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
