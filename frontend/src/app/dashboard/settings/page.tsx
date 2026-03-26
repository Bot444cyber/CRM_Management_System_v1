"use client";

import React, { useState } from 'react';
import {
    User, Lock, Shield, Smartphone, Globe, Bell,
    Save, CheckCircle2, ChevronRight, Key, Laptop,
    Image as ImageIcon, RefreshCw, X, AlertCircle, HelpCircle, ExternalLink, QrCode,
    ShieldAlert, Trash2, AlertTriangle, Settings as SettingsIcon
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/apiFetch';

export default function SettingsPage() {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmText, setConfirmText] = useState("");
    const [error, setError] = useState<string | null>(null);

    const [greenApiInstanceId, setGreenApiInstanceId] = useState("");
    const [greenApiToken, setGreenApiToken] = useState("");
    const [isSavingGreenApi, setIsSavingGreenApi] = useState(false);
    const [greenApiSuccess, setGreenApiSuccess] = useState(false);
    const [showGreenApiHelp, setShowGreenApiHelp] = useState(false);

    React.useEffect(() => {
        const fetchGreenAPI = async () => {
            try {
                const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings/green-api`, {
                    method: 'GET',
                });
                if (res.ok) {
                    const data = await res.json();
                    setGreenApiInstanceId(data.greenApiInstanceId || "");
                    setGreenApiToken(data.greenApiToken || "");
                }
            } catch (err) {
                console.error("Failed to fetch GreenAPI settings:", err);
            }
        };
        fetchGreenAPI();
    }, []);

    const handleSaveGreenApi = async () => {
        setIsSavingGreenApi(true);
        setGreenApiSuccess(false);
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings/green-api`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ greenApiInstanceId, greenApiToken })
            });
            if (res.ok) {
                setGreenApiSuccess(true);
                setTimeout(() => setGreenApiSuccess(false), 3000);
            }
        } catch (err) {
            console.error("Error saving GreenAPI settings:", err);
        } finally {
            setIsSavingGreenApi(false);
        }
    };

    const handleWipeData = async () => {
        if (confirmText !== "DELETE MY DATA") {
            setError("Please type exactly 'DELETE MY DATA' to confirm.");
            return;
        }

        setIsDeleting(true);
        setError(null);

        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings/wipe-data`, {
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

            {/* WhatsApp Integration */}
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 mb-8 overflow-hidden relative">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />

                <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <Smartphone size={20} className="text-green-500" />
                    WhatsApp Integration
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                    Connect your own WhatsApp account using GreenAPI to send marketing messages directly from your number.
                </p>

                {/* Setup Guide Toggle */}
                <button
                    onClick={() => setShowGreenApiHelp(!showGreenApiHelp)}
                    className="flex items-center gap-2 text-sm font-bold text-green-600 hover:text-green-500 transition-colors mb-6 bg-green-500/10 hover:bg-green-500/20 px-4 py-2 rounded-xl"
                >
                    <HelpCircle size={16} />
                    {showGreenApiHelp ? "Hide Setup Guide" : "Don't know how to set this up? Click here"}
                </button>

                {/* Explainer / Setup Guide Section */}
                {showGreenApiHelp && (
                    <div className="mb-8 p-6 bg-muted/40 border border-border rounded-2xl animate-in slide-in-from-top-2 fade-in duration-300">
                        <h3 className="text-sm font-black uppercase tracking-widest text-foreground/80 mb-5">How to get your credentials</h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Step 1 */}
                            <div className="flex flex-col gap-3 relative">
                                <div className="absolute top-5 left-10 right-0 h-px bg-border hidden md:block" />
                                <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center font-black text-foreground shadow-sm relative z-10 shrink-0">
                                    1
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5 mb-1">
                                        <Globe size={14} className="text-green-500" /> Register Option
                                    </h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Go to <a href="https://greenapi.com/en/" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline inline-flex items-center gap-0.5">GreenAPI <ExternalLink size={10} /></a> and sign up for a free developer account or choose a plan.
                                    </p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="flex flex-col gap-3 relative">
                                <div className="absolute top-5 left-10 right-0 h-px bg-border hidden md:block" />
                                <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center font-black text-foreground shadow-sm relative z-10 shrink-0">
                                    2
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5 mb-1">
                                        <QrCode size={14} className="text-green-500" /> Scan QR Code
                                    </h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Create a new instance in their console. Open your WhatsApp app on your phone → Linked Devices → Scan the QR code shown in GreenAPI.
                                    </p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="flex flex-col gap-3">
                                <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center font-black text-foreground shadow-sm relative z-10 shrink-0">
                                    3
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5 mb-1">
                                        <Key size={14} className="text-green-500" /> Copy Credentials
                                    </h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Once authorised, navigate to your instance settings. Copy the <strong>Id Instance</strong> and <strong>Api Token Instance</strong> and paste them in the fields below.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-foreground mb-2">Instance ID</label>
                            <input
                                type="text"
                                value={greenApiInstanceId}
                                onChange={(e) => setGreenApiInstanceId(e.target.value)}
                                placeholder="e.g. 7103859942"
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-foreground mb-2">API Token</label>
                            <input
                                type="text"
                                value={greenApiToken}
                                onChange={(e) => setGreenApiToken(e.target.value)}
                                placeholder="e.g. 8917a5b3c4d..."
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            onClick={handleSaveGreenApi}
                            disabled={isSavingGreenApi}
                            className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSavingGreenApi ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : greenApiSuccess ? (
                                <>
                                    <CheckCircle2 size={18} />
                                    Saved successfully
                                </>
                            ) : (
                                "Save Configuration"
                            )}
                        </button>
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
