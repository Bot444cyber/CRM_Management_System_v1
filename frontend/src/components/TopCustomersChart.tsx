"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TopCustomersChartProps {
    data: any[];
    details?: any[];
    onClick?: (customer: any) => void;
}

const CustomTooltip = ({ active, payload, label, details }: any) => {
    if (active && payload && payload.length && details) {
        // Filter out zero-value segments and sort them descending by spend
        const activeSegments = payload.filter((p: any) => p.value > 0).sort((a: any, b: any) => b.value - a.value);

        return (
            <div className="bg-card border border-border rounded-xl p-3 shadow-2xl flex flex-col gap-2 min-w-[200px]">
                <p className="text-xs font-bold text-muted-foreground mb-2 border-b border-border pb-2">{label}</p>

                {activeSegments.map((segment: any, index: number) => {
                    const customer = details.find((d: any) => d.name === segment.dataKey);

                    return (
                        <div key={index} className="flex justify-between items-center group">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: segment.fill }} />
                                <span className="text-sm font-bold text-foreground truncate max-w-[120px]">{segment.name}</span>
                            </div>
                            <span className="text-sm font-mono font-bold" style={{ color: segment.fill }}>
                                ${Number(segment.value).toFixed(2)}
                            </span>
                        </div>
                    );
                })}

                {activeSegments.length === 0 && (
                    <span className="text-xs text-muted-foreground italic">No sales this day</span>
                )}
            </div>
        );
    }
    return null;
};

export default function TopCustomersChart({ data, details, onClick }: TopCustomersChartProps) {
    // Pro dashboard color palette
    const colors = [
        '#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#EF4444'
    ];

    return (
        <div className="h-[250px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 600 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 600 }}
                        tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip cursor={{ fill: 'hsl(var(--muted) / 0.1)' }} content={<CustomTooltip details={details} />} />

                    {details && details.map((customer, index) => (
                        <Bar
                            key={customer.name}
                            dataKey={customer.name}
                            stackId="a"
                            fill={colors[index % colors.length]}
                            className="transition-all duration-300 hover:opacity-80 drop-shadow-md"
                            cursor={onClick ? "pointer" : "default"}
                            onClick={(entry, index, event) => {
                                // Recharts passes the payload entry, letting us open the panel
                                if (onClick) {
                                    onClick(customer);
                                }
                            }}
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
