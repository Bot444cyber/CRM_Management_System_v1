"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
    Send, Shield, Zap, Search, Plus, MessageSquare,
    User, Briefcase, BarChart3, Globe2,
    SmilePlus, CheckCheck, Clock, MoreHorizontal, ChevronLeft, Menu
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
    senderName?: string;
    content: string;
    createdAt: string;
    isOptimistic?: boolean;
    isSeen?: boolean;
}

interface Channel {
    id: string;
    workspaceId: string;
    name: string;
    type: 'public' | 'private' | 'dm';
    otherMemberName?: string;
    otherMemberEmail?: string;
    otherMemberReadAt?: string;
    lastMessage?: string;
    lastMessageTime?: string;
    unreadCount?: number;
    avatar?: string;
}

interface WorkspaceMember {
    id: number;
    name: string | null;
    email: string;
    role: string;
    isOnline: boolean;
}

type UserRole = 'Manager' | 'Developer' | 'Customer' | 'Member';

const ROLE_STYLES = {
    Manager: 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-sm shadow-rose-500/5',
    Developer: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20 shadow-sm shadow-zinc-500/5',
    Customer: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-sm shadow-emerald-500/5',
    Member: 'bg-zinc-800 text-zinc-400 border-zinc-700 shadow-sm',
};

function formatName(name: string | null, email: string) {
    if (name && name.trim()) return name;
    // Fallback: Prettify email prefix
    const prefix = email.split('@')[0];
    return prefix
        .split(/[._-]/)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ');
}

