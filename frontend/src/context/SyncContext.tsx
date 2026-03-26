"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

interface SyncContextType {
    refreshSignal: number;
    triggerRefresh: () => void;
}

const SyncContext = createContext<SyncContextType>({
    refreshSignal: 0,
    triggerRefresh: () => { }
});

export const useSync = () => useContext(SyncContext);

const POLLING_INTERVAL = 30000; // 30 seconds

export const SyncProvider = ({ children }: { children: React.ReactNode }) => {
    const [refreshSignal, setRefreshSignal] = useState(0);

    const triggerRefresh = () => {
        setRefreshSignal(prev => prev + 1);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            triggerRefresh();
        }, POLLING_INTERVAL);

        return () => clearInterval(interval);
    }, []);

    return (
        <SyncContext.Provider value={{ refreshSignal, triggerRefresh }}>
            {children}
        </SyncContext.Provider>
    );
};
