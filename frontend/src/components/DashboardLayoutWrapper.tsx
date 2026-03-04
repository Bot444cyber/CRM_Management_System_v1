"use client";

import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import ClickSpark from '@/components/ClickSpark';

export default function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="flex flex-col md:flex-row h-screen bg-background text-foreground overflow-hidden relative z-50">
            {/* Mobile Top Navigation */}
            <div className="md:hidden flex items-center justify-between bg-card border-b border-border px-4 py-3 z-50">
                <div className="font-bold text-xl flex items-center gap-2">
                    <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center text-background font-bold text-sm">
                        SE
                    </div>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 focus:outline-none hover:text-muted-foreground transition-colors"
                    aria-label="Toggle mobile menu"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                    onClick={closeMobileMenu}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed md:relative top-0 bottom-0 left-0 z-50 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                    } transition-transform duration-300 ease-in-out md:flex md:h-screen`}
            >
                <div className="h-full bg-background md:bg-transparent overflow-y-auto md:overflow-hidden pt-[60px] md:pt-0 border-r border-border shadow-2xl md:shadow-none">
                    <Sidebar onClose={closeMobileMenu} />
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-background text-foreground overflow-x-hidden">
                <ClickSpark sparkColor="currentColor" sparkSize={10} sparkRadius={22} sparkCount={10} duration={500} easing="ease-out" extraScale={1.2}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-6 md:py-10">
                        {children}
                    </div>
                </ClickSpark>
            </main>
        </div>
    );
}
