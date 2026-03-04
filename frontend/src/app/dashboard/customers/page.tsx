"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/apiFetch';
import {
    Users, Search, MapPin, ShoppingBag, Star, DollarSign,
    Plus, Pencil, Trash2, CheckCircle2, XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Pagination from '@/components/Pagination';
import CustomerFormModal from '@/components/CustomerFormModal';
import DeleteCustomerModal from '@/components/DeleteCustomerModal';

interface Customer {
    id: string;
    name: string;
    email: string;
    location?: string;
    orders: number;
    spent: string;
    rating?: string;
    avatar?: string;
    createdAt?: string;
}

interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error';
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const LIMIT = 10;

let toastCounter = 0;

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [toasts, setToasts] = useState<Toast[]>([]);

    // Modal states
    const [formOpen, setFormOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Customer | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
    const [mutating, setMutating] = useState(false);

    const showToast = (message: string, type: 'success' | 'error') => {
        const id = ++toastCounter;
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    };

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiFetch(
                `${BACKEND_URL}/api/customers?page=${page}&limit=${LIMIT}`
            );
            if (res.ok) {
                const json = await res.json();
                const data: Customer[] = Array.isArray(json) ? json : (json.data ?? []);
                setCustomers(data);
                setTotal(json.total ?? data.length);
                setTotalPages(json.totalPages ?? 1);
            }
        } catch (err) {
            console.error('Failed to fetch customers:', err);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

    const filtered = customers.filter(c =>
        search.trim() === '' ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        (c.location ?? '').toLowerCase().includes(search.toLowerCase())
    );

    const handlePageChange = (p: number) => {
        setPage(p);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ── Add
    const openAddModal = () => {
        setEditTarget(null);
        setFormOpen(true);
    };

    // ── Edit
    const openEditModal = (c: Customer) => {
        setEditTarget(c);
        setFormOpen(true);
    };

    // ── Delete
    const openDeleteModal = (c: Customer) => {
        setDeleteTarget(c);
        setDeleteOpen(true);
    };

    // ── Submit form (create OR update)
    const handleFormSubmit = async (data: {
        name: string; email: string; location: string;
        orders: string; spent: string; rating: string; avatar: string;
    }) => {
        setMutating(true);
        try {
            const payload = {
                name: data.name,
                email: data.email,
                location: data.location || null,
                orders: data.orders ? Number(data.orders) : 0,
                spent: data.spent || '$ 0',
                rating: data.rating ? data.rating : null,
                avatar: data.avatar || null,
            };

            let res: Response;

            if (editTarget) {
                res = await apiFetch(`${BACKEND_URL}/api/customers/${editTarget.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload),
                });
            } else {
                res = await apiFetch(`${BACKEND_URL}/api/customers`, {
                    method: 'POST',
                    body: JSON.stringify(payload),
                });
            }

            if (res.ok) {
                showToast(editTarget ? 'Customer updated successfully' : 'Customer added successfully', 'success');
                setFormOpen(false);
                setEditTarget(null);
                fetchCustomers();
            } else {
                const json = await res.json().catch(() => ({}));
                showToast(json.message ?? 'Something went wrong', 'error');
            }
        } catch {
            showToast('Network error. Please try again.', 'error');
        } finally {
            setMutating(false);
        }
    };

    // ── Confirm delete
    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setMutating(true);
        try {
            const res = await apiFetch(`${BACKEND_URL}/api/customers/${deleteTarget.id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                showToast('Customer deleted', 'success');
                setDeleteOpen(false);
                setDeleteTarget(null);
                // If last item on page, go back
                if (filtered.length === 1 && page > 1) setPage(p => p - 1);
                else fetchCustomers();
            } else {
                const json = await res.json().catch(() => ({}));
                showToast(json.message ?? 'Delete failed', 'error');
            }
        } catch {
            showToast('Network error. Please try again.', 'error');
        } finally {
            setMutating(false);
        }
    };

    return (
        <div className="animate-in fade-in duration-500 relative">
            {/* ── Toasts ── */}
            <div className="fixed top-5 right-5 z-100 flex flex-col gap-2 pointer-events-none">
                {toasts.map(t => (
                    <div
                        key={t.id}
                        className={cn(
                            "flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium shadow-xl animate-in slide-in-from-right-4 duration-300 pointer-events-auto bg-card",
                            t.type === 'success'
                                ? "border-emerald-500/30 text-emerald-500"
                                : "border-red-500/30 text-red-500"
                        )}
                    >
                        {t.type === 'success'
                            ? <CheckCircle2 size={15} />
                            : <XCircle size={15} />
                        }
                        {t.message}
                    </div>
                ))}
            </div>

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Customers</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        {loading ? 'Loading…' : `${total} total customer${total !== 1 ? 's' : ''}`}
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search customers…"
                            className="pl-9 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 focus:bg-background transition-all w-full"
                        />
                    </div>

                    {/* Add button */}
                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-xl text-sm font-bold hover:opacity-90 active:scale-95 transition-all shrink-0"
                    >
                        <Plus size={15} />
                        <span className="hidden sm:inline">Add Customer</span>
                        <span className="sm:hidden">Add</span>
                    </button>
                </div>
            </div>

            {/* ── Table Header ── */}
            <div className="hidden lg:grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr_80px] gap-4 px-6 mb-3">
                {['Customer', 'Email', 'Location', 'Orders', 'Spent', 'Rating', ''].map((h, i) => (
                    <span key={i} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{h}</span>
                ))}
            </div>

            {/* ── Rows ── */}
            <div className="flex flex-col gap-2">
                {loading ? (
                    Array.from({ length: LIMIT }).map((_, i) => (
                        <div key={i} className="h-20 rounded-2xl bg-muted/50 animate-pulse" />
                    ))
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 border border-border border-dashed rounded-2xl text-muted-foreground">
                        <Users size={40} className="mb-4 opacity-30" />
                        <p className="font-bold text-sm uppercase tracking-widest">No customers found</p>
                        <p className="text-xs text-muted-foreground/50 mt-1">
                            {search ? 'Try a different search term' : 'Click "Add Customer" to get started'}
                        </p>
                    </div>
                ) : (
                    filtered.map(c => (
                        <div
                            key={c.id}
                            className="group bg-card border border-border rounded-2xl px-6 py-5 grid grid-cols-1 lg:grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr_80px] gap-4 items-center hover:bg-accent/50 transition-all"
                        >
                            {/* Name + Avatar */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center shrink-0 text-sm font-bold text-foreground group-hover:bg-foreground group-hover:text-background transition-all duration-300">
                                    {c.avatar || c.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-foreground text-sm truncate">{c.name}</p>
                                    <p className="text-xs text-muted-foreground truncate lg:hidden">{c.email}</p>
                                </div>
                            </div>

                            {/* Email */}
                            <p className="text-sm text-muted-foreground truncate hidden lg:block">{c.email}</p>

                            {/* Location */}
                            <div className="flex items-center gap-1.5">
                                <MapPin size={12} className="text-muted-foreground/50 shrink-0" />
                                <span className="text-xs text-muted-foreground truncate">{c.location || '—'}</span>
                            </div>

                            {/* Orders */}
                            <div className="flex items-center gap-1.5">
                                <ShoppingBag size={12} className="text-muted-foreground/50 shrink-0" />
                                <span className="text-sm font-bold text-foreground font-mono">{c.orders ?? 0}</span>
                            </div>

                            {/* Spent */}
                            <div className="flex items-center gap-1">
                                <DollarSign size={12} className="text-emerald-500/60 shrink-0" />
                                <span className="text-sm font-bold text-foreground font-mono">
                                    {(c.spent ?? '$ 0').replace('$ ', '')}
                                </span>
                            </div>

                            {/* Rating */}
                            <div className="flex items-center gap-1">
                                <Star
                                    size={12}
                                    className={cn("shrink-0", c.rating && parseFloat(c.rating) >= 4 ? 'text-amber-500' : 'text-muted-foreground/50')}
                                />
                                <span className={cn(
                                    "text-sm font-bold font-mono",
                                    c.rating && parseFloat(c.rating) >= 4 ? 'text-amber-500' : 'text-muted-foreground/80'
                                )}>
                                    {c.rating ?? '—'}
                                </span>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => openEditModal(c)}
                                    title="Edit customer"
                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                                >
                                    <Pencil size={13} />
                                </button>
                                <button
                                    onClick={() => openDeleteModal(c)}
                                    title="Delete customer"
                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                >
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* ── Pagination ── */}
            <div className="flex flex-col items-center gap-2 mt-4">
                <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
                {!loading && total > 0 && (
                    <p className="text-center text-[10px] text-muted-foreground font-bold uppercase tracking-widest pb-2">
                        Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total} customers
                    </p>
                )}
            </div>

            {/* ── Modals ── */}
            <CustomerFormModal
                open={formOpen}
                onClose={() => { setFormOpen(false); setEditTarget(null); }}
                onSubmit={handleFormSubmit}
                initialData={editTarget}
                loading={mutating}
            />

            <DeleteCustomerModal
                open={deleteOpen}
                customerName={deleteTarget?.name ?? ''}
                onClose={() => { setDeleteOpen(false); setDeleteTarget(null); }}
                onConfirm={handleDeleteConfirm}
                loading={mutating}
            />
        </div>
    );
}
