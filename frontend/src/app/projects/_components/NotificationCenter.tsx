"use client";

import React, { useState, useEffect } from 'react';
import { Bell, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/apiFetch';

export default function NotificationCenter() {
    const [reminders, setReminders] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const fetchReminders = async () => {
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/reminders`);
            if (res.ok) {
                const data = await res.json();
                setReminders(data || []);
            }
        } catch (e) {
            console.error('Failed to fetch reminders:', e);
        }
    };

    useEffect(() => {
        fetchReminders();
        const interval = setInterval(fetchReminders, 15000);
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/reminders/${id}/read`, {
                method: 'PUT'
            });
            fetchReminders();
        } catch (e) {
            console.error('Failed to mark reminder as read:', e);
        }
    };

    const unreadCount = reminders.filter(r => !r.isRead).length;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 hover:bg-accent rounded-xl transition-all group"
            >
                <Bell
                    size={20}
                    className={cn(
                        "transition-all",
                        unreadCount > 0 ? "text-primary animate-pulse scale-110" : "text-muted-foreground/60 group-hover:text-foreground"
                    )}
                />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-card shadow-lg animate-in zoom-in">
                        {unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-3 w-80 bg-card/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl z-50 overflow-hidden"
                        >
                            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                                <h3 className="text-[10px] font-bold uppercase tracking-wider text-foreground/80">Notifications</h3>
                                <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">{unreadCount} New</span>
                            </div>

                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                {reminders.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                                            <CheckCircle size={28} />
                                        </div>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">All caught up!</p>
                                        <p className="text-xs text-muted-foreground/40 font-medium mt-1">You have no unread notifications.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-white/5">
                                        {reminders.map((r) => (
                                            <div
                                                key={r.id}
                                                className={cn(
                                                    "p-5 transition-all hover:bg-white/5 relative group",
                                                    !r.isRead ? 'bg-primary/5' : ''
                                                )}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={cn(
                                                        "mt-1 shrink-0 p-2 rounded-lg border",
                                                        !r.isRead ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-white/5 border-white/5 text-muted-foreground'
                                                    )}>
                                                        <Clock size={14} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={cn(
                                                            "text-xs font-black tracking-tight mb-1",
                                                            !r.isRead ? 'text-foreground' : 'text-muted-foreground'
                                                        )}>{r.title}</p>
                                                        <p className="text-[11px] text-muted-foreground/80 leading-relaxed line-clamp-2 font-medium">{r.message}</p>
                                                        <div className="flex items-center justify-between mt-3">
                                                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40">{new Date(r.createdAt || Date.now()).toLocaleDateString()}</span>
                                                            {!r.isRead && (
                                                                <button
                                                                    onClick={() => markAsRead(r.id)}
                                                                    className="text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary/80 transition-colors"
                                                                >
                                                                    Mark as Read
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-white/5 bg-white/5 text-center">
                                <button className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 hover:text-primary transition-all">Clear All</button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
