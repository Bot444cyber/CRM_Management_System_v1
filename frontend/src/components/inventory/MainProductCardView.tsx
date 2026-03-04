"use client";

import React from 'react';
import { Inventory, MainProduct } from '@/context/InventoryContext';
import { Package, Layers, TrendingUp, AlertTriangle, ArrowLeft, ArrowRight, Plus, Archive, Box } from 'lucide-react';
import { cn } from '@/lib/utils';
import AddMainProductModal from '../AddMainProductModal';

interface MainProductCardViewProps {
    inventory: Inventory;
    onBack: () => void;
    onSelectMainProduct: (index: number) => void;
    onAddMainProduct: (mp: MainProduct) => Promise<void>;
    showAddModal: boolean;
    setShowAddModal: (show: boolean) => void;
}

const FallbackImage = ({ src, alt, className, fallbackIcon: FallbackIcon, iconSize }: any) => {
    const [error, setError] = React.useState(false);

    if (error || !src) {
        return (
            <div className={cn(className, "flex items-center justify-center bg-muted border-border text-muted-foreground group-hover:bg-foreground group-hover:text-background transition-all shrink-0")}>
                <FallbackIcon size={iconSize || 20} />
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            onError={() => setError(true)}
        />
    );
};

const MainProductCardView: React.FC<MainProductCardViewProps> = ({
    inventory,
    onBack,
    onSelectMainProduct,
    onAddMainProduct,
    showAddModal,
    setShowAddModal
}) => {
    // Totals for header
    const totalSub = inventory.mainProducts.reduce((a, m) => a + (m.subProducts?.length ?? 0), 0);
    const totalStock = inventory.mainProducts.reduce((a, m) => a + m.subProducts.reduce((b, s) => b + (s.stock ?? 0), 0), 0);
    const outOfStock = inventory.mainProducts.reduce((a, m) => a + m.subProducts.filter(s => s.stock === 0).length, 0);

    return (
        <div className="flex flex-col animate-in fade-in duration-500 space-y-6">

            {/* Breadcrumb / Back Navigation */}
            <div className="flex items-center gap-3 justify-between">

                <button
                    onClick={onBack}
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-muted border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                >
                    <ArrowLeft size={14} />
                </button>
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors" onClick={onBack}>Inventories</span>
                    <span className="text-muted-foreground/50">/</span>
                    <span className="text-foreground font-bold">{inventory.name}</span>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="shrink-0 flex items-center gap-2 px-5 py-3 bg-foreground text-background rounded-xl text-xs font-bold hover:opacity-90 transition-all uppercase tracking-widest shadow-md"
                >
                    <Plus size={14} /> Add Category
                </button>
            </div>

            {/* Grid of Main Products */}
            {inventory.mainProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {inventory.mainProducts.map((mp, index) => {
                        const inStock = mp.subProducts.filter(s => s.stock > 0).length;
                        const oos = mp.subProducts.filter(s => s.stock === 0).length;

                        return (
                            <div
                                key={index}
                                onClick={() => onSelectMainProduct(index)}
                                className="group relative bg-card border border-border rounded-2xl p-6 cursor-pointer hover:border-accent-foreground/20 hover:bg-accent/50 transition-all duration-300 overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-foreground/5 rounded-full blur-2xl group-hover:bg-foreground/10 transition-colors pointer-events-none" />

                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <FallbackImage
                                            src={mp.imageUrl}
                                            alt={mp.name}
                                            className="w-12 h-12 rounded-xl object-cover border border-border shrink-0"
                                            fallbackIcon={Layers}
                                            iconSize={20}
                                        />
                                        <div>
                                            <h3 className="text-lg font-bold text-foreground tracking-wide">{mp.name}</h3>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">Category #{index + 1}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 relative z-10">
                                    <div className="flex items-center justify-between py-2 border-b border-border">
                                        <span className="text-xs text-muted-foreground font-medium">Items</span>
                                        <span className="text-sm font-bold text-foreground">{mp.subProducts.length}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b border-border">
                                        <span className="text-xs text-muted-foreground font-medium">Active Stock</span>
                                        <span className="text-sm font-bold text-emerald-500">{inStock}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-xs text-muted-foreground font-medium">Out of Stock</span>
                                        <span className={cn("text-sm font-bold", oos > 0 ? "text-rose-500" : "text-muted-foreground/50")}>{oos}</span>
                                    </div>
                                </div>

                                <div className="mt-6 flex items-center justify-between text-muted-foreground group-hover:text-foreground transition-colors">
                                    <span className="text-[10px] font-bold uppercase tracking-widest">View Items</span>
                                    <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 px-4 border border-border border-dashed rounded-3xl bg-muted/30">
                    <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center mb-6">
                        <Archive size={28} className="text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2 tracking-tight">No Categories Found</h3>
                    <p className="text-muted-foreground text-sm text-center max-w-sm mb-8">
                        This asset container is currently empty. Add your first category to begin organizing items.
                    </p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-muted hover:bg-foreground hover:text-background border border-border hover:border-foreground text-foreground rounded-xl text-xs font-bold transition-all uppercase tracking-widest"
                    >
                        <Plus size={14} /> Create First Category
                    </button>
                </div>
            )}

            <AddMainProductModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSave={onAddMainProduct}
            />
        </div>
    );
};

export default MainProductCardView;
