"use client";

import React, { useEffect, useState } from "react";
import { X, User, Mail, MapPin, ShoppingBag, DollarSign, Star, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomerFormData {
    name: string;
    email: string;
    location: string;
    orders: string;
    spent: string;
    rating: string;
    avatar: string;
}

interface Customer {
    id: string;
    name: string;
    email: string;
    location?: string;
    orders: number;
    spent: string;
    rating?: string;
    avatar?: string;
}

interface CustomerFormModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: CustomerFormData) => Promise<void>;
    initialData?: Customer | null;
    loading?: boolean;
}

const EMPTY: CustomerFormData = {
    name: "",
    email: "",
    location: "",
    orders: "0",
    spent: "0",
    rating: "",
    avatar: "",
};

export default function CustomerFormModal({
    open,
    onClose,
    onSubmit,
    initialData,
    loading = false,
}: CustomerFormModalProps) {
    const [form, setForm] = useState<CustomerFormData>(EMPTY);
    const [errors, setErrors] = useState<Partial<CustomerFormData>>({});

    const isEdit = !!initialData;

    useEffect(() => {
        if (open) {
            if (initialData) {
                setForm({
                    name: initialData.name ?? "",
                    email: initialData.email ?? "",
                    location: initialData.location ?? "",
                    orders: String(initialData.orders ?? 0),
                    spent: (initialData.spent ?? "$ 0").replace(/^\$\s*/, ""),
                    rating: initialData.rating ?? "",
                    avatar: initialData.avatar ?? "",
                });
            } else {
                setForm(EMPTY);
            }
            setErrors({});
        }
    }, [open, initialData]);

    const validate = (): boolean => {
        const errs: Partial<CustomerFormData> = {};
        if (!form.name.trim()) errs.name = "Name is required";
        if (!form.email.trim()) {
            errs.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            errs.email = "Enter a valid email";
        }
        if (form.rating && (isNaN(Number(form.rating)) || Number(form.rating) < 0 || Number(form.rating) > 5)) {
            errs.rating = "Rating must be 0–5";
        }
        if (form.orders && isNaN(Number(form.orders))) {
            errs.orders = "Must be a number";
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleChange = (field: keyof CustomerFormData, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        await onSubmit({
            ...form,
            spent: `$ ${form.spent.replace(/^\$\s*/, "")}`,
        });
    };

    if (!open) return null;

    const fields: {
        key: keyof CustomerFormData;
        label: string;
        placeholder: string;
        type?: string;
        icon: React.ReactNode;
        required?: boolean;
        hint?: string;
    }[] = [
            { key: "name", label: "Full Name", placeholder: "e.g. Jane Smith", icon: <User size={14} />, required: true },
            { key: "email", label: "Email", placeholder: "e.g. jane@company.com", type: "email", icon: <Mail size={14} />, required: true },
            { key: "location", label: "Location", placeholder: "e.g. New York, USA", icon: <MapPin size={14} /> },
            { key: "avatar", label: "Avatar", placeholder: "Emoji or single letter (e.g. 🚀 or J)", icon: <Hash size={14} />, hint: "Shown as the avatar bubble" },
            { key: "orders", label: "Orders", placeholder: "0", type: "number", icon: <ShoppingBag size={14} /> },
            { key: "spent", label: "Total Spent ($)", placeholder: "0.00", type: "number", icon: <DollarSign size={14} /> },
            { key: "rating", label: "Rating (0–5)", placeholder: "4.5", type: "number", icon: <Star size={14} />, hint: "Leave blank if unknown" },
        ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="relative z-10 w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-muted/50">
                    <div>
                        <h2 className="text-foreground font-bold text-lg tracking-tight">
                            {isEdit ? "Edit Customer" : "Add Customer"}
                        </h2>
                        <p className="text-muted-foreground text-xs mt-0.5">
                            {isEdit ? "Update customer information" : "Fill in the details below"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {fields.map(f => (
                        <div key={f.key}>
                            <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                                {f.icon}
                                {f.label}
                                {f.required && <span className="text-destructive">*</span>}
                            </label>
                            <input
                                type={f.type ?? "text"}
                                value={form[f.key]}
                                onChange={e => handleChange(f.key, e.target.value)}
                                placeholder={f.placeholder}
                                min={f.type === "number" ? 0 : undefined}
                                step={f.key === "rating" || f.key === "spent" ? "0.01" : f.type === "number" ? "1" : undefined}
                                className={cn(
                                    "w-full bg-background border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 transition-all",
                                    errors[f.key]
                                        ? "border-destructive focus:ring-destructive/30"
                                        : "border-border focus:ring-foreground/20"
                                )}
                            />
                            {errors[f.key] && (
                                <p className="text-destructive text-[11px] mt-1">{errors[f.key]}</p>
                            )}
                            {f.hint && !errors[f.key] && (
                                <p className="text-muted-foreground/50 text-[11px] mt-1">{f.hint}</p>
                            )}
                        </div>
                    ))}
                </form>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/30">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-5 py-2 bg-foreground text-background rounded-xl text-sm font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                                Saving…
                            </>
                        ) : isEdit ? "Save Changes" : "Add Customer"}
                    </button>
                </div>
            </div>
        </div>
    );
}
