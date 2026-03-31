"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    Calendar, Download, ChevronDown, Package, Tag, Layers, DollarSign,
    Box, Percent, TrendingUp, Users, ShoppingBag, Mail, MapPin, X,
    BarChart2, PieChart, TrendingDown, Activity, LayoutGrid,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useInventory } from '@/context/InventoryContext';
import dynamic from 'next/dynamic';
import { apiFetch } from '@/lib/apiFetch';
import { toast } from 'react-hot-toast';

const AnalyticsChart = dynamic(() => import('@/components/AnalyticsChart'), { ssr: false });
const TopProductsChart = dynamic(() => import('@/components/TopProductsChart'), { ssr: false });
const TopCustomersChart = dynamic(() => import('@/components/TopCustomersChart'), { ssr: false });
const SalesRevenueChart = dynamic(() => import('@/components/SalesRevenueChart'), { ssr: false });
const SalesVolumeChart = dynamic(() => import('@/components/SalesVolumeChart'), { ssr: false });
const ProductPriceChart = dynamic(() => import('@/components/ProductPriceChart'), { ssr: false });
const SalesShareChart = dynamic(() => import('@/components/SalesShareChart'), { ssr: false });
const InventoryStatsChart = dynamic(() => import('@/components/InventoryStatsChart'), { ssr: false });

// ── Types ──────────────────────────────────────────────────────────────────
interface SalesProduct {
    name: string;
    unitPrice: number;
    totalUnits: number;
    totalRevenue: number;
    revenueShare: number;
}
interface SalesBreakdown {
    products: SalesProduct[];
    timeSeries: Record<string, any>[];      // revenue / day
    unitTimeSeries: Record<string, any>[];  // units  / day
}

type SalesTab = 'revenue' | 'volume' | 'price' | 'share' | 'all';

// ── Helpers ────────────────────────────────────────────────────────────────
const formatCompact = (num: number) =>
    new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(num);

// ── Sales tab definitions ───────────────────────────────────────────────────
const SALES_TABS: { id: SalesTab; label: string; icon: React.ReactNode }[] = [
    { id: 'revenue', label: 'Revenue Trend', icon: <Activity size={14} /> },
    { id: 'volume', label: 'Volume', icon: <BarChart2 size={14} /> },
    { id: 'price', label: 'Price Comparison', icon: <TrendingDown size={14} /> },
    { id: 'share', label: 'Revenue Share', icon: <PieChart size={14} /> },
    { id: 'all', label: 'All Charts', icon: <LayoutGrid size={14} /> },
];

// ── Empty state ─────────────────────────────────────────────────────────────
const EmptyChart = ({ label }: { label: string }) => (
    <div className="h-[320px] w-full flex flex-col items-center justify-center border border-border border-dashed rounded-xl bg-muted/50">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
            <BarChart2 className="text-muted-foreground" size={18} />
        </div>
        <p className="text-muted-foreground text-sm font-medium">No sales data</p>
        <p className="text-muted-foreground text-xs mt-1">{label}</p>
    </div>
);

