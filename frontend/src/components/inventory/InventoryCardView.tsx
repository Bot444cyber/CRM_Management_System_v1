"use client";

import React from 'react';
import { Inventory } from '@/context/InventoryContext';
import {
    Package,
    Layers,
    TrendingUp,
    AlertTriangle,
    Plus,
    ArrowRight,
    ShoppingCart,
    Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InventoryCardViewProps {
    inventories: Inventory[];
    onSelectInventory: (id: string) => void;
    onAddInventory: () => void;
}

const InventoryCardView: React.FC<InventoryCardViewProps> = ({
    inventories,
    onSelectInventory,
    onAddInventory
}) => {
    return (
        <div className="w-full space-y-10 animate-in fade-in duration-1000">

            {/* --- REFINED CRM HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border pb-6">
                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                    Digital Vault
                </h1>
                <button
                    onClick={onAddInventory}
                    className="group flex items-center gap-3 bg-foreground text-background px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-md hover:opacity-90"
                >
                    <Plus size={16} className="text-background/60 group-hover:text-background transition-colors" />
                    Initialize Asset
                </button>
            </div>

            {/* --- LUXURY PRODUCT GRID --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
                {inventories.map((inv, index) => {
                    const totalMain = inv.mainProducts.length;
                    const totalSub = inv.mainProducts.reduce((a, m) => a + (m.subProducts?.length ?? 0), 0);
                    const outOfStock = inv.mainProducts.reduce((a, m) => a + m.subProducts.filter(s => s.stock === 0).length, 0);

                    return (
                        <div
                            key={inv.id}
                            className={cn(
                                "group relative flex flex-col transition-all duration-500 bg-card border border-border rounded-[2rem] hover:border-accent-foreground/20 overflow-hidden"
                            )}
                        >
                            {/* 1. HERO IMAGE (Reduced Size) */}
                            <div className="relative h-64 w-full overflow-hidden bg-muted border-b border-border transform-gpu">
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-card z-10 transition-opacity duration-700 group-hover:opacity-80" />

                                {inv.imageUrl ? (
                                    <img
                                        src={inv.imageUrl}
                                        alt={inv.name}
                                        className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-[1.03] origin-center"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                        }}
                                    />
                                ) : null}

                                {/* Fallback if no valid image */}
                                <div className={cn("w-full h-full flex items-center justify-center bg-muted transition-transform duration-700 ease-in-out group-hover:scale-[1.03]", inv.imageUrl ? "hidden" : "flex")}>
                                    <Package size={48} className="text-muted-foreground" />
                                </div>

                                {/* Status Float Badge */}
                                <div className="absolute top-4 left-4 z-20">
                                    <div className="bg-background/80 backdrop-blur-xl border border-border px-3 py-1.5 rounded-full">
                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">
                                            Ref: {inv.id.slice(0, 8)}
                                        </span>
                                    </div>
                                </div>

                                {/* Internal Title Overlay */}
                                <div className="absolute bottom-6 left-6 right-6 z-20">
                                    <h2 className="text-3xl font-black text-foreground tracking-tighter drop-shadow-lg truncate">
                                        {inv.name}
                                    </h2>
                                </div>
                            </div>

                            {/* 2. CARD CONTENT & STATS */}
                            <div className="p-6">
                                <div className="grid grid-cols-3 gap-3 mb-6">
                                    <OverlayStat label="Groups" value={totalMain} />
                                    <OverlayStat label="Items" value={totalSub} />
                                    <OverlayStat
                                        label="Alerts"
                                        value={outOfStock}
                                        isAlert={outOfStock > 0}
                                    />
                                </div>

                                {/* EXTERNAL ACTION BUTTON */}
                                <div className="pt-4 border-t border-border flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            "w-2 h-2 rounded-full animate-pulse",
                                            outOfStock > 0 ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                                        )} />
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                            {outOfStock > 0 ? 'Action Reqd' : 'Optimized'}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => onSelectInventory(inv.id)}
                                        className="flex items-center gap-2 text-foreground font-black text-[11px] uppercase tracking-widest group/btn hover:text-blue-500 transition-colors"
                                    >
                                        Enter Vault
                                        <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover/btn:border-blue-500/30 group-hover/btn:bg-blue-500/10 transition-all">
                                            <ArrowRight size={14} />
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* --- EMPTY STATE --- */}
                {inventories.length === 0 && (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center border border-border border-dashed rounded-3xl bg-muted/30">
                        <ShoppingCart size={32} className="text-muted-foreground mb-4" />
                        <h3 className="text-xl font-bold text-foreground tracking-tight">The Vault is Empty</h3>
                        <p className="text-muted-foreground text-sm mt-1">Start your collection by initializing your first asset container.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

/* --- MINI COMPONENT FOR IMAGE OVERLAY --- */
const OverlayStat = ({ label, value, isAlert }: any) => (
    <div className="space-y-1">
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{label}</p>
        <p className={cn(
            "text-lg font-black tabular-nums",
            isAlert ? "text-rose-500" : "text-foreground"
        )}>{value}</p>
    </div>
);

export default InventoryCardView;