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
    { value: 'admin', label: 'Admin', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]' },
    { value: 'manager', label: 'Manager', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]' },
    { value: 'team_leader', label: 'Team Leader', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]' },
    { value: 'developer', label: 'Developer', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' },
    { value: 'designer', label: 'Designer', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]' },
    { value: 'customer', label: 'Customer', color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]' },
    { value: 'user', label: 'User', color: 'bg-white/5 text-muted-foreground/60 border-white/5' },
];

export function getRoleStyle(role: string) {
    return ROLES.find(r => r.value === role)?.color ?? 'bg-white/5 text-muted-foreground/60 border-white/5';
}

export function RoleBadge({ role }: { role: string }) {
    const r = ROLES.find(r => r.value === role);
    return (
        <span className={cn(
            "text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border backdrop-blur-md transition-all duration-300",
            r?.color ?? 'bg-white/5 text-muted-foreground/60 border-white/5'
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
            toast.success('Join code copied!');
        }
    };

    const roleDistribution = ROLES.map(r => ({
        name: r.label,
        value: members.filter(m => m.projectRole === r.value).length,
        color: r.color.includes('rose-500') ? '#f43f5e' :
            r.color.includes('purple-500') ? '#a855f7' :
                r.color.includes('blue-500') ? '#3b82f6' :
                    r.color.includes('emerald-500') ? '#10b981' :
                        r.color.includes('amber-500') ? '#f59e0b' :
                            r.color.includes('cyan-500') ? '#06b6d4' : 'rgba(255,255,255,0.1)'
    })).filter(d => d.value > 0);

    const joinTimeline = members.reduce((acc: any[], m: any) => {
        const date = new Date(m.joinedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        const existing = acc.find(d => d.date === date);
        if (existing) {
            existing.count += 1;
        } else {
            acc.push({ date, count: 1 });
        }
        return acc;
    }, []).reverse().slice(-10);

    return (
        <div className="space-y-12 max-w-6xl mx-auto pb-20 px-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-1"
                >
                    <h2 className="text-xl font-bold tracking-tight mb-1">Team</h2>
                    <p className="text-xs text-muted-foreground font-medium flex items-center gap-2 opacity-70">
                        <Network size={12} className="text-primary" /> Manage project members and their access levels.
                    </p>
                </motion.div>

                <div className="flex items-center gap-3 flex-wrap">
                    <AnimatePresence>
                        {invitation && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl flex items-center gap-4 shadow-xl"
                            >
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground/40">Invite Code</span>
                                    <span className="text-sm font-bold tracking-widest text-primary font-mono">{invitation.code}</span>
                                </div>
                                <div className="w-px h-6 bg-zinc-800" />
                                <button
                                    onClick={copyInviteCode}
                                    className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-all"
                                >
                                    <Copy size={14} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {canManage && (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowAdd(!showAdd)}
                            className="bg-primary text-primary-foreground px-5 py-2 rounded-xl flex items-center gap-2 font-bold text-[10px] uppercase tracking-wider shadow-lg shadow-primary/20 transition-all"
                        >
                            <UserPlus size={16} /> Add Member
                        </motion.button>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {showAdd && canManage && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: -10 }}
                        className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-xl relative overflow-hidden"
                    >
                        <div className="flex flex-col lg:flex-row items-end gap-6 relative z-10">
                            <div className="flex-1 space-y-1.5 w-full relative">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 ml-1">Search User (Email)</label>
                                <div className="relative">
                                    <input
                                        value={userSearch}
                                        onChange={e => {
                                            setUserSearch(e.target.value);
                                            if (newUserId) setNewUserId(''); // Reset selection if typing starts
                                        }}
                                        placeholder="Type to search..."
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-primary/10 transition-all outline-none italic"
                                    />
                                    {searching ? <RefreshCw size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/30 animate-spin" /> : <Fingerprint size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/30" />}
                                </div>

                                <AnimatePresence>
                                    {searchResults.length > 0 && !newUserId && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                            className="absolute left-0 right-0 top-full mt-2 bg-card border border-white/10 rounded-xl shadow-2xl z-100 overflow-hidden"
                                        >
                                            {searchResults.map((user: any) => (
                                                <button
                                                    key={user.id}
                                                    onClick={() => {
                                                        setNewUserId(user.id.toString());
                                                        setUserSearch(user.email);
                                                        setSearchResults([]);
                                                    }}
                                                    className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center justify-between group transition-colors"
                                                >
                                                    <span className="text-xs font-bold">{user.email}</span>
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 group-hover:text-primary transition-colors">Select ID: {user.id}</span>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {newUserId && (
                                    <div className="mt-2 flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg w-fit">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_currentColor]" />
                                        <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">User Selected (ID: {newUserId})</span>
                                    </div>
                                )}

                                {/* Workspace Personnel Suggestions */}
                                {!userSearch && !newUserId && workspaceMembers.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 ml-1">Workspace Personnel</p>
                                        <div className="flex flex-wrap gap-2">
                                            {workspaceMembers
                                                .filter(wm => !members.some(pm => pm.userId === wm.userId)) // Not already in project
                                                .slice(0, 5)
                                                .map(wm => (
                                                    <button
                                                        key={wm.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setNewUserId(wm.userId.toString());
                                                            setUserSearch(wm.userName);
                                                            setSearchResults([]);
                                                        }}
                                                        className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg text-[9px] font-bold hover:bg-primary/10 hover:border-primary/20 transition-all flex items-center gap-2"
                                                    >
                                                        <div className="w-4 h-4 rounded bg-primary/20 flex items-center justify-center text-[8px]">{wm.userName[0].toUpperCase()}</div>
                                                        {wm.userName.split('@')[0]}
                                                    </button>
                                                ))
                                            }
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 space-y-1.5 w-full">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 ml-1">Role</label>
                                <select
                                    value={newRole}
                                    onChange={e => setNewRole(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider focus:ring-2 focus:ring-primary/10 transition-all outline-none appearance-none cursor-pointer italic"
                                >
                                    {ROLES.map(r => <option key={r.value} value={r.value} className="bg-background text-foreground">{r.label}</option>)}
                                </select>
                            </div>
                            <div className="flex items-center gap-3 w-full lg:w-auto">
                                <button
                                    onClick={handleAdd}
                                    disabled={saving}
                                    className="flex-1 lg:flex-none bg-primary text-primary-foreground px-8 py-2.5 rounded-xl font-bold uppercase tracking-wider text-[10px] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                >
                                    {saving ? "Adding..." : "Add Member"}
                                </button>
                                <button onClick={() => setShowAdd(false)} className="px-5 py-2.5 text-muted-foreground font-bold uppercase tracking-wider text-[10px] hover:text-foreground transition-colors">Cancel</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl relative">
                {loading ? (
                    <div className="p-16 text-center flex flex-col items-center gap-3">
                        < RefreshCw size={24} className="text-primary animate-spin" />
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40">Loading team members...</p>
                    </div>
                ) : members.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-dashed border-white/10">
                            <Users size={24} className="text-muted-foreground/20" />
                        </div>
                        <h3 className="text-base font-bold mb-1 text-foreground/60 tracking-tight">No Team Members</h3>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/30">Add your first team member to start collaborating.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-[10px]">
                            <thead>
                                <tr className="bg-zinc-950 border-b border-zinc-800">
                                    <th className="px-8 py-4 font-black uppercase tracking-widest text-muted-foreground/40 italic">Personnel Entity</th>
                                    <th className="px-8 py-4 font-black uppercase tracking-widest text-muted-foreground/40 italic">Tactical Role</th>
                                    <th className="px-8 py-4 font-black uppercase tracking-widest text-muted-foreground/40 italic">Onboarding Date</th>
                                    {canManage && <th className="px-8 py-4 font-black uppercase tracking-widest text-muted-foreground/40 text-right italic">Operations</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/40">
                                {members.map((m, idx) => (
                                    <motion.tr
                                        key={m.memberId}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className="hover:bg-white/2 transition-colors group"
                                    >
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary font-bold text-sm shadow-inner transition-transform">
                                                    {m.email?.[0]?.toUpperCase() ?? '?'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm tracking-tight">{m.email}</span>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <Shield size={8} className="text-primary/40" />
                                                        <span className="text-[9px] text-muted-foreground/30 font-bold uppercase tracking-wider">{m.systemRole}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <RoleBadge role={m.projectRole} />
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-2 text-muted-foreground/60 font-black text-[10px] uppercase tracking-widest bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800 w-fit italic">
                                                <Clock size={10} className="text-primary/40" />
                                                {new Date(m.joinedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </div>
                                        </td>
                                        {canManage && (
                                            <td className="px-8 py-4 text-right">
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => handleRemove(m.memberId)}
                                                    className="w-8 h-8 flex items-center justify-center ml-auto bg-rose-500/5 text-rose-500/40 rounded-lg border border-rose-500/10 hover:text-rose-500 transition-all"
                                                >
                                                    <Trash2 size={14} />
                                                </motion.button>
                                            </td>
                                        )}
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
