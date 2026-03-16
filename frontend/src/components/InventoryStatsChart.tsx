"use client";

import React from 'react';
import {
    ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

interface InventoryStatsChartProps {
    allSubProducts: any[];
    unitTimeSeries?: any[];
    priceTimeSeries?: any[];
}

const PALETTE = [
    '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6',
    '#EF4444', '#06B6D4', '#EC4899', '#84CC16',
];

export default function InventoryStatsChart({ allSubProducts = [], unitTimeSeries = [], priceTimeSeries = [] }: InventoryStatsChartProps) {
    const data: any[] = [];

    // We maintain a map of "current projected stock" for each product
    const productQ = new Map();
    const productV = new Map();
    const productCreatedDates = new Map();

    allSubProducts.forEach(sp => {
        const priceNum = parseFloat(String(sp.price).replace(/[^0-9.-]+/g, '')) || 0;
        productQ.set(sp.name, sp.stock);
        productV.set(sp.name, sp.stock * priceNum);

        // Strip time from creation date for accurate day-level comparison
        const createdDate = new Date(sp.inventoryCreatedAt || new Date());
        createdDate.setHours(0, 0, 0, 0);
        productCreatedDates.set(sp.name, createdDate.getTime());
    });

    for (let i = unitTimeSeries.length - 1; i >= 0; i--) {
        const uDay = unitTimeSeries[i];
        const rDay = priceTimeSeries[i];

        const dayDate = new Date(uDay.date);
        dayDate.setFullYear(new Date().getFullYear());
        const dayTime = dayDate.setHours(0, 0, 0, 0);

        let dayTotalQ = 0;
        let dayTotalV = 0;

        // Sum up the projected stock for this day ONLY for products that existed on or before this day
        allSubProducts.forEach(sp => {
            if (dayTime >= productCreatedDates.get(sp.name)) {
                dayTotalQ += productQ.get(sp.name) || 0;
                dayTotalV += productV.get(sp.name) || 0;
            }
        });

        data.unshift({
            date: uDay.date,
            stock: dayTotalQ,
            value: dayTotalV
        });

        // Now project the stock back to the end of day D-1
        // We add back the units sold on Day D, because they were in stock at the end of Day D-1
        if (uDay) {
            Object.keys(uDay).forEach(k => {
                if (k !== 'date' && productQ.has(k)) {
                    productQ.set(k, productQ.get(k) + (Number(uDay[k]) || 0));
                }
            });
        }
        if (rDay) {
            Object.keys(rDay).forEach(k => {
                if (k !== 'date' && productV.has(k)) {
                    productV.set(k, productV.get(k) + (Number(rDay[k]) || 0));
                }
            });
        }
    }

    if (data.length === 0) {
        data.push({
            date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            stock: allSubProducts.reduce((sum, sp) => sum + sp.stock, 0),
            value: allSubProducts.reduce((sum, sp) => sum + (sp.stock * (parseFloat(String(sp.price).replace(/[^0-9.-]+/g, '')) || 0)), 0)
        });
    }

    const formatYAxisValue = (value: number) => {
        if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
        return `$${value}`;
    };

    const formatYAxisStock = (value: number) => {
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
        return `${value}`;
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload?.length) return null;

        const stockData = payload.find((p: any) => p.dataKey === 'stock');
        const valueData = payload.find((p: any) => p.dataKey === 'value');

        return (
            <div className="bg-card border border-border rounded-xl p-4 shadow-2xl min-w-[200px]">
                <p className="text-sm font-bold text-foreground mb-3 pb-2 border-b border-border">{label}</p>
                <div className="space-y-2">
                    {stockData && (
                        <div className="flex justify-between items-center gap-4">
                            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-blue-500" />
                                Stock Quantity
                            </span>
                            <span className="text-xs font-bold text-foreground">{stockData.value} units</span>
                        </div>
                    )}
                    {valueData && (
                        <div className="flex justify-between items-center gap-4">
                            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                Total Value
                            </span>
                            <span className="text-xs font-bold text-emerald-500 font-mono">
                                ${valueData.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                    data={data}
                    margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                        dy={10}
                    />
                    <YAxis
                        yAxisId="left"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                        tickFormatter={formatYAxisStock}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                        tickFormatter={formatYAxisValue}
                    />
                    <Tooltip cursor={{ fill: 'color-mix(in oklch, var(--muted) 10%, transparent)' }} content={<CustomTooltip />} />
                    <Legend
                        wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
                    />
                    <Bar
                        yAxisId="left"
                        dataKey="stock"
                        name="Stock Quantity"
                        fill="#3B82F6"
                        opacity={0.8}
                        radius={[4, 4, 0, 0]}
                        maxBarSize={50}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill="#3B82F6" />
                        ))}
                    </Bar>
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="value"
                        name="Total Value ($)"
                        stroke="#10B981"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: 'var(--card)' }}
                        activeDot={{ r: 6, fill: '#10B981', stroke: 'var(--background)' }}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
