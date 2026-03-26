"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/apiFetch';
import { useSync } from './SyncContext';

interface Workspace {
    id: string;
    name: string;
    description: string | null;
    passKey: string | null;
    role: string;
    createdAt: string;
}

interface WorkspaceContextType {
    activeWorkspace: Workspace | null;
    workspaces: Workspace[];
    workspaceRole: string | null;
    setWorkspaces: React.Dispatch<React.SetStateAction<Workspace[]>>;
    setActiveWorkspace: (workspace: Workspace | null) => void;
    refreshWorkspaces: () => Promise<void>;
    loading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType>({
    activeWorkspace: null,
    workspaces: [],
    workspaceRole: null,
    setWorkspaces: () => { },
    setActiveWorkspace: () => { },
    refreshWorkspaces: async () => { },
    loading: true
});

export const useWorkspace = () => useContext(WorkspaceContext);

export const WorkspaceProvider = ({ children }: { children: React.ReactNode }) => {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [activeWorkspace, setActiveWorkspaceState] = useState<Workspace | null>(null);
    const [loading, setLoading] = useState(true);
    const { refreshSignal } = useSync();

    const refreshWorkspaces = useCallback(async () => {
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/workspaces`);
            if (res.ok) {
                const data = await res.json();
                setWorkspaces(data || []);

                // Set active workspace from localStorage if available, or first if only one
                const savedId = localStorage.getItem('activeWorkspaceId');
                if (savedId) {
                    const match = data.find((w: Workspace) => w.id === savedId);
                    if (match) setActiveWorkspaceState(match);
                } else if (data.length === 1) {
                    setActiveWorkspaceState(data[0]);
                    localStorage.setItem('activeWorkspaceId', data[0].id);
                }
            }
        } catch (e) {
            console.error("Error fetching workspaces:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    const setActiveWorkspace = (ws: Workspace | null) => {
        setActiveWorkspaceState(ws);
        if (ws) {
            localStorage.setItem('activeWorkspaceId', ws.id);
        } else {
            localStorage.removeItem('activeWorkspaceId');
        }
    };

    useEffect(() => {
        refreshWorkspaces();
    }, [refreshWorkspaces, refreshSignal]);

    return (
        <WorkspaceContext.Provider value={{
            activeWorkspace,
            workspaces,
            workspaceRole: activeWorkspace?.role || null,
            setWorkspaces,
            setActiveWorkspace,
            refreshWorkspaces,
            loading
        }}>
            {children}
        </WorkspaceContext.Provider>
    );
};
