"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    Calculator, BookOpen, PenTool, Users, Wrench, RefreshCw,
    Key, Store, MessageSquare, Files, CheckSquare, Clock,
    Zap, CalendarDays, LifeBuoy, Globe, Heart, Send,
    CreditCard, Box, Factory, BarChart3, UserSquare2, LayoutDashboard,
    Link as LinkIcon
} from 'lucide-react';
import Link from 'next/link';

import Squares from '@/components/Design/Squares';

// ─── Integration Image Data (Advanced Logos) ──────────────────────────────────
const integrationsData = [
    // { name: 'Accounting', icon: Calculator, color: 'text-emerald-500' },
    // { name: 'Knowledge', icon: BookOpen, color: 'text-indigo-500' },
    // { name: 'Sign', icon: PenTool, color: 'text-blue-500' },
    // { name: 'CRM', icon: Users, color: 'text-purple-500' },
    // { name: 'Studio', icon: Wrench, color: 'text-orange-500' },
    // { name: 'Subscriptions', icon: RefreshCw, color: 'text-cyan-500' },
    // { name: 'Rental', icon: Key, color: 'text-teal-500' },
    // { name: 'Point of Sale', icon: Store, color: 'text-rose-500' },
    // { name: 'Discuss', icon: MessageSquare, color: 'text-yellow-500' },
    // { name: 'Documents', icon: Files, color: 'text-sky-500' },
    // { name: 'Project', icon: CheckSquare, color: 'text-green-500' },
    // { name: 'Timesheets', icon: Clock, color: 'text-blue-400' },
    // { name: 'Field Service', icon: Zap, color: 'text-amber-500' },
    // { name: 'Planning', icon: CalendarDays, color: 'text-violet-500' },
    // { name: 'Helpdesk', icon: LifeBuoy, color: 'text-red-500' },
    // { name: 'Website', icon: Globe, color: 'text-blue-600' },
    // { name: 'Social Marketing', icon: Heart, color: 'text-pink-500' },
    // { name: 'Email Marketing', icon: Send, color: 'text-indigo-400' },
    // { name: 'Purchase', icon: CreditCard, color: 'text-emerald-600' },
    { name: 'Inventory', icon: Box, color: 'text-orange-600' },
    // { name: 'Manufacturing', icon: Factory, color: 'text-slate-600' },
    // { name: 'Sales', icon: BarChart3, color: 'text-green-600' },
    // { name: 'HR', icon: UserSquare2, color: 'text-purple-600' },
    // { name: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-500' }
];

// ─── Single Integration Card ──────────────────────────────────────────────────
function IntegrationIcon({ item, delay }: { item: typeof integrationsData[0]; delay: number }) {
    const Icon = item.icon;
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay, ease: "easeOut" }}
            className="group flex flex-col items-center gap-3 sm:gap-4 cursor-pointer"
        >
            <div className={`w-20 h-20 sm:w-[105px] sm:h-[105px] bg-white rounded-2xl sm:rounded-[2rem] flex items-center justify-center transition-all duration-400 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.15)] shadow-md`}>
                <Icon className={`w-10 h-10 sm:w-12 sm:h-12 ${item.color} transition-transform duration-500 group-hover:scale-110`} strokeWidth={1.5} />
            </div>
            <p className="text-white/80 group-hover:text-white transition-colors duration-300 text-[11px] sm:text-[13px] font-semibold tracking-wide">
                {item.name}
            </p>
        </motion.div>
    );
}

