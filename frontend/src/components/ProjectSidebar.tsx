"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname, useParams, useSearchParams } from 'next/navigation';
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
    ChevronDown,
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
    BellDot,
    Hash,
    MoreVertical,
    CheckCircle2,
    Calendar,
    Target,
    Zap,
    Activity as ActivityIcon,
    Layout as LayoutIcon,
    Kanban,
    PieChart as PieIcon
} from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { apiFetch } from '@/lib/apiFetch';
import { createPortal } from 'react-dom';

export default function ProjectSidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();

    const { isMobileOpen, setIsMobileOpen, isCollapsed, setIsCollapsed } = useSidebar();
    const searchParams = useSearchParams();
    const [recentProjects, setRecentProjects] = useState<any[]>([]);
    const [activeProject, setActiveProject] = useState<any>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [milestones, setMilestones] = useState<any[]>([]);

    const activeProjectId = params?.id as string;
    const { activeWorkspace, setActiveWorkspace, workspaces, refreshWorkspaces, workspaceRole } = useWorkspace();
    const [isWorkspaceListOpen, setIsWorkspaceListOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [newWsName, setNewWsName] = useState("");
    const [joinPassKey, setJoinPassKey] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dropdownStyles, setDropdownStyles] = useState<React.CSSProperties>({});
    const triggerRef = React.useRef<HTMLButtonElement>(null);

    const toggleWorkspaceList = () => {
        if (!isWorkspaceListOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            if (isCollapsed) {
                setDropdownStyles({
                    top: `${rect.top}px`,
                    left: `${rect.right + 16}px`,
                    width: '240px'
                });
            } else {
                setDropdownStyles({
                    top: `${rect.bottom + 8}px`,
                    left: `${rect.left}px`,
                    width: `${rect.width}px`
                });
            }
        }
        setIsWorkspaceListOpen(!isWorkspaceListOpen);
    };

    const handleCreateWorkspace = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newWsName.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/workspaces`, {
                method: 'POST',
                body: JSON.stringify({ name: newWsName })
            });
            if (res.ok) {
                const data = await res.json();
                toast.success("Workspace Created");
                setNewWsName("");
                setIsCreateModalOpen(false);
                if (data.id) localStorage.setItem('activeWorkspaceId', data.id);
                await refreshWorkspaces();
            } else {
                toast.error("Failed to create workspace");
            }
        } catch (e) { toast.error("Network error"); }
        finally { setIsSubmitting(false); }
    };

    const handleJoinWorkspace = async (e: React.FormEvent) => {
        e.preventDefault();
        if (joinPassKey.length !== 6) return;
        setIsSubmitting(true);
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/workspaces/join`, {
                method: 'POST',
                body: JSON.stringify({ passKey: joinPassKey })
            });
            if (res.ok) {
                const data = await res.json();
                toast.success("Joined Workspace");
                setJoinPassKey("");
                setIsJoinModalOpen(false);
                if (data.workspaceId) localStorage.setItem('activeWorkspaceId', data.workspaceId);
                await refreshWorkspaces();
            } else {
                toast.error("Invalid PassKey or already joined");
            }
        } catch (e) { toast.error("Network error"); }
        finally { setIsSubmitting(false); }
    };

    const fetchMembers = async () => {
        if (!activeProjectId) return;
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/${activeProjectId}/members`);
            if (res.ok) setMembers(await res.json());
        } catch (e) {
            console.error('Failed to fetch members:', e);
        }
    };

    const fetchUser = async () => {
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`);
            if (res.ok) {
                const data = await res.json();
                setCurrentUser(data.user);
            }
        } catch (e) { console.error(e); }
    };

    const fetchMilestones = async () => {
        if (!activeProjectId) return;
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/${activeProjectId}/milestones`);
            if (res.ok) setMilestones(await res.json());
        } catch (e) { console.error(e); }
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
        fetchUser();
    }, [pathname, activeWorkspace]);

    useEffect(() => {
        if (activeProjectId) {
            const fetchActive = async () => {
                try {
                    const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/${activeProjectId}`);
                    if (res.ok) {
                        const data = await res.json();
                        setActiveProject(data);
                        setMembers(data.members || []);
                        setMilestones(data.milestones || []);
                    }
                } catch (e) { console.error(e); }
            };
            fetchActive();
        } else {
            setActiveProject(null);
            setMembers([]);
            setMilestones([]);
        }
    }, [activeProjectId]);

    const getEffectiveRole = () => {
        if (!currentUser || !activeProject || !members) return 'user';
        if (activeProject.workspace?.userId === currentUser.userId || workspaceRole === 'owner' || workspaceRole === 'admin') return 'admin';
        const member = members.find(m => m.userId === currentUser.userId);
        return member?.projectRole || 'user';
    };

    const currentUserRole = getEffectiveRole();
    const isManager = ['admin', 'manager', 'owner'].includes(currentUserRole);

    const completedMilestones = (milestones || []).filter(m => m.status === 'Completed').length;
    const totalProgress = (milestones || []).length > 0 ? Math.round(milestones.reduce((a, m) => a + (m.progress || 0), 0) / milestones.length) : 0;

    const sidebarContent = (
        <div className={cn(
            "flex flex-col h-full bg-background/80 backdrop-blur-xl border-r border-border/50 relative transition-all duration-300 ease-in-out group/sidebar overflow-hidden",
            isCollapsed && !isMobileOpen ? "w-[68px]" : "w-[260px]",
            isWorkspaceListOpen ? "z-[1000]" : "z-[100]"
        )}>
            {/* Logo Section */}
            <div className="h-14 flex items-center px-4 border-b border-border/50 shrink-0 bg-background/50">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30 shrink-0">
                        <Target size={18} />
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-foreground truncate">SYNC CRM</span>
                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Zinc Network</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Nav */}
            <div className="flex-1 py-4 px-3 overflow-y-auto custom-scrollbar space-y-6">
                <div className="space-y-1">
                    <NavItem
                        href="/projects"
                        active={pathname === '/projects' && !activeProjectId}
                        icon={<Briefcase size={16} />}
                        label="All Projects"
                        collapsed={isCollapsed}
                        onClick={() => setIsMobileOpen(false)}
                    />
                    <NavItem
                        href="/projects/analytics"
                        active={pathname === '/projects/analytics'}
                        icon={<ActivityIcon size={16} />}
                        label="Overall Progress"
                        collapsed={isCollapsed}
                        onClick={() => setIsMobileOpen(false)}
                    />
                    <NavItem
                        href="/projects/workspaces"
                        active={pathname === '/projects/workspaces'}
                        icon={<Globe size={16} />}
                        label="Public Workspaces"
                        collapsed={isCollapsed}
                        onClick={() => setIsMobileOpen(false)}
                    />
                    <NavItem
                        href="/projects/team"
                        active={pathname === '/projects/team'}
                        icon={<Users size={16} />}
                        label="Manage Team"
                        collapsed={isCollapsed}
                        onClick={() => setIsMobileOpen(false)}
                    />
                    <NavItem
                        href="/projects/chat"
                        active={pathname === '/projects/chat'}
                        icon={<MessageSquare size={16} />}
                        label="Team Chat"
                        collapsed={isCollapsed}
                        onClick={() => setIsMobileOpen(false)}
                    />
                </div>

                {activeProjectId && (
                    <div className="space-y-3 pt-2 animate-in slide-in-from-left duration-300">
                        {!isCollapsed && (
                            <div className="px-3 flex items-center justify-between">
                                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Project Navigation</h4>
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                            </div>
                        )}
                        <div className="space-y-1">
                            {[
                                { id: 'overview', label: 'Summary', icon: <LayoutIcon size={16} /> },
                                { id: 'milestones', label: 'Full Task List', icon: <Flag size={16} /> },
                                { id: 'board', label: 'Task Board', icon: <Kanban size={16} /> },
                                { id: 'analytics', label: 'Progress Charts', icon: <PieIcon size={16} /> },
                                { id: 'resources', label: 'Team Access', icon: <Box size={16} /> },
                                { id: 'team', label: 'Member List', icon: <Users size={16} /> },
                                { id: 'pulse', label: 'Daily Activity', icon: <ActivityIcon size={16} /> },
                                { id: 'settings', label: 'Project Settings', icon: <Settings size={16} /> },
                            ].filter(tab => {

                                if (!isManager) return ['milestones', 'board', 'analytics'].includes(tab.id);
                                if (['board', 'analytics'].includes(tab.id)) return true;
                                if (tab.id === 'settings') return currentUserRole === 'admin';
                                return true;
                            }).map(tab => {
                                const currentTab = (params?.tab as string) || 'overview';
                                const currentView = searchParams.get('view') || (isManager ? 'list' : 'board');

                                const isTabMatch = tab.id === 'milestones' || tab.id === 'board' || tab.id === 'analytics'
                                    ? currentTab === 'milestones'
                                    : currentTab === tab.id;

                                const isViewMatch = (tab.id === 'milestones' && currentView === 'list') ||
                                    (tab.id === 'board' && currentView === 'board') ||
                                    (tab.id === 'analytics' && currentView === 'analytics');

                                const isActive = pathname.includes(`/projects/${activeProjectId}`) && isTabMatch && (isManager ? (tab.id === 'milestones' ? currentView === 'list' : isViewMatch) : isViewMatch);

                                const href = tab.id === 'board' ? `/projects/${activeProjectId}?tab=milestones&view=board` :
                                    tab.id === 'analytics' ? `/projects/${activeProjectId}?tab=milestones&view=analytics` :
                                        tab.id === 'milestones' && !isManager ? `/projects/${activeProjectId}?tab=milestones&view=list` :
                                            `/projects/${activeProjectId}?tab=${tab.id}`;

                                return (
                                    <div key={tab.id}>
                                        <NavItem
                                            href={href}
                                            active={isActive}
                                            icon={tab.icon}
                                            label={tab.label}
                                            collapsed={isCollapsed}
                                            onClick={() => setIsMobileOpen(false)}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    {!isCollapsed && (
                        <div className="px-3 flex items-center justify-between">
                            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">Choose Workspace</h4>
                            <button onClick={() => setIsCreateModalOpen(true)} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20 shadow-sm" title="New Workspace">
                                <Plus size={14} />
                            </button>
                        </div>
                    )}
                    <div className="px-2 relative">
                        {activeWorkspace ? (
                            <button
                                ref={triggerRef}
                                onClick={toggleWorkspaceList}
                                className={cn(
                                    "w-full flex items-center gap-3 p-2 rounded-xl transition-all text-left group/ws",
                                    isWorkspaceListOpen ? "bg-secondary border-primary/20 shadow-lg shadow-primary/5" : "bg-card/40 border border-border/50 hover:border-primary/30 hover:bg-secondary/80"
                                )}
                            >
                                <div className="w-9 h-9 rounded-xl bg-background border border-border flex items-center justify-center text-muted-foreground group-hover/ws:text-primary group-hover/ws:scale-110 transition-all shadow-xs">
                                    <Building2 size={18} />
                                </div>
                                {!isCollapsed && (
                                    <>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[11px] font-black text-foreground truncate uppercase tracking-tight">{activeWorkspace.name}</p>
                                            <p className="text-[9px] text-muted-foreground font-black truncate uppercase tracking-widest opacity-40">{activeWorkspace.passKey || 'Standard'}</p>
                                        </div>
                                        <div className={cn("transition-transform duration-300 text-muted-foreground/30", isWorkspaceListOpen && "rotate-180")}>
                                            <ChevronDown size={14} />
                                        </div>
                                    </>
                                )}
                            </button>
                        ) : (
                            <button onClick={() => setIsWorkspaceListOpen(!isWorkspaceListOpen)} className="w-full p-4 rounded-xl border border-dashed border-border/50 text-center hover:bg-secondary/50 transition-all">
                                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.3em]">{!isCollapsed ? 'No Selection' : 'N/A'}</p>
                            </button>
                        )}

                        <div className="hidden" />
                    </div>
                </div>

                {!isCollapsed && recentProjects.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Recent Projects</h4>
                        <div className="space-y-1">
                            {recentProjects.map(prj => (
                                <Link key={prj.id} href={`/projects/${prj.id}`} className={cn("flex items-center gap-3 px-3 py-2 rounded-lg transition-all", activeProjectId === prj.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground")}>
                                    <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", activeProjectId === prj.id ? "bg-primary shadow-[0_0_8px_currentColor]" : "bg-muted-foreground/30")} />
                                    <span className="text-xs font-medium truncate">{prj.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Sidebar Footer Actions */}
            <div className="px-4 pb-4 space-y-3 shrink-0">
                <button
                    onClick={() => setIsJoinModalOpen(true)}
                    className={cn(
                        "w-full group relative flex items-center transition-all duration-500 rounded-[1.25rem] overflow-hidden border border-emerald-500/20 shadow-lg shadow-emerald-500/5",
                        isCollapsed && !isMobileOpen ? "justify-center p-0 h-12" : "gap-4 px-4 py-3 h-14",
                        "bg-emerald-500/[0.03] hover:bg-emerald-500/10 hover:border-emerald-500/40 hover:scale-[1.02] active:scale-95"
                    )}
                >
                    <div className="absolute inset-0 bg-radial-at-tr from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="relative flex items-center justify-center text-emerald-500 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-[0_0_15px_rgba(16,185,129,0.2)] bg-emerald-500/10 w-8 h-8 rounded-lg border border-emerald-500/20">
                        <Globe size={18} strokeWidth={2.5} />
                    </div>
                    {!isCollapsed && (
                        <div className="relative flex-1 text-left">
                            <span className="block text-[11px] font-black text-foreground uppercase tracking-[0.1em] leading-none group-hover:text-emerald-500 transition-colors">Join Workspace</span>
                        </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-500/20 translate-y-[2px] group-hover:translate-y-0 transition-transform duration-500" />
                </button>

                <Link
                    href="/projects/workspace"
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                        "w-full group relative flex items-center transition-all duration-500 rounded-[1.25rem] overflow-hidden border border-primary/20 shadow-lg shadow-primary/10",
                        isCollapsed && !isMobileOpen ? "justify-center p-0 h-12" : "gap-4 px-4 py-3 h-14",
                        "bg-primary/[0.05] hover:bg-primary/10 hover:border-primary/40 hover:scale-[1.02] active:scale-95"
                    )}
                >
                    <div className="absolute inset-0 bg-linear-to-tr from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="relative flex items-center justify-center text-primary group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500 shadow-md bg-white dark:bg-primary/20 w-8 h-8 rounded-lg border border-primary/20">
                        <Settings size={18} strokeWidth={2.5} />
                    </div>
                    {!isCollapsed && (
                        <div className="relative flex-1 text-left">
                            <span className="block text-[11px] font-black text-foreground uppercase tracking-[0.1em] leading-none group-hover:text-primary transition-colors">Workspace Control</span>
                        </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary/30 translate-y-[2px] group-hover:translate-y-0 transition-transform duration-500" />
                </Link>
            </div>

            <div className="p-4 border-t border-border/50 shrink-0">
                <div className={cn("flex items-center gap-3", isCollapsed && "flex-col")}>
                    <ThemeToggle />
                    {!isCollapsed && <div className="h-6 w-px bg-border/50" />}
                    <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all lg:flex hidden">
                        {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                    </button>
                    <button onClick={() => { localStorage.removeItem('accessToken'); localStorage.removeItem('refreshToken'); router.push('/login'); }} className={cn("p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all", !isCollapsed && "flex-1 flex items-center gap-2 px-3 py-2 text-xs font-semibold")} title="Sign Out">
                        <LogOut size={18} />
                        {!isCollapsed && <span>Sign Out</span>}
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <aside className="hidden lg:flex shrink-0 h-screen sticky top-0 overflow-hidden">
                {sidebarContent}
            </aside>

            <AnimatePresence>
                {isMobileOpen && (
                    <div className="fixed inset-0 z-100 lg:hidden">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="absolute inset-y-0 left-0 w-[260px] bg-background">
                            <div className="h-full relative">
                                <button onClick={() => setIsMobileOpen(false)} className="absolute top-4 right-[-48px] w-10 h-10 bg-card border border-border rounded-xl flex items-center justify-center text-foreground shadow-xl">
                                    <X size={20} />
                                </button>
                                {sidebarContent}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCreateModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                            <div className="p-6 border-b border-border flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                        <Plus size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Create Workspace</h3>
                                        <p className="text-[10px] text-muted-foreground font-medium">Start a new project area</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsCreateModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                            <form onSubmit={handleCreateWorkspace} className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Workspace Name</label>
                                    <input type="text" value={newWsName} onChange={(e) => setNewWsName(e.target.value)} placeholder="Enter name (e.g. Project Alpha)" className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-all" autoFocus />
                                </div>
                                <button disabled={isSubmitting || !newWsName.trim()} className="w-full bg-primary hover:opacity-90 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                                    {isSubmitting ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={16} />}
                                    <span>Create Workspace</span>
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isJoinModalOpen && (
                    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsJoinModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                            <div className="p-6 border-b border-border flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                        <Globe size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Join Workspace</h3>
                                        <p className="text-[10px] text-muted-foreground font-medium">Join an existing workspace</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsJoinModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                            <form onSubmit={handleJoinWorkspace} className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Access Key</label>
                                    <input type="text" value={joinPassKey} onChange={(e) => setJoinPassKey(e.target.value.toUpperCase())} placeholder="Enter Code" maxLength={6} className="w-full bg-background border border-border rounded-xl px-4 py-4 text-center text-2xl font-mono font-bold tracking-[0.5em] text-emerald-400 placeholder:text-muted-foreground/20 focus:outline-none focus:border-emerald-500/50 transition-all uppercase" autoFocus />
                                    <p className="text-[10px] text-muted-foreground text-center font-medium italic">Enter the 6-digit code to join.</p>
                                </div>
                                <button disabled={isSubmitting || joinPassKey.length !== 6} className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2">
                                    {isSubmitting ? <RefreshCw size={16} className="animate-spin" /> : <Zap size={16} />}
                                    <span>Join Workspace</span>
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {isWorkspaceListOpen && (
                        <>
                            <div className="fixed inset-0 z-[1090]" onClick={() => setIsWorkspaceListOpen(false)} />
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                style={dropdownStyles}
                                className="fixed bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[1100] overflow-hidden max-h-[400px] overflow-y-auto custom-scrollbar"
                            >
                                <div className="p-2 space-y-1">
                                    {workspaces && workspaces.length > 0 ? (
                                        workspaces.map(ws => (
                                            <button key={ws.id} onClick={() => { if (setActiveWorkspace) setActiveWorkspace(ws); setIsWorkspaceListOpen(false); }} className={cn("w-full flex items-center gap-3 p-2.5 rounded-lg transition-all text-left border border-transparent", activeWorkspace?.id === ws.id ? "bg-primary/10 text-primary border-primary/20" : "hover:bg-secondary text-muted-foreground hover:text-foreground")}>
                                                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black shadow-sm", activeWorkspace?.id === ws.id ? "bg-primary text-primary-foreground" : "bg-secondary")}>
                                                    {ws.name?.[0]?.toUpperCase() || "W"}
                                                </div>
                                                <span className="text-[11px] font-black uppercase tracking-tight truncate flex-1">{ws.name}</span>
                                                {activeWorkspace?.id === ws.id && <CheckCircle2 size={14} className="text-primary" />}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="p-6 text-center">
                                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-40">No accessible nodes</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
};

const NavItem = ({ icon, label, active = false, href, collapsed = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, href: string, collapsed?: boolean, onClick?: () => void }) => {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={cn(
                "group relative flex items-center transition-all duration-200 rounded-lg",
                collapsed ? "justify-center py-2" : "gap-3 px-3 py-2",
                active ? "bg-primary/10 text-primary font-bold shadow-sm shadow-primary/5" : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
        >
            <div className={cn(
                "flex items-center justify-center shrink-0 transition-colors",
                active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
            )}>
                {icon}
            </div>

            {!collapsed && (
                <span className="text-xs font-semibold truncate flex-1 tracking-tight">
                    {label}
                </span>
            )}

            {active && !collapsed && (
                <div className="w-1 h-3 rounded-full bg-primary shadow-[0_0_8px_currentColor]" />
            )}
        </Link>
    );
};
