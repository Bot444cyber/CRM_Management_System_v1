"use client";

import React, { useMemo, useState } from 'react';
import { useInventory, SubProduct } from '@/context/InventoryContext';
import { Tag, Box, DollarSign, Percent, Package, Search, ChevronDown, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import Pagination from '@/components/Pagination';
import SubProductShowcaseView from '@/components/inventory/SubProductShowcaseView';

interface FlatProduct {
    key: string;
    inventoryId: string;
    inventoryName: string;
    inventoryImageUrl?: string;
    mainProductName: string;
    mainProductImageUrl?: string;
    sub: SubProduct;
    mainProductIndex: number;
    subProductIndex: number;
}

type StatusFilter = 'All' | 'Active' | 'Draft' | 'Archived';

const ITEMS_PER_PAGE = 10;

export default function AllProductsPage() {
    const { inventories } = useInventory();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
    const [inventoryFilter, setInventoryFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [selectedProductInfo, setSelectedProductInfo] = useState<{ inventoryId: string, mainProductIndex: number, subProductIndex: number } | null>(null);

    const allProducts = useMemo<FlatProduct[]>(() => {
        return inventories.flatMap(inv =>
            inv.mainProducts.flatMap((mp, mpIndex) =>
                mp.subProducts.map((sub, spIndex) => ({
                    key: `${inv.id}-${mpIndex}-${spIndex}`,
                    inventoryId: inv.id,
                    inventoryName: inv.name,
                    inventoryImageUrl: inv.imageUrl,
                    mainProductName: mp.name,
                    mainProductImageUrl: mp.imageUrl,
                    sub,
                    mainProductIndex: mpIndex,
                    subProductIndex: spIndex,
                }))
            )
        );
    }, [inventories]);

    const filtered = useMemo(() => {
        return allProducts.filter(p => {
            const matchSearch = search.trim() === '' ||
                p.sub.name.toLowerCase().includes(search.toLowerCase()) ||
                p.inventoryName.toLowerCase().includes(search.toLowerCase()) ||
                p.mainProductName.toLowerCase().includes(search.toLowerCase());
            const matchStatus = statusFilter === 'All' || p.sub.status === statusFilter;
            const matchInventory = inventoryFilter === 'all' || p.inventoryId === inventoryFilter;
            return matchSearch && matchStatus && matchInventory;
        });
    }, [allProducts, search, statusFilter, inventoryFilter]);

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated = useMemo(
        () => filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE),
        [filtered, page]
    );

    const handleSearch = (v: string) => { setSearch(v); setPage(1); };
    const handleStatus = (v: StatusFilter) => { setStatusFilter(v); setPage(1); };
    const handleInventory = (v: string) => { setInventoryFilter(v); setPage(1); };

    if (selectedProductInfo) {
        const activeInventory = inventories.find(inv => inv.id === selectedProductInfo.inventoryId);
        if (activeInventory) {
            return (
                <div className="animate-in fade-in duration-500 min-h-full">
                    <SubProductShowcaseView
                        inventory={activeInventory}
                        mainProductIndex={selectedProductInfo.mainProductIndex}
                        subProductIndex={selectedProductInfo.subProductIndex}
                        onBack={() => setSelectedProductInfo(null)}
                        onSelectSubProduct={(index) => setSelectedProductInfo({ ...selectedProductInfo, subProductIndex: index })}
                    />
                </div>
            );
        }
    }

    return (
        <div className="animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">All Products</h1>
                    <p className="text-muted-foreground text-sm mt-1">{filtered.length} sub-products across all inventories</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                    {/* Inventory filter */}
                    <div className="relative">
                        <select
                            value={inventoryFilter}
                            onChange={e => handleInventory(e.target.value)}
                            className="appearance-none bg-card border border-border rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors pl-4 pr-10 py-2 focus:outline-none cursor-pointer"
                        >
                            <option value="all">All Inventories</option>
                            {inventories.map(inv => (
                                <option key={inv.id} value={inv.id}>{inv.name}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>

                    {/* Status filter */}
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={e => handleStatus(e.target.value as StatusFilter)}
                            className="appearance-none bg-card border border-border rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors pl-4 pr-10 py-2 focus:outline-none cursor-pointer"
                        >
                            {(['All', 'Active', 'Draft', 'Archived'] as StatusFilter[]).map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>

                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <input
                            type="text"
                            value={search}
                            onChange={e => handleSearch(e.target.value)}
                            placeholder="Search products..."
                            className="pl-9 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-border transition-all w-full"
                        />
                    </div>
                </div>
            </div>

            {/* Product Cards */}
            <div className="grid grid-cols-1 gap-4">
                {paginated.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 border border-border border-dashed rounded-2xl text-muted-foreground">
                        <Package size={40} className="mb-4 opacity-30" />
                        <p className="font-bold text-sm uppercase tracking-widest">No products found</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    paginated.map((p) => (
                        <div
                            key={p.key}
                            onClick={() => setSelectedProductInfo({ inventoryId: p.inventoryId, mainProductIndex: p.mainProductIndex, subProductIndex: p.subProductIndex })}
                            className="bg-card border border-border rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between hover:bg-accent hover:border-accent-foreground/20 transition-all group gap-6 lg:gap-0 cursor-pointer"
                        >
                            {/* Identity — left 30% */}
                            <div className="flex items-center gap-5 w-full lg:w-[30%]">
                                {p.sub.imageUrl ? (
                                    <img
                                        src={p.sub.imageUrl}
                                        alt={p.sub.name}
                                        className="w-14 h-14 rounded-2xl object-cover border border-border shrink-0"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                ) : (
                                    <div className="w-14 h-14 bg-muted border border-border rounded-2xl flex items-center justify-center text-muted-foreground font-bold text-lg group-hover:bg-foreground group-hover:text-background transition-all duration-500 shrink-0">
                                        <Tag size={20} />
                                    </div>
                                )}
                                <div className="flex flex-col min-w-0">
                                    <h3 className="font-bold text-foreground text-base truncate">{p.sub.name}</h3>
                                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs mt-1">
                                        <Tag size={10} />
                                        <span>Sub Product · #{p.subProductIndex + 1}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Metrics — right 65% */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-0 lg:flex lg:flex-row lg:w-[65%]">
                                {/* Category */}
                                <div className="flex flex-col lg:w-[30%] lg:px-6 lg:border-l lg:border-border min-w-0">
                                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Category</span>
                                    <div className="flex items-center gap-2 mt-2 min-w-0">
                                        {p.inventoryImageUrl ? (
                                            <img src={p.inventoryImageUrl} alt="" className="w-5 h-5 rounded object-cover shrink-0"
                                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                        ) : (
                                            <Box size={13} className="text-muted-foreground shrink-0" />
                                        )}
                                        <span className="text-sm font-bold text-foreground truncate">{p.inventoryName}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-1 min-w-0">
                                        <Package size={10} className="text-muted-foreground shrink-0" />
                                        <span className="text-[10px] text-muted-foreground/80 truncate">{p.mainProductName}</span>
                                    </div>
                                </div>

                                {/* Unit Price */}
                                <div className="flex flex-col lg:w-[20%] lg:px-6 lg:border-l lg:border-border">
                                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Unit Price</span>
                                    <div className="flex items-center gap-1.5 mt-2">
                                        <DollarSign size={14} className="text-muted-foreground" />
                                        <span className="text-sm font-bold text-foreground font-mono">{p.sub.price}</span>
                                    </div>
                                </div>

                                {/* Stock */}
                                <div className="flex flex-col lg:w-[20%] lg:px-6 lg:border-l lg:border-border">
                                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Stock</span>
                                    <div className="flex items-center gap-1.5 mt-2">
                                        <Box size={14} className="text-muted-foreground" />
                                        <span className={cn("text-sm font-bold",
                                            p.sub.stock > 50 ? "text-foreground" : p.sub.stock > 0 ? "text-amber-500" : "text-rose-500"
                                        )}>
                                            {p.sub.stock > 0 ? `${p.sub.stock} units` : 'Out of stock'}
                                        </span>
                                    </div>
                                </div>

                                {/* Discount */}
                                <div className="flex flex-col lg:w-[15%] lg:px-6 lg:border-l lg:border-border">
                                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Discount</span>
                                    <div className="flex items-center gap-1.5 mt-2">
                                        <Percent size={14} className="text-muted-foreground" />
                                        <span className={cn("text-sm font-bold", p.sub.discount > 0 ? "text-emerald-500" : "text-muted-foreground/80")}>
                                            {p.sub.discount}%
                                        </span>
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="flex flex-col lg:w-[15%] lg:px-6 lg:border-l lg:border-border">
                                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Status</span>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0",
                                            p.sub.status === 'Active' ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]'
                                                : p.sub.status === 'Draft' ? 'bg-amber-500'
                                                    : 'bg-muted-foreground'
                                        )} />
                                        <span className={cn("text-sm font-bold",
                                            p.sub.status === 'Active' ? 'text-emerald-500'
                                                : p.sub.status === 'Draft' ? 'text-amber-500'
                                                    : 'text-muted-foreground'
                                        )}>{p.sub.status}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            <div className="flex flex-col items-center gap-2">
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                {filtered.length > 0 && (
                    <p className="text-center text-[10px] text-muted-foreground font-bold uppercase tracking-widest pb-2">
                        Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} products
                    </p>
                )}
            </div>
        </div>
    );
}
