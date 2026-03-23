"use client";

import React, { useMemo, useState } from 'react';
import { useInventory, SubProduct } from '@/context/InventoryContext';
import { Tag, Box, DollarSign, Percent, Package, Search, ChevronDown, ArrowLeft, Send, Facebook, Twitter, MessagesSquare, Share2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Pagination from '@/components/Pagination';
import SubProductShowcaseView from '@/components/inventory/SubProductShowcaseView';
import WhatsAppPublishModal from '@/components/WhatsAppPublishModal';
import { apiFetch } from '@/lib/apiFetch';
import toast from 'react-hot-toast';

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
    const [debouncedSearch, setDebouncedSearch] = useState('');

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
    const [inventoryFilter, setInventoryFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [selectedProductInfo, setSelectedProductInfo] = useState<{ inventoryId: string, mainProductIndex: number, subProductIndex: number } | null>(null);
    const [whatsappProduct, setWhatsappProduct] = useState<any>(null);
    const [openPublishMenu, setOpenPublishMenu] = useState<string | null>(null);
    const [isCheckingWhatsapp, setIsCheckingWhatsapp] = useState(false);

    const handleWhatsAppClick = async (e: React.MouseEvent, p: FlatProduct) => {
        e.stopPropagation();
        setOpenPublishMenu(null);

        if (isCheckingWhatsapp) return;
        setIsCheckingWhatsapp(true);

        const loadingToast = toast.loading("Checking WhatsApp configuration...", {
            style: {
                borderRadius: '10px',
                background: '#333',
                color: '#fff',
            },
        });

        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/settings/green-api`, { method: 'GET' });
            if (res.ok) {
                const data = await res.json();
                if (data.greenApiInstanceId && data.greenApiToken) {
                    toast.dismiss(loadingToast);
                    setWhatsappProduct({
                        name: p.sub.name,
                        imageUrl: p.sub.imageUrl,
                        subProducts: []
                    });
                    return;
                }
            }
            // If we reach here, either not OK or missing credentials
            toast.error(
                <div className="flex flex-col gap-1">
                    <span className="font-bold">Configuration Required</span>
                    <span className="text-xs opacity-90">Please set up your GreenAPI settings first to use WhatsApp sharing.</span>
                </div>,
                { id: loadingToast, duration: 5000 }
            );
        } catch (err) {
            toast.error("Failed to check configuration.", { id: loadingToast });
        } finally {
            setIsCheckingWhatsapp(false);
        }
    };

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
            const matchSearch = debouncedSearch.trim() === '' ||
                p.sub.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                p.inventoryName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                p.mainProductName.toLowerCase().includes(debouncedSearch.toLowerCase());
            const matchStatus = statusFilter === 'All' || p.sub.status === statusFilter;
            const matchInventory = inventoryFilter === 'all' || p.inventoryId === inventoryFilter;
            return matchSearch && matchStatus && matchInventory;
        });
    }, [allProducts, debouncedSearch, statusFilter, inventoryFilter]);

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated = useMemo(
        () => filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE),
        [filtered, page]
    );

    const handleSearch = (v: string) => { setSearch(v); };
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
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors" size={16} />
                        <input
                            type="text"
                            value={search}
                            onChange={e => handleSearch(e.target.value)}
                            placeholder="Search products..."
                            className="pl-9 pr-9 py-2 bg-muted/50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-border transition-all w-full"
                        />
                        {search && (
                            <button
                                onClick={() => handleSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors bg-muted/50 hover:bg-muted rounded-full p-0.5"
                            >
                                <XCircle size={14} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Product Cards */}
            <div className="grid grid-cols-1 gap-4">
                {paginated.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 border border-border border-dashed rounded-2xl text-muted-foreground bg-muted/5">
                        <Package size={40} className="mb-4 opacity-30" />
                        <p className="font-bold text-sm uppercase tracking-widest text-foreground/80">No products found</p>
                        <p className="text-xs text-muted-foreground/60 mt-1 max-w-[250px] text-center">
                            {search || statusFilter !== 'All' || inventoryFilter !== 'all'
                                ? 'Try adjusting your search query or filters'
                                : 'You don\'t have any products. Add some in the Systems Edge tab.'}
                        </p>
                        {(search || statusFilter !== 'All' || inventoryFilter !== 'all') && (
                            <button
                                onClick={() => { setSearch(''); setStatusFilter('All'); setInventoryFilter('all'); }}
                                className="mt-5 text-xs font-bold text-foreground border border-border px-4 py-2 rounded-lg hover:bg-muted transition-colors"
                            >
                                Clear all filters
                            </button>
                        )}
                    </div>
                ) : (
                    paginated.map((p) => (
                        <div
                            key={p.key}
                            onClick={() => setSelectedProductInfo({ inventoryId: p.inventoryId, mainProductIndex: p.mainProductIndex, subProductIndex: p.subProductIndex })}
                            className="bg-card border border-border rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between hover:bg-accent hover:border-accent-foreground/20 transition-all group gap-6 lg:gap-0 cursor-pointer"
                        >
                            {/* Identity — left 32% */}
                            <div className="flex items-center gap-5 w-full lg:w-[32%]">
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
                                <div className="flex flex-col min-w-0 pr-4">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-bold text-foreground text-base truncate">{p.sub.name}</h3>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs mt-1">
                                        <Tag size={10} />
                                        <span>Sub Product · #{p.subProductIndex + 1}</span>
                                    </div>
                                </div>

                            </div>

                            {/* Metrics — right 68% */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-0 lg:flex lg:flex-row lg:w-[68%]">
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
                                <div className="flex flex-col lg:w-[17%] lg:px-6 lg:border-l lg:border-border">
                                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Unit Price</span>
                                    <div className="flex items-center gap-1.5 mt-2">
                                        <DollarSign size={14} className="text-muted-foreground" />
                                        <span className="text-sm font-bold text-foreground font-mono">{p.sub.price}</span>
                                    </div>
                                </div>

                                {/* Stock */}
                                <div className="flex flex-col lg:w-[18%] lg:px-6 lg:border-l lg:border-border">
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

                                {/* Publish */}
                                <div className="flex flex-col lg:w-[20%] lg:px-6 lg:border-l lg:border-border relative">
                                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Publish</span>
                                    <div className="mt-2 relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenPublishMenu(openPublishMenu === p.key ? null : p.key);
                                            }}
                                            className={cn("flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-[11px] font-bold w-full sm:w-auto",
                                                openPublishMenu === p.key
                                                    ? "bg-foreground text-background border-foreground shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                                                    : "bg-muted/30 text-foreground border-border hover:bg-muted/80 shadow-sm"
                                            )}
                                        >
                                            <Share2 size={13} className={openPublishMenu === p.key ? "text-background" : "text-muted-foreground"} />
                                            Share
                                        </button>

                                        {openPublishMenu === p.key && (
                                            <>
                                                {/* Invisible backdrop to close when clicking outside */}
                                                <div
                                                    className="fixed inset-0 z-40"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenPublishMenu(null);
                                                    }}
                                                />
                                                {/* Dropdown Menu */}
                                                <div className="absolute top-full right-0 lg:left-0 lg:right-auto mt-2 w-[160px] bg-[#09090b] border border-border/80 rounded-[1.25rem] shadow-2xl shadow-black overflow-hidden z-[100] flex flex-col p-1.5 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200">
                                                    <button
                                                        onClick={(e) => handleWhatsAppClick(e, p)}
                                                        disabled={isCheckingWhatsapp}
                                                        className="flex items-center gap-3 px-3 py-2.5 rounded-[12px] hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-500 transition-colors w-full text-left text-[13px] font-bold group disabled:opacity-50"
                                                    >
                                                        <MessagesSquare size={16} className="text-emerald-500/70 group-hover:text-emerald-500 transition-colors" />
                                                        WhatsApp
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setOpenPublishMenu(null);
                                                            alert("Facebook integration coming soon!");
                                                        }}
                                                        className="flex items-center gap-3 px-3 py-2.5 rounded-[12px] hover:bg-blue-500/10 text-muted-foreground hover:text-blue-500 transition-colors w-full text-left text-[13px] font-bold group"
                                                    >
                                                        <Facebook size={16} className="text-blue-500/70 group-hover:text-blue-500 transition-colors" />
                                                        Facebook
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setOpenPublishMenu(null);
                                                            alert("Twitter integration coming soon!");
                                                        }}
                                                        className="flex items-center gap-3 px-3 py-2.5 rounded-[12px] hover:bg-sky-500/10 text-muted-foreground hover:text-sky-500 transition-colors w-full text-left text-[13px] font-bold group"
                                                    >
                                                        <Twitter size={16} className="text-sky-500/70 group-hover:text-sky-500 transition-colors" />
                                                        Twitter/X
                                                    </button>
                                                </div>
                                            </>
                                        )}
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

            {/* WhatsApp Publish Modal */}
            {whatsappProduct && (
                <WhatsAppPublishModal
                    isOpen={!!whatsappProduct}
                    onClose={() => setWhatsappProduct(null)}
                    productDetails={whatsappProduct}
                />
            )}
        </div>
    );
}
