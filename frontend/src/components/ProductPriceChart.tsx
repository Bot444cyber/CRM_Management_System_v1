"use client";

import React, { useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';

interface ProductPriceChartProps {
    products: { name: string; unitPrice: number; totalRevenue: number }[];
}

const CustomTooltip = ({ active, payload, avgPrice }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    const isAbove = d.unitPrice >= avgPrice;
    return (
        <div className="bg-card border border-border rounded-xl p-3 shadow-2xl min-w-[190px]">
            <p className="text-xs font-bold text-foreground mb-2 truncate">{d.name}</p>
            <div className="flex flex-col gap-1">
                <div className="flex justify-between gap-6">
                    <span className="text-[11px] text-muted-foreground">Unit Price</span>
                    <span className={`text-[11px] font-bold font-mono ${isAbove ? 'text-emerald-500' : 'text-amber-500'}`}>
                        ${d.unitPrice.toFixed(2)}
                    </span>
                </div>
                <div className="flex justify-between gap-6">
                    <span className="text-[11px] text-muted-foreground">vs Avg</span>
                    <span className={`text-[11px] font-bold ${isAbove ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {isAbove ? '+' : ''}{(d.unitPrice - avgPrice).toFixed(2)}
                    </span>
                </div>
                <div className="flex justify-between gap-6 pt-1 border-t border-border">
                    <span className="text-[11px] text-muted-foreground">Total Revenue</span>
                    <span className="text-[11px] font-bold font-mono text-foreground">${d.totalRevenue.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
};

export default function ProductPriceChart({ products }: ProductPriceChartProps) {
    const avgPrice = useMemo(
        () => products.length > 0
            ? products.reduce((s, p) => s + p.unitPrice, 0) / products.length
            : 0,
        [products],
    );

    return (
        <div className="w-full">
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={products} layout="vertical" margin={{ top: 0, right: 50, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                        <XAxis
                            type="number"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                            tickFormatter={(v) => `$${v}`}
                        />
                        <YAxis
                            dataKey="name"
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                            width={110}
                            tickFormatter={(v: string) => v.length > 14 ? v.slice(0, 14) + '…' : v}
                        />
                        <Tooltip
                            cursor={{ fill: 'color-mix(in oklch, var(--muted) 10%, transparent)' }}
                            content={<CustomTooltip avgPrice={avgPrice} />}
                        />
                        <ReferenceLine
                            x={avgPrice}
                            stroke="var(--muted-foreground)"
                            strokeDasharray="5 3"
                            label={{
                                value: `Avg $${avgPrice.toFixed(2)}`,
                                fill: 'var(--muted-foreground)',
                                fontSize: 10,
                                position: 'insideTopRight',
                                dy: -6,
                            }}
                        />
                        <Bar dataKey="unitPrice" radius={[0, 6, 6, 0]} maxBarSize={32}>
                            {products.map((p, i) => (
                                <Cell
                                    key={i}
                                    fill={p.unitPrice >= avgPrice ? '#10B981' : '#F59E0B'}
                                    fillOpacity={0.8}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-4 mt-3 px-1">
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-[11px] text-muted-foreground">Above average</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="text-[11px] text-muted-foreground">Below average</span>
                </div>
            </div>
        </div>
    );
}
