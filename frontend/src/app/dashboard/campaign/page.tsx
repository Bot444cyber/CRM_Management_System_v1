"use client";

import React, { useState, useCallback } from "react";
import { useInventory } from "@/context/InventoryContext";
import { apiFetch } from "@/lib/apiFetch";
import {
    Megaphone, Package, Users, CheckCircle2, Search, ArrowRight,
    ArrowLeft, ShoppingBag, DollarSign, User, Mail, MapPin, Hash,
    RotateCcw, AlertTriangle, Clock, Star, XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Pagination from "@/components/Pagination";
import SaleDetailsModal from "@/components/SaleDetailsModal";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

// ── Types ─────────────────────────────────────────────────────────────────────

interface SubProduct { name: string; price: string; stock: number; discount: number; status: string; }
interface MainProduct { name: string; imageUrl?: string; subProducts: SubProduct[]; }
interface CustomerFound {
    id: string; name: string; email: string; location?: string;
    orders: number; spent: string; rating?: string; avatar?: string;
}
interface NewCustomerForm { name: string; email: string; location: string; avatar: string; }
interface Sale { id: number; entityDetails: any; createdAt: string; }

type Step = 1 | 2 | 3;

// ── Toast ─────────────────────────────────────────────────────────────────────

let toastId = 0;
function useToasts() {
    const [toasts, setToasts] = useState<{ id: number; msg: string; type: "success" | "error" }[]>([]);
    const show = (msg: string, type: "success" | "error" = "success") => {
        const id = ++toastId;
        setToasts(p => [...p, { id, msg, type }]);
        setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4500);
    };
    return { toasts, show };
}

