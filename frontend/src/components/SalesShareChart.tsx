"use client";

import React from 'react';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from 'recharts';

interface SalesShareChartProps {
    products: { name: string; unitPrice: number; totalUnits: number; totalRevenue: number; revenueShare: number }[];
}

const PALETTE = [
    '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6',
    '#EF4444', '#06B6D4', '#EC4899', '#84CC16',
];

const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
        <div className="bg-card border border-border rounded-xl p-3 shadow-2xl min-w-[190px]">
            <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: payload[0].fill }} />
                <p className="text-xs font-bold text-foreground truncate">{d.name}</p>
            </div>
            <div className="flex flex-col gap-1">
                <div className="flex justify-between gap-4">
                    <span className="text-[11px] text-muted-foreground">Revenue Share</span>
                    <span className="text-[11px] font-bold font-mono" style={{ color: payload[0].fill }}>{d.revenueShare}%</span>
                </div>
                <div className="flex justify-between gap-4">
                    <span className="text-[11px] text-muted-foreground">Total Revenue</span>
                    <span className="text-[11px] font-bold font-mono text-foreground">${d.totalRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between gap-4">
                    <span className="text-[11px] text-muted-foreground">Unit Price</span>
                    <span className="text-[11px] font-bold font-mono text-emerald-500">${d.unitPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between gap-4">
                    <span className="text-[11px] text-muted-foreground">Units Sold</span>
                    <span className="text-[11px] font-bold font-mono text-foreground">{d.totalUnits}</span>
                </div>
            </div>
        </div>
    );
};

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, name, revenueShare,
}: any) => {
    if (revenueShare < 5) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
        <text x={x} y={y} fill="hsl(var(--foreground))" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
            {revenueShare}%
        </text>
    );
};

export default function SalesShareChart({ products }: SalesShareChartProps) {
    const totalRevenue = products.reduce((s, p) => s + p.totalRevenue, 0);

    return (
        <div className="w-full flex flex-col lg:flex-row items-center gap-6">
            {/* Donut chart */}
            <div className="h-[280px] w-full lg:w-[280px] shrink-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={products}
                            cx="50%"
                            cy="50%"
                            innerRadius="55%"
                            outerRadius="78%"
                            dataKey="totalRevenue"
                            startAngle={90}
                            endAngle={-270}
                            paddingAngle={2}
                            labelLine={false}
                            label={renderCustomLabel}
                            isAnimationActive
                            animationDuration={900}
                            animationEasing="ease-out"
                        >
                            {products.map((_, i) => (
                                <Cell key={i} fill={PALETTE[i % PALETTE.length]} strokeWidth={0} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Total Revenue</p>
                    <p className="text-xl font-bold text-foreground font-mono">${totalRevenue >= 1000 ? (totalRevenue / 1000).toFixed(1) + 'K' : totalRevenue.toFixed(2)}</p>
                </div>
            </div>

            {/* Legend table */}
            <div className="flex-1 w-full overflow-auto">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="text-left py-2 pr-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Product</th>
                            <th className="text-right py-2 px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Price</th>
                            <th className="text-right py-2 px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Units</th>
                            <th className="text-right py-2 pl-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((p, i) => (
                            <tr key={p.name} className="border-b border-border hover:bg-muted/50 transition-colors">
                                <td className="py-2.5 pr-3">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: PALETTE[i % PALETTE.length] }} />
                                        <span className="text-foreground truncate max-w-[130px]">{p.name}</span>
                                    </div>
                                </td>
                                <td className="py-2.5 px-2 text-right font-mono text-muted-foreground">${p.unitPrice.toFixed(2)}</td>
                                <td className="py-2.5 px-2 text-right font-mono text-muted-foreground">{p.totalUnits}</td>
                                <td className="py-2.5 pl-2 text-right font-mono font-bold" style={{ color: PALETTE[i % PALETTE.length] }}>
                                    ${p.totalRevenue.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