// ──────────────────────────────────────────────────────────────────────────
const Analytics = () => {
    const { inventories } = useInventory();

    const [data, setData] = useState<{ name: string; value: number }[]>([]);
    const [insights, setInsights] = useState<any>(null);
    const [salesBreakdown, setSalesBreakdown] = useState<SalesBreakdown | null>(null);
    const [selectedInventory, setSelectedInventory] = useState<string>('all');
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [salesTab, setSalesTab] = useState<SalesTab>('revenue');
    const analyticsRef = useRef<HTMLDivElement>(null);
    const [exporting, setExporting] = useState(false);

    const exportToPDF = async () => {
        if (!analyticsRef.current) return;
        setExporting(true);
        try {
            // Dynamically import tools
            const { toJpeg } = await import('html-to-image');
            const { jsPDF } = await import('jspdf');
            const autoTable = (await import('jspdf-autotable')).default;

            const pdf = new jsPDF('p', 'pt', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const margin = 40;

            // 1. Report Header
            pdf.setFontSize(22);
            pdf.setTextColor(40);
            pdf.text('Financial & Analytics Report', margin, 50);

            pdf.setFontSize(10);
            pdf.setTextColor(100);
            pdf.text(`Generated Date: ${new Date().toLocaleDateString()}`, margin, 70);
            pdf.text(`Inventory Scope: ${selectedInventory === 'all' ? 'All Inventories' : inventories.find(i => i.id === selectedInventory)?.name || selectedInventory}`, margin, 85);
            pdf.text('Prepared for: CA, Financial Analysts & Management', margin, 100);

            // 2. Executive Summary KPIs
            pdf.setFontSize(14);
            pdf.setTextColor(40);
            pdf.text('Executive Summary', margin, 140);

            const totalRev = `$${(insights?.totalRevenue || 0).toLocaleString()}`;
            const totalConv = (insights?.salesConverted || 0).toLocaleString();
            const totalCust = (insights?.totalCustomers || 0).toLocaleString();
            const avgSpend = `$${(insights?.averageSpend || 0).toLocaleString()}`;

            autoTable(pdf, {
                startY: 155,
                head: [['Total Revenue', 'Conversions', 'Total Customers', 'Avg. Spend']],
                body: [[totalRev, totalConv, totalCust, avgSpend]],
                theme: 'grid',
                headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold', halign: 'center' },
                styles: { halign: 'center', fontSize: 11, cellPadding: 8 }
            });

            // 3. Product Performance Data Table
            const lastY = (pdf as any).lastAutoTable.finalY || 155;
            pdf.setFontSize(14);
            pdf.setTextColor(40);
            pdf.text('Product Performance Breakdown', margin, lastY + 40);

            if (salesBreakdown?.products && salesBreakdown.products.length > 0) {
                const tableData = salesBreakdown.products.map(p => [
                    p.name,
                    `$${p.totalRevenue.toLocaleString()}`,
                    p.totalUnits.toLocaleString(),
                    `$${p.unitPrice.toLocaleString()}`,
                    `${p.revenueShare.toFixed(1)}%`
                ]);

                autoTable(pdf, {
                    startY: lastY + 55,
                    head: [['Product Name', 'Revenue', 'Volume', 'Avg Unit Price', 'Revenue Share']],
                    body: tableData,
                    theme: 'striped',
                    headStyles: { fillColor: [52, 73, 94], textColor: 255 },
                    styles: { fontSize: 10, cellPadding: 6 }
                });
            } else {
                pdf.setFontSize(10);
                pdf.text('No product data available for this period.', margin, lastY + 60);
            }

            // 4. Appendix: Visual Dashboard Capture
            pdf.addPage();
            pdf.setFontSize(14);
            pdf.text('Appendix: Dashboard Visuals', margin, 50);

            // Generate high-quality JPEG of the visual charts
            const imgData = await toJpeg(analyticsRef.current, {
                quality: 0.95,
                backgroundColor: '#09090b', // standard dark mode
                pixelRatio: 2,
                style: { transform: 'scale(1)', transformOrigin: 'top left' },
                filter: (node) => {
                    // Optionally hide the top header buttons during capture
                    if (node.id === 'export-actions') return false;
                    return true;
                }
            });

            const imgProps = new Image();
            imgProps.src = imgData;
            await new Promise((resolve) => { imgProps.onload = resolve });

            // Scale image to fit A4 width, maintaining aspect ratio
            const imgPdfWidth = pageWidth - (margin * 2);
            const imgPdfHeight = (imgProps.height * imgPdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'JPEG', margin, 70, imgPdfWidth, imgPdfHeight);

            // Save the Professional PDF
            pdf.save(`Financial_Report_${new Date().toISOString().split('T')[0]}.pdf`);
            toast.success('Dashboard exported successfully!');
        } catch (err: any) {
            console.error('Failed to export PDF:', err);
            toast.error('Failed to export PDF: ' + (err.message || 'Unknown error'));
        } finally {
            setExporting(false);
        }
    };

    // ── Day detail drill-down ──────────────────────────────────────────────
    const [dayDetail, setDayDetail] = useState<{ date: string; isoDate: string; sales: any[]; loading: boolean } | null>(null);

    const fetchDayDetail = useCallback(async (dateStr: string, isoDate: string) => {
        setDayDetail({ date: dateStr, isoDate, sales: [], loading: true });
        try {
            const res = await apiFetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/marketing/sales?date=${isoDate}`
            );
            if (res.ok) {
                const json = await res.json();
                setDayDetail({ date: dateStr, isoDate, sales: json.data ?? [], loading: false });
            } else {
                setDayDetail(prev => prev ? { ...prev, loading: false } : null);
            }
        } catch {
            setDayDetail(prev => prev ? { ...prev, loading: false } : null);
        }
    }, []);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await apiFetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/analytics?inventoryId=${selectedInventory}`
                );
                if (res.ok) setData(await res.json());
            } catch (err) { console.error('Failed to fetch analytics:', err); }
        };

        const fetchInsights = async () => {
            try {
                const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/insights`);
                if (res.ok) setInsights(await res.json());
            } catch (err) { console.error('Failed to fetch insights:', err); }
        };

        const fetchSalesBreakdown = async () => {
            try {
                const res = await apiFetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/sales-breakdown`
                );
                if (res.ok) setSalesBreakdown(await res.json());
            } catch (err) { console.error('Failed to fetch sales breakdown:', err); }
        };

        fetchAnalytics();
        fetchInsights();
        fetchSalesBreakdown();

        const interval = setInterval(() => {
            fetchAnalytics();
            fetchInsights();
            fetchSalesBreakdown();
        }, 5000);

        return () => clearInterval(interval);
    }, [selectedInventory]);

    const hasProducts = salesBreakdown && salesBreakdown.products.length > 0;

    // render a single sales chart based on the active tab
    const renderSalesChart = (tab: SalesTab) => {
        if (!hasProducts) {
            return <EmptyChart label="Record some sales to see product graphs." />;
        }
        switch (tab) {
            case 'revenue':
                return (
                    <SalesRevenueChart
                        timeSeries={salesBreakdown!.timeSeries}
                        products={salesBreakdown!.products}
                    />
                );
            case 'volume':
                return (
                    <div className="relative">
                        <SalesVolumeChart
                            unitTimeSeries={salesBreakdown!.unitTimeSeries ?? salesBreakdown!.timeSeries}
                            products={salesBreakdown!.products}
                            onDayClick={fetchDayDetail}
                        />
                        {/* ── Day detail panel ── */}
                        {dayDetail && (
                            <div className="absolute inset-0 bg-background/95 backdrop-blur-sm rounded-xl border border-border flex flex-col overflow-hidden z-20 animate-in slide-in-from-bottom-2 duration-250">
                                <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
                                    <div>
                                        <p className="text-sm font-bold text-foreground">{dayDetail.date}</p>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">
                                            {dayDetail.loading ? 'Loading…' : `${dayDetail.sales.length} sale${dayDetail.sales.length !== 1 ? 's' : ''} on this day`}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setDayDetail(null)}
                                        className="w-7 h-7 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors text-sm"
                                    >✕</button>
                                </div>
                                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 custom-scrollbar">
                                    {dayDetail.loading ? (
                                        Array.from({ length: 4 }).map((_, i) => (
                                            <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
                                        ))
                                    ) : dayDetail.sales.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center py-10 text-center">
                                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2">
                                                <ShoppingBag size={16} className="text-muted-foreground" />
                                            </div>
                                            <p className="text-xs text-muted-foreground">No sales recorded on {dayDetail.date}</p>
                                        </div>
                                    ) : dayDetail.sales.map((sale: any) => {
                                        const d = sale.entityDetails ?? {};
                                        const unitPrice = parseFloat(String(d.price || '0').replace(/[^0-9.-]+/g, '')) || 0;
                                        const qty = Number(d.quantity) || 1;
                                        const total = unitPrice * qty;
                                        const time = sale.createdAt
                                            ? new Date(sale.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                                            : '—';
                                        return (
                                            <div key={sale.id} className="flex items-center gap-3 px-3 py-2.5 bg-muted/30 rounded-lg border border-border hover:border-foreground/10 hover:bg-muted/60 transition-all">
                                                <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-500 shrink-0">
                                                    {String(d.customerName ?? '?').charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-foreground truncate">{d.subProductName || d.mainProductName || '—'}</p>
                                                    <p className="text-[10px] text-muted-foreground truncate">{d.customerName ?? '—'} · {d.mainProductName ?? ''}</p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-xs font-mono font-bold text-emerald-500">${total.toFixed(2)}</p>
                                                    <p className="text-[10px] text-muted-foreground">×{qty} unit{qty !== 1 ? 's' : ''} · {time}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                {!dayDetail.loading && dayDetail.sales.length > 0 && (
                                    <div className="px-4 py-2.5 border-t border-border shrink-0 flex items-center justify-between">
                                        <span className="text-[10px] text-muted-foreground">
                                            Total: ${dayDetail.sales.reduce((s: number, sale: any) => {
                                                const d = sale.entityDetails ?? {};
                                                const p = parseFloat(String(d.price || '0').replace(/[^0-9.-]+/g, '')) || 0;
                                                return s + p * (Number(d.quantity) || 1);
                                            }, 0).toFixed(2)}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">{dayDetail.isoDate}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            case 'price':
                return <ProductPriceChart products={salesBreakdown!.products} />;
            case 'share':
                return <SalesShareChart products={salesBreakdown!.products} />;
            default:
                return null;
        }
    };

    // mini chart card for "All Charts" view
    const MiniChartCard = ({
        title, subtitle, icon, color, tab,
    }: {
        title: string; subtitle: string; icon: React.ReactNode; color: string; tab: SalesTab;
    }) => (
        <div
            className={cn(
                'bg-card border border-border rounded-2xl p-5 flex flex-col gap-4 cursor-pointer',
                'hover:border-foreground/10 transition-all duration-300 group',
            )}
            onClick={() => setSalesTab(tab)}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center', color)}>
                        {icon}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-foreground">{title}</p>
                        <p className="text-[10px] text-muted-foreground">{subtitle}</p>
                    </div>
                </div>
                <span className="text-[10px] text-muted-foreground group-hover:text-foreground/40 transition-colors">
                    Expand →
                </span>
            </div>
            <div className="pointer-events-none">
                {!hasProducts
                    ? <EmptyChart label="" />
                    : tab === 'revenue'
                        ? <SalesRevenueChart timeSeries={salesBreakdown!.timeSeries} products={salesBreakdown!.products} />
                        : tab === 'volume'
                            ? <SalesVolumeChart unitTimeSeries={salesBreakdown!.unitTimeSeries ?? salesBreakdown!.timeSeries} products={salesBreakdown!.products} />
                            : tab === 'price'
                                ? <ProductPriceChart products={salesBreakdown!.products} />
                                : <SalesShareChart products={salesBreakdown!.products} />}
            </div>
        </div>
    );

    return (
        <div className="animate-in fade-in duration-500" ref={analyticsRef}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Analytics Overview</h1>
                    <p className="text-muted-foreground text-sm mt-1">Detailed traffic and sales analysis</p>
                </div>
                <div className="flex flex-wrap items-center gap-3" id="export-actions">
                    <button className="flex items-center gap-2 px-4 py-2 bg-muted/50 border border-border rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
                        <Calendar size={16} />
                        Last 7 Days
                    </button>
                    <button
                        onClick={exportToPDF}
                        disabled={exporting}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 bg-foreground border border-foreground rounded-lg text-sm font-medium text-background hover:opacity-90 transition-colors",
                            exporting && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {exporting ? <span className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" /> : <Download size={16} />}
                        {exporting ? 'Exporting...' : 'Export Data PDF'}
                    </button>
                </div>
            </div>

            {/* KPI Row */}
            {insights && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-emerald-500/20 transition-all" />
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <DollarSign size={20} />
                            </div>
                            <span className="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md"><TrendingUp size={12} /> Live</span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Total Revenue</p>
                            <p className="text-3xl font-bold text-foreground font-mono">${formatCompact(insights.marketing.totalRevenue)}</p>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/30 transition-colors">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-blue-500/20 transition-all" />
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <ShoppingBag size={20} />
                            </div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Sales Converted</p>
                            <p className="text-3xl font-bold text-foreground font-mono">{formatCompact(insights.marketing.salesConverted)}</p>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden group hover:border-amber-500/30 transition-colors">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-amber-500/20 transition-all" />
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                <Users size={20} />
                            </div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Total Customers</p>
                            <p className="text-3xl font-bold text-foreground font-mono">{formatCompact(insights.customers.totalCustomers)}</p>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden group hover:border-purple-500/30 transition-colors">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-purple-500/20 transition-all" />
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                                <Tag size={20} />
                            </div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Average Spend</p>
                            <p className="text-3xl font-bold text-foreground font-mono">${formatCompact(insights.customers.averageSpend)}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                SALES ANALYSIS SECTION
            ══════════════════════════════════════════════════════════════ */}
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 mb-4">
                {/* Section header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-foreground flex items-center gap-2">
                            <ShoppingBag size={20} className="text-emerald-500" />
                            Sales Analysis
                        </h2>
                        <p className="text-muted-foreground text-xs mt-1">
                            Product-level breakdown — revenue, volume, unit price & share
                        </p>
                    </div>
                    {hasProducts && (
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest bg-emerald-500/10 px-2.5 py-1 rounded-md">
                                {salesBreakdown!.products.length} products
                            </span>
                        </div>
                    )}
                </div>

                {/* Tab switcher */}
                <div className="flex flex-wrap gap-1.5 mb-6 p-1 bg-muted/50 rounded-xl w-fit">
                    {SALES_TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setSalesTab(tab.id)}
                            className={cn(
                                'flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all duration-200',
                                salesTab === tab.id
                                    ? 'bg-background text-foreground shadow-md'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                                tab.id === 'all' && salesTab !== 'all' && 'border border-border/50',
                            )}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Chart content */}
                {salesTab === 'all' ? (
                    /* All Charts: 2×2 grid */
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Revenue Trend */}
                        <div
                            className="bg-card border border-border rounded-2xl p-5 cursor-pointer hover:border-emerald-500/50 transition-all group"
                            onClick={() => setSalesTab('revenue')}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                        <Activity size={13} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-foreground">Revenue Trend</p>
                                        <p className="text-[10px] text-muted-foreground">Daily revenue per product — 7 days</p>
                                    </div>
                                </div>
                                <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors">Expand →</span>
                            </div>
                            <div className="pointer-events-none">
                                {hasProducts
                                    ? <SalesRevenueChart timeSeries={salesBreakdown!.timeSeries} products={salesBreakdown!.products} />
                                    : <EmptyChart label="Record sales to see trend." />}
                            </div>
                        </div>

                        {/* Volume */}
                        <div
                            className="bg-card border border-border rounded-2xl p-5 cursor-pointer hover:border-blue-500/50 transition-all group"
                            onClick={() => setSalesTab('volume')}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                                        <BarChart2 size={13} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-foreground">Sales Volume</p>
                                        <p className="text-[10px] text-muted-foreground">Units sold by product</p>
                                    </div>
                                </div>
                                <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors">Expand →</span>
                            </div>
                            <div className="pointer-events-none">
                                {hasProducts
                                    ? <SalesVolumeChart unitTimeSeries={salesBreakdown!.unitTimeSeries ?? salesBreakdown!.timeSeries} products={salesBreakdown!.products} />
                                    : <EmptyChart label="Record sales to see volume." />}
                            </div>
                        </div>

                        {/* Price Comparison */}
                        <div
                            className="bg-card border border-border rounded-2xl p-5 cursor-pointer hover:border-amber-500/50 transition-all group"
                            onClick={() => setSalesTab('price')}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                                        <TrendingDown size={13} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-foreground">Price Comparison</p>
                                        <p className="text-[10px] text-muted-foreground">Unit price vs. average</p>
                                    </div>
                                </div>
                                <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors">Expand →</span>
                            </div>
                            <div className="pointer-events-none">
                                {hasProducts
                                    ? <ProductPriceChart products={salesBreakdown!.products} />
                                    : <EmptyChart label="Record sales to compare prices." />}
                            </div>
                        </div>

                        {/* Revenue Share */}
                        <div
                            className="bg-card border border-border rounded-2xl p-5 cursor-pointer hover:border-purple-500/50 transition-all group"
                            onClick={() => setSalesTab('share')}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                                        <PieChart size={13} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-foreground">Revenue Share</p>
                                        <p className="text-[10px] text-muted-foreground">% of total revenue by product</p>
                                    </div>
                                </div>
                                <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors">Expand →</span>
                            </div>
                            <div className="pointer-events-none">
                                {hasProducts
                                    ? <SalesShareChart products={salesBreakdown!.products} />
                                    : <EmptyChart label="Record sales to see share." />}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Individual full-width chart */
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-400">
                        {/* Active chart subtitle */}
                        <div className="mb-6 pb-4 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div>
                                <p className="text-base font-bold text-foreground">
                                    {SALES_TABS.find(t => t.id === salesTab)?.label}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {salesTab === 'revenue' && 'Daily revenue contribution per product over the last 7 days'}
                                    {salesTab === 'volume' && 'Total units sold per product — hover for unit price × quantity breakdown'}
                                    {salesTab === 'price' && 'Unit price per product compared to the fleet average price'}
                                    {salesTab === 'share' && 'Percentage of total revenue attributed to each product'}
                                </p>
                            </div>
                            {hasProducts && (
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        Total:&nbsp;
                                        <span className="text-foreground font-mono">
                                            ${salesBreakdown!.products
                                                .reduce((s, p) => s + p.totalRevenue, 0)
                                                .toFixed(2)}
                                        </span>
                                    </span>
                                </div>
                            )}
                        </div>
                        {renderSalesChart(salesTab)}
                    </div>
                )}
            </div>

            {/* Bottom Grid: Top Products + Top Customers */}
            {insights && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                    <div className="bg-card border border-border rounded-2xl p-6 md:p-8 flex flex-col">
                        <h3 className="text-sm font-bold text-muted-foreground mb-8 flex items-center gap-2">
                            <Percent size={16} className="text-blue-500" />
                            Top Selling Products
                        </h3>
                        <div className="flex-1 w-full min-h-[300px] relative">
                            {insights.marketing.topProducts.length > 0 ? (
                                <TopProductsChart data={insights.marketing.topProducts} />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center border border-border border-dashed rounded-lg">
                                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">No sales data</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-6 md:p-8 flex flex-col relative overflow-hidden">
                        <h3 className="text-sm font-bold text-muted-foreground mb-8 flex items-center gap-2">
                            <Layers size={16} className="text-amber-500" />
                            Top Customers
                        </h3>
                        <div className="flex-1 w-full min-h-[300px] relative transition-all duration-500">
                            {insights.customers.topCustomers.length > 0 ? (
                                <TopCustomersChart
                                    data={insights.customers.topCustomersGraph}
                                    details={insights.customers.topCustomers}
                                    onClick={(customer) => setSelectedCustomer(customer)}
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center border border-border border-dashed rounded-lg">
                                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">No customer data</p>
                                </div>
                            )}
                        </div>

                        {/* Customer detail panel */}
                        <div className={cn(
                            "absolute inset-0 bg-card z-20 flex flex-col p-8 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] delay-75 border-l-4 border-amber-500",
                            selectedCustomer ? "translate-y-0" : "translate-y-full"
                        )}>
                            {selectedCustomer && (
                                <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-both">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-full bg-linear-to-br from-amber-400 to-orange-600 p-[2px] shadow-[0_0_20px_rgba(251,191,36,0.3)]">
                                                <div className="w-full h-full bg-card rounded-full flex items-center justify-center text-xl font-bold text-amber-500">
                                                    {selectedCustomer.avatar || selectedCustomer.name.charAt(0).toUpperCase()}
                                                </div>
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-foreground">{selectedCustomer.name}</h2>
                                                <p className="text-muted-foreground text-sm flex items-center gap-1.5 mt-0.5"><Mail size={12} /> {selectedCustomer.email}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedCustomer(null)}
                                            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div className="bg-muted/30 border border-border rounded-xl p-4">
                                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><DollarSign size={12} /> Lifetime Spend</p>
                                            <p className="text-2xl font-bold text-amber-500 font-mono">${Number(selectedCustomer.spent).toFixed(2)}</p>
                                        </div>
                                        <div className="bg-muted/30 border border-border rounded-xl p-4">
                                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><ShoppingBag size={12} /> Total Orders</p>
                                            <p className="text-2xl font-bold text-foreground font-mono">{selectedCustomer.orders || 0}</p>
                                        </div>
                                        <div className="bg-muted/30 border border-border rounded-xl p-4 col-span-2">
                                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><MapPin size={12} /> Location</p>
                                            <p className="text-sm font-medium text-foreground">{selectedCustomer.location || 'Unknown location'}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedCustomer(null)}
                                        className="mt-auto w-full py-3 bg-muted/50 hover:bg-muted text-foreground text-sm font-bold rounded-xl transition-colors"
                                    >
                                        Back to Chart
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Inventory Statistics */}
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 mb-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                    <h2 className="text-lg md:text-xl font-bold text-foreground flex items-center gap-2">
                        <Package size={20} className="text-muted-foreground" />
                        Inventory Statistics
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {(() => {
                        const allSubProducts = inventories
                            .filter(inv => selectedInventory === 'all' || inv.id === selectedInventory)
                            .flatMap(inv => inv.mainProducts.flatMap(mp => mp.subProducts.map(sp => ({
                                ...sp,
                                inventoryCreatedAt: inv.createdAt
                            }))));

                        const totalQuantity = allSubProducts.reduce((sum, sub) => sum + sub.stock, 0);
                        const totalBudget = allSubProducts.reduce((sum, sub) => {
                            const priceNum = parseFloat(sub.price.replace(/[^0-9.-]+/g, '')) || 0;
                            return sum + (priceNum * sub.stock);
                        }, 0);
                        const activeProducts = allSubProducts.filter(sub => sub.status === 'Active').length;
                        const averagePrice = allSubProducts.length > 0
                            ? (allSubProducts.reduce((sum, sub) => sum + (parseFloat(sub.price.replace(/[^0-9.-]+/g, '')) || 0), 0) / allSubProducts.length)
                            : 0;

                        if (allSubProducts.length === 0) {
                            return (
                                <div className="col-span-1 sm:col-span-2 lg:col-span-4 h-[200px] w-full flex flex-col items-center justify-center border border-border border-dashed rounded-xl bg-muted/20">
                                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
                                        <Package className="text-muted-foreground" size={16} />
                                    </div>
                                    <p className="text-muted-foreground text-sm font-medium">No products found</p>
                                    <p className="text-muted-foreground/50 text-xs mt-1">Add products in the Systems Edge section to see statistics.</p>
                                </div>
                            );
                        }

                        return (
                            <div className="col-span-1 sm:col-span-2 lg:col-span-4 bg-card border border-border rounded-2xl p-6 relative overflow-hidden group">
                                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                <Box size={14} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Total Stock</p>
                                                <p className="text-sm font-bold text-foreground font-mono">{formatCompact(totalQuantity)} Units</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                <DollarSign size={14} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Total Value</p>
                                                <p className="text-sm font-bold text-emerald-500 font-mono">${formatCompact(totalBudget)}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold text-right">Active Products</p>
                                            <p className="text-sm font-bold text-foreground text-right font-mono">{activeProducts}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold text-right">Avg Unit Price</p>
                                            <p className="text-sm font-bold text-foreground text-right font-mono">${formatCompact(averagePrice)}</p>
                                        </div>
                                    </div>
                                </div>

                                <InventoryStatsChart
                                    allSubProducts={allSubProducts}
                                    unitTimeSeries={salesBreakdown?.unitTimeSeries}
                                    priceTimeSeries={salesBreakdown?.timeSeries}
                                />
                            </div>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
};

export default Analytics;
