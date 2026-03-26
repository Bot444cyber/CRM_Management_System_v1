"use client";

import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Shield, Copy, RefreshCw, Check, X, ClipboardCheck, Clock } from 'lucide-react';
import { apiFetch } from '@/lib/apiFetch';

const ROLES = [
    { value: 'admin', label: 'Admin', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20' },
    { value: 'manager', label: 'Manager', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
    { value: 'team_leader', label: 'Team Leader', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    { value: 'developer', label: 'Developer', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    { value: 'designer', label: 'Designer', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    { value: 'customer', label: 'Customer', color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' },
    { value: 'user', label: 'User', color: 'bg-muted text-muted-foreground border-border' },
];

export function getRoleStyle(role: string) {
    return ROLES.find(r => r.value === role)?.color ?? 'bg-muted text-muted-foreground border-border';
}

export function RoleBadge({ role }: { role: string }) {
    const r = ROLES.find(r => r.value === role);
    return (
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${r?.color ?? 'bg-muted text-muted-foreground'}`}>
            {r?.label ?? role}
        </span>
    );
}

export default function TeamView({ projectId, currentUserRole = 'developer', refresh }: {
    projectId: string;
    currentUserRole?: string;
    refresh: () => void;
}) {
    const [members, setMembers] = useState<any[]>([]);
    const [invitation, setInvitation] = useState<any>(null);
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [newUserId, setNewUserId] = useState('');
    const [newRole, setNewRole] = useState('developer');
    const [saving, setSaving] = useState(false);
    const [copied, setCopied] = useState<'code' | 'link' | null>(null);

    const canManage = ['admin', 'manager'].includes(currentUserRole);

    useEffect(() => {
        if (projectId) {
            fetchMembers();
            if (canManage) {
                fetchInvitation();
                fetchJoinRequests();
            }
        }
    }, [projectId, canManage]);

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

    const fetchInvitation = async () => {
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/${projectId}/invitation`);
            if (res.ok) setInvitation(await res.json());
        } catch (e) { console.error(e); }
    };

    const fetchJoinRequests = async () => {
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/${projectId}/join-requests`);
            if (res.ok) setRequests(await res.json());
        } catch (e) { console.error(e); }
    };

    const handleResetInvite = async () => {
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/${projectId}/invitation/reset`, {
                method: 'PUT'
            });
            if (res.ok) fetchInvitation();
        } catch (e) { console.error(e); }
    };

    const handleAdd = async () => {
        if (!newUserId || !newRole) return;
        setSaving(true);
        await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/${projectId}/members`, {
            method: 'POST',
            body: JSON.stringify({ userId: newUserId, role: newRole })
        });
        setShowAdd(false);
        setNewUserId('');
        setSaving(false);
        fetchMembers();
    };

    const handleUpdateRole = async (userId: number, role: string) => {
        await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/${projectId}/members`, {
            method: 'POST',
            body: JSON.stringify({ userId, role })
        });
        fetchMembers();
    };

    const handleRemove = async (memberId: string) => {
        await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/${projectId}/members/${memberId}`, {
            method: 'DELETE'
        });
        fetchMembers();
    };

    const handleProcessRequest = async (requestId: string, status: 'Approved' | 'Rejected') => {
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/${projectId}/join-requests/${requestId}`, {
                method: 'PUT',
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                fetchJoinRequests();
                fetchMembers();
            }
        } catch (e) { console.error(e); }
    };

    const copyToClipboard = (text: string, type: 'code' | 'link') => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold">Project Team</h2>
                    <p className="text-sm text-muted-foreground">Manage collaboration and access permissions</p>
                </div>
                {canManage && (
                    <button onClick={() => setShowAdd(!showAdd)} className="bg-primary text-primary-foreground px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm shadow-sm hover:opacity-90 transition-all">
                        <Plus size={16} /> Add Member
                    </button>
                )}
            </div>

            {/* Invitation Section */}
            {canManage && invitation && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-card border border-border rounded-2xl p-5 relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Shield size={12} className="text-primary" /> Invite Code</h3>
                            <button onClick={handleResetInvite} className="p-1.5 hover:bg-accent rounded-lg transition-colors text-muted-foreground" title="Reset Code">
                                <RefreshCw size={14} />
                            </button>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-accent/50 px-4 py-3 rounded-xl font-mono text-xl font-black tracking-[0.2em] flex-1 text-center border border-border/50">
                                {invitation.code}
                            </div>
                            <button onClick={() => copyToClipboard(invitation.code, 'code')} className="bg-foreground text-background p-3.5 rounded-xl hover:opacity-90 transition-all shadow-sm">
                                {copied === 'code' ? <ClipboardCheck size={20} /> : <Copy size={20} />}
                            </button>
                        </div>
                        <p className="text-[9px] text-muted-foreground mt-3 font-medium uppercase tracking-tighter">Share this code with existing platform users to let them join instantly.</p>
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-5 relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Shield size={12} className="text-primary" /> Invite Link</h3>
                            <button onClick={handleResetInvite} className="p-1.5 hover:bg-accent rounded-lg transition-colors text-muted-foreground" title="Reset Link">
                                <RefreshCw size={14} />
                            </button>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-accent/50 px-4 py-3 rounded-xl font-mono text-xs truncate flex-1 border border-border/50 text-muted-foreground">
                                {typeof window !== 'undefined' ? `${window.location.origin}/join/${invitation.linkToken}` : '...'}
                            </div>
                            <button onClick={() => copyToClipboard(`${typeof window !== 'undefined' ? window.location.origin : ''}/join/${invitation.linkToken}`, 'link')} className="bg-foreground text-background p-3.5 rounded-xl hover:opacity-90 transition-all shadow-sm">
                                {copied === 'link' ? <ClipboardCheck size={20} /> : <Copy size={20} />}
                            </button>
                        </div>
                        <p className="text-[9px] text-muted-foreground mt-3 font-medium uppercase tracking-tighter text-right">Anyone with this link can join this project as a developer.</p>
                    </div>
                </div>
            )}

            {/* Pending Requests */}
            {canManage && requests.filter(r => r.status === 'Pending').length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-amber-500 flex items-center gap-2"><Clock size={14} /> Join Requests ({requests.filter(r => r.status === 'Pending').length})</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {requests.filter(r => r.status === 'Pending').map(req => (
                            <div key={req.requestId} className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 font-bold">
                                        {req.email[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">{req.email}</p>
                                        <p className="text-xs text-muted-foreground italic">{req.message || "No message provided."}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleProcessRequest(req.requestId, 'Approved')} className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                                        <Check size={18} />
                                    </button>
                                    <button onClick={() => handleProcessRequest(req.requestId, 'Rejected')} className="p-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors">
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {showAdd && canManage && (
                <div className="bg-card border-2 border-primary/20 rounded-2xl p-6 flex items-end gap-4 animate-in fade-in slide-in-from-top-4 shadow-xl">
                    <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">User ID</label>
                        <input value={newUserId} onChange={e => setNewUserId(e.target.value)} placeholder="e.g. 42" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50" />
                    </div>
                    <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Project Role</label>
                        <select value={newRole} onChange={e => setNewRole(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50">
                            {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                    </div>
                    <button onClick={handleAdd} disabled={saving} className="bg-foreground text-background px-5 py-2.5 rounded-xl font-bold text-sm disabled:opacity-50">
                        {saving ? "Saving..." : "Confirm"}
                    </button>
                    <button onClick={() => setShowAdd(false)} className="px-5 py-2.5 text-muted-foreground font-bold text-sm">Cancel</button>
                </div>
            )}

            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                {loading ? (
                    <div className="p-8 text-center text-muted-foreground text-sm">Loading team...</div>
                ) : members.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-14 h-14 bg-accent rounded-full flex items-center justify-center mx-auto mb-3">
                            <Users size={24} className="text-muted-foreground" />
                        </div>
                        <h3 className="font-bold mb-1">No team members yet</h3>
                        <p className="text-sm text-muted-foreground">Add your first team member with a specific role.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-accent/50 text-[11px] uppercase tracking-wider text-muted-foreground">
                            <tr>
                                <th className="px-6 py-4 text-left font-bold">Member</th>
                                <th className="px-6 py-4 text-left font-bold">Project Role</th>
                                <th className="px-6 py-4 text-left font-bold">Joined</th>
                                {canManage && <th className="px-6 py-4 text-right font-bold">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {members.map((m) => (
                                <tr key={m.memberId} className="hover:bg-accent/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm">
                                                {m.email?.[0]?.toUpperCase() ?? '?'}
                                            </div>
                                            <div>
                                                <span className="font-semibold block">{m.email}</span>
                                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{m.systemRole}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {canManage ? (
                                            <select
                                                value={m.projectRole}
                                                onChange={(e) => handleUpdateRole(m.userId, e.target.value)}
                                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border bg-transparent cursor-pointer focus:outline-none ${getRoleStyle(m.projectRole)}`}
                                            >
                                                {ROLES.map(r => <option key={r.value} value={r.value} className="bg-background text-foreground">{r.label}</option>)}
                                            </select>
                                        ) : (
                                            <RoleBadge role={m.projectRole} />
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground text-xs">{new Date(m.joinedAt).toLocaleDateString()}</td>
                                    {canManage && (
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleRemove(m.memberId)} className="w-8 h-8 flex items-center justify-center ml-auto bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-colors">
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
