"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    Users, Mail, Shield, UserPlus, Search, Filter, Briefcase,
    MoreVertical, X, Trash2, Menu, Building2, Copy, Check,
    ChevronDown, User, ShieldCheck, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSync } from '@/context/SyncContext';
import { useSidebar } from '@/context/SidebarContext';
import { apiFetch } from '@/lib/apiFetch';
import toast from 'react-hot-toast';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useWorkspace } from '@/context/WorkspaceContext';

// Standardized Roles for Team Management
const VALID_WORKSPACE_ROLES = ["admin", "manager", "team_leader", "developer", "designer", "member"];

// Role specific styling
const ROLE_THEMES: Record<string, { bg: string, text: string, border: string, icon: any }> = {
    'owner': { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20', icon: ShieldCheck },
    'admin': { bg: 'bg-zinc-800/10', text: 'text-zinc-800 dark:text-zinc-200', border: 'border-zinc-800/20', icon: ShieldCheck },
    'manager': { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20', icon: Zap },
    'developer': { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20', icon: User },
    'designer': { bg: 'bg-pink-500/10', text: 'text-pink-500', border: 'border-pink-500/20', icon: User },
    'member': { bg: 'bg-muted-foreground/10', text: 'text-muted-foreground', border: 'border-muted-foreground/20', icon: User },
};

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

export default function GlobalTeamPage() {
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const { refreshSignal } = useSync();
    const { setIsMobileOpen } = useSidebar();
    const { activeWorkspace, workspaces, setActiveWorkspace } = useWorkspace();

    const fetchGlobalTeam = async () => {
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/team/global`);
            if (res.ok) {
                const data = await res.json();
                setMembers(data);
            }
        } catch (e) {
            console.error("Failed to fetch team:", e);
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
                toast.success('Role updated successfully');
                fetchGlobalTeam();
            } else {
                const err = await res.json();
                toast.error(err.message || 'Failed to update role');
            }
        } catch (e) {
            toast.error('Network error. Please try again.');
        }
    };

    const handleRemoveMember = async (workspaceId: string, memberId: string) => {
        if (!confirm('Are you sure you want to remove this member? This action is irreversible.')) return;
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/workspaces/${workspaceId}/members/${memberId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                toast.success('Member removed from workspace');
                fetchGlobalTeam();
            } else {
                const err = await res.json();
                toast.error(err.message || 'Failed to remove member');
            }
        } catch (e) {
            toast.error('Network error');
        }
    };

    const handleCopy = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        toast.success('Invite code copied');
        setTimeout(() => setCopiedId(null), 2000);
    };

    const uniqueWorkspaces = useMemo(() => {
        return Array.from(new Map(members.map(m => [m.workspaceId, {
            id: m.workspaceId,
            name: m.workspaceName,
            passKey: m.passKey
        }])).values());
    }, [members]);

    const filteredMembers = useMemo(() => {
        const base = activeWorkspace
            ? members.filter(m => m.workspaceId === activeWorkspace.id)
            : members;

        return base
            .filter(m => roleFilter === 'all' || m.role?.toLowerCase() === roleFilter.toLowerCase())
            .filter(m =>
                m.email.toLowerCase().includes(search.toLowerCase()) ||
                m.workspaceName?.toLowerCase().includes(search.toLowerCase()) ||
                m.email.split('@')[0].toLowerCase().includes(search.toLowerCase())
            );
    }, [members, activeWorkspace, roleFilter, search]);

    const displayedInviteWorkspaces = useMemo(() => {
        return activeWorkspace
            ? uniqueWorkspaces.filter(ws => ws.id === activeWorkspace.id)
            : uniqueWorkspaces.slice(0, 1); // Show first if global
    }, [activeWorkspace, uniqueWorkspaces]);

    if (loading) return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-background min-h-[400px] transition-colors duration-500">
            <div className="relative mb-8">
                <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Users size={24} className="text-primary animate-pulse" />
                </div>
            </div>
            <div className="space-y-2 text-center">
                <h3 className="text-xs font-black text-foreground uppercase tracking-[0.4em] animate-pulse">
                    Loading Team
                </h3>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-40">
                    Connecting...
                </p>
            </div>
        </div>
    );

    return (
        <div className="bg-background h-full overflow-hidden flex flex-col">
            {/* Professional Header */}
            <header className="h-14 border-b border-border bg-background/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-50">
                <div className="flex items-center gap-6">
                    <button onClick={() => setIsMobileOpen(true)} className="lg:hidden text-muted-foreground hover:text-foreground"><Menu size={18} /></button>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center">
                            <Users size={14} className="text-primary" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-sm font-semibold text-foreground flex items-center gap-2 leading-none">
                                Team Management
                                {activeWorkspace && <span className="text-[10px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded-md font-medium border border-border/50">{activeWorkspace.name}</span>}
                            </h1>
                            <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">{filteredMembers.length} active members across selected workspace</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {displayedInviteWorkspaces.map(ws => (
                        <div key={ws.id} className="hidden md:flex items-center gap-3 pl-4 border-l border-border">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Invite Code</span>
                            <div className="flex items-center gap-1 bg-secondary border border-border rounded-md px-2 py-1">
                                <code className="text-xs font-mono font-bold text-emerald-500">{ws.passKey}</code>
                                <button
                                    onClick={() => handleCopy(ws.passKey, ws.id)}
                                    className="p-1 hover:text-foreground text-muted-foreground transition-colors"
                                >
                                    {copiedId === ws.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                                </button>
                            </div>
                        </div>
                    ))}
                    <div className="w-px h-4 bg-border mx-2" />
                    <ThemeToggle />
                </div>
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">

                    {/* Unified Toolbar */}
                    <div className="bg-secondary/40 border border-border/50 p-2 rounded-2xl flex flex-col md:flex-row items-center gap-2">
                        <div className="relative flex-1 group w-full">
                            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by name, email or workspace..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full bg-transparent pl-11 pr-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground/60 font-medium text-foreground"
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                            <div className="flex items-center gap-2 px-3 h-10 bg-secondary border border-border rounded-xl shrink-0">
                                <Filter size={12} className="text-muted-foreground" />
                                <select
                                    value={roleFilter}
                                    onChange={e => setRoleFilter(e.target.value)}
                                    className="bg-transparent text-[11px] font-bold uppercase tracking-wider outline-none text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <option value="all">Every Role</option>
                                    <option value="owner">Owner</option>
                                    <option value="admin">Admin</option>
                                    <option value="manager">Manager</option>
                                    <option value="developer">Developer</option>
                                    <option value="designer">Designer</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2 px-3 h-10 bg-secondary border border-border rounded-xl shrink-0">
                                <Building2 size={12} className="text-muted-foreground" />
                                <select
                                    value={activeWorkspace?.id || 'all'}
                                    onChange={e => {
                                        const res = workspaces.find(w => w.id === e.target.value);
                                        setActiveWorkspace(res || null);
                                    }}
                                    className="bg-transparent text-[11px] font-bold uppercase tracking-wider outline-none text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <option value="all">All Workspaces</option>
                                    {workspaces.map(ws => (
                                        <option key={ws.id} value={ws.id}>{ws.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Team Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-20">
                        <AnimatePresence mode='popLayout'>
                            {filteredMembers.map((m, idx) => (
                                <MemberCard
                                    key={m.id}
                                    m={m}
                                    idx={idx}
                                    onUpdateRole={handleUpdateRole}
                                    onRemove={handleRemoveMember}
                                />
                            ))}
                        </AnimatePresence>

                        {filteredMembers.length === 0 && !loading && (
                            <div className="col-span-full py-32 flex flex-col items-center justify-center text-center opacity-40">
                                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                                    <Users size={24} className="text-muted-foreground" />
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">No members found</h3>
                                <p className="text-xs mt-1 text-muted-foreground">Adjust filters or search criteria to locate members</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function MemberCard({ m, idx, onUpdateRole, onRemove }: { m: any, idx: number, onUpdateRole: any, onRemove: any }) {
    const roleTheme = ROLE_THEMES[m.role?.toLowerCase()] || ROLE_THEMES['member'];
    const RoleIcon = roleTheme.icon;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            whileHover={{ y: -4, scale: 1.01 }}
            className="group"
        >
            <div className="bg-card/50 border border-border/50 rounded-2xl overflow-hidden hover:bg-card transition-all duration-300 shadow-sm hover:shadow-xl relative group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="p-5 flex flex-col h-full">
                    {/* Top Info */}
                    <div className="flex items-start gap-4 mb-5">
                        <div className="relative">
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold rotate-0 group-hover:rotate-6 transition-transform duration-500",
                                "bg-secondary border border-border/50 text-foreground"
                            )}>
                                {getInitials(m.name || m.email)}
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-background shadow-lg" />
                            </div>
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-sm font-semibold text-foreground truncate">{formatName(m.name, m.email)}</h3>
                                <div className={cn(
                                    "flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold border",
                                    roleTheme.bg, roleTheme.text, roleTheme.border
                                )}>
                                    <RoleIcon size={10} />
                                    {m.role?.toUpperCase()}
                                </div>
                            </div>
                            <p className="text-[11px] text-muted-foreground font-medium truncate flex items-center gap-1.5">
                                <Mail size={10} />
                                {m.email}
                            </p>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            <div className="flex items-center gap-1.5">
                                <Building2 size={10} />
                                <span className="truncate max-w-[100px]">{m.workspaceName}</span>
                            </div>
                            <span className="text-muted-foreground/30">●</span>
                            <div className="flex items-center gap-1.5">
                                <Shield size={10} />
                                <span>Secure</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between gap-3">
                        {m.role !== 'owner' ? (
                            <>
                                <div className="relative flex-1 group/select">
                                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                    <select
                                        value={m.role}
                                        onChange={(e) => onUpdateRole(m.workspaceId, m.id, e.target.value)}
                                        className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest outline-none focus:ring-1 focus:ring-primary/50 appearance-none transition-all text-foreground"
                                    >
                                        {VALID_WORKSPACE_ROLES.map(r => (
                                            <option key={r} value={r}>{r.toUpperCase().replace('_', ' ')}</option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    onClick={() => onRemove(m.workspaceId, m.id)}
                                    className="w-8 h-8 rounded-lg bg-background border border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5 flex items-center justify-center transition-all"
                                    title="Remove Member"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </>
                        ) : (
                            <div className="w-full flex items-center justify-center py-1.5 bg-amber-500/5 border border-amber-500/10 rounded-lg">
                                <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                                    <ShieldCheck size={10} />
                                    Workspace Owner
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