// ── Step indicator ────────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: Step }) {
    const steps = ["Pick Product", "Find Customer", "Confirm & Sell"];
    return (
        <div className="flex items-center gap-0 mb-10">
            {steps.map((label, i) => {
                const s = (i + 1) as Step;
                const done = step > s;
                const active = step === s;
                return (
                    <React.Fragment key={s}>
                        <div className="flex flex-col items-center gap-1.5">
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border transition-all duration-300",
                                done ? "bg-white text-black border-white" :
                                    active ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]" :
                                        "bg-white/5 text-white/20 border-white/10"
                            )}>
                                {done ? <CheckCircle2 size={14} /> : s}
                            </div>
                            <span className={cn(
                                "text-[10px] font-bold uppercase tracking-widest whitespace-nowrap",
                                active ? "text-white" : done ? "text-white/60" : "text-white/20"
                            )}>{label}</span>
                        </div>
                        {i < 2 && (
                            <div className={cn(
                                "flex-1 h-px mx-3 mb-5 transition-all duration-500",
                                done ? "bg-foreground/60" : "bg-border"
                            )} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CampaignPage() {
    const { inventories, refreshInventories } = useInventory();
    const { toasts, show } = useToasts();

    const [step, setStep] = useState<Step>(1);

    // Step 1 selections
    const [selInvId, setSelInvId] = useState("");
    const [selMain, setSelMain] = useState<MainProduct | null>(null);
    const [selSub, setSelSub] = useState<SubProduct | null>(null);

    // Step 2 customer
    const [emailQuery, setEmailQuery] = useState("");
    const [looking, setLooking] = useState(false);
    const [lookupDone, setLookupDone] = useState(false);
    const [foundCustomer, setFoundCustomer] = useState<CustomerFound | null>(null);
    const [isNewCustomer, setIsNewCustomer] = useState(false);
    const [newCustomer, setNewCustomer] = useState<NewCustomerForm>({ name: "", email: "", location: "", avatar: "" });

    // Step 3
    const [quantity, setQuantity] = useState<number>(1);
    const [submitting, setSubmitting] = useState(false);
    const [saleSuccess, setSaleSuccess] = useState<{ customerName: string } | null>(null);

    // Sales history
    const [sales, setSales] = useState<Sale[]>([]);
    const [salesTotal, setSalesTotal] = useState(0);
    const [salesTotalPages, setSalesTotalPages] = useState(1);
    const [salesPage, setSalesPage] = useState(1);
    const [salesLoading, setSalesLoading] = useState(false);
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

    const selectedInventory = inventories.find(i => i.id === selInvId) ?? null;

    // ── Fetch sales history ──────────────────────────────────────────────────
    const fetchSales = useCallback(async (p = 1) => {
        setSalesLoading(true);
        try {
            const res = await apiFetch(`${BACKEND_URL}/api/marketing/sales?page=${p}&limit=10`);
            if (res.ok) {
                const json = await res.json();
                setSales(json.data ?? []);
                setSalesTotal(json.total ?? 0);
                setSalesTotalPages(json.totalPages ?? 1);
            }
        } catch { /* silent */ } finally { setSalesLoading(false); }
    }, []);

    React.useEffect(() => { fetchSales(salesPage); }, [salesPage, fetchSales]);

    // ── Step 1 helpers ───────────────────────────────────────────────────────
    const canProceedStep1 = selInvId && selMain && selSub;

    // ── Step 2: look up customer ─────────────────────────────────────────────
    const handleLookup = async () => {
        if (!emailQuery.trim()) return;
        setLooking(true);
        setLookupDone(false);
        setFoundCustomer(null);
        setIsNewCustomer(false);
        try {
            const res = await apiFetch(`${BACKEND_URL}/api/marketing/customer-lookup?email=${encodeURIComponent(emailQuery.trim())}`);
            if (res.ok) {
                const json = await res.json();
                if (json.customer) {
                    setFoundCustomer(json.customer);
                    setIsNewCustomer(false);
                } else {
                    setFoundCustomer(null);
                    setIsNewCustomer(true);
                    setNewCustomer(prev => ({ ...prev, email: emailQuery.trim() }));
                }
            }
        } catch { show("Lookup failed. Check your connection.", "error"); }
        finally { setLooking(false); setLookupDone(true); }
    };

    const canProceedStep2 = lookupDone && (
        (foundCustomer !== null) ||
        (isNewCustomer && newCustomer.name.trim() && newCustomer.email.trim())
    );

    // ── Step 3: record sale ───────────────────────────────────────────────────
    const handleRecordSale = async () => {
        if (!selSub || !selMain || !selInvId) return;
        setSubmitting(true);
        try {
            const body: any = {
                inventoryId: selInvId,
                mainProductName: selMain.name,
                subProductName: selSub.name,
                price: selSub.price,
                quantity: quantity,
            };
            if (foundCustomer) {
                body.customerId = foundCustomer.id;
            } else {
                body.newCustomer = {
                    name: newCustomer.name.trim(),
                    email: newCustomer.email.trim(),
                    location: newCustomer.location.trim() || null,
                    avatar: newCustomer.avatar.trim() || null,
                };
            }

            const res = await apiFetch(`${BACKEND_URL}/api/marketing/sell`, {
                method: "POST",
                body: JSON.stringify(body),
            });

            if (res.ok) {
                const json = await res.json();
                setSaleSuccess({ customerName: json.customerName });
                fetchSales(1);
                refreshInventories();
            } else {
                const json = await res.json().catch(() => ({}));
                show(json.message ?? "Failed to record sale", "error");
            }
        } catch { show("Network error. Please try again.", "error"); }
        finally { setSubmitting(false); }
    };

    // ── Reset ─────────────────────────────────────────────────────────────────
    const resetWizard = () => {
        setStep(1);
        setSelInvId(""); setSelMain(null); setSelSub(null); setQuantity(1);
        setEmailQuery(""); setLookupDone(false); setFoundCustomer(null);
        setIsNewCustomer(false); setNewCustomer({ name: "", email: "", location: "", avatar: "" });
        setSaleSuccess(null);
    };

    return (
        <div className="animate-in fade-in duration-500 relative">

            {/* ── Toasts ── */}
            <div className="fixed top-5 right-5 z-100 flex flex-col gap-2 pointer-events-none">
                {toasts.map(t => (
                    <div key={t.id} className={cn(
                        "flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium shadow-xl animate-in slide-in-from-right-4 duration-300 pointer-events-auto bg-card",
                        t.type === "success" ? "border-emerald-500/30 text-emerald-500" : "border-red-500/30 text-red-500"
                    )}>
                        {t.type === "success" ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                        {t.msg}
                    </div>
                ))}
            </div>

            {/* ── Header ── */}
            <div className="mb-10">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
                    <Megaphone size={26} className="text-muted-foreground" />
                    Marketing & Sales
                </h1>
                <p className="text-muted-foreground text-sm mt-1">Record product sales and manage customer relationships</p>
            </div>

            {/* ── Wizard Card ── */}
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 mb-8">
                <StepIndicator step={step} />

                {/* ─── SUCCESS STATE ─────────────────────────────────────────── */}
                {saleSuccess ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">
                            <CheckCircle2 size={32} className="text-emerald-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Sale Recorded!</h2>
                        <p className="text-white/40 text-sm mb-1">
                            <span className="text-white font-semibold">{selSub?.name}</span>{" "}
                            from <span className="text-white font-semibold">{selMain?.name}</span>
                        </p>
                        <p className="text-white/40 text-sm mb-8">
                            sold to <span className="text-white font-semibold">{saleSuccess.customerName}</span>
                        </p>

                        {/* Receipt */}
                        <div className="w-full max-w-sm bg-linear-to-b from-muted/50 to-transparent border border-border rounded-2xl p-6 text-left mb-8 shadow-2xl relative overflow-hidden">
                            {/* Decorative ticket holes cutouts */}
                            <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 bg-background rounded-full shadow-inner z-10"></div>
                            <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 bg-background rounded-full shadow-inner z-10"></div>

                            <div className="flex items-center justify-between mb-5 pb-5 border-b border-border border-dashed relative z-0">
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1">Transaction</p>
                                    <p className="text-xs font-mono font-semibold text-white">#SALE-{Math.floor(Math.random() * 900000) + 100000}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1">Date</p>
                                    <p className="text-xs font-mono font-semibold text-white flex items-center gap-1.5 justify-end">
                                        {new Date().toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-5 pb-5 border-b border-white/10 border-dashed relative z-0">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="min-w-0 pr-4">
                                        <p className="text-sm font-bold text-white truncate">{selMain?.name}</p>
                                        <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest truncate">{selSub?.name} &bull; {selectedInventory?.name ?? selInvId}</p>
                                    </div>
                                    <span className="text-sm font-mono font-bold text-white whitespace-nowrap hidden"></span>
                                </div>

                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-white/40 font-bold tracking-wider relative z-20">Qty {quantity} &times; ${parseFloat(String(selSub?.price || "0").replace(/[^0-9.-]+/g, ''))} Unit</span>
                                    <span className="text-white font-mono font-bold relative z-20 text-sm">${(parseFloat(String(selSub?.price || "0").replace(/[^0-9.-]+/g, '')) * quantity).toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between items-center text-xs pt-2">
                                    <span className="text-white/40 font-bold tracking-wider relative z-20">Customer</span>
                                    <span className="text-white font-bold relative z-20">{saleSuccess.customerName}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center relative z-0">
                                <span className="text-sm text-white font-bold tracking-widest uppercase relative z-20">Total Paid</span>
                                <span className="text-2xl text-emerald-400 font-mono font-bold relative z-20">
                                    ${(parseFloat(String(selSub?.price || "0").replace(/[^0-9.-]+/g, '')) * quantity).toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={resetWizard}
                            className="flex items-center gap-2 px-5 py-2.5 bg-foreground text-background rounded-xl text-sm font-bold hover:opacity-90 active:scale-95 transition-all"
                        >
                            <RotateCcw size={14} />
                            Record Another Sale
                        </button>
                    </div>
                ) : (
                    <>
                        {/* ─── STEP 1: Pick Product ────────────────────────── */}
                        {step === 1 && (
                            <div className="space-y-6">
                                {/* Inventory selector */}
                                <div>
                                    <label className="flex text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 items-center gap-1.5">
                                        <Package size={13} /> Inventory
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {inventories.length === 0 && (
                                            <p className="text-muted-foreground text-sm col-span-full py-4 text-center">No inventories found. Add one first.</p>
                                        )}
                                        {inventories.map(inv => (
                                            <button key={inv.id} onClick={() => { setSelInvId(inv.id); setSelMain(null); setSelSub(null); }}
                                                className={cn(
                                                    "flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all",
                                                    selInvId === inv.id ? "bg-accent border-accent-foreground/40" : "bg-muted/50 border-border hover:border-accent-foreground/20"
                                                )}>
                                                {inv.imageUrl
                                                    ? <img src={inv.imageUrl} alt={inv.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                                                    : <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0"><Package size={14} className="text-muted-foreground" /></div>
                                                }
                                                <div>
                                                    <p className="text-sm font-bold text-foreground">{inv.name}</p>
                                                    <p className="text-xs text-muted-foreground">{inv.mainProducts.length} product{inv.mainProducts.length !== 1 ? "s" : ""}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Main product */}
                                {selectedInventory && (
                                    <div>
                                        <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Main Product</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {selectedInventory.mainProducts.map(mp => (
                                                <button key={mp.name} onClick={() => { setSelMain(mp); setSelSub(null); }}
                                                    className={cn(
                                                        "flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all",
                                                        selMain?.name === mp.name ? "bg-accent border-accent-foreground/40" : "bg-muted/50 border-border hover:border-accent-foreground/20"
                                                    )}>
                                                    {mp.imageUrl
                                                        ? <img src={mp.imageUrl} alt={mp.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                                                        : <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0"><ShoppingBag size={14} className="text-muted-foreground" /></div>
                                                    }
                                                    <div>
                                                        <p className="text-sm font-bold text-foreground">{mp.name}</p>
                                                        <p className="text-xs text-muted-foreground">{mp.subProducts.length} variant{mp.subProducts.length !== 1 ? "s" : ""}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Sub-product */}
                                {selMain && (
                                    <div>
                                        <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Variant / Sub-product</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                            {selMain.subProducts.map(sp => {
                                                const isOutOfStock = sp.stock <= 0;
                                                const isDisabled = sp.status === "Archived" || isOutOfStock;

                                                return (
                                                    <button key={sp.name} onClick={() => setSelSub(sp)}
                                                        className={cn(
                                                            "px-4 py-3 rounded-xl border text-left transition-all",
                                                            selSub?.name === sp.name ? "bg-accent border-accent-foreground/40" : "bg-muted/50 border-border hover:border-accent-foreground/20",
                                                            isDisabled && "opacity-40 cursor-not-allowed"
                                                        )}
                                                        disabled={isDisabled}>
                                                        <div className="flex items-start justify-between mb-3 border-b border-border pb-2">
                                                            <div>
                                                                <p className="text-sm font-bold text-foreground leading-tight">{sp.name}</p>
                                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Sub-product</p>
                                                            </div>
                                                            <div className="flex flex-col items-end gap-1">
                                                                {isOutOfStock && (
                                                                    <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-red-500/10 text-red-500">Out of Stock</span>
                                                                )}
                                                                <span className={cn("text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded",
                                                                    sp.status === "Active" ? "bg-emerald-500/10 text-emerald-500" :
                                                                        sp.status === "Draft" ? "bg-amber-500/10 text-amber-500" :
                                                                            "bg-muted text-muted-foreground"
                                                                )}>{sp.status}</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between mt-2">
                                                            <div>
                                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">Price</p>
                                                                <p className="text-lg text-emerald-500 font-mono font-bold">{sp.price}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">Stock Qty</p>
                                                                <div className="flex items-center justify-end gap-1.5">
                                                                    <div className={cn("w-1.5 h-1.5 rounded-full", isOutOfStock ? "bg-red-500" : "bg-emerald-500")} />
                                                                    <p className={cn("text-sm font-bold", isOutOfStock ? "text-red-500" : "text-foreground")}>
                                                                        {sp.stock}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end pt-2">
                                    <button disabled={!canProceedStep1}
                                        onClick={() => setStep(2)}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-foreground text-background rounded-xl text-sm font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                                        Find Customer <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ─── STEP 2: Customer Lookup ─────────────────────── */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <div>
                                    <label className="flex text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 items-center gap-1.5">
                                        <Mail size={13} /> Customer Email
                                    </label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1 group">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors" size={15} />
                                            <input
                                                type="email"
                                                value={emailQuery}
                                                onChange={e => { setEmailQuery(e.target.value); setLookupDone(false); setFoundCustomer(null); setIsNewCustomer(false); }}
                                                onKeyDown={e => e.key === "Enter" && handleLookup()}
                                                placeholder="customer@email.com"
                                                className="w-full pl-9 pr-9 py-2.5 bg-muted/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 focus:bg-background transition-all"
                                            />
                                            {emailQuery && (
                                                <button
                                                    onClick={() => { setEmailQuery(''); setLookupDone(false); setFoundCustomer(null); setIsNewCustomer(false); }}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors bg-muted/50 hover:bg-muted rounded-full p-0.5"
                                                >
                                                    <XCircle size={14} />
                                                </button>
                                            )}
                                        </div>
                                        <button onClick={handleLookup} disabled={!emailQuery.trim() || looking}
                                            className="px-4 py-2.5 bg-foreground text-background rounded-xl text-sm font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 flex items-center gap-2 shrink-0">
                                            {looking ? <span className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" /> : <Search size={14} />}
                                            Look up
                                        </button>
                                    </div>
                                </div>

                                {/* Found customer */}
                                {lookupDone && foundCustomer && (
                                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <CheckCircle2 size={14} className="text-emerald-400" />
                                            <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Customer Found</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center text-sm font-bold text-foreground shrink-0">
                                                {foundCustomer.avatar || foundCustomer.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-foreground text-sm">{foundCustomer.name}</p>
                                                <p className="text-xs text-muted-foreground">{foundCustomer.email}</p>
                                                {foundCustomer.location && <p className="text-xs text-muted-foreground">{foundCustomer.location}</p>}
                                            </div>
                                            <div className="ml-auto flex flex-col items-end gap-1">
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <ShoppingBag size={11} /> {foundCustomer.orders} orders
                                                </div>
                                                {foundCustomer.rating && (
                                                    <div className="flex items-center gap-1 text-xs text-amber-400">
                                                        <Star size={11} /> {foundCustomer.rating}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Not found — new customer form */}
                                {lookupDone && isNewCustomer && (
                                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 space-y-4">
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle size={14} className="text-amber-400" />
                                            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">New Customer — Fill in details</span>
                                        </div>
                                        <p className="text-muted-foreground text-xs">This email isn't in your customer database. Fill in the details below and they'll be added automatically when you record the sale.</p>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {[
                                                { key: "name" as const, label: "Full Name *", icon: <User size={12} />, placeholder: "Jane Smith", required: true },
                                                { key: "email" as const, label: "Email *", icon: <Mail size={12} />, placeholder: "jane@example.com", required: true },
                                                { key: "location" as const, label: "Location", icon: <MapPin size={12} />, placeholder: "New York, USA" },
                                                { key: "avatar" as const, label: "Avatar", icon: <Hash size={12} />, placeholder: "Emoji or letter" },
                                            ].map(f => (
                                                <div key={f.key}>
                                                    <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                                                        {f.icon} {f.label}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={newCustomer[f.key]}
                                                        onChange={e => setNewCustomer(p => ({ ...p, [f.key]: e.target.value }))}
                                                        placeholder={f.placeholder}
                                                        className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 focus:bg-background transition-all"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between pt-2">
                                    <button onClick={() => setStep(1)}
                                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                        <ArrowLeft size={14} /> Back
                                    </button>
                                    <button disabled={!canProceedStep2} onClick={() => setStep(3)}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-foreground text-background rounded-xl text-sm font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                                        Review Sale <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ─── STEP 3: Confirm & Record ─────────────────────── */}
                        {step === 3 && (
                            <div className="space-y-6">
                                <h3 className="text-foreground font-bold text-base">Review & Confirm</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Product card */}
                                    <div className="bg-muted/50 border border-border rounded-xl p-4 space-y-3">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><Package size={12} /> Product</p>
                                        <p className="text-xs text-muted-foreground">{selectedInventory?.name}</p>
                                        <p className="text-foreground font-bold">{selMain?.name}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-foreground/70">{selSub?.name}</span>
                                            <span className="text-sm font-mono font-bold text-emerald-500">{selSub?.price}</span>
                                        </div>
                                        <div className="flex items-center justify-between pt-3 border-t border-border">
                                            <span className="text-sm font-bold text-muted-foreground">Quantity</span>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                                    className="w-7 h-7 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center text-foreground font-bold transition-colors"
                                                >-</button>
                                                <span className="font-mono font-bold text-foreground w-4 text-center">{quantity}</span>
                                                <button
                                                    onClick={() => setQuantity(q => q + 1)}
                                                    className="w-7 h-7 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center text-foreground font-bold transition-colors"
                                                >+</button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Customer card */}
                                    <div className="bg-muted/50 border border-border rounded-xl p-4 space-y-3">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><Users size={12} /> Customer</p>
                                        {foundCustomer ? (
                                            <>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-foreground shrink-0">
                                                        {foundCustomer.avatar || foundCustomer.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-foreground text-sm">{foundCustomer.name}</p>
                                                        <p className="text-xs text-muted-foreground">{foundCustomer.email}</p>
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-emerald-400/80 font-bold uppercase tracking-widest">Existing customer</p>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-sm font-bold text-amber-500 shrink-0">
                                                        {newCustomer.avatar || newCustomer.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-foreground text-sm">{newCustomer.name}</p>
                                                        <p className="text-xs text-muted-foreground">{newCustomer.email}</p>
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-amber-500/80 font-bold uppercase tracking-widest">Will be added to customer DB</p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-between pt-2">
                                    <button onClick={() => setStep(2)}
                                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                        <ArrowLeft size={14} /> Back
                                    </button>
                                    <button onClick={handleRecordSale} disabled={submitting}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-foreground text-background rounded-xl text-sm font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                                        {submitting
                                            ? <><span className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />Recording…</>
                                            : <><CheckCircle2 size={15} />Record Sale</>
                                        }
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* ── Sales History ─────────────────────────────────────────────── */}
            <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-foreground font-bold text-base flex items-center gap-2">
                        <Clock size={16} className="text-muted-foreground" />
                        Sales History
                    </h2>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{salesTotal} total</span>
                </div>

                {/* Header row */}
                <div className="hidden lg:grid grid-cols-[1.5fr_1.5fr_0.5fr_1fr_100px] gap-4 px-4 mb-2">
                    {["Customer", "Item", "Qty", "Total", "Date"].map(h => (
                        <span key={h} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{h}</span>
                    ))}
                </div>

                <div className="flex flex-col gap-2">
                    {salesLoading ? (
                        Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 rounded-xl bg-muted/50 animate-pulse" />)
                    ) : sales.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 border border-border border-dashed rounded-xl text-muted-foreground">
                            <Megaphone size={32} className="mb-3 opacity-30" />
                            <p className="font-bold text-xs uppercase tracking-widest">No sales recorded yet</p>
                        </div>
                    ) : sales.map((s: any) => {
                        let d = s.entityDetails || {};
                        if (typeof d === 'string') {
                            try { d = JSON.parse(d); } catch (e) { d = {}; }
                        }
                        const date = s.createdAt ? new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "–";
                        return (
                            <div key={s.id}
                                onClick={() => setSelectedSale(s)}
                                className="grid grid-cols-1 lg:grid-cols-[1.5fr_1.5fr_0.5fr_1fr_100px] gap-4 items-center px-4 py-3 bg-card border border-border rounded-xl hover:bg-muted/80 transition-all shadow-sm cursor-pointer hover:border-foreground/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center text-sm font-bold text-foreground shrink-0 shadow-inner">
                                        {(d.customerName ?? "?").charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-foreground truncate">{d.customerName ?? "–"}</p>
                                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">{d.customerEmail ?? "–"}</p>
                                    </div>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-foreground truncate">{d.mainProductName ?? "–"}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest truncate mt-0.5">{d.subProductName ?? "–"}</p>
                                </div>
                                <div className="flex items-center">
                                    <div className="px-2.5 py-1 rounded bg-muted text-xs font-bold text-foreground shadow-sm">
                                        &times;{d.quantity ?? 1}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-mono font-bold text-emerald-500">
                                        ${(parseFloat(String(d.price || "0").replace(/[^0-9.-]+/g, '')) * (d.quantity ?? 1)).toFixed(2)}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                                        ${parseFloat(String(d.price || "0").replace(/[^0-9.-]+/g, ''))}/each
                                    </p>
                                </div>
                                <p className="text-xs text-muted-foreground font-medium">{date}</p>
                            </div>
                        );
                    })}
                </div>

                {salesTotalPages > 1 && (
                    <Pagination page={salesPage} totalPages={salesTotalPages} onPageChange={p => setSalesPage(p)} />
                )}
            </div>

            <SaleDetailsModal
                open={!!selectedSale}
                sale={selectedSale}
                onClose={() => setSelectedSale(null)}
            />
        </div>
    );
}
