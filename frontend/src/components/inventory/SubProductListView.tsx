"use client";

import React from 'react';
import { Inventory, SubProduct } from '@/context/InventoryContext';
import { Tag, DollarSign, Percent, ArrowLeft, ArrowRight, Plus, X, Search, Filter, Box, ChevronDown, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductDetails } from '../ProductDetailsPanel';
import { useMemo, useState } from 'react';

interface SubProductListViewProps {
    inventory: Inventory;
    mainProductIndex: number;
    onBack: () => void;
    onEditSubProduct: (sub: SubProduct, subIndex: number, mainIndex: number) => void;
    onAddSubProduct: (mainIndex: number) => void;
    onDeleteSubProduct: (subIndex: number) => void;
    onShowcaseSubProduct: (subIndex: number) => void;
}

const FallbackImage = ({ src, alt, className, fallbackIcon: FallbackIcon, iconSize }: any) => {
    const [error, setError] = React.useState(false);

    if (error || !src) {
        return (
            <div className={cn(className, "flex items-center justify-center bg-muted border-border text-muted-foreground group-hover:bg-foreground group-hover:text-background transition-all shrink-0")}>
                <FallbackIcon size={iconSize || 18} />
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

function StockBar({ stock }: { stock: number }) {
    const max = 100;
    const pct = Math.min((stock / max) * 100, 100);
    const color =
        stock === 0 ? 'bg-rose-500' :
            stock <= 20 ? 'bg-amber-400' :
                stock <= 50 ? 'bg-yellow-300' :
                    'bg-emerald-400';
    return (
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
                className={cn('h-full rounded-full transition-all duration-700', color)}
                style={{ width: `${pct}%` }}
            />
        </div>
    );
}

function StatusPill({ status }: { status: string }) {
    const map: Record<string, { bg: string; dot: string; text: string }> = {
        Active: { bg: 'bg-emerald-500/10 border-emerald-500/25', dot: 'bg-emerald-500', text: 'text-emerald-500' },
        Draft: { bg: 'bg-amber-500/10 border-amber-500/25', dot: 'bg-amber-500', text: 'text-amber-500' },
        Discontinued: { bg: 'bg-muted border-border', dot: 'bg-muted-foreground/50', text: 'text-muted-foreground' },
    };
    const s = map[status] ?? map['Discontinued'];
    return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider', s.bg, s.text)}>
            <span className={cn('w-1.5 h-1.5 rounded-full', s.dot)} />
            {status}
        </span>
    );
}

const SubProductListView: React.FC<SubProductListViewProps> = ({
    inventory,
    mainProductIndex,
    onBack,
    onEditSubProduct,
    onAddSubProduct,
    onDeleteSubProduct,
    onShowcaseSubProduct
}) => {
    const mp = inventory.mainProducts[mainProductIndex];
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('All');

    const filteredProducts = useMemo(() => {
        if (!mp) return [];
        return mp.subProducts.filter((sub) => {
            const matchSearch = sub.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchStatus = statusFilter === 'All' || sub.status === statusFilter;
            return matchSearch && matchStatus;
        });
    }, [mp, searchQuery, statusFilter]);

    if (!mp) return null;

    return (
        <div className="flex flex-col animate-in fade-in duration-500 space-y-6">

            {/* Breadcrumb / Back Navigation */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onBack}
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-muted border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                >
                    <ArrowLeft size={14} />
                </button>
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors" onClick={() => { onBack(); /* Needs extra hop if we wanted to go to root, but this goes back 1 level */ }}>{inventory.name}</span>
                    <span className="text-muted-foreground/50">/</span>
                    <span className="text-foreground font-bold">{mp.name}</span>
                </div>
            </div>

            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">{mp.name} Items</h1>
                    <p className="text-muted-foreground text-sm mt-1">Manage individual items within this category.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => onAddSubProduct(mainProductIndex)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-foreground text-background rounded-xl text-[11px] font-bold hover:opacity-90 transition-all uppercase tracking-widest shadow-md"
                    >
                        <Plus size={14} /> Add Item
                    </button>
                </div>
            </div>

            {/* List Container */}
            <div className="rounded-2xl border border-border overflow-hidden bg-card shadow-2xl">

                {/* Tools Bar (Search/Filter) */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 px-6 py-4 border-b border-border bg-muted/20">
                    {/* Search */}
                    <div className="relative flex-1 max-w-sm group">
                        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search items..."
                            className="w-full bg-muted/50 border border-border text-foreground text-sm rounded-xl py-2 pl-10 pr-9 focus:outline-none focus:border-foreground/30 focus:bg-background transition-all placeholder:text-muted-foreground shadow-sm"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors bg-muted border border-border rounded-full p-0.5"
                            >
                                <XCircle size={12} />
                            </button>
                        )}
                    </div>

                    {/* Filter */}
                    <div className="relative w-full sm:w-auto">
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="appearance-none w-full sm:w-auto bg-muted border border-border rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground transition-colors pl-10 pr-10 py-2.5 focus:outline-none focus:ring-1 focus:ring-border cursor-pointer shadow-sm uppercase tracking-wider"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Active">Active</option>
                            <option value="Draft">Draft</option>
                            <option value="Discontinued">Discontinued</option>
                        </select>
                        <Filter size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                </div>

                {/* Header Row - Removed since we are using cards now */}

                {/* Grid Body */}
                <div className="p-6">
                    {filteredProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 px-4 border border-border bg-muted/30 rounded-2xl border-dashed">
                            <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center mb-4 shadow-sm">
                                <Search size={24} className="text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2 tracking-tight">
                                {mp.subProducts.length === 0 ? "No Items Yet" : "No Match Found"}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm leading-relaxed">
                                {mp.subProducts.length === 0
                                    ? "Add specific items to this category to start managing their stock and details."
                                    : "Try adjusting your search query or status filter to find what you're looking for."}
                            </p>
                            {mp.subProducts.length === 0 ? (
                                <button
                                    onClick={() => onAddSubProduct(mainProductIndex)}
                                    className="px-6 py-3 bg-foreground hover:opacity-90 text-background rounded-xl text-xs font-bold transition-all uppercase tracking-wider shadow-md flex items-center gap-2"
                                >
                                    <Plus size={16} /> Create First Item
                                </button>
                            ) : (
                                <button
                                    onClick={() => { setSearchQuery(''); setStatusFilter('All'); }}
                                    className="px-6 py-2.5 bg-background border border-border text-foreground rounded-xl text-xs font-bold transition-all uppercase tracking-wider hover:bg-muted"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                            {filteredProducts.map((sub: SubProduct, index: number) => {
                                const originalIndex = mp.subProducts.indexOf(sub);
                                return (
                                    <div
                                        key={originalIndex}
                                        onClick={() => onShowcaseSubProduct(originalIndex)}
                                        className="group relative flex flex-col bg-card border border-border rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:border-accent-foreground/20 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                                    >
                                        {/* Image Section */}
                                        <div className="relative w-full aspect-[4/3] bg-muted overflow-hidden">
                                            {/* Image Label / Badge */}
                                            <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                                                <StatusPill status={sub.status} />
                                                {sub.discount > 0 && (
                                                    <div className="inline-flex items-center gap-1 backdrop-blur-md bg-background/80 border border-border px-2 py-1 rounded-lg text-[10px] font-bold text-emerald-500 uppercase tracking-wider shadow-lg">
                                                        <Percent size={10} /> {sub.discount}% OFF
                                                    </div>
                                                )}
                                            </div>

                                            <FallbackImage
                                                src={sub.imageUrl}
                                                alt={sub.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out opacity-80 group-hover:opacity-100"
                                                fallbackIcon={Box}
                                                iconSize={48}
                                            />

                                            {/* Overlay gradient for readability */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent opacity-80" />

                                            {/* Product Price & Name Floating over image */}
                                            <div className="absolute bottom-0 left-0 right-0 p-5 pt-12 text-foreground">
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">SKU #{String(originalIndex + 1).padStart(3, '0')}</p>
                                                <h3 className="text-xl font-extrabold tracking-tight leading-tight line-clamp-2">{sub.name}</h3>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-sm font-bold flex items-center gap-1 shadow-inner">
                                                        <DollarSign size={14} />{sub.price}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card Body - Metrics & Actions */}
                                        <div className="p-5 flex flex-col gap-4 flex-1 justify-end bg-card">

                                            {/* Stock Section */}
                                            <div className="space-y-2.5 bg-muted/30 rounded-xl p-3 border border-border">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                                        <Box size={12} /> Inventory
                                                    </span>
                                                    <span className={cn(
                                                        'text-xs font-bold bg-background/50 px-2 py-0.5 rounded-md border border-border',
                                                        sub.stock === 0 ? 'text-rose-500' :
                                                            sub.stock <= 20 ? 'text-amber-500' : 'text-emerald-500'
                                                    )}>
                                                        {sub.stock > 0 ? `${sub.stock} Units` : 'Out of Stock'}
                                                    </span>
                                                </div>
                                                <StockBar stock={sub.stock} />
                                            </div>

                                            {/* Actions */}
                                            <div className="grid grid-cols-2 gap-2 mt-auto pt-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onEditSubProduct(sub, originalIndex, mainProductIndex); }}
                                                    className="flex items-center justify-center gap-2 py-2.5 bg-muted hover:bg-muted/80 border border-border hover:border-foreground/20 rounded-xl text-[11px] font-bold text-foreground uppercase tracking-wider transition-all"
                                                >
                                                    Edit Details
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onDeleteSubProduct(originalIndex); }}
                                                    className="flex items-center justify-center gap-2 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 rounded-xl text-[11px] font-bold text-red-500 uppercase tracking-wider transition-all"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubProductListView;
