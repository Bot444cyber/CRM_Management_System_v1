"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import Link from 'next/link';
import { useSidebar } from '@/context/SidebarContext';
import {
    LayoutDashboard,
    Settings,
    LogOut,
    Users,
    Activity,
    Plus,
    ChevronLeft,
    ChevronRight,
    Briefcase,
    Flag,
    Box,
    FileText,
    Search,
    X,
    UserPlus,
    Layers,
    PanelLeftClose,
    PanelLeftOpen,
    Menu,
    RefreshCw,
    Building2,
    Globe,
    MessageSquare,
    Clock,
    BarChart3,
    Compass,
    Bell,
    BellDot
} from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { apiFetch } from '@/lib/apiFetch';

export default function ProjectSidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();

    const { isMobileOpen, setIsMobileOpen, isCollapsed, setIsCollapsed } = useSidebar();
    const [recentProjects, setRecentProjects] = useState<any[]>([]);
    const [projectSearch, setProjectSearch] = useState('');
    const [activeProject, setActiveProject] = useState<any>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [showAddMember, setShowAddMember] = useState(false);
    const [newUserId, setNewUserId] = useState('');
    const [newRole, setNewRole] = useState('developer');
    const [saving, setSaving] = useState(false);
    const [userSearch, setUserSearch] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchingUsers, setSearchingUsers] = useState(false);
    const [workspaceMembers, setWorkspaceMembers] = useState<any[]>([]);

    // Detect active project from params or pathname
    const activeProjectId = params?.id as string;

    const { activeWorkspace, setActiveWorkspace } = useWorkspace();

    const fetchMembers = async () => {
        if (!activeProjectId) return;
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/${activeProjectId}/members`);
            if (res.ok) setMembers(await res.json());
        } catch (e) {
            console.error('Failed to fetch members:', e);
        }
    };

    const fetchRecent = async () => {
        if (!activeWorkspace) {
            setRecentProjects([]);
            return;
        }
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/workspaces/${activeWorkspace.id}`);
            if (res.ok) {
                const data = await res.json();
                setRecentProjects(data.slice(0, 5));
            }
        } catch (e) {
            console.error('Failed to fetch projects:', e);
        }
    };

    useEffect(() => {
        fetchRecent();
    }, [pathname, activeWorkspace]); // Refresh on navigation or WS change

    useEffect(() => {
        if (activeProjectId) {
            const fetchActive = async () => {
                try {
                    const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/${activeProjectId}`);
                    if (res.ok) setActiveProject(await res.json());
                } catch (e) { console.error(e); }
            };
            fetchActive();
            fetchMembers();
        } else {
            setActiveProject(null);
            setMembers([]);
        }
    }, [activeProjectId]);

    const fetchWorkspaceMembers = async () => {
        if (!activeWorkspace) return;
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/workspaces/${activeWorkspace.id}/members`);
            if (res.ok) setWorkspaceMembers(await res.json());
        } catch (e) {
            console.error('Failed to fetch workspace members:', e);
        }
    };

    useEffect(() => {
        if (showAddMember) fetchWorkspaceMembers();
    }, [showAddMember, activeWorkspace]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (userSearch.length >= 2) {
                performUserSearch();
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [userSearch]);

    const performUserSearch = async () => {
        setSearchingUsers(true);
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/users/search?q=${userSearch}`);
            if (res.ok) setSearchResults(await res.json());
        } catch (e) {
            console.error(e);
        } finally {
            setSearchingUsers(false);
        }
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/${activeProjectId}/members`, {
                method: 'POST',
                body: JSON.stringify({ userId: newUserId, role: newRole })
            });
            if (res.ok) {
                setShowAddMember(false);
                setNewUserId('');
                setUserSearch('');
                fetchMembers();
                toast.success('Member added.');
            } else {
                const err = await res.json();
                toast.error(err.message || 'Action failed');
            }
        } catch (e) {
            toast.error('Network error');
        } finally {
            setSaving(false);
        }
    };

    const filteredProjects = recentProjects.filter(p =>
        p.name.toLowerCase().includes(projectSearch.toLowerCase())
    );

    const sidebarContent = (
        <div className={cn(
            "flex flex-col h-full bg-[#0a0a0a] border-r border-zinc-800 relative z-50 transition-all duration-300 ease-in-out group/sidebar",
            isCollapsed && !isMobileOpen ? "w-[80px]" : "w-[280px]"
        )}>
            {/* Background Ambient Glow */}
            <div className="absolute top-0 left-0 w-full h-32 bg-primary/5 blur-[80px] pointer-events-none" />

            <div className="flex flex-col py-6 px-4 overflow-y-auto overflow-x-hidden flex-1 custom-scrollbar relative z-10">
                {/* Brand Header */}
                <div className={cn(
                    "flex items-center justify-between mb-8 px-2",
                    isCollapsed ? "flex-col gap-6" : "flex-row"
                )}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.1)]">
                            <Compass size={20} className="animate-pulse" />
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col">
                                <span className="text-sm font-black italic tracking-tighter text-foreground">ANTIGRAVITY</span>
                                <span className="text-[7px] font-black text-primary/40 uppercase tracking-[0.3em]">Neural CRM v1</span>
                            </div>
                        )}
                    </div>

                    <div className={cn("flex items-center gap-1", isCollapsed ? "flex-col" : "flex-row")}>
                        <button className="p-2 hover:bg-white/5 rounded-xl text-muted-foreground/30 hover:text-primary transition-all relative group/notify">
                            <Bell size={18} />
                            <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-rose-500 rounded-full border-2 border-[#0a0a0a] ring-2 ring-rose-500/20" />

                            {isCollapsed && (
                                <div className="absolute left-full ml-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-[8px] font-black uppercase tracking-widest text-primary opacity-0 group-hover/notify:opacity-100 pointer-events-none transition-all whitespace-nowrap z-[100]">
                                    Notifications
                                </div>
                            )}
                        </button>

                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="p-2 hover:bg-white/5 rounded-xl text-muted-foreground/30 hover:text-primary transition-all hidden lg:flex group/toggle relative"
                        >
                            {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}

                            {isCollapsed && (
                                <div className="absolute left-full ml-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-[8px] font-black uppercase tracking-widest text-primary opacity-0 group-hover/toggle:opacity-100 pointer-events-none transition-all whitespace-nowrap z-[100]">
                                    Expand Sidebar
                                </div>
                            )}
                        </button>
                    </div>
                </div>
                {/* Workspace Identity */}
                <div className={cn(
                    "mb-8 p-3 mt-2 rounded-[1.5rem] bg-zinc-900/40 backdrop-blur-md border border-zinc-800 group/ws relative overflow-hidden shadow-2xl transition-all hover:bg-zinc-900/60",
                    isCollapsed && "mt-4 px-0 py-4 bg-transparent border-none"
                )}>

                    {activeWorkspace ? (
                        <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
                            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shrink-0 shadow-lg shadow-primary/20">
                                <Building2 size={16} />
                            </div>
                            {!isCollapsed && (
                                <div className="min-w-0 flex-1">
                                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-primary/40 leading-none mb-1.5">CURRENT WORKSPACE</p>
                                    <h3 className="text-xs font-black tracking-tight text-foreground uppercase italic leading-tight break-words line-clamp-2" title={activeWorkspace.name}>
                                        {activeWorkspace.name}
                                    </h3>
                                </div>
                            )}
                            {!isCollapsed && (
                                <button
                                    onClick={() => setActiveWorkspace(null)}
                                    className="p-1.5 hover:bg-primary/10 rounded-lg text-primary/40 hover:text-primary transition-colors"
                                    title="Switch Workspace"
                                >
                                    <RefreshCw size={12} />
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
                            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground/30 shrink-0">
                                <Globe size={16} />
                            </div>
                            {!isCollapsed && <span className="text-[10px] font-bold text-muted-foreground/40 uppercase italic">No Workspace</span>}
                        </div>
                    )}
                </div>

                {/* Main Navigation */}
                <div className="space-y-1 mb-8">
                    <NavItem
                        href="/projects"
                        active={pathname === '/projects' && !activeProjectId}
                        icon={<Briefcase size={16} />}
                        label="Portfolio"
                        collapsed={isCollapsed}
                        onClick={() => setIsMobileOpen(false)}
                    />
                    <NavItem
                        href="/projects/pulse"
                        active={pathname === '/projects/pulse'}
                        icon={<Activity size={16} />}
                        label="Pulse Feed"
                        collapsed={isCollapsed}
                        onClick={() => setIsMobileOpen(false)}
                    />
                    <NavItem
                        href="/projects/chat"
                        active={pathname === '/projects/chat'}
                        icon={<MessageSquare size={16} />}
                        label="Chat Group"
                        collapsed={isCollapsed}
                        onClick={() => setIsMobileOpen(false)}
                    />
                    <NavItem
                        href="/projects/time-tracker"
                        active={pathname === '/projects/time-tracker'}
                        icon={<Clock size={16} />}
                        label="Time Tracker"
                        collapsed={isCollapsed}
                        onClick={() => setIsMobileOpen(false)}
                    />
                    <NavItem
                        href="/projects/analytics"
                        active={pathname === '/projects/analytics'}
                        icon={<BarChart3 size={16} />}
                        label="Analytics"
                        collapsed={isCollapsed}
                        onClick={() => setIsMobileOpen(false)}
                    />
                    <NavItem
                        href="/projects/team"
                        active={pathname === '/projects/team'}
                        icon={<Users size={16} />}
                        label="Team Matrix"
                        collapsed={isCollapsed}
                        onClick={() => setIsMobileOpen(false)}
                    />
                    <NavItem
                        href="/projects/settings"
                        active={pathname === '/projects/settings'}
                        icon={<Settings size={16} />}
                        label="HQ Settings"
                        collapsed={isCollapsed}
                        onClick={() => setIsMobileOpen(false)}
                    />
                </div>
            </div>

            {/* Footer */}
            <div className={cn(
                "p-4 border-t border-white/5 bg-black/40 backdrop-blur-xl relative z-20",
                isCollapsed && "px-0"
            )}>
                <button
                    onClick={() => {
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        router.push('/login');
                    }}
                    className={cn(
                        "flex items-center gap-3 rounded-xl transition-all group",
                        isCollapsed ? "w-10 h-10 mx-auto justify-center bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white" : "w-full px-4 py-2.5 text-[10px] font-black text-rose-500 hover:bg-rose-500/10 uppercase tracking-widest"
                    )}
                    title="Terminate Session"
                >
                    <LogOut size={isCollapsed ? 18 : 16} className={cn(!isCollapsed && "group-hover:-translate-x-1 transition-transform")} />
                    {!isCollapsed && "Log Out"}
                </button>
            </div>

            {/* Collapse Toggle Label */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute top-1/2 -right-3 w-6 h-6 bg-card border border-white/10 rounded-full flex items-center justify-center shadow-xl text-muted-foreground hover:text-primary transition-all z-[60] -translate-y-1/2 opacity-0 group-hover/sidebar:opacity-100 hidden lg:flex"
            >
                {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
            </button>
        </div>
    );

    return (
        <>
            {/* Desktop View */}
            <aside className="hidden lg:flex shrink-0 h-screen sticky top-0 overflow-hidden">
                {sidebarContent}
            </aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <div className="fixed inset-0 z-[200] lg:hidden">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="absolute inset-y-0 left-0 w-[280px]"
                        >
                            <div className="h-full relative">
                                <button
                                    onClick={() => setIsMobileOpen(false)}
                                    className="absolute top-6 right-[-48px] w-10 h-10 bg-card rounded-xl flex items-center justify-center text-foreground shadow-2xl"
                                >
                                    <X size={20} />
                                </button>
                                {/* Render sidebar content without forced collapses for mobile */}
                                <div className="h-full flex flex-col bg-black border-r border-white/5">
                                    {/* We reuse the content logic but without isCollapsed logic for mobile context */}
                                    {sidebarContent}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Member Addition Modal Overlay */}
            <AnimatePresence>
                {showAddMember && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-sm bg-card border border-white/10 rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative overflow-hidden"
                        >

                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl pointer-events-none" />
                            <button
                                onClick={() => setShowAddMember(false)}
                                className="absolute top-8 right-8 text-muted-foreground hover:text-foreground transition-all"
                            >
                                <X size={20} />
                            </button>

                            <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-8 shadow-inner border border-primary/20">
                                <UserPlus size={28} />
                            </div>

                            <h2 className="text-2xl font-black mb-1 drop-shadow-sm">Add Member</h2>
                            <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest mb-10 leading-relaxed italic">Add a new member to your team.</p>

                            <form onSubmit={handleAddMember} className="space-y-6">
                                <div className="space-y-2 text-left relative">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 ml-4">Email Address</label>
                                    <div className="relative">
                                        <input
                                            value={userSearch}
                                            onChange={e => {
                                                setUserSearch(e.target.value);
                                                if (newUserId) setNewUserId('');
                                            }}
                                            placeholder="agent@nexus.io"
                                            className="w-full bg-black/50 border border-white/5 rounded-2xl px-6 py-4 text-xs font-bold focus:ring-4 focus:ring-primary/10 transition-all placeholder:opacity-20"
                                        />
                                        {searchingUsers && <RefreshCw size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-primary/30 animate-spin" />}
                                    </div>

                                    <AnimatePresence>
                                        {searchResults.length > 0 && !newUserId && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                                className="absolute left-0 right-0 top-full mt-2 bg-card border border-white/10 rounded-2xl shadow-2xl z-400 overflow-hidden"
                                            >
                                                {searchResults.map((user: any) => (
                                                    <button
                                                        key={user.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setNewUserId(user.id.toString());
                                                            setUserSearch(user.email);
                                                            setSearchResults([]);
                                                        }}
                                                        className="w-full px-6 py-4 text-left hover:bg-white/5 flex items-center justify-between group transition-colors"
                                                    >
                                                        <span className="text-xs font-bold">{user.email}</span>
                                                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 group-hover:text-primary transition-colors">ID: {user.id}</span>
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {newUserId && (
                                        <div className="mt-2 flex items-center gap-2 px-4 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg w-fit ml-4">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_currentColor]" />
                                            <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Selected Member (ID: {newUserId})</span>
                                        </div>
                                    )}

                                    {/* Workspace Member Suggestions */}
                                    {!userSearch && !newUserId && workspaceMembers.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 ml-4">People in Workspace</p>
                                            <div className="flex flex-wrap gap-2 px-4">
                                                {workspaceMembers
                                                    .filter(wm => !members.some(pm => pm.userId === wm.userId)) // Only those not in project
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

                                <div className="space-y-2 text-left">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 ml-4">Role</label>
                                    <select
                                        value={newRole}
                                        onChange={e => setNewRole(e.target.value)}
                                        className="w-full bg-black/50 border border-white/5 rounded-2xl px-6 py-4 text-xs font-black focus:ring-4 focus:ring-primary/10 transition-all appearance-none uppercase tracking-widest [color-scheme:dark]"
                                    >
                                        <option value="admin">Administrator</option>
                                        <option value="manager">Manager</option>
                                        <option value="team_leader">Team Leader</option>
                                        <option value="developer">Developer</option>
                                        <option value="designer">Designer</option>
                                        <option value="customer">Customer</option>
                                        <option value="user">User</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    disabled={saving || !newUserId}
                                    className="w-full bg-primary text-primary-foreground py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-[0_20px_40px_-15px_rgba(var(--color-primary-rgb),0.4)] flex items-center justify-center gap-3"
                                >
                                    {saving ? 'Adding...' : 'Add Member'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}

const NavItem = ({ icon, label, active = false, href, collapsed = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, href: string, collapsed?: boolean, onClick?: () => void }) => {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={cn(
                "group relative flex items-center transition-all duration-500",
                collapsed ? "justify-center py-2" : "gap-3 px-3 py-2 rounded-xl"
            )}
        >
            {/* Background Hover Effect */}
            <motion.div
                className={cn(
                    "absolute inset-0 rounded-xl transition-opacity duration-500 opacity-0 group-hover:opacity-100",
                    active ? "bg-primary/10 border border-primary/20 opacity-100" : "bg-white/[0.03] border border-white/5"
                )}
                layoutId={active ? "activeNav" : undefined}
            />

            <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-500 relative z-10",
                active
                    ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.3)] scale-110"
                    : "bg-white/5 border border-white/5 text-muted-foreground/30 group-hover:text-primary group-hover:border-primary/20 group-hover:scale-110"
            )}>
                {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 14 }) : icon}
            </div>

            {!collapsed && (
                <span className={cn(
                    "text-[11px] font-black tracking-widest uppercase transition-all duration-500 relative z-10",
                    active ? "text-primary italic scale-105" : "text-muted-foreground/60 group-hover:text-foreground"
                )}>
                    {label}
                </span>
            )}

            {active && !collapsed && (
                <motion.div
                    layoutId="activeIndicator"
                    className="absolute right-3 w-1 h-3 rounded-full bg-primary shadow-[0_0_10px_currentColor] z-10"
                />
            )}
        </Link>
    );
};