export default function ChatPage() {
    const [channels, setChannels] = useState<Channel[]>([]);
    const [members, setMembers] = useState<WorkspaceMember[]>([]);
    const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'channels' | 'dms'>('channels');
    const [isMobileConversationOpen, setIsMobileConversationOpen] = useState(false);
    const { setIsMobileOpen } = useSidebar();
    const { activeWorkspace } = useWorkspace();

    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const [currentUser, setCurrentUser] = useState<any>({ id: 0, name: 'User' });
    const POLLING_INTERVAL = 2000;

    const [error, setError] = useState<string | null>(null);

    const fetchMe = async () => {
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`);
            if (res.ok) {
                const data = await res.json();
                if (data.user) {
                    setCurrentUser({
                        id: data.user.userId,
                        name: formatName(data.user.name, data.user.email),
                        email: data.user.email
                    });
                }
            }
        } catch (e) {
            console.error("Failed to fetch profile:", e);
        }
    };

    const fetchWorkspaceMembers = async () => {
        if (!activeWorkspace) return;
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/members?workspaceId=${activeWorkspace.id}`);
            if (res.ok) {
                const data = await res.json();
                const memberMap = new Map();
                data.forEach((m: any) => memberMap.set(m.id, m));
                setMembers(Array.from(memberMap.values()));
            }
        } catch (e) {
            console.error("Failed to fetch workspace members:", e);
        }
    };

    const fetchChannels = async () => {
        if (!activeWorkspace) return;
        setLoading(true);
        setError(null);
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/channels?workspaceId=${activeWorkspace.id}`);
            if (res.ok) {
                const data = await res.json();

                const enrichedData = data.map((c: any) => {
                    let label = c.name;
                    if (c.type === 'dm' && c.otherMemberName) {
                        label = c.otherMemberName;
                    }
                    return {
                        ...c,
                        name: label,
                        otherMemberEmail: c.otherMemberEmail, // Ensure email is passed
                        lastMessage: c.lastMessage || 'No messages yet...',
                        lastMessageTime: c.lastMessageTime || 'Just now',
                        unreadCount: c.unreadCount || 0,
                        avatar: c.type === 'dm' ? undefined : `https://api.dicebear.com/7.x/initials/svg?seed=${label}`
                    };
                });

                const channelMap = new Map();
                enrichedData.forEach((c: any) => channelMap.set(c.id, c));
                setChannels(Array.from(channelMap.values()));
                if (enrichedData.length > 0 && !activeChannel) {
                    const general = enrichedData.find((c: any) => c.name.toLowerCase() === 'general');
                    setActiveChannel(general || enrichedData[0]);
                }
            } else if (res.status === 403) {
                setError("No Permission: This channel is restricted.");
            } else {
                setError("Failed to load channels.");
            }
        } catch (e) {
            setError("Connection failed: Server is offline.");
        } finally {
            setLoading(false);
        }
    };

    const messagesRef = useRef<Message[]>([]);
    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    const fetchMessages = async (isPolling = false) => {
        if (!activeChannel) return;
        try {
            const currentMessages = messagesRef.current;
            const lastMsg = currentMessages[currentMessages.length - 1];

            const params = new URLSearchParams({ channelId: activeChannel.id });
            if (isPolling && lastMsg) {
                params.append('lastTimestamp', lastMsg.createdAt);
            }

            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/messages?${params.toString()}`);
            if (res.ok) {
                const newMessages: Message[] = await res.json();
                if (newMessages.length > 0) {
                    setMessages(prev => {
                        // Remove optimistic messages that are now fulfilled by the server
                        const filteredPrev = prev.filter(m => !newMessages.find(nm => nm.content === m.content && m.isOptimistic));

                        // Use a Map to ensure each message ID is unique
                        const messageMap = new Map();
                        [...filteredPrev, ...newMessages].forEach(m => messageMap.set(m.id, m));

                        const combined = Array.from(messageMap.values());
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
        if (activeWorkspace) {
            fetchChannels();
            fetchWorkspaceMembers();
            setActiveChannel(null);
        }
    }, [activeWorkspace]);

    useEffect(() => {
        fetchMe();
    }, []);

    useEffect(() => {
        if (activeChannel) {
            setLoading(true);
            setMessages([]);
            fetchMessages();
        }
    }, [activeChannel]);

    useEffect(() => {
        const msgInterval = setInterval(() => fetchMessages(true), POLLING_INTERVAL);
        const memberInterval = setInterval(() => fetchWorkspaceMembers(), 10000);

        // Responsive reset on window resize
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMobileConversationOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            clearInterval(msgInterval);
            clearInterval(memberInterval);
            window.removeEventListener('resize', handleResize);
        };
    }, [activeChannel]);

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
            id: `opt-${Math.random().toString(36).substr(2, 9)}`,
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
                toast.error("Message failed to send");
                setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
            } else {
                fetchMessages(true);
            }
        } catch (e) {
            toast.error("Connection error");
            setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
        }
    };

    const startDirectMessage = async (memberId: number, memberEmail: string) => {
        if (memberId === currentUser.id) return;
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/dm`, {
                method: 'POST',
                body: JSON.stringify({ workspaceId: activeWorkspace?.id, targetUserId: memberId })
            });
            if (res.ok) {
                const data = await res.json();
                await fetchChannels();
                setActiveChannel({
                    id: data.id,
                    workspaceId: activeWorkspace?.id || '',
                    name: formatName(null, memberEmail),
                    otherMemberEmail: memberEmail,
                    type: 'dm',
                    avatar: undefined
                });
            }
        } catch (e) {
            toast.error("Failed to start direct message");
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (loading && !activeChannel) return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-background transition-colors duration-500">
            <div className="relative mb-8">
                <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Zap size={24} className="text-primary animate-pulse" />
                </div>
            </div>
            <div className="space-y-2 text-center">
                <h3 className="text-xs font-black text-foreground uppercase tracking-[0.4em] animate-pulse">
                    Loading Chat...
                </h3>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-40">
                    Connecting...
                </p>
            </div>
        </div>
    );

    if (error) return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-background p-10 text-center transition-colors duration-500">
            <div className="w-20 h-20 rounded-[2.5rem] bg-destructive/5 border border-destructive/20 flex items-center justify-center mb-8 shadow-2xl shadow-destructive/10">
                <Shield size={32} className="text-destructive" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground mb-3 leading-none">Access Denied</h3>
            <p className="text-[11px] text-muted-foreground max-w-sm leading-relaxed mb-8 uppercase font-bold tracking-tight opacity-70">
                {error}
            </p>
            <button
                onClick={() => fetchChannels()}
                className="px-10 py-4 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
            >
                Retry
            </button>
        </div>
    );

    return (
        <div className="bg-background h-dvh md:h-full overflow-hidden flex transition-colors duration-500">
            {/* Middle Sidebar: Chat List */}
            <aside className={cn(
                "w-full md:w-80 border-r border-border bg-background flex flex-col shrink-0 z-40 bg-linear-to-b from-background to-accent/20 transition-colors duration-500",
                isMobileConversationOpen ? "hidden md:flex" : "flex"
            )}>
                <div className="p-6 pb-2">
                    <div className="flex items-center gap-3 mb-6">
                        <button
                            onClick={() => setIsMobileOpen(true)}
                            className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-primary transition-all"
                        >
                            <Menu size={20} />
                        </button>
                        <h2 className="text-2xl font-black text-foreground tracking-tight flex-1">Messages</h2>
                        <button className="w-8 h-8 rounded-full bg-accent/50 border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all shadow-sm shrink-0">
                            <Plus size={16} />
                        </button>
                    </div>
                    {/* Search Bar */}
                    <div className="relative mb-6">
                        <input
                            type="text"
                            placeholder="Search channels..."
                            className="w-full bg-accent/20 border border-border/80 rounded-xl py-2.5 pl-9 pr-4 text-xs font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all focus:bg-accent/40 shadow-inner"
                        />
                    </div>
                    {/* Tabs */}
                    <div className="flex gap-2 bg-accent/30 p-1 rounded-xl border border-border/50">
                        <button
                            onClick={() => setActiveTab('channels')}
                            className={cn(
                                "flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all border border-transparent shadow-xs active:scale-95",
                                activeTab === 'channels' ? "bg-card text-foreground border-border shadow-sm ring-1 ring-border/5" : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
                            )}
                        >
                            Channels
                        </button>
                        <button
                            onClick={() => setActiveTab('dms')}
                            className={cn(
                                "flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all border border-transparent",
                                activeTab === 'dms' ? "bg-card text-foreground border-border shadow-sm ring-1 ring-border/5" : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
                            )}
                        >
                            Direct
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-3 pb-6 custom-scrollbar">
                    {channels
                        .filter(c => c.type !== 'dm')
                        .map(chan => (
                            <ChatListItem
                                key={chan.id}
                                channel={chan}
                                active={activeChannel?.id === chan.id}
                                onClick={() => {
                                    setActiveChannel(chan);
                                    setIsMobileConversationOpen(true);
                                }}
                            />
                        ))}
                    <div className="space-y-1 mt-1">
                        <p className="px-3 mb-3 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2 opacity-60">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                            Active Members
                        </p>
                        {members
                            .filter(m => m.id !== currentUser.id)
                            .map(member => {
                                const dmChannel = channels.find(c => c.type === 'dm' && c.otherMemberEmail === member.email);
                                return (
                                    <MemberItem
                                        key={member.id}
                                        member={member}
                                        active={activeChannel?.type === 'dm' && activeChannel.otherMemberEmail === member.email}
                                        onClick={() => {
                                            startDirectMessage(member.id, member.email);
                                            setIsMobileConversationOpen(true);
                                        }}
                                        lastMessage={dmChannel?.lastMessage}
                                        lastTime={dmChannel?.lastMessageTime}
                                        unread={dmChannel?.unreadCount}
                                    />
                                );
                            })}
                    </div>
                    <div className="px-5 py-12 text-center opacity-30">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Finding channels...</p>
                    </div>
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className={cn(
                "flex-1 flex flex-col min-w-0 bg-background relative transition-colors duration-500 h-full",
                isMobileConversationOpen ? "flex" : "hidden md:flex"
            )}>
                <div className="absolute inset-0 bg-grid-zinc-900/[0.02] dark:bg-grid-white/[0.01] pointer-events-none" />

                {activeChannel ? (
                    <>
                        {/* Glassy Chat Header */}
                        <header className="h-16 border-b border-border px-4 md:px-8 flex items-center shrink-0 bg-background/80 backdrop-blur-xl z-30 transition-colors duration-500">
                            <div className="flex items-center gap-3 md:gap-4 overflow-hidden flex-1">
                                <button
                                    onClick={() => setIsMobileConversationOpen(false)}
                                    className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground transition-all"
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                <div className="relative shrink-0">
                                    <div className="w-10 h-10 rounded-2xl bg-accent border border-border flex items-center justify-center text-muted-foreground overflow-hidden shadow-inner group-hover:scale-105 transition-transform">
                                        {activeChannel.avatar ? (
                                            <img src={activeChannel.avatar} alt={activeChannel.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={20} />
                                        )}
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse" />
                                </div>

                                <div className="flex flex-col gap-0.5 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-xs md:text-sm font-black text-foreground uppercase tracking-tight truncate max-w-[180px] sm:max-w-none">
                                            {activeChannel.type === 'dm' && activeChannel.otherMemberEmail ? activeChannel.otherMemberEmail : activeChannel.name}
                                        </h2>
                                        <div className="shrink-0">
                                            <RoleBadge role={activeChannel.type === 'dm' ? 'Developer' : 'Manager'} />
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-emerald-500/70 font-black uppercase tracking-widest leading-none flex items-center gap-1.5">
                                        <span className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                                        Member Online
                                    </p>
                                </div>
                            </div>
                        </header>

                        {/* Messages Area */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 custom-scrollbar bg-background scroll-smooth transition-colors duration-500">
                            <div className="max-w-4xl mx-auto space-y-4">
                                <AnimatePresence initial={false}>
                                    {messages.map((msg, idx) => (
                                        <MessageBubble
                                            key={msg.id}
                                            msg={msg}
                                            isSelf={msg.senderId === currentUser.id}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Enhanced Input Area */}
                        <div className="p-6 bg-background z-10 transition-colors duration-500">
                            <div className="max-w-4xl mx-auto flex items-end gap-3 bg-accent/30 border border-border rounded-3xl p-2 pr-2.5 shadow-2xl transition-all focus-within:border-primary/30 focus-within:bg-accent/50 focus-within:ring-4 focus-within:ring-primary/5">
                                <div className="flex items-center gap-1 pb-1 md:pb-1.5 pl-2">
                                    <InputTool icon={<SmilePlus size={20} />} />
                                </div>
                                <textarea
                                    ref={textareaRef}
                                    rows={1}
                                    placeholder={`Message ${activeChannel.name}...`}
                                    value={input}
                                    onChange={(e) => {
                                        setInput(e.target.value);
                                        e.target.style.height = 'auto';
                                        e.target.style.height = `${e.target.scrollHeight}px`;
                                    }}
                                    onKeyDown={handleKeyPress}
                                    className="flex-1 bg-transparent border-none outline-none text-[14px] text-foreground px-1 py-3 resize-none max-h-40 font-medium placeholder:text-muted-foreground"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!input.trim()}
                                    className={cn(
                                        "w-11 h-11 mb-0.5 rounded-2xl flex items-center justify-center transition-all shrink-0 shadow-lg",
                                        input.trim()
                                            ? "bg-primary text-primary-foreground shadow-primary/30 hover:scale-105 hover:opacity-90 active:scale-95"
                                            : "bg-accent text-muted-foreground/30 cursor-not-allowed border border-border/50"
                                    )}
                                >
                                    <Send size={18} className={input.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background transition-colors duration-500">
                        <div className="w-24 h-24 rounded-[2.5rem] bg-accent border border-border flex items-center justify-center mb-8 shadow-inner group overflow-hidden">
                            <MessageSquare size={40} className="text-muted-foreground/20 group-hover:text-primary transition-all duration-700 group-hover:scale-110" />
                        </div>
                        <h3 className="text-lg font-black text-foreground uppercase tracking-[0.3em] mb-2 opacity-80">Messaging</h3>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] text-center max-w-xs leading-relaxed opacity-60">
                            No channel selected. Choose a conversation to start messaging.
                        </p>
                    </div>
                )}
            </main>
        </div >
    );
}

function NavIcon({ icon, active = false }: { icon: React.ReactNode; active?: boolean }) {
    return (
        <button className={cn(
            "w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 relative group",
            active ? "bg-card text-primary shadow-md ring-1 ring-border" : "text-muted-foreground hover:text-foreground hover:bg-accent"
        )}>
            {icon}
            {active && <div className="absolute left-0 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_8px_rgba(var(--primary-rgb),0.6)]" />}
            <div className="absolute left-full ml-4 px-3 py-1.5 bg-card text-[10px] font-black text-foreground rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap z-100 border border-border shadow-2xl uppercase tracking-widest">
                Chat Settings
            </div>
        </button>
    );
}

function ChatListItem({ channel, active, onClick }: { channel: Channel; active: boolean; onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 border border-transparent mb-1 group px-4",
                active ? "bg-primary/10 border-primary/20 shadow-xs" : "hover:bg-accent/40"
            )}
        >
            <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-accent border border-border flex items-center justify-center text-muted-foreground group-hover:scale-105 transition-transform duration-300 overflow-hidden bg-cover bg-center" style={channel.avatar ? { backgroundImage: `url(${channel.avatar})` } : {}}>
                    {!channel.avatar && <MessageSquare size={18} className="group-hover:text-primary transition-colors" />}
                </div>
                {active && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background shadow-sm shadow-emerald-500/40" />}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <h3 className={cn("text-xs font-black uppercase tracking-tight truncate border-b-2 border-transparent transition-all", active ? "text-primary border-primary/20" : "text-foreground group-hover:text-primary")}>
                        {channel.name}
                    </h3>
                    <span className="text-[9px] font-black text-zinc-700 whitespace-nowrap ml-2 uppercase tracking-tighter tabular-nums">
                        {channel.lastMessageTime}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <p className="text-[11px] text-muted-foreground font-medium truncate italic leading-none pr-4 group-hover:text-foreground transition-colors opacity-60 group-hover:opacity-100">
                        {channel.lastMessage}
                    </p>
                    {channel.unreadCount ? (
                        <span className="w-5 h-5 rounded-full bg-primary text-[9px] font-black text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/40 scale-100 hover:scale-110 transition-transform">
                            {channel.unreadCount}
                        </span>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

function MemberItem({ member, active, onClick, lastMessage, lastTime, unread }: { member: WorkspaceMember; active: boolean; onClick: () => void; lastMessage?: string; lastTime?: string; unread?: number }) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 border border-transparent mb-1 group",
                active ? "bg-primary/10 border-primary/20 shadow-xs" : "hover:bg-accent/40"
            )}
        >
            <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-accent border border-border flex items-center justify-center text-muted-foreground font-black text-[10px] uppercase group-hover:bg-accent/80 transition-colors">
                    {member.email.charAt(0)}
                </div>
                {member.isOnline && <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background shadow-sm shadow-emerald-500/40 animate-pulse" />}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <h3 className={cn("text-xs font-black uppercase tracking-tight truncate", active ? "text-primary" : "text-foreground group-hover:text-primary")}>
                        {formatName(member.name, member.email)}
                    </h3>
                    <span className="text-[9px] font-black text-zinc-700 whitespace-nowrap ml-2 uppercase tracking-tighter">
                        {lastTime || ''}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <p className="text-[11px] text-muted-foreground font-medium truncate italic leading-none pr-4 opacity-70 group-hover:opacity-100">
                        {lastMessage || member.email}
                    </p>
                    {unread ? (
                        <span className="w-5 h-5 rounded-full bg-primary text-[9px] font-black text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/40">
                            {unread}
                        </span>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

function MessageBubble({ msg, isSelf }: { msg: Message; isSelf: boolean }) {
    const timeStr = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className={cn(
                "flex w-full group",
                isSelf ? "justify-end" : "justify-start"
            )}
        >
            <div className={cn(
                "max-w-[85%] sm:max-w-[65%] relative px-5 py-4 rounded-[1.25rem] shadow-sm border transition-all duration-500",
                isSelf
                    ? "bg-linear-to-br from-zinc-800 to-zinc-950 dark:from-zinc-100 dark:to-zinc-300 text-white dark:text-zinc-950 rounded-tr-none border-zinc-700/50 dark:border-zinc-100/20 shadow-lg shadow-zinc-900/20"
                    : "bg-zinc-100/80 dark:bg-zinc-900/80 text-zinc-950 dark:text-zinc-100 rounded-tl-none border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm backdrop-blur-md"
            )}>
                {!isSelf && msg.senderName && (
                    <p className="text-[9px] font-black text-primary uppercase tracking-[0.15em] mb-1.5 opacity-90 border-b border-border/50 pb-1 w-fit">
                        {msg.senderName}
                    </p>
                )}
                <p className="text-[13px] font-medium leading-relaxed mb-3 pr-2 select-text">
                    {msg.content}
                </p>
                <div className={cn(
                    "flex items-center justify-end gap-2 h-3",
                    isSelf ? "text-zinc-400/50 dark:text-zinc-500/50" : "text-muted-foreground"
                )}>
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-80 tabular-nums">{timeStr}</span>
                    {isSelf && (
                        msg.isOptimistic ? (
                            <Clock size={10} className="animate-spin opacity-50" />
                        ) : (
                            <div className="flex items-center -space-x-1.5">
                                <CheckCheck size={13} className={cn("transition-all duration-700", msg.isSeen ? "text-primary/70 dark:text-zinc-400 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" : "text-muted-foreground/30")} />
                            </div>
                        )
                    )}
                </div>
            </div>
        </motion.div>
    );
}

function RoleBadge({ role }: { role: UserRole }) {
    return (
        <span className={cn(
            "text-[8px] font-black uppercase tracking-[0.2em] px-3 py-0.5 rounded-full border shadow-sm backdrop-blur-md transition-all hover:scale-105",
            ROLE_STYLES[role] || ROLE_STYLES.Member
        )}>
            {role}
        </span>
    );
}


function InputTool({ icon }: { icon: React.ReactNode }) {
    return (
        <button className="p-3 text-muted-foreground hover:text-primary hover:bg-accent/80 rounded-full transition-all active:scale-90 group relative shadow-inner">
            {icon}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-2.5 py-1.5 bg-zinc-900 text-[8px] font-black text-zinc-300 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 border border-zinc-800 whitespace-nowrap uppercase tracking-widest shadow-2xl backdrop-blur-xl">
                Emojis
            </div>
        </button>
    );
}
