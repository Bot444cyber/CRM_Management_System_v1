"use client";

import React, { useMemo } from 'react';
import {
    ComposedChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

interface SalesRevenueChartProps {
    timeSeries: Record<string, any>[];
    products: { name: string; unitPrice: number }[];
}

const PALETTE = [
    '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6',
    '#EF4444', '#06B6D4', '#EC4899', '#84CC16',
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const nonZero = payload.filter((p: any) => p.value > 0);
    return (
        <div className="bg-card border border-border rounded-xl p-3 shadow-2xl min-w-[190px]">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 pb-2 border-b border-border">{label}</p>
            {nonZero.length === 0
                ? <p className="text-xs text-muted-foreground italic">No sales this day</p>
                : nonZero.map((p: any) => (
                    <div key={p.name} className="flex justify-between items-center gap-4 mb-1">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
                            <span className="text-xs text-foreground truncate max-w-[110px]">{p.name}</span>
                        </div>
                        <span className="text-xs font-bold font-mono" style={{ color: p.color }}>
                            ${Number(p.value).toFixed(2)}
                        </span>
                    </div>
                ))}
        </div>
    );
};

const CustomLegend = ({ products }: { products: { name: string; unitPrice: number }[] }) => (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 px-1">
        {products.map((p, i) => (
            <div key={p.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
                <span className="text-[11px] text-foreground">{p.name}</span>
                <span className="text-[11px] font-mono text-muted-foreground">(${p.unitPrice.toFixed(2)}/u)</span>
            </div>
        ))}
    </div>
);

export default function SalesRevenueChart({ timeSeries, products }: SalesRevenueChartProps) {
    const productNames = useMemo(() => products.map(p => p.name), [products]);

    return (
        <div className="w-full">
            <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={timeSeries} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                            {productNames.map((name, i) => (
                                <linearGradient key={name} id={`grad-rev-${i}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={PALETTE[i % PALETTE.length]} stopOpacity={0.25} />
                                    <stop offset="95%" stopColor={PALETTE[i % PALETTE.length]} stopOpacity={0} />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                            dy={8}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                            tickFormatter={(v) => `$${v}`}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.1)', stroke: 'hsl(var(--border))', strokeWidth: 1, strokeDasharray: '4 4' }} />
                        {productNames.map((name, i) => (
                            <Area
                                key={name}
                                type="monotone"
                                dataKey={name}
                                stroke={PALETTE[i % PALETTE.length]}
                                strokeWidth={2}
                                fill={`url(#grad-rev-${i})`}
                                dot={false}
                                activeDot={{ r: 5, strokeWidth: 0 }}
                            />
                        ))}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
            <CustomLegend products={products} />
        </div>
    );
}
