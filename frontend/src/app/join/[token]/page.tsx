"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { apiFetch } from '@/lib/apiFetch';

export default function JoinByLinkPage() {
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Joining project...');

    useEffect(() => {
        const join = async () => {
            if (!token) return;
            try {
                const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/join/link/${token}`, {
                    method: 'POST'
                });
                const data = await res.json();
                if (res.ok) {
                    setStatus('success');
                    setMessage('Successfully joined project!');
                    setTimeout(() => router.push(`/projects/${data.projectId}`), 2000);
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Failed to join project');
                }
            } catch (err) {
                setStatus('error');
                setMessage('An error occurred. Please try again.');
            }
        };
        join();
    }, [token, router]);

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
            <div className="max-w-md w-full space-y-6">
                {status === 'loading' && (
                    <>
                        <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto" />
                        <h1 className="text-2xl font-black italic uppercase tracking-tight">Verifying Invitation</h1>
                        <p className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest">{message}</p>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in">
                            <CheckCircle2 size={40} className="text-emerald-500" />
                        </div>
                        <h1 className="text-3xl font-black italic uppercase tracking-tight">Access Granted</h1>
                        <p className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest">{message}</p>
                        <p className="text-xs text-muted-foreground pt-4 animate-pulse">Redirecting to dashboard...</p>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4 scale-in duration-300">
                            <ShieldAlert size={40} className="text-rose-500" />
                        </div>
                        <h1 className="text-3xl font-black italic uppercase tracking-tight text-rose-500">Access Denied</h1>
                        <p className="text-sm font-bold text-muted-foreground">{message}</p>
                        <button
                            onClick={() => router.push('/projects')}
                            className="w-full mt-8 bg-foreground text-background py-4 rounded-2xl font-bold hover:opacity-90 transition-all"
                        >
                            Return to Portfolio
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
