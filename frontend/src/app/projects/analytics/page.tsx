"use client";

import React from 'react';
import { BarChart3, TrendingUp, Users, Target, Activity, Zap, Shield, Globe, ArrowUpRight, ArrowDownRight, MoreHorizontal, PieChart, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AnalyticsPage() {
    return (
        <div className="h-full bg-background/50 flex flex-col p-6 md:p-10 space-y-10 overflow-y-auto custom-scrollbar">

            {/* Header / Global KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard label="TOTAL WORKSPACE IMPACT" value="$2.4M" change="+12.5%" isPositive icon={<Globe size={18} />} />
                <KPICard label="PROJECT VELOCITY" value="84%" change="+4.2%" isPositive icon={<Zap size={18} />} />
                <KPICard label="ACTIVE OPERATIVES" value="128" change="-2.1%" isPositive={false} icon={<Users size={18} />} />
                <KPICard label="MILESTONE ACCURACY" value="96.8%" change="+0.5%" isPositive icon={<Target size={18} />} />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Project Health Matrix */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-8 px-2">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-3 italic">
                                    <Activity size={16} className="text-primary" />
                                    Project Health Matrix
                                </h3>
                                <p className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] mt-1 ml-7">Real-time status across all mission parameters</p>
                            </div>
                            <div className="flex gap-2">
                                <FilterButton label="Operational" active />
                                <FilterButton label="At Risk" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <HealthRow name="Nexus Core Synchronization" health={98} status="operational" />
                            <HealthRow name="Global Resource Relay" health={72} status="warning" />
                            <HealthRow name="Identity Matrix Audit" health={94} status="operational" />
                            <HealthRow name="Legacy System Migration" health={45} status="critical" />
                            <HealthRow name="Satellite Uplink Protocol" health={88} status="operational" />
                            <HealthRow name="Cybernetic Bridge V2" health={61} status="warning" />
                        </div>
                    </div>

                    {/* Resource Allocation View (Placeholder for Chart) */}
                    <div className="bg-black/20 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8">
                        <div className="flex items-center justify-between mb-8 px-2">
                            <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-3">
                                <Layers size={16} className="text-primary" />
                                Resource Allocation Matrix
                            </h3>
                            <ArrowUpRight size={16} className="text-muted-foreground/20" />
                        </div>
                        <div className="h-64 flex items-end justify-between gap-2 px-4 pb-4">
                            {[40, 70, 45, 90, 65, 80, 55, 30, 95, 20].map((h, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    transition={{ delay: i * 0.1, type: "spring" }}
                                    className="flex-1 bg-linear-to-t from-primary/5 to-primary/40 rounded-t-lg border-t border-primary/20 relative group"
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover border border-white/10 px-2 py-1 rounded text-[8px] font-black opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">{h}% LOAD</div>
                                </motion.div>
                            ))}
                        </div>
                        <div className="flex justify-between px-4 mt-4">
                            {['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT'].map(m => (
                                <span key={m} className="text-[7px] font-black text-muted-foreground/20 italic">{m}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Performance Analytics Sidebar */}
                <div className="space-y-8">
                    <div className="bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8">
                        <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-3 mb-8">
                            <Shield size={16} className="text-emerald-500" />
                            Security Integrity
                        </h3>
                        <div className="space-y-6">
                            <SecurityFactor label="Authorization Flow" value={99.8} />
                            <SecurityFactor label="Data Encryption" value={100} />
                            <SecurityFactor label="Threat Neutralization" value={94.5} />
                        </div>
                    </div>

                    <div className="bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8">
                        <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-3 mb-8 px-2">
                            <TrendingUp size={16} className="text-primary" />
                            Workspace Efficiency
                        </h3>
                        <div className="flex items-center justify-center py-6">
                            <div className="relative w-40 h-40">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="440" strokeDashoffset="44" className="text-primary drop-shadow-[0_0_10px_rgba(var(--color-primary-rgb),0.5)]" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-black italic">90%</span>
                                    <span className="text-[7px] font-black text-muted-foreground/40 uppercase tracking-widest leading-none mt-1">Global Health</span>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className="text-center">
                                <p className="text-[8px] font-black italic text-emerald-500 leading-none mb-1">OPTIONAL</p>
                                <p className="text-[7px] font-black text-muted-foreground/30 uppercase tracking-widest">Efficiency</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[8px] font-black italic text-rose-500 leading-none mb-1">CRITICAL</p>
                                <p className="text-[7px] font-black text-muted-foreground/30 uppercase tracking-widest">At Risk</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

function KPICard({ label, value, change, isPositive, icon }: { label: string, value: string, change: string, isPositive: boolean, icon: React.ReactNode }) {
    return (
        <div className="bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[2rem] p-6 group hover:bg-black/60 transition-all shadow-xl">
            <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                    {icon}
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black italic ${isPositive ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'}`}>
                    {isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                    {change}
                </div>
            </div>
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 mb-1">{label}</p>
            <h4 className="text-3xl font-black tracking-tighter text-foreground group-hover:scale-105 transition-transform origin-left">{value}</h4>
        </div>
    );
}

function HealthRow({ name, health, status }: { name: string, health: number, status: 'operational' | 'warning' | 'critical' }) {
    const color = status === 'operational' ? 'text-emerald-500' : status === 'warning' ? 'text-amber-500' : 'text-rose-500';
    const bgColor = status === 'operational' ? 'bg-emerald-500/10' : status === 'warning' ? 'bg-amber-500/10' : 'bg-rose-500/10';

    return (
        <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-all">
            <div className="flex items-center gap-4 min-w-0">
                <div className={`w-2 h-2 rounded-full ${color.replace('text', 'bg')} shadow-[0_0_8px_currentColor] shrink-0`} />
                <h5 className="text-xs font-black uppercase tracking-widest text-foreground/80 truncate">{name}</h5>
            </div>
            <div className="flex items-center gap-3 shrink-0">
                <span className={`text-[9px] font-black font-mono italic ${color}`}>{health}%</span>
                <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${color.replace('text', 'bg')}`} style={{ width: `${health}%` }} />
                </div>
            </div>
        </div>
    );
}

function SecurityFactor({ label, value }: { label: string, value: number }) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
                <span className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">{label}</span>
                <span className="text-[9px] font-black italic text-emerald-500">{value}%</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                />
            </div>
        </div>
    );
}

function FilterButton({ label, active }: { label: string, active?: boolean }) {
    return (
        <button className={`
            px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all
            ${active ? 'bg-primary/20 text-primary border border-primary/20 shadow-inner' : 'text-muted-foreground/20 hover:text-muted-foreground hover:bg-white/5'}
        `}>
            {label}
        </button>
    );
}
