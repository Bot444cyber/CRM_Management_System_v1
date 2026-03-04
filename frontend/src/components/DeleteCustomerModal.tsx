"use client";

import React from "react";
import { X, AlertTriangle, Trash2 } from "lucide-react";

interface DeleteCustomerModalProps {
    open: boolean;
    customerName: string;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    loading?: boolean;
}

export default function DeleteCustomerModal({
    open,
    customerName,
    onClose,
    onConfirm,
    loading = false,
}: DeleteCustomerModalProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="relative z-10 w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-start justify-between px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                            <AlertTriangle size={18} className="text-destructive" />
                        </div>
                        <div>
                            <h2 className="text-foreground font-bold text-base tracking-tight">Delete Customer</h2>
                            <p className="text-muted-foreground text-xs mt-0.5">This action cannot be undone</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                    >
                        <X size={14} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 pb-5">
                    <div className="bg-muted/30 border border-border rounded-xl px-4 py-3 mb-5">
                        <p className="text-muted-foreground text-sm">
                            Are you sure you want to permanently remove{" "}
                            <span className="text-foreground font-semibold">{customerName}</span>?
                            All associated data will be deleted.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded-xl transition-all disabled:opacity-40"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-destructive hover:opacity-90 active:scale-95 text-destructive-foreground rounded-xl text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="w-4 h-4 border-2 border-destructive-foreground/30 border-t-destructive-foreground rounded-full animate-spin" />
                            ) : (
                                <Trash2 size={14} />
                            )}
                            {loading ? "Deleting…" : "Delete"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