// ─── Main Integrations Section ────────────────────────────────────────────────
export default function Integrations() {
    return (
        <section className="relative w-full bg-black py-20 sm:py-28 md:py-36 overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <Squares
                    direction="diagonal"
                    speed={0.4}
                    squareSize={32}
                    borderColor="#2a2a2a"
                    hoverFillColor="#444444"
                />
            </div>

            {/* Added pointer-events-none to the wrapper, but pointer-events-auto to cards so background can still feel hover between grid gaps */}
            <div className="max-w-7xl mx-auto px-5 sm:px-6 relative z-10 pointer-events-none">
                <div className="pointer-events-auto">
                    {/* ── Header ── */}
                    <div className="text-center mb-16 sm:mb-24">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.06 }}
                            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter text-white mb-6"
                        >
                            Every tool you need,<br />
                            <span className="text-white/40">
                                in one place.
                            </span>
                        </motion.h2>
                    </div>

                    {/* ── Integration Grid ── */}
                    <div className="flex justify-center">
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-10 sm:gap-x-10 sm:gap-y-14 justify-items-center w-full max-w-6xl">
                            {integrationsData.map((item, i) => (
                                <IntegrationIcon key={item.name} item={item} delay={i * 0.02} />
                            ))}
                        </div>
                    </div>

                    {/* ── Bottom CTA strip ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="mt-16 sm:mt-24 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8"
                    >
                        <p className="text-white/40 text-sm font-medium">
                            + 88 more integrations available
                        </p>
                        <div className="hidden sm:block w-px h-4 bg-white/10" />

                        <Link href="/products" className="text-sm font-semibold text-black bg-white hover:bg-white/90 px-5 py-2.5 rounded-full transition-all duration-300 flex items-center gap-2 group">
                            Browse all integrations
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>
                    </motion.div>

                    {/* ── Product screenshot / mock ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.8, delay: 0.15 }}
                        className="mt-24 sm:mt-32 relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/[0.07]"
                        style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04) inset, 0 40px 100px rgba(0,0,0,0.7)' }}
                    >
                        {/* Top browser chrome bar */}
                        <div className="flex items-center gap-2 px-4 py-3 bg-[#111115] border-b border-white/[0.07]">
                            <div className="w-3 h-3 rounded-full bg-red-500/70" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                            <div className="w-3 h-3 rounded-full bg-green-500/70" />
                            <div className="ml-4 flex-1 max-w-xs h-5 rounded-md bg-white/5 border border-white/5 flex items-center px-3">
                                <span className="text-[9px] text-white/20 font-mono">app.nexuscrm.com/dashboard</span>
                            </div>
                        </div>

                        {/* Dashboard image */}
                        <div className="relative bg-[#0a0a0e] aspect-video sm:aspect-2/1 overflow-hidden">
                            <img
                                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
                                alt="NexusCRM Dashboard"
                                className="w-full h-full object-cover object-top opacity-60"
                            />
                            {/* Dark overlay vignette */}
                            <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0e] via-[#0a0a0e]/30 to-transparent" />

                            {/* Floating stat cards */}
                            <div className="absolute top-4 right-4 sm:top-8 sm:right-8 bg-[#111115]/95 border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-xl">
                                <p className="text-[9px] sm:text-xs text-white/40 mb-1">MRR This Month</p>
                                <p className="text-base sm:text-2xl font-bold text-white">$48,290</p>
                                <p className="text-[9px] sm:text-[10px] text-white/40 mt-0.5">↑ 22% from last month</p>
                            </div>

                            <div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8 bg-[#111115]/95 border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-xl">
                                <p className="text-[9px] sm:text-xs text-white/40 mb-1">Active Deals</p>
                                <p className="text-base sm:text-2xl font-bold text-white">127</p>
                                <div className="flex gap-1 mt-2">
                                    {[40, 65, 55, 80, 70, 90].map((h, i) => (
                                        <div key={i} className="w-1.5 sm:w-2 rounded-t-sm bg-white/20" style={{ height: `${h * 0.24}px` }} />
                                    ))}
                                </div>
                            </div>

                            <div className="absolute top-4 left-4 sm:top-8 sm:left-8 bg-[#111115]/95 border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-xl hidden sm:block">
                                <p className="text-xs text-white/40 mb-2">Pipeline Health</p>
                                <div className="flex gap-1.5">
                                    {['Prospecting', 'Qualified', 'Proposal', 'Closed'].map((s, i) => (
                                        <div key={s} className="text-center">
                                            <div className="w-6 rounded-t-sm mb-1" style={{ height: `${[30, 52, 38, 64][i]}px`, background: `rgba(255,255,255,${0.1 + i * 0.1})` }} />
                                            <p className="text-[7px] text-white/30">{s}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Caption under screenshot */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="text-center text-white/30 text-xs sm:text-sm mt-5"
                    >
                        NexusCRM live dashboard — real-time across all your connected tools
                    </motion.p>
                </div>
            </div>
        </section>
    );
}
