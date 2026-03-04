"use client";

import React, { useState } from 'react';
import { ShieldAlert, Trash2, AlertTriangle, CheckCircle2, ChevronRight, Settings as SettingsIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/apiFetch';

export default function SettingsPage() {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmText, setConfirmText] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleWipeData = async () => {
        if (confirmText !== "DELETE MY DATA") {
            setError("Please type exactly 'DELETE MY DATA' to confirm.");
            return;
        }

        setIsDeleting(true);
        setError(null);

        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/settings/wipe-data`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ confirmation: confirmText })
            });

            if (res.ok) {
                // Force a hard reload to clear all React Context memory and re-fetch empty state
                window.location.href = '/dashboard';
            } else {
                const data = await res.json();
                setError(data.message || "Failed to wipe data.");
                setIsDeleting(false);
            }
        } catch (err) {
            console.error(err);
            setError("A network error occurred.");
            setIsDeleting(false);
        }
    };

    return (
        <div className="animate-in fade-in duration-500 max-w-4xl mx-auto">
            <div className="mb-10">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
                    <SettingsIcon className="text-muted-foreground" />
                    Workspace Settings
                </h1>
                <p className="text-muted-foreground text-sm mt-2">Manage your account preferences and data security.</p>
            </div>

            {/* General Settings Placeholder */}
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 mb-8">
                <h2 className="text-lg font-bold text-foreground mb-4">Profile Information</h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border opacity-50 pointer-events-none">
                        <div>
                            <p className="text-sm font-bold text-foreground">Email Address</p>
                            <p className="text-xs text-muted-foreground mt-1">Managed via authentication provider</p>
                        </div>
                        <ChevronRight size={16} className="text-muted-foreground/50" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border opacity-50 pointer-events-none">
                        <div>
                            <p className="text-sm font-bold text-foreground">Password Details</p>
                            <p className="text-xs text-muted-foreground mt-1">Update your login credentials</p>
                        </div>
                        <ChevronRight size={16} className="text-muted-foreground/50" />
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row gap-6 md:items-start justify-between">
                    <div className="max-w-xl">
                        <h2 className="text-xl font-bold text-rose-500 flex items-center gap-2 mb-2">
                            <ShieldAlert size={22} />
                            Danger Zone
                        </h2>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                            Permanently delete all workspace data. This includes all <strong className="text-foreground">Inventories, Products, Customers, Sales Logs, and Analytics</strong>.
                            Your user account credentials will remain active, allowing you to start fresh.
                        </p>
                        <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider bg-rose-500/10 px-3 py-1.5 rounded-lg w-fit">
                            <AlertTriangle size={14} /> Warning: This action cannot be undone.
                        </div>
                    </div>

                    <button
                        onClick={() => setShowConfirm(true)}
                        className="shrink-0 flex items-center gap-2 px-6 py-3 bg-rose-600/20 hover:bg-rose-600 text-rose-500 hover:text-white border border-rose-500/30 hover:border-rose-600 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(244,63,94,0.1)] hover:shadow-[0_0_30px_rgba(244,63,94,0.3)]"
                    >
                        <Trash2 size={18} />
                        Wipe Workspace Data
                    </button>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => !isDeleting && setShowConfirm(false)} />
                    <div className="relative bg-card border border-rose-500/30 rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-6 mx-auto">
                            <AlertTriangle size={24} />
                        </div>

                        <h3 className="text-xl font-bold text-foreground text-center mb-2">Are you absolutely sure?</h3>
                        <p className="text-sm text-muted-foreground text-center mb-6">
                            This action will permanently purge all databases linked to your account.
                        </p>

                        <div className="mb-6">
                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                                Type <span className="text-rose-500 select-all">DELETE MY DATA</span> to confirm
                            </label>
                            <input
                                type="text"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground text-center font-mono focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all outline-none"
                                placeholder="DELETE MY DATA"
                                disabled={isDeleting}
                            />
                            {error && <p className="text-rose-500 text-xs mt-2 text-center font-medium">{error}</p>}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-3 rounded-xl border border-border text-muted-foreground font-bold hover:bg-muted transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleWipeData}
                                disabled={isDeleting || confirmText !== "DELETE MY DATA"}
                                className="flex-1 px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isDeleting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>Purge Data</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
