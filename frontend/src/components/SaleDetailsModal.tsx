"use client";

import React from "react";
import { X, CheckCircle2, Download, Printer } from "lucide-react";
import ModalPortal from "./ModalPortal";

export interface SaleDetailsModalProps {
    open: boolean;
    sale: any | null;
    onClose: () => void;
}

export default function SaleDetailsModal({ open, sale, onClose }: SaleDetailsModalProps) {
    if (!open || !sale) return null;

    let d = sale.entityDetails || {};
    if (typeof d === 'string') {
        try { d = JSON.parse(d); } catch (e) { d = {}; }
    }

    const date = sale.createdAt ? new Date(sale.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: "long", day: "numeric" }) : "–";
    const time = sale.createdAt ? new Date(sale.createdAt).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' }) : "–";
    const qty = d.quantity ?? 1;
    const priceStr = String(d.price || "0").replace(/[^0-9.-]+/g, '');
    const price = parseFloat(priceStr);
    const total = price * qty;
    const transactionId = sale.id ? `SALE-${sale.id.toString().padStart(6, '0')}` : `#SALE-${Math.floor(Math.random() * 900000) + 100000}`;

    return (
        <ModalPortal>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

                <div className="relative z-10 w-full max-w-md max-h-[90vh] flex flex-col bg-card border border-border rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-muted/30 shrink-0">
                        <h2 className="text-foreground font-bold text-lg tracking-tight">Transaction Details</h2>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Receipt Body */}
                    <div className="p-6 md:p-8 bg-muted/10 relative overflow-y-auto custom-scrollbar flex-1 min-h-0">
                        <div className="text-center mb-8 relative z-20">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                                <CheckCircle2 size={32} className="text-emerald-500" />
                            </div>
                            <h3 className="text-3xl font-bold text-foreground mb-1 tracking-tight">${total.toFixed(2)}</h3>
                            <p className="text-emerald-500 text-xs font-bold uppercase tracking-widest">Successful Payment</p>
                        </div>

                        <div className="space-y-6 relative z-20">
                            <div className="flex items-center justify-between pb-6 border-b border-border border-dashed">
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Receipt ID</p>
                                    <p className="text-sm font-mono font-semibold text-foreground">{transactionId}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Date & Time</p>
                                    <p className="text-sm font-mono font-semibold text-foreground">{date} &bull; {time}</p>
                                </div>
                            </div>

                            <div className="space-y-4 pb-6 border-b border-border border-dashed">
                                <div className="flex justify-between items-start">
                                    <div className="min-w-0 pr-4">
                                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">Item Purchased</p>
                                        <p className="text-base font-bold text-foreground truncate">{d.mainProductName ?? "Unknown Product"}</p>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{d.subProductName ?? "Variant"}</p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center text-sm mt-3 pt-3 bg-muted/20 rounded-lg p-3 border border-border/50">
                                    <span className="text-muted-foreground font-bold tracking-wider">Qty {qty} &times; ${price.toFixed(2)}</span>
                                    <span className="text-foreground font-mono font-bold">${total.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="space-y-4 pb-6 border-b border-border">
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">Billed To</p>
                                    <div className="flex items-center gap-3 bg-muted/20 p-3 rounded-xl border border-border/50">
                                        <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-sm font-bold text-foreground shrink-0 shadow-inner">
                                            {(d.customerName ?? "?").charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-foreground truncate">{d.customerName ?? "Unknown Customer"}</p>
                                            <p className="text-xs text-muted-foreground truncate">{d.customerEmail ?? "No email provided"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-xl pt-2">
                                <span className="text-foreground font-bold tracking-widest uppercase">Total Paid</span>
                                <span className="text-emerald-500 font-mono font-bold">
                                    ${total.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="px-6 py-5 bg-muted/30 border-t border-border flex flex-col sm:flex-row items-center gap-3 shrink-0">
                        <button onClick={() => window.print()} className="w-full sm:flex-1 px-4 py-2.5 bg-background hover:bg-muted text-foreground border border-border rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                            <Printer size={16} /> Print
                        </button>
                        <button className="w-full sm:flex-1 px-4 py-2.5 bg-foreground text-background hover:opacity-90 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                            <Download size={16} /> PDF
                        </button>
                    </div>
                </div>
            </div>
        </ModalPortal>
    );
}
