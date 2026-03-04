"use client";

import React, { useState, useCallback } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

interface SalesVolumeChartProps {
    unitTimeSeries: Record<string, any>[];
    products: { name: string; unitPrice: number; totalUnits: number }[];
    onDayClick?: (dateStr: string, isoDate: string) => void;
}

const PALETTE = [
    '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6',
    '#EF4444', '#06B6D4', '#EC4899', '#84CC16',
];

/** Convert "Mar 4" → "2026-03-04" — guesses the year from context (current or previous year) */
function dateStrToISO(label: string): string {
    const now = new Date();
    const d = new Date(`${label} ${now.getFullYear()}`);
    // If the parsed date is in the future, it must be last year
    if (d > now) d.setFullYear(now.getFullYear() - 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const nonZero = payload.filter((p: any) => p.value > 0);
    return (
        <div className="bg-card border border-border rounded-xl p-3 shadow-2xl min-w-[200px] pointer-events-none">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 pb-2 border-b border-border flex items-center justify-between">
                <span>{label}</span>
                <span className="text-muted-foreground/50 normal-case font-normal tracking-normal">click to view sales</span>
            </p>
            {nonZero.length === 0
                ? <p className="text-xs text-muted-foreground italic">No sales this day</p>
                : nonZero.map((p: any) => (
                    <div key={p.name} className="flex justify-between items-center gap-4 mb-1.5">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: p.fill }} />
                            <span className="text-xs text-foreground truncate max-w-[120px]">{p.name}</span>
                        </div>
                        <span className="text-xs font-bold font-mono text-foreground">{p.value} unit{p.value !== 1 ? 's' : ''}</span>
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

export default function SalesVolumeChart({ unitTimeSeries, products, onDayClick }: SalesVolumeChartProps) {
    const [activeDate, setActiveDate] = useState<string | null>(null);
    const productNames = products.map(p => p.name);

    const handleClick = useCallback((data: any) => {
        if (!data?.activeLabel || !onDayClick) return;
        const label = data.activeLabel as string;
        setActiveDate(label);
        onDayClick(label, dateStrToISO(label));
    }, [onDayClick]);

    const renderTick = ({ x, y, payload }: any) => (
        <text
            x={Number(x)}
            y={Number(y) + 10}
            textAnchor="middle"
            fill={payload.value === activeDate ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))'}
            fontSize={11}
            fontWeight={payload.value === activeDate ? 700 : 400}
        >
            {payload.value}
        </text>
    );

    return (
        <div className="w-full">
            <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={unitTimeSeries}
                        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                        onClick={handleClick}
                        style={{ cursor: onDayClick ? 'pointer' : undefined }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={renderTick}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                            allowDecimals={false}
                        />
                        <Tooltip
                            cursor={{ fill: 'hsl(var(--muted) / 0.1)', radius: 6 }}
                            content={<CustomTooltip />}
                        />
                        {productNames.map((name, i) => (
                            <Bar
                                key={name}
                                dataKey={name}
                                stackId="units"
                                fill={PALETTE[i % PALETTE.length]}
                                fillOpacity={0.85}
                                radius={i === productNames.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                                maxBarSize={48}
                            >
                                {unitTimeSeries.map((entry, j) => (
                                    <Cell
                                        key={`cell-${j}`}
                                        fill={PALETTE[i % PALETTE.length]}
                                        fillOpacity={activeDate && entry.date !== activeDate ? 0.3 : 0.85}
                                    />
                                ))}
                            </Bar>
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </div>
            {onDayClick && (
                <p className="text-[10px] text-muted-foreground/50 text-center mt-1 mb-0">
                    Click any bar to see sales for that day
                </p>
            )}
            <CustomLegend products={products} />
        </div>
    );
}
