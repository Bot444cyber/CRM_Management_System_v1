import React from 'react';
import DashboardLayoutWrapper from '@/components/DashboardLayoutWrapper';
import { InventoryProvider } from '@/context/InventoryContext';
import AuthGuard from '@/components/AuthGuard';
import ProductChatbot from '@/components/inventory/ProductChatbot';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard>
            <InventoryProvider>
                <DashboardLayoutWrapper>
                    {children}
                    <ProductChatbot />
                </DashboardLayoutWrapper>
            </InventoryProvider>
        </AuthGuard>
    );
}
