"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    Send, Hash, Users, Shield, Zap, Search, Smile, Paperclip,
    MoreVertical, Phone, Video, Plus, Menu, MessageSquare,
    Check, CheckCheck, Clock, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/context/SidebarContext';
import { apiFetch } from '@/lib/apiFetch';
import { useWorkspace } from '@/context/WorkspaceContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import toast from 'react-hot-toast';

interface Message {
    id: string;
    channelId: string;
    senderId: number;
    content: string;
    createdAt: string;
    isOptimistic?: boolean;
    isGrouped?: boolean;
}

interface Channel {
    id: string;
    workspaceId: string;
    name: string;
    type: 'public' | 'private' | 'dm';
}

export default function ChatPage() {
    const [channels, setChannels] = useState<Channel[]>([]);
    const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const { setIsMobileOpen } = useSidebar();
    const { activeWorkspace } = useWorkspace();
    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const currentUser = { id: 1, name: 'Lead Operative' };
    const POLLING_INTERVAL = 3000;
    const [error, setError] = useState<string | null>(null);

    const fetchChannels = async () => {
        if (!activeWorkspace) return;
        setLoading(true);
        setError(null);
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/channels?workspaceId=${activeWorkspace.id}`);
            if (res.ok) {
                const data = await res.json();
                setChannels(data);
                if (data.length > 0) {
                    if (!activeChannel) setActiveChannel(data[0]);
                } else {
                    setLoading(false);
                }
            } else {
                if (res.status === 403) {
                    setError("Membership Required: Unauthorized personnel detected in this communication sector.");
                } else {
                    setError("Failed to initialize secure link. Protocol synchronization failed.");
                }
                setLoading(false);
            }
        } catch (e) {
            console.error("Failed to fetch channels:", e);
            setError("Connection failure: Encryption nodes offline.");
            setLoading(false);
        }
    };

    const fetchMessages = async (isPolling = false) => {
        if (!activeChannel) return;
        try {
            const lastMsg = messages[messages.length - 1];
            const url = `${process.env.NEXT_PUBLIC_API_URL}/api/chat/messages?channelId=${activeChannel.id}${isPolling && lastMsg ? `&lastTimestamp=${lastMsg.createdAt}` : ''}`;

            const res = await apiFetch(url);
            if (res.ok) {
                const newMessages: Message[] = await res.json();
                if (newMessages.length > 0) {
                    setMessages(prev => {
                        const filteredPrev = prev.filter(m => !newMessages.find(nm => nm.content === m.content && m.isOptimistic));
                        const combined = [...filteredPrev, ...newMessages];
                        return combined.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                    });
                }
            }
        } catch (e) {
            console.error("Failed to fetch messages:", e);
        } finally {
            if (!isPolling) setLoading(false);
        }
    };

    useEffect(() => {
        fetchChannels();
    }, [activeWorkspace]);

    useEffect(() => {
        if (activeChannel) {
            setLoading(true);
            setMessages([]);
            fetchMessages();
        }
    }, [activeChannel]);

    useEffect(() => {
        const interval = setInterval(() => {
            fetchMessages(true);
        }, POLLING_INTERVAL);
        return () => clearInterval(interval);
    }, [activeChannel, messages]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!input.trim() || !activeChannel) return;

        const content = input;
        setInput("");
        if (textareaRef.current) textareaRef.current.style.height = 'auto';

        const optimisticMsg: Message = {
            id: Math.random().toString(36).substr(2, 9),
            channelId: activeChannel.id,
            senderId: currentUser.id,
            content,
            createdAt: new Date().toISOString(),
            isOptimistic: true
        };

        setMessages(prev => [...prev, optimisticMsg]);

        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/messages`, {
                method: 'POST',
                body: JSON.stringify({ channelId: activeChannel.id, content })
            });

            if (!res.ok) {
                toast.error("Packet transmission failed");
                setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
            }
        } catch (e) {
            toast.error("Network instability detected");
            setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
        }
    };

    const handleInputResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (loading && !activeChannel) return (
        <div className="flex-1 flex flex-col items-center justify-center bg-background">
            <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-6" />
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] text-center animate-pulse">
                Synchronizing Neural Link...
            </p>
        </div>
    );

    if (error) return (
        <div className="flex-1 flex flex-col items-center justify-center bg-background p-10 text-center">
            <div className="w-20 h-20 rounded-[2rem] bg-destructive/5 border border-destructive/20 flex items-center justify-center mb-8 shadow-2xl shadow-destructive/10">
                <Shield size={32} className="text-destructive" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground mb-3 leading-none">Access Synchronization Breach</h3>
            <p className="text-[11px] text-muted-foreground max-w-sm leading-relaxed mb-8 uppercase font-bold tracking-tight opacity-70">
                {error}
            </p>
            <button
                onClick={() => fetchChannels()}
                className="px-8 py-3 bg-secondary hover:bg-accent text-foreground text-[10px] font-black uppercase tracking-widest rounded-xl border border-border transition-all shadow-sm hover:translate-y-[-1px]"
            >
                Retry Authorization
            </button>
        </div>
    );

    return (
        <div className="bg-background h-full overflow-hidden flex flex-col">
            {/* Professional Header */}
            <header className="h-16 border-b border-border bg-card/80 backdrop-blur-xl px-6 flex items-center justify-between shrink-0 z-50 shadow-sm">
                <div className="flex items-center gap-6">
                    <button onClick={() => setIsMobileOpen(true)} className="lg:hidden text-muted-foreground hover:text-foreground transition-all"><Menu size={18} /></button>
                    <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center shadow-xs">
                            <MessageSquare size={16} className="text-primary" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <h1 className="text-sm font-black text-foreground flex items-center gap-2 leading-none uppercase tracking-tight">
                                Communication Grid
                                {activeWorkspace && <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-lg font-black border border-primary/20 uppercase tracking-widest ml-1">{activeWorkspace.name}</span>}
                            </h1>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">Real-time collaboration node encryption active</p>
                        </div>
                    </div>
                </div>
                <ThemeToggle />
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Channels Sidebar */}
                <aside className="w-64 border-r border-border bg-secondary/20 hidden md:flex flex-col backdrop-blur-sm">
                    <div className="p-5 border-b border-border/50 flex items-center justify-between">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">Sectors</h2>
                        <button className="p-1.5 hover:bg-primary/10 hover:text-primary text-muted-foreground rounded-lg transition-all shadow-xs border border-transparent hover:border-primary/20">
                            <Plus size={14} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
                        <div className="space-y-1">
                            {channels.length > 0 ? channels.map(chan => (
                                <button
                                    key={chan.id}
                                    onClick={() => setActiveChannel(chan)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group text-left shadow-xs border border-transparent",
                                        activeChannel?.id === chan.id
                                            ? "bg-primary text-primary-foreground font-black shadow-lg shadow-primary/20 scale-[1.02]"
                                            : "text-muted-foreground hover:bg-secondary hover:text-foreground hover:border-border/50"
                                    )}
                                >
                                    <Hash size={14} className={cn("shrink-0 transition-transform group-hover:rotate-12", activeChannel?.id === chan.id ? "text-primary-foreground" : "text-muted-foreground/40 group-hover:text-primary/60")} />
                                    <span className="text-[11px] font-black uppercase tracking-tight truncate">{chan.name}</span>
                                </button>
                            )) : (
                                <div className="px-4 py-6 text-center border border-dashed border-border/50 rounded-2xl bg-secondary/10">
                                    <p className="text-[9px] text-muted-foreground/60 font-black uppercase tracking-widest">No Active Sectors</p>
                                </div>
                            )}
                        </div>

                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 mb-4 px-2">Active Entities</p>
                            <div className="space-y-1">
                                <UserItem name="Agent Alpha" online />
                                <UserItem name="Vector Sync" online />
                                <UserItem name="Lead Operative" online isSelf />
                                <UserItem name="Static Observer" />
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Chat Area */}
                <main className="flex-1 flex flex-col min-w-0 bg-background relative">
                    <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px] pointer-events-none" />

                    {activeChannel ? (
                        <>
                            {/* Chat Header */}
                            <header className="h-16 border-b border-border px-8 flex items-center justify-between shrink-0 bg-card/40 backdrop-blur-md">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-primary/60 border border-border shadow-inner">
                                        <Hash size={18} />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <h2 className="text-base font-black text-foreground uppercase tracking-tight leading-none">{activeChannel.name}</h2>
                                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-40 leading-none">
                                            {messages.length} packets synchronized over secure uplink
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <HeaderAction icon={<Search size={16} />} />
                                    <HeaderAction icon={<Users size={16} />} />
                                    <div className="w-px h-6 bg-border/50 mx-1" />
                                    <HeaderAction icon={<MoreVertical size={16} />} />
                                </div>
                            </header>

                            {/* Messages Grid */}
                            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar z-10">
                                <AnimatePresence initial={false}>
                                    {messages.map((msg, idx) => {
                                        const isSelf = msg.senderId === currentUser.id;
                                        const prevMsg = messages[idx - 1];
                                        const isGrouped = prevMsg && prevMsg.senderId === msg.senderId;
                                        const showAvatar = !isGrouped;

                                        return (
                                            <MessageBubble
                                                key={msg.id}
                                                msg={msg}
                                                isSelf={isSelf}
                                                showAvatar={showAvatar}
                                                isGrouped={isGrouped}
                                            />
                                        );
                                    })}
                                </AnimatePresence>
                            </div>

                            {/* Input Area */}
                            <div className="p-6 bg-background/80 backdrop-blur-md z-10 border-t border-border/30">
                                <div className="max-w-5xl mx-auto bg-card border border-border rounded-2xl p-2 flex flex-col shadow-2xl shadow-primary/5 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/5 transition-all">
                                    <textarea
                                        ref={textareaRef}
                                        rows={1}
                                        placeholder={`Secure transmission to #${activeChannel.name}...`}
                                        value={input}
                                        onChange={handleInputResize}
                                        onKeyDown={handleKeyPress}
                                        className="w-full bg-transparent border-none outline-none text-sm text-foreground px-5 py-3 resize-none max-h-60 font-bold placeholder:text-muted-foreground/40 placeholder:uppercase placeholder:text-[10px] placeholder:tracking-[0.2em]"
                                    />
                                    <div className="flex items-center justify-between px-3 pb-2 pt-1">
                                        <div className="flex items-center gap-2">
                                            <InputTool icon={<Plus size={18} />} />
                                            <InputTool icon={<Smile size={18} />} />
                                            <InputTool icon={<Paperclip size={18} />} />
                                        </div>
                                        <button
                                            onClick={handleSendMessage}
                                            disabled={!input.trim()}
                                            className={cn(
                                                "px-6 py-2.5 rounded-xl transition-all flex items-center gap-2",
                                                input.trim()
                                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:translate-y-[-1px] active:translate-y-0"
                                                    : "bg-secondary text-muted-foreground/30 cursor-not-allowed uppercase text-[9px] font-black tracking-widest"
                                            )}
                                        >
                                            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Transmit</span>
                                            <Send size={14} className={cn(input.trim() ? "animate-pulse" : "")} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center space-y-8 z-10">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-[2.5rem] bg-secondary border border-border flex items-center justify-center shadow-inner group overflow-hidden">
                                    <MessageSquare size={40} className="text-muted-foreground/30 group-hover:scale-110 group-hover:text-primary/40 transition-all duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-background border border-border rounded-xl flex items-center justify-center shadow-lg animate-bounce">
                                    <Zap size={14} className="text-primary" />
                                </div>
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-foreground">Awaiting Sector Link</h3>
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-40">Initialize synchronization to begin communication pulse</p>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

function UserItem({ name, online = false, isSelf = false }: { name: string, online?: boolean, isSelf?: boolean }) {
    return (
        <div className="flex items-center gap-4 px-4 py-2.5 rounded-xl hover:bg-secondary/50 transition-all cursor-pointer group border border-transparent hover:border-border/50">
            <div className="relative">
                <div className="w-8 h-8 rounded-xl bg-card border border-border flex items-center justify-center text-[10px] font-black text-muted-foreground transition-all uppercase shadow-xs group-hover:scale-110 group-hover:border-primary/30 group-hover:text-primary">
                    {name.split(' ').map(n => n[0]).join('')}
                </div>
                {online && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)] animate-pulse" />
                )}
            </div>
            <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-black text-muted-foreground uppercase tracking-tight group-hover:text-foreground transition-colors truncate">
                    {name} {isSelf && <span className="text-[8px] text-primary/40 ml-1">(SELF)</span>}
                </span>
            </div>
        </div>
    );
}

