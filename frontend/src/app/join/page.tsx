"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight, Lock, MessageSquare, Loader2, CheckCircle2 } from 'lucide-react';
import { apiFetch } from '@/lib/apiFetch';

export default function JoinProjectPage() {
    const router = useRouter();
    const [code, setCode] = useState('');
    const [projectId, setProjectId] = useState(''); // For request approval
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [mode, setMode] = useState<'code' | 'request'>('code');

    const handleJoinByCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code) return;
        setLoading(true);
        setError('');
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/join/code`, {
                method: 'POST',
                body: JSON.stringify({ code })
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess(true);
                setTimeout(() => router.push(`/projects/${data.projectId}`), 2000);
            } else {
                setError(data.message || 'Failed to join project');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRequestApproval = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectId) return;
        setLoading(true);
        setError('');
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/join/request`, {
                method: 'POST',
                body: JSON.stringify({ projectId, message })
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess(true);
            } else {
                setError(data.message || 'Failed to submit request');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <div className="max-w-md w-full text-center space-y-6 animate-in zoom-in-95 duration-300">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 size={40} className="text-emerald-500" />
                    </div>
                    <h1 className="text-3xl font-black">
                        {mode === 'code' ? "Successfully Joined!" : "Request Submitted!"}
                    </h1>
                    <p className="text-muted-foreground">
                        {mode === 'code'
                            ? "You are now a member of the project. Redirecting to dashboard..."
                            : "Your request has been sent to the project administrators. You'll be notified once it's approved."}
                    </p>
                    {mode === 'request' && (
                        <button
                            onClick={() => router.push('/projects')}
                            className="w-full bg-foreground text-background py-4 rounded-2xl font-bold hover:opacity-90 transition-all"
                        >
                            Back to Portfolio
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3">
                        <ShieldCheck size={32} className="text-primary" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tight italic uppercase">Join Project</h1>
                    <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Access secure collaboration rooms</p>
                </div>

                <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                    {/* Mode Toggle */}
                    <div className="flex bg-accent/50 p-1 rounded-2xl mb-8">
                        <button
                            onClick={() => setMode('code')}
                            className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${mode === 'code' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Invite Code
                        </button>
                        <button
                            onClick={() => setMode('request')}
                            className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${mode === 'request' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Request Access
                        </button>
                    </div>

                    {error && (
                        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-2xl text-xs font-bold mb-6 animate-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    {mode === 'code' ? (
                        <form onSubmit={handleJoinByCode} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Enter 8-Digit Code</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={e => setCode(e.target.value.toUpperCase())}
                                        placeholder="X1Y2Z3A4"
                                        maxLength={8}
                                        className="w-full bg-background border-2 border-border rounded-2xl pl-12 pr-4 py-4 font-mono text-xl font-black tracking-[0.3em] focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none uppercase placeholder:opacity-30"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !code}
                                className="w-full bg-primary text-primary-foreground py-5 rounded-[1.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:hover:scale-100"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <>Continue <ArrowRight size={20} /></>}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleRequestApproval} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Project ID</label>
                                <input
                                    type="text"
                                    value={projectId}
                                    onChange={e => setProjectId(e.target.value)}
                                    placeholder="Enter Project UUID"
                                    className="w-full bg-background border-2 border-border rounded-2xl px-4 py-4 text-sm font-bold focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Message (Optional)</label>
                                <div className="relative">
                                    <MessageSquare className="absolute left-4 top-4 text-muted-foreground" size={18} />
                                    <textarea
                                        value={message}
                                        onChange={e => setMessage(e.target.value)}
                                        placeholder="Why do you need access?"
                                        rows={3}
                                        className="w-full bg-background border-2 border-border rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !projectId}
                                className="w-full bg-foreground text-background py-5 rounded-[1.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-lg disabled:opacity-50 disabled:hover:scale-100"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : "Submit Request"}
                            </button>
                        </form>
                    )}
                </div>

                <p className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">
                    Secure Project Management Environment v1.0
                </p>
            </div>
        </div>
    );
}
