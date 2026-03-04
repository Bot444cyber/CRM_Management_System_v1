"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Search, SlidersHorizontal, Eye, Star, LineChart, Box, Package, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import GaugeChart from './GaugeChart';
import { useInventory } from '@/context/InventoryContext';

type ColumnKey = 'product' | 'performance' | 'stock' | 'price';

interface ColumnConfig {
  key: ColumnKey;
  label: string;
  width: string;
}

const COLUMNS: ColumnConfig[] = [
  { key: 'product', label: 'Product Info', width: 'w-full md:w-[28%]' },
  { key: 'performance', label: 'Performance', width: 'w-full md:w-[28%]' },
  { key: 'stock', label: 'Stock', width: 'w-full md:w-[18%]' },
  { key: 'price', label: 'Price', width: 'w-full md:w-[26%]' },
];

const ProductList = () => {
  const { inventories } = useInventory();
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>(['product', 'performance', 'stock', 'price']);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Flatten inventories into a mapped product list
  const products = inventories.flatMap((inv, invIndex) =>
    inv.mainProducts.flatMap((mp, mpIndex) =>
      mp.subProducts.map((sub, subIndex) => ({
        id: `${inv.id}-${mpIndex}-${subIndex}`,
        name: sub.name,
        inventoryName: inv.name,
        review: 4.5 + (subIndex * 0.1 > 0.5 ? 0 : subIndex * 0.1),
        performance: "Good",
        perfValue: 400 + (subIndex * 15),
        perfTotal: "12,4k",
        perfPercent: 60 + (subIndex * 5 > 30 ? 30 : subIndex * 5),
        stock: sub.stock,
        price: `$${sub.price}`,
        image: `https://picsum.photos/seed/${invIndex}-${mpIndex}-${subIndex}/100/100`
      }))
    )
  );

  const toggleColumn = (key: ColumnKey) => {
    setVisibleColumns(prev =>
      prev.includes(key)
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isVisible = (key: ColumnKey) => visibleColumns.includes(key);

  const getPerformanceTextColor = (percent: number) => {
    if (percent >= 80) return "text-emerald-500";
    if (percent >= 40) return "text-amber-500";
    return "text-rose-500";
  };

  const getPerformanceLabel = (percent: number) => {
    if (percent >= 80) return "Excellent";
    if (percent >= 40) return "Good";
    return "Bad";
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">All Product List</h1>
        <div className="flex flex-wrap items-center gap-2 md:gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input
              type="text"
              placeholder="Search Product"
              className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all w-full sm:w-64"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors">
            <SlidersHorizontal size={16} />
            Sort By
          </button>

          {/* Column Customization Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-all",
                isDropdownOpen
                  ? "bg-white border-white text-black"
                  : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
              )}
            >
              <Eye size={16} />
              Show
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#0F0F0F] border border-white/10 rounded-xl shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-3 py-1 mb-1">
                  <span className="text-[10px] font-bold text-white/20 uppercase tracking-wider">Display Columns</span>
                </div>
                {COLUMNS.map((col) => (
                  <button
                    key={col.key}
                    onClick={() => toggleColumn(col.key)}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <span>{col.label}</span>
                    {isVisible(col.key) && <Check size={14} className="text-white" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {products.map((product) => (
          <div key={product.id} className="flex flex-col md:flex-row md:items-center bg-[#0A0A0A] p-4 rounded-2xl hover:bg-[#0F0F0F] transition-all border border-white/5 hover:border-white/10 overflow-hidden gap-4 md:gap-0">
            {/* Image & Name */}
            {isVisible('product') && (
              <div className={cn("flex items-center gap-4 px-2", visibleColumns.length === 1 ? "w-full" : "w-full md:w-[28%]")}>
                <div className="w-16 h-16 bg-white/5 rounded-2xl overflow-hidden shrink-0 border border-white/10">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" referrerPolicy="no-referrer" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-bold text-white text-base">{product.name}</h3>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1 px-1 py-0.5 bg-white/5 rounded w-max">{product.inventoryName}</p>
                  <div className="flex items-center gap-1 text-white/30 text-xs">
                    <span>Review :</span>
                    <span className="font-bold text-white ml-1">{product.review.toFixed(1)}</span>
                    <Star size={12} className="fill-white text-white" />
                  </div>
                </div>
              </div>
            )}

            {/* Performance */}
            {isVisible('performance') && (
              <div className={cn(
                "flex items-center gap-4 md:gap-6 px-2 md:px-6 md:border-l md:border-white/5",
                visibleColumns.length === 1 ? "w-full md:border-l-0" : "w-full md:w-[28%]"
              )}>
                <div className="flex flex-col flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/20 font-bold uppercase tracking-wider">Performance</span>
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-wider",
                      getPerformanceTextColor(product.perfPercent)
                    )}>
                      {getPerformanceLabel(product.perfPercent)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5">
                      <LineChart size={14} className="text-white/30" />
                      <span className="text-sm font-bold text-white">{product.perfValue}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Box size={14} className="text-white/30" />
                      <span className="text-sm font-bold text-white">{product.perfTotal}</span>
                    </div>
                  </div>
                </div>
                <div className="shrink-0">
                  <GaugeChart
                    percentage={product.perfPercent}
                    size={54}
                  />
                </div>
              </div>
            )}

            {/* Stock */}
            {isVisible('stock') && (
              <div className={cn(
                "flex flex-col px-2 md:px-6 md:border-l md:border-white/5",
                visibleColumns.length === 1 ? "w-full md:border-l-0" : "w-full md:w-[18%]"
              )}>
                <span className="text-[10px] text-white/20 font-bold uppercase tracking-wider">Stock</span>
                <div className="flex items-center gap-2 mt-2">
                  <Box size={16} className="text-white/30" />
                  <span className="text-sm font-bold text-white">{product.stock}</span>
                  {product.stock < 50 && (
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="Low Stock" />
                  )}
                </div>
              </div>
            )}

            {/* Price */}
            {isVisible('price') && (
              <div className={cn(
                "flex flex-col px-2 md:px-6 md:border-l md:border-white/5",
                visibleColumns.length === 1 ? "w-full md:border-l-0" : "w-full md:w-[26%]"
              )}>
                <span className="text-[10px] text-white/20 font-bold uppercase tracking-wider">Product Price</span>
                <span className="text-sm font-bold text-white mt-2">{product.price}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