function MessageBubble({ msg, isSelf, showAvatar, isGrouped }: { msg: Message, isSelf: boolean, showAvatar: boolean, isGrouped: boolean }) {
    const timeStr = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <motion.div
            initial={{ opacity: 0, x: isSelf ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
                "flex w-full",
                isSelf ? "justify-end" : "justify-start",
                isGrouped ? "mt-1" : "mt-6"
            )}
        >
            <div className={cn(
                "flex max-w-[85%] sm:max-w-[70%]",
                isSelf ? "flex-row-reverse" : "flex-row"
            )}>
                <div className="w-10 shrink-0 flex flex-col items-center">
                    {showAvatar && !isSelf && (
                        <div className="w-10 h-10 rounded-2xl bg-secondary border border-border flex items-center justify-center text-primary/60 shadow-xs transition-transform hover:scale-110 cursor-pointer">
                            <User size={18} />
                        </div>
                    )}
                </div>

                <div className={cn(
                    "flex flex-col mx-4",
                    isSelf ? "items-end" : "items-start"
                )}>
                    {showAvatar && (
                        <div className="flex items-center gap-3 mb-2 px-1">
                            {!isSelf && <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Entity {msg.senderId}</span>}
                            <span className="text-[8px] text-muted-foreground/30 font-black uppercase tracking-widest">{timeStr}</span>
                        </div>
                    )}

                    <div className={cn(
                        "px-5 py-3.5 rounded-2xl text-[13px] font-bold leading-relaxed relative group shadow-sm transition-all",
                        isSelf
                            ? "bg-primary text-primary-foreground rounded-tr-none shadow-primary/10 border border-primary/20"
                            : "bg-card text-foreground rounded-tl-none border border-border/50 hover:border-primary/20"
                    )}>
                        {msg.content}

                        {isSelf && !isGrouped && (
                            <div className="absolute right-0 top-full pt-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                                {msg.isOptimistic ? (
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-primary/40">Syncing</span>
                                        <Clock size={10} className="text-primary/40 animate-spin" />
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-primary/40">Transmitted</span>
                                        <CheckCheck size={10} className="text-primary/60" />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function HeaderAction({ icon }: { icon: React.ReactNode }) {
    return (
        <button className="p-2.5 text-muted-foreground hover:text-primary transition-all hover:bg-primary/5 rounded-xl border border-transparent hover:border-primary/20 shadow-xs">
            {icon}
        </button>
    );
}

function InputTool({ icon }: { icon: React.ReactNode }) {
    return (
        <button className="p-2.5 text-muted-foreground hover:text-foreground transition-all hover:bg-secondary rounded-xl bg-secondary/30 border border-border/50 shadow-inner">
            {icon}
        </button>
    );
}
