"use client";

import React, { useState } from 'react';
import { Send, Hash, Users, Shield, Zap, Search, Smile, Paperclip, MoreVertical, Phone, Video, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatPage() {
    const [message, setMessage] = useState("");

    return (
        <div className="flex h-full bg-background/50 overflow-hidden">
            {/* Standardized Header (Managed by Layout or local if needed) */}
            {/* But layout.tsx already has a header. Let's assume we fit inside the main area. */}

            {/* Channels Sidebar */}
            <div className="w-64 border-r border-white/5 bg-black/20 backdrop-blur-3xl hidden md:flex flex-col">
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-primary/60 italic">Communications</h2>
                    <Shield size={12} className="text-primary/40" />
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                    <div>
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 mb-3">CHANNELS</p>
                        <div className="space-y-1">
                            <ChannelItem label="general-ops" active />
                            <ChannelItem label="nexus-core" />
                            <ChannelItem label="resource-relay" />
                        </div>
                    </div>

                    <div>
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 mb-3">OPERATIVES</p>
                        <div className="space-y-1">
                            <UserStatusItem name="Agent Alpha" status="online" />
                            <UserStatusItem name="Nexus Controller" status="busy" />
                            <UserStatusItem name="Sync Node" status="idle" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                {/* Chat Header */}
                <div className="h-14 border-b border-white/5 px-6 flex items-center justify-between bg-black/40 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <Hash size={16} className="text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xs font-black uppercase tracking-tight italic">general-ops</h2>
                            <p className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest leading-none mt-0.5">Primary Operation Channel</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <HeaderAction icon={<Phone size={14} />} />
                        <HeaderAction icon={<Video size={14} />} />
                        <HeaderAction icon={<Search size={14} />} />
                        <div className="w-px h-6 bg-white/5 mx-2" />
                        <HeaderAction icon={<MoreVertical size={14} />} />
                    </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    <Message
                        user="Agent Alpha"
                        time="10:42 AM"
                        content="Nexus core synchronization complete. All modules are reporting green status."
                        initials="AA"
                    />
                    <Message
                        user="System Observer"
                        time="10:45 AM"
                        content="New project initialization detected in Workspace V3."
                        isSystem
                    />
                    <Message
                        user="Nexus Controller"
                        time="10:48 AM"
                        content="Roger that. Allocating resource bandwidth for the new entry. Please stand by for mission parameters."
                        initials="NC"
                        isPrimary
                    />
                </div>

                {/* Input Area */}
                <div className="p-6 bg-linear-to-t from-black/60 to-transparent">
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-2 flex items-center gap-2 focus-within:border-primary/20 transition-all shadow-2xl backdrop-blur-2xl">
                        <button className="p-3 text-muted-foreground/40 hover:text-primary transition-colors hover:bg-white/5 rounded-xl">
                            <Plus size={18} />
                        </button>
                        <input
                            type="text"
                            placeholder="Type a message into the void..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="flex-1 bg-transparent border-none outline-none text-xs font-bold px-2 placeholder:opacity-20 uppercase tracking-widest"
                        />
                        <div className="flex items-center gap-1">
                            <button className="p-2 text-muted-foreground/40 hover:text-primary transition-colors hover:bg-white/5 rounded-lg">
                                <Smile size={16} />
                            </button>
                            <button className="p-2 text-muted-foreground/40 hover:text-primary transition-colors hover:bg-white/5 rounded-lg">
                                <Paperclip size={16} />
                            </button>
                            <button className="bg-primary text-primary-foreground p-3 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20">
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ChannelItem({ label, active = false }: { label: string, active?: boolean }) {
    return (
        <div className={`
            flex items-center gap-2 px-3 py-2 rounded-xl transition-all cursor-pointer group
            ${active ? "bg-primary/10 text-primary border border-primary/20 shadow-inner shadow-primary/5" : "text-muted-foreground/40 hover:bg-white/5 hover:text-foreground"}
        `}>
            <Hash size={12} className={active ? "text-primary" : "text-muted-foreground/20 group-hover:text-primary/40"} />
            <span className={`text-[10px] font-black uppercase tracking-widest ${active ? "italic" : ""}`}>{label}</span>
        </div>
    );
}

function UserStatusItem({ name, status }: { name: string, status: 'online' | 'busy' | 'idle' }) {
    const statusColor = status === 'online' ? 'bg-emerald-500' : status === 'busy' ? 'bg-rose-500' : 'bg-amber-500';
    return (
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer group">
            <div className="relative">
                <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-[8px] font-black text-foreground/40 group-hover:bg-primary/10 group-hover:text-primary transition-colors uppercase">
                    {name[0]}{name.split(' ')[1]?.[0]}
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full border-2 border-black ${statusColor} shadow-[0_0_5px_currentColor]`} />
            </div>
            <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest group-hover:text-foreground transition-colors">{name}</span>
        </div>
    );
}

function HeaderAction({ icon }: { icon: React.ReactNode }) {
    return (
        <button className="p-2 text-muted-foreground/40 hover:text-primary transition-all hover:bg-white/5 rounded-lg active:scale-95">
            {icon}
        </button>
    );
}

function Message({ user, time, content, initials, isPrimary, isSystem }: { user: string, time: string, content: string, initials?: string, isPrimary?: boolean, isSystem?: boolean }) {
    if (isSystem) {
        return (
            <div className="flex items-center gap-4 py-2 opacity-40">
                <div className="h-px flex-1 bg-white/10" />
                <p className="text-[8px] font-black uppercase tracking-[0.2em] italic">{content}</p>
                <div className="h-px flex-1 bg-white/10" />
            </div>
        );
    }

    return (
        <div className="flex gap-4 group">
            <div className={`
                w-10 h-10 rounded-2xl flex items-center justify-center text-[10px] font-black shrink-0 transition-transform group-hover:scale-105 duration-300
                ${isPrimary ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 border border-primary/20" : "bg-white/5 border border-white/5 text-muted-foreground/30"}
            `}>
                {initials}
            </div>
            <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-3">
                    <span className={`text-xs font-black uppercase tracking-widest ${isPrimary ? "text-primary italic" : "text-foreground"}`}>{user}</span>
                    <span className="text-[8px] font-black text-muted-foreground/20 uppercase tracking-widest">{time}</span>
                </div>
                <div className="bg-black/30 border border-white/5 rounded-2xl rounded-tl-none p-4 backdrop-blur-md shadow-xl transition-all hover:bg-black/50 group-hover:border-white/10 flex items-center">
                    <p className="text-sm font-bold text-foreground/80 leading-relaxed uppercase tracking-tight">{content}</p>
                </div>
            </div>
        </div>
    );
}
