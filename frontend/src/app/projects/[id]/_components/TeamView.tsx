"use client";

import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Shield, Copy, RefreshCw, Check, X, ClipboardCheck, Clock, UserPlus, Fingerprint, Network, PieChart as PieIcon, BarChart3, Fingerprint as FingerIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { useSync } from '@/context/SyncContext';
import { apiFetch } from '@/lib/apiFetch';

const ROLES = [
    { value: 'admin', label: 'Admin', color: 'bg-destructive/10 text-destructive border-destructive/20' },
    { value: 'manager', label: 'Manager', color: 'bg-primary/10 text-primary border-primary/20' },
    { value: 'team_leader', label: 'Team Lead', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    { value: 'developer', label: 'Developer', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    { value: 'designer', label: 'Designer', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    { value: 'customer', label: 'Client', color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' },
    { value: 'user', label: 'Member', color: 'bg-secondary text-muted-foreground border-border/50' },
];

export function getRoleStyle(role: string) {
    return ROLES.find(r => r.value === role)?.color ?? 'bg-secondary text-muted-foreground border-border/50';
}

export function RoleBadge({ role }: { role: string }) {
    const r = ROLES.find(r => r.value === role);
    return (
        <span className={cn(
            "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border shadow-xs transition-all",
            r?.color ?? 'bg-secondary text-muted-foreground border-border/50'
        )}>
            {r?.label ?? role}
        </span>
    );
}

export default function TeamView({ projectId, workspaceId, currentUserRole = 'developer', refresh }: {
    projectId: string;
    workspaceId?: string;
    currentUserRole?: string;
    refresh: () => void;
}) {
    const { triggerRefresh } = useSync();
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [newUserId, setNewUserId] = useState('');
    const [newRole, setNewRole] = useState('developer');
    const [saving, setSaving] = useState(false);
    const [userSearch, setUserSearch] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const [invitation, setInvitation] = useState<any>(null);
    const [workspaceMembers, setWorkspaceMembers] = useState<any[]>([]);

    const canManage = ['admin', 'manager'].includes(currentUserRole);

    useEffect(() => {
        if (projectId) {
            fetchMembers();
            if (canManage) {
                fetchInvitation();
            }
        }
    }, [projectId, canManage]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (userSearch.length >= 2) {
                performSearch();
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [userSearch]);

    const performSearch = async () => {
        setSearching(true);
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/users/search?q=${userSearch}`);
            if (res.ok) setSearchResults(await res.json());
        } catch (e) {
            console.error(e);
        } finally {
            setSearching(false);
        }
    };

    const fetchInvitation = async () => {
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/${projectId}/invitation`);
            if (res.ok) setInvitation(await res.json());
        } catch (e) {
            console.error(e);
        }
    };

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/${projectId}/members`);
            if (res.ok) setMembers(await res.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchWorkspaceMembers = async () => {
        if (!workspaceId) return;
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/workspaces/${workspaceId}/members`);
            if (res.ok) setWorkspaceMembers(await res.json());
        } catch (e) {
            console.error('Failed to fetch workspace members:', e);
        }
    };

    useEffect(() => {
        if (showAdd && workspaceId) fetchWorkspaceMembers();
    }, [showAdd, workspaceId]);

    const handleAdd = async () => {
        if (!newUserId || !newRole) return;
        setSaving(true);
        const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/${projectId}/members`, {
            method: 'POST',
            body: JSON.stringify({ userId: newUserId, role: newRole })
        });
        if (res.ok) {
            toast.success('Member added');
            setShowAdd(false);
            setNewUserId('');
            triggerRefresh();
            fetchMembers();
        } else {
            toast.error('Failed to add member');
        }
        setSaving(false);
    };

    const handleRemove = async (memberId: string) => {
        const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/${projectId}/members/${memberId}`, {
            method: 'DELETE'
        });
        if (res.ok) {
            toast.success('Member removed');
            triggerRefresh();
            fetchMembers();
        } else {
            toast.error('Failed to remove member');
        }
    };

    const copyInviteCode = () => {
        if (invitation?.code) {
            navigator.clipboard.writeText(invitation.code);
            toast.success('Invite code copied');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-secondary border border-border rounded-xl flex items-center justify-center text-primary shadow-sm hover:scale-105 transition-transform">
                        <Users size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-foreground uppercase tracking-tight">Team Matrix</h2>
                        <p className="text-xs text-muted-foreground opacity-80 uppercase font-black tracking-widest leading-none">Manage project collaborators and workspace access nodes.</p>
                    </div>
                </div>
                {canManage && (
                    <button
                        onClick={() => setShowAdd(!showAdd)}
                        className="flex items-center gap-2 bg-primary hover:opacity-90 text-primary-foreground px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20"
                    >
                        <UserPlus size={16} />
                        Recruit Member
                    </button>
                )}
            </div>

            <AnimatePresence>
                {showAdd && canManage && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="bg-card/40 border border-border/50 p-6 md:p-8 rounded-2xl shadow-xl backdrop-blur-md space-y-8"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="space-y-2.5 relative">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Search Database</label>
                                <div className="relative group/search">
                                    <input
                                        value={userSearch}
                                        onChange={e => {
                                            setUserSearch(e.target.value);
                                            if (newUserId) setNewUserId('');
                                        }}
                                        placeholder="Identification email..."
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all placeholder:opacity-30"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                        {searching ? (
                                            <RefreshCw size={14} className="text-primary animate-spin" />
                                        ) : (
                                            <Users size={14} className="text-muted-foreground opacity-30 group-focus-within/search:opacity-100 transition-opacity" />
                                        )}
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {searchResults.length > 0 && !newUserId && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 5 }}
                                            className="absolute left-0 right-0 top-full mt-2 bg-card border border-border rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-50 overflow-hidden divide-y divide-border/30"
                                        >
                                            {searchResults.map((user: any) => (
                                                <button
                                                    key={user.id}
                                                    onClick={() => {
                                                        setNewUserId(user.id.toString());
                                                        setUserSearch(user.email);
                                                        setSearchResults([]);
                                                    }}
                                                    className="w-full px-5 py-3.5 text-left hover:bg-accent flex items-center justify-between transition-colors group"
                                                >
                                                    <span className="text-xs font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">{user.email}</span>
                                                    <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-40">UPLINK ID: {user.id}</span>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Assign Node Role</label>
                                <div className="relative">
                                    <select
                                        value={newRole}
                                        onChange={e => setNewRole(e.target.value)}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-black text-foreground uppercase tracking-widest outline-none focus:ring-1 focus:ring-primary/50 transition-all appearance-none cursor-pointer"
                                    >
                                        {ROLES.map(r => <option key={r.value} value={r.value} className="bg-background">{r.label}</option>)}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground opacity-30">
                                        <Shield size={14} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-end gap-3">
                                <button
                                    onClick={handleAdd}
                                    disabled={saving || !newUserId}
                                    className="flex-1 bg-foreground hover:opacity-90 text-background h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-foreground/10 disabled:opacity-50"
                                >
                                    {saving ? "Uplinking..." : "Authorize Recruit"}
                                </button>
                                <button
                                    onClick={() => setShowAdd(false)}
                                    className="px-6 h-12 text-muted-foreground hover:text-foreground text-[10px] font-black uppercase tracking-widest transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>

                        {invitation && (
                            <div className="flex flex-col sm:flex-row items-center justify-between p-5 bg-secondary/30 border border-border/50 rounded-2xl gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-card flex items-center justify-center border border-border shadow-xs">
                                        <FingerIcon size={20} className="text-primary opacity-60" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Encrypted Referral Token</p>
                                        <p className="text-sm font-mono font-black text-foreground tracking-tighter">{invitation.code}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={copyInviteCode}
                                    className="w-full sm:w-auto px-6 py-2.5 bg-foreground hover:opacity-90 text-background rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-sm"
                                >
                                    Copy Link
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="bg-card/40 border border-border/50 rounded-2xl overflow-hidden shadow-sm backdrop-blur-md">
                {loading ? (
                    <div className="py-24 flex flex-col items-center gap-6">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                            <RefreshCw size={16} className="absolute inset-0 m-auto text-primary animate-pulse" />
                        </div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Synchronizing neural link data...</p>
                    </div>
                ) : members.length === 0 ? (
                    <div className="py-24 text-center space-y-6">
                        <div className="w-20 h-20 bg-secondary rounded-3xl border border-dashed border-border/50 flex items-center justify-center mx-auto opacity-30 shadow-inner group">
                            <Users size={40} className="text-muted-foreground group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-black text-foreground uppercase tracking-tight">Workspace Void Detected</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-40">No active entities assigned to this sector.</p>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-secondary/50 border-b border-border/50">
                                <tr>
                                    <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Entity Signature</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Sector Authority</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Commissioned</th>
                                    {canManage && <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Commands</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {members.map((m, idx) => (
                                    <tr key={m.memberId} className="hover:bg-accent/30 transition-all group/row">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-xl bg-secondary border border-border/50 flex items-center justify-center text-primary font-black text-base shadow-inner transition-all group-hover/row:scale-105 group-hover/row:border-primary/30">
                                                    {m.email?.[0]?.toUpperCase() ?? '?'}
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-sm font-black text-foreground uppercase tracking-tight group-hover/row:text-primary transition-colors">{m.email}</span>
                                                    <div className="flex items-center gap-1.5 opacity-40">
                                                        <Shield size={10} className="text-muted-foreground" />
                                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{m.systemRole}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <RoleBadge role={m.projectRole} />
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2.5 text-muted-foreground font-black text-[10px] uppercase tracking-widest opacity-60">
                                                <Clock size={12} className="text-muted-foreground/30" />
                                                {new Date(m.joinedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                        </td>
                                        {canManage && (
                                            <td className="px-6 py-5 text-right">
                                                <button
                                                    onClick={() => handleRemove(m.memberId)}
                                                    className="w-10 h-10 flex items-center justify-center ml-auto bg-background hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-xl border border-border hover:border-destructive/50 transition-all opacity-0 group-hover/row:opacity-100 shadow-xs group/del"
                                                    title="Deauthorize Entity"
                                                >
                                                    <Trash2 size={16} className="group-hover/del:rotate-12 transition-transform" />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
