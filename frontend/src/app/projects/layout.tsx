"use client";

import React from 'react';
import ProjectSidebar from '@/components/ProjectSidebar';
import AuthGuard from '@/components/AuthGuard';
import { SyncProvider } from '@/context/SyncContext';
import NotificationCenter from './_components/NotificationCenter';
import { SidebarProvider, useSidebar } from '@/context/SidebarContext';
import { WorkspaceProvider, useWorkspace } from '@/context/WorkspaceContext';
import { Menu, User, ShieldCheck, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

function parseJwt(token: string) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
}

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard>
            <SyncProvider>
                <WorkspaceProvider>
                    <SidebarProvider>
                        <ProjectsLayoutContent>{children}</ProjectsLayoutContent>
                    </SidebarProvider>
                </WorkspaceProvider>
            </SyncProvider>
        </AuthGuard>
    );
}

function ProjectsLayoutContent({ children }: { children: React.ReactNode }) {
    const { setIsMobileOpen, isCollapsed, setIsCollapsed } = useSidebar();
    const [userData, setUserData] = React.useState<any>(null);

    React.useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            setUserData(parseJwt(token));
        }
    }, []);

    const initials = userData?.email?.substring(0, 2).toUpperCase() || 'AD';
    const roleLabel = userData?.role === 'admin' ? 'System Admin' :
        userData?.role === 'manager' ? 'Project Manager' : 'Authorized User';
    const nameLabel = userData?.email?.split('@')[0] || 'Member';

    return (
        <div className="flex h-screen bg-background overflow-hidden selection:bg-primary/20">
            <ProjectSidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <main className="flex-1 overflow-hidden relative custom-scrollbar bg-background/30">
                    {children}
                </main>
            </div>
        </div>
    );
}
