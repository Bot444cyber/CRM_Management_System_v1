'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { apiFetch } from '@/lib/apiFetch';
import {
    Building2, Users, Briefcase, Settings, Globe, Copy, CheckCircle2,
    Trash2, Save, UserPlus, Shield, Clock, ExternalLink, Activity, Plus,
    Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useSidebar } from '@/context/SidebarContext';
import { ThemeToggle } from '@/components/ThemeToggle';

type TabType = 'overview' | 'members' | 'projects';

interface WorkspaceMember {
    id: string;
    userId: string;
    role: string;
    joinedAt: string;
    userName: string;
    name?: string | null;
    email?: string;
    userRole: string;
}

const formatName = (name: string | null | undefined, email: string | null | undefined) => {
    if (name && name !== email) return name;
    if (!email) return 'Unknown Operative';
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

interface Project {
    id: string;
    name: string;
    description: string;
    status: string;
    health: string;
    deadline: string;
}

export default function WorkspaceDetailsPage() {
    const { activeWorkspace, setActiveWorkspace } = useWorkspace();
    const { setIsMobileOpen } = useSidebar();
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [members, setMembers] = useState<WorkspaceMember[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isInviting, setIsInviting] = useState(false);
    const [inviteEmails, setInviteEmails] = useState("");
    const [showInviteForm, setShowInviteForm] = useState(false);

    // Edit state
    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');

    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

    useEffect(() => {
        if (activeWorkspace) {
            setEditName(activeWorkspace.name);
            setEditDesc(activeWorkspace.description || '');
            fetchWorkspaceData();
        }
    }, [activeWorkspace?.id]);

    const fetchWorkspaceData = async () => {
        if (!activeWorkspace) return;
        setIsLoading(true);
        try {
            const [membersRes, projectsRes, detailsRes] = await Promise.all([
                apiFetch(`${BACKEND_URL}/api/pms/workspaces/${activeWorkspace.id}/members`),
                apiFetch(`${BACKEND_URL}/api/pms/workspaces/${activeWorkspace.id}`),
                apiFetch(`${BACKEND_URL}/api/pms/workspaces/${activeWorkspace.id}/details`)
            ]);

            if (membersRes.ok && projectsRes.ok && detailsRes.ok) {
                const membersData = await membersRes.json();
                const projectsData = await projectsRes.json();
                const detailsData = await detailsRes.json();

                setMembers(membersData);
                setProjects(projectsData);

                setEditName(detailsData.name || '');
                setEditDesc(detailsData.description || '');
            } else {
                toast.error('Connection lost');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Couldn\'t load workspace info');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateWorkspace = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeWorkspace) return;
        setIsSaving(true);
        try {
            const res = await apiFetch(`${BACKEND_URL}/api/pms/workspaces/${activeWorkspace.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ name: editName, description: editDesc })
            });
            if (res.ok) {
                setActiveWorkspace({ ...activeWorkspace, name: editName, description: editDesc });
                toast.success('Workspace updated');
            } else {
                toast.error('Update failed');
            }
        } catch (error) {
            toast.error('Connection failed');
        } finally {
            setIsSaving(false);
        }
    };

    const handleBulkInvite = async () => {
        if (!activeWorkspace || !inviteEmails.trim()) return;
        setIsInviting(true);
        try {
            // Parse emails: split by comma or newline, trim and filter
            const emails = inviteEmails
                .split(/[,\n]/)
                .map(e => e.trim())
                .filter(e => e.includes('@'));

            if (emails.length === 0) {
                toast.error("No valid emails found");
                setIsInviting(false);
                return;
            }

            const res = await apiFetch(`${BACKEND_URL}/api/pms/workspaces/${activeWorkspace.id}/invite`, {
                method: 'POST',
                body: JSON.stringify({ emails })
            });

            if (res.ok) {
                toast.success(`Invitations sent to ${emails.length} people`);
                setInviteEmails("");
                setShowInviteForm(false);
            } else {
                toast.error("Failed to send invitations");
            }
        } catch (error) {
            toast.error("Couldn't send invitations");
        } finally {
            setIsInviting(false);
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        if (!activeWorkspace || !confirm('Are you sure you want to remove this person from the workspace?')) return;
        try {
            const res = await apiFetch(`${BACKEND_URL}/api/pms/workspaces/${activeWorkspace.id}/members/${memberId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setMembers(members.filter(m => m.id !== memberId));
                toast.success('Member removed');
            } else {
                toast.error('Failed to remove member');
            }
        } catch (error) {
            toast.error('Couldn\'t remove member');
        }
    };

    const copyPassKey = () => {
        if (!activeWorkspace?.passKey) return;
        navigator.clipboard.writeText(activeWorkspace.passKey);
        toast.success('Access Code copied to clipboard');
    };

    const isOwner = activeWorkspace?.role === 'owner';

    if (!activeWorkspace) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] text-muted-foreground">
                <Building2 size={48} className="mb-4 opacity-20" />
                <p className="text-sm font-medium uppercase tracking-widest">No Workspace Selected</p>
            </div>
        );
    }

    return (
        <div className="h-full bg-background flex flex-col">
            {/* Mobile Header */}
            <header className="lg:hidden h-14 border-b border-border flex items-center justify-between px-4 bg-background/50 backdrop-blur-md sticky top-0 z-50 shrink-0">
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all"
                >
                    <Menu size={20} />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                        <Building2 size={12} />
                    </div>
                    <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">Workspace Admin</span>
                </div>
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <div className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center text-[10px] font-bold text-muted-foreground uppercase">
                        {activeWorkspace?.name?.[0] || 'W'}
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-10 space-y-8 md:space-y-10">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border/50">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xl shadow-primary/10">
                                    <Building2 size={32} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight leading-none">{activeWorkspace.name}</h1>
                                        <div className="px-2 py-0.5 rounded-full bg-secondary border border-border text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                            {activeWorkspace.role}
                                        </div>
                                    </div>
                                    <p className="text-muted-foreground mt-2 max-w-xl line-clamp-2 text-sm">
                                        {activeWorkspace.description || 'Workspace for team collaboration and project management.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 w-full md:w-auto items-center">
                            <div className="bg-card border border-border rounded-xl p-3 px-4 flex items-center justify-between md:justify-start gap-4 relative overflow-hidden group/pass w-full md:w-auto shadow-sm">
                                <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover/pass:opacity-100 transition-opacity" />
                                <div className="relative">
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-none mb-1">Tactical PassKey</p>
                                    <p className="text-lg font-mono font-bold text-emerald-400 tracking-wider">
                                        {activeWorkspace.passKey}
                                    </p>
                                </div>
                                <button
                                    onClick={copyPassKey}
                                    className="relative p-2 bg-background hover:bg-accent border border-border text-muted-foreground hover:text-foreground rounded-lg transition-all"
                                >
                                    <Copy size={16} />
                                </button>
                            </div>
                            <div className="hidden md:block">
                                <ThemeToggle />
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex items-center gap-1 bg-card/50 border border-border/50 p-1 rounded-xl w-full md:w-fit overflow-x-auto no-scrollbar">
                        {[
                            { id: 'overview', label: 'Workspace Details', icon: <Settings size={14} /> },
                            { id: 'members', label: 'Team Members', icon: <Users size={14} /> },
                            { id: 'projects', label: 'Current Projects', icon: <Briefcase size={14} /> },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-bold transition-all uppercase tracking-wider whitespace-nowrap",
                                    activeTab === tab.id
                                        ? "bg-background text-foreground shadow-sm border border-border"
                                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                )}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                                {tab.id === 'members' && members.length > 0 && (
                                    <span className="ml-1 px-1.5 py-0.5 rounded-md bg-secondary text-[9px] text-muted-foreground border border-border/50">
                                        {members.length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === 'overview' && (
                                <div className="grid md:grid-cols-3 gap-8">
                                    <div className="md:col-span-2 space-y-6">
                                        <section className="bg-card/30 border border-border/50 rounded-2xl p-6 lg:p-8 space-y-6">
                                            <h3 className="text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                                                <Globe size={16} className="text-primary" />
                                                Workspace Settings
                                            </h3>

                                            <form onSubmit={handleUpdateWorkspace} className="space-y-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest px-1">Workspace Name</label>
                                                    <input
                                                        disabled={!isOwner}
                                                        type="text"
                                                        value={editName}
                                                        onChange={e => setEditName(e.target.value)}
                                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 transition-all disabled:opacity-50 font-medium"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest px-1">Description</label>
                                                    <textarea
                                                        disabled={!isOwner}
                                                        rows={4}
                                                        value={editDesc}
                                                        onChange={e => setEditDesc(e.target.value)}
                                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 transition-all resize-none disabled:opacity-50 text-sm leading-relaxed"
                                                        placeholder="Describe what this workspace is for..."
                                                    />
                                                </div>
                                                {isOwner && (
                                                    <button
                                                        disabled={isSaving}
                                                        className="flex items-center gap-2 bg-primary hover:opacity-90 text-primary-foreground text-xs font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50 uppercase tracking-widest"
                                                    >
                                                        {isSaving ? (
                                                            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                                        ) : <Save size={16} />}
                                                        <span>Save Changes</span>
                                                    </button>
                                                )}
                                            </form>
                                        </section>

                                        {isOwner && (
                                            <section className="bg-destructive/5 border border-destructive/10 rounded-2xl p-6 lg:p-8 space-y-4">
                                                <h3 className="text-xs font-bold text-destructive uppercase tracking-widest flex items-center gap-2">
                                                    <Trash2 size={16} />
                                                    Delete Workspace
                                                </h3>
                                                <p className="text-xs text-destructive/70 leading-relaxed max-w-xl">
                                                    Warning: Deleting this workspace will permanently remove all associated projects, chat history, and team members from the database. This action cannot be undone.
                                                </p>
                                                <button className="bg-destructive/10 hover:bg-destructive text-destructive hover:text-destructive-foreground border border-destructive/20 font-bold py-2.5 px-6 rounded-xl transition-all text-[10px] uppercase tracking-widest mt-2 shadow-sm">
                                                    Delete Workspace Permanently
                                                </button>
                                            </section>
                                        )}
                                    </div>

                                    <div className="space-y-6">
                                        <div className="bg-card/40 border border-border/50 rounded-2xl p-6 space-y-6 shadow-sm">
                                            <h3 className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Workspace Summary</h3>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-muted-foreground font-medium">Created On</span>
                                                    <span className="text-foreground font-bold tracking-tight">{new Date(activeWorkspace.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-muted-foreground font-medium">Total Members</span>
                                                    <span className="text-foreground font-bold tracking-tight">{members.length}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-muted-foreground font-medium">Active Projects</span>
                                                    <span className="text-foreground font-bold tracking-tight">{projects.length}</span>
                                                </div>
                                                <div className="h-px bg-border/50" />
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-muted-foreground font-medium">Node Status</span>
                                                    <span className="text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                        Online
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'members' && (
                                <div className="bg-card/30 border border-border/50 rounded-2xl overflow-hidden shadow-sm">
                                    <div className="p-6 border-b border-border flex items-center justify-between bg-accent/20">
                                        <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Team List</h3>
                                        {isOwner && (
                                            <button
                                                onClick={() => setShowInviteForm(!showInviteForm)}
                                                className="flex items-center gap-2 bg-background border border-border hover:bg-accent text-foreground px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm"
                                            >
                                                <UserPlus size={16} className="text-primary" />
                                                <span>{showInviteForm ? 'Close' : 'Invite Member'}</span>
                                            </button>
                                        )}
                                    </div>

                                    <AnimatePresence>
                                        {showInviteForm && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden border-b border-border"
                                            >
                                                <div className="p-6 bg-accent/5 space-y-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest px-1">Batch Invite (Comma or one per line)</label>
                                                        <textarea
                                                            placeholder="example@email.com, another@email.com..."
                                                            value={inviteEmails}
                                                            onChange={e => setInviteEmails(e.target.value)}
                                                            rows={3}
                                                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary/50 transition-all resize-none"
                                                        />
                                                    </div>
                                                    <div className="flex justify-end">
                                                        <button
                                                            disabled={isInviting || !inviteEmails.trim()}
                                                            onClick={handleBulkInvite}
                                                            className="flex items-center gap-2 bg-primary hover:opacity-90 text-primary-foreground text-[10px] font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50 uppercase tracking-widest"
                                                        >
                                                            {isInviting ? (
                                                                <div className="w-3 h-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                                            ) : <UserPlus size={14} />}
                                                            <span>Send Invitations</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <div className="overflow-x-auto custom-scrollbar">
                                        <table className="w-full text-left">
                                            <thead className="bg-accent/50 text-[10px] text-muted-foreground uppercase tracking-widest font-bold border-b border-border">
                                                <tr>
                                                    <th className="px-6 py-4">Member</th>
                                                    <th className="px-6 py-4">Role</th>
                                                    <th className="px-6 py-4">Permissions</th>
                                                    <th className="px-6 py-4">Joined On</th>
                                                    <th className="px-6 py-4 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {members.map(member => (
                                                    <tr key={member.id} className="group hover:bg-accent/30 transition-all">
                                                        <td className="px-6 py-5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center text-[10px] font-bold text-foreground uppercase tracking-tighter shadow-inner">
                                                                    {getInitials(member.name || member.email || member.userName)}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-sm font-bold text-foreground leading-none truncate">
                                                                        {member.name || member.userName}
                                                                    </p>
                                                                    <p className="text-[10px] text-muted-foreground mt-1 font-medium lowercase tracking-tight truncate opacity-70">
                                                                        {member.email || 'id.inbound@node.local'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <span className={cn(
                                                                "px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest border",
                                                                member.role === 'owner' ? "bg-primary/10 text-primary border-primary/20" : "bg-accent text-muted-foreground border-border"
                                                            )}>
                                                                {member.role}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-tighter">
                                                                <Shield size={12} className={cn(member.userRole === 'admin' ? "text-emerald-400" : "text-muted-foreground")} />
                                                                {member.userRole}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                                                                <Clock size={12} />
                                                                {new Date(member.joinedAt).toLocaleDateString()}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5 text-right">
                                                            {isOwner && member.role !== 'owner' && (
                                                                <button
                                                                    onClick={() => handleRemoveMember(member.id)}
                                                                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                                                                    title="Remove Member"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'projects' && (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {projects.map(project => (
                                        <div key={project.id} className="bg-card/30 border border-border/50 rounded-2xl p-6 space-y-5 hover:border-primary/20 transition-all group relative overflow-hidden shadow-sm">
                                            <div className="absolute top-0 right-0 p-4">
                                                <div className={cn(
                                                    "w-2.5 h-2.5 rounded-full shadow-[0_0_12px_currentColor]",
                                                    project.health === 'Green' ? "text-emerald-500 bg-emerald-500" :
                                                        project.health === 'Yellow' ? "text-amber-500 bg-amber-500" : "text-rose-500 bg-rose-500"
                                                )} />
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-1">
                                                    <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors uppercase tracking-tight">{project.name}</h4>
                                                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed h-8">{project.description}</p>
                                                </div>

                                                <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                                                    <div className="flex flex-col gap-1.5 flex-1">
                                                        <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest leading-none">Status</p>
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-foreground uppercase tracking-widest bg-accent px-2 py-1 rounded w-fit border border-border">
                                                            <Activity size={10} className="text-primary" />
                                                            {project.status}
                                                        </div>
                                                    </div>
                                                    {project.deadline && (
                                                        <div className="flex flex-col items-end gap-1.5">
                                                            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest leading-none">Deadline</p>
                                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground tracking-tighter">
                                                                <Clock size={10} />
                                                                {new Date(project.deadline).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-2">
                                                <a
                                                    href={`/projects/${project.id}`}
                                                    className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest"
                                                >
                                                    <ExternalLink size={12} />
                                                    View Project
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                    {isOwner && (
                                        <a
                                            href="/projects"
                                            className="border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center p-8 min-h-[180px] text-muted-foreground hover:text-foreground hover:border-primary/20 hover:bg-accent/20 transition-all gap-3"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center shadow-lg">
                                                <Plus size={24} />
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-widest">New Project</span>
                                        </a>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
