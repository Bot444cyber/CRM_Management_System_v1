'use client';

import React from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import { motion } from 'framer-motion';
import {
    Truck,
    PackageCheck,
    ClipboardList,
    ScanLine,
    Route,
    ShoppingCart,
    Factory,
    FileText,
    ArrowRight,
    Map,
    Box,
    QrCode,
    Network,
    BarChart3,
    ArrowDownToLine,
    PackageOpen,
    ArrowRightLeft,
    GitMerge,
    PieChart,
    Layers,
} from 'lucide-react';
import Squares from '@/components/Design/Squares';
import CTASection from '@/components/Home/CTASection';
import SocialProof from '@/components/Home/SocialProof';
import Link from 'next/link';

// Hand-drawn annotations

const CircleAnnotation = ({ color = '#2dd4bf', children }: { color?: string, children: React.ReactNode }) => (
    <span className="relative inline-block">
        <svg className="absolute w-[130%] h-[130%] -top-[15%] -left-[15%] pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <ellipse cx="50" cy="50" rx="45" ry="30" fill="none" stroke={color} strokeWidth="3" transform="rotate(-3 50 50)" strokeLinecap="round" />
        </svg>
        <span className="relative z-10">{children}</span>
    </span>
);

const UnderlineAnnotation = ({ color = '#ef4444', children }: { color?: string, children: React.ReactNode }) => (
    <span className="relative inline-block whitespace-nowrap">
        <svg className="absolute w-[110%] h-4 -bottom-1 -left-[5%] pointer-events-none" viewBox="0 0 100 20" preserveAspectRatio="none">
            <path d="M0 15 Q 50 25 100 5" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
        </svg>
        <span className="relative z-10">{children}</span>
    </span>
);

const SparklesAnnotation = ({ children }: { children: React.ReactNode }) => (
    <span className="relative inline-block">
        <svg className="absolute w-12 h-12 -top-10 -left-10 text-yellow-500/80 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
        <svg className="absolute w-8 h-8 -bottom-8 -right-8 text-yellow-600/80 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
        <span className="relative z-10">{children}</span>
    </span>
);


export default function InventoryPage() {
    return (
        <main className="min-h-screen bg-black text-white font-sans selection:bg-teal-500/30 flex flex-col overflow-hidden relative">

            {/* Fixed Background Texture */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <Squares
                    direction="diagonal"
                    speed={0.4}
                    squareSize={40}
                    borderColor="rgba(255,255,255,0.03)"
                    hoverFillColor="rgba(255,255,255,0.02)"
                />
            </div>

            <Header />

            <div className="relative z-10 flex-1 pt-32 pb-24 w-full">

                {/* 1. Hero Section */}
                <section className="px-6 sm:px-8 md:px-12 max-w-7xl mx-auto text-center pt-8 sm:pt-16 mb-24 relative">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-bold tracking-tight mb-6 leading-[1.1] text-white"
                    >
                        <span className="text-teal-400 font-medium tracking-normal inline-block" style={{ fontFamily: "'Caveat', 'Comic Sans MS', cursive", fontSize: '1.2em', marginRight: '0.4rem', transform: "rotate(-2deg)" }}>Modern</span>
                        inventory system
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="text-lg text-slate-400 max-w-3xl mx-auto mb-10 font-medium leading-relaxed"
                    >
                        Maximize your warehouse efficiency. Improve performance & process time. Better organize your warehouse with the smart double entry inventory system.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 relative z-20"
                    >
                        <Link href='/dashboard'>
                            <button className="bg-white text-black font-bold text-sm px-8 py-4 rounded-md hover:bg-slate-200 transition-all w-full sm:w-auto uppercase tracking-wide shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                                Start now - It's free
                            </button>
                        </Link>
                        <button className="bg-white/5 text-white font-bold text-sm px-8 py-4 rounded-md border border-white/20 hover:border-white hover:bg-white/10 transition-all w-full sm:w-auto uppercase tracking-wide">
                            Schedule a demo
                        </button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="relative mx-auto max-w-5xl rounded-xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.6)] border border-white/10 bg-[#0a0a0a]"
                    >
                        <div className="relative z-10 w-full flex items-center px-4 py-3 bg-[#111] border-b border-white/10 gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>

                        {/* Abstract Dashboard UI */}
                        <div className="w-full h-[500px] flex flex-col text-left">
                            <div className="h-14 border-b border-white/5 flex items-center px-6 gap-6 bg-black/40">
                                <div className="w-24 h-4 bg-teal-500/20 text-teal-400 rounded text-[10px] font-bold flex items-center justify-center tracking-widest uppercase border border-teal-500/30">Inventory</div>
                                <div className="w-20 h-4 bg-white/5 rounded"></div>
                                <div className="flex-1"></div>
                                <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden border border-white/10">
                                    <img src="https://i.pravatar.cc/100?img=68" alt="User" />
                                </div>
                            </div>
                            <div className="flex-1 flex">
                                <div className="w-64 border-r border-white/5 hidden md:block bg-black/20 p-6">
                                    <div className="space-y-4">
                                        <div className="h-4 w-3/4 bg-white/10 rounded"></div>
                                        <div className="h-4 w-1/2 bg-white/5 rounded"></div>
                                        <div className="h-4 w-2/3 bg-white/5 rounded"></div>
                                        <div className="h-4 w-full bg-white/5 rounded"></div>
                                        <div className="h-4 w-5/6 bg-white/5 rounded"></div>
                                    </div>
                                    <div className="mt-8 space-y-4">
                                        <div className="h-3 w-1/3 bg-white/20 rounded mb-6"></div>
                                        <div className="h-4 w-3/4 bg-white/5 rounded"></div>
                                        <div className="h-4 w-1/2 bg-white/5 rounded"></div>
                                    </div>
                                </div>
                                <div className="flex-1 p-8">
                                    <div className="flex justify-between mb-8">
                                        <div>
                                            <div className="text-2xl font-bold text-white mb-2">Overview</div>
                                            <div className="h-4 w-48 bg-white/10 rounded"></div>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="w-8 h-8 rounded bg-white/5 border border-white/10"></div>
                                            <div className="w-8 h-8 rounded bg-white/5 border border-white/10"></div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-6 mb-8">
                                        <div className="bg-white/5 p-6 rounded-xl border border-white/10 shadow-lg flex items-center gap-4 hover:bg-white/10 transition-colors">
                                            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30"><PackageOpen className="text-blue-400" /></div>
                                            <div>
                                                <div className="text-2xl font-bold text-white">124</div>
                                                <div className="text-sm text-slate-400">To Receive</div>
                                            </div>
                                        </div>
                                        <div className="bg-white/5 p-6 rounded-xl border border-white/10 shadow-lg flex items-center gap-4 hover:bg-white/10 transition-colors">
                                            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30"><Truck className="text-amber-400" /></div>
                                            <div>
                                                <div className="text-2xl font-bold text-white">48</div>
                                                <div className="text-sm text-slate-400">To Deliver</div>
                                            </div>
                                        </div>
                                        <div className="bg-white/5 p-6 rounded-xl border border-white/10 shadow-lg flex items-center gap-4 hover:bg-white/10 transition-colors">
                                            <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center border border-teal-500/30"><ClipboardList className="text-teal-400" /></div>
                                            <div>
                                                <div className="text-2xl font-bold text-white">12</div>
                                                <div className="text-sm text-slate-400">Internal Transfers</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 rounded-xl border border-white/10 shadow-lg overflow-hidden">
                                        <div className="h-12 border-b border-white/10 flex items-center px-6">
                                            <div className="w-1/4 h-3 bg-white/20 rounded"></div>
                                            <div className="w-1/4 h-3 bg-white/20 rounded mx-4"></div>
                                            <div className="w-1/4 h-3 bg-white/20 rounded"></div>
                                            <div className="w-1/4 h-3 bg-white/20 rounded mx-4"></div>
                                        </div>
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="h-12 border-b border-white/5 flex items-center px-6 hover:bg-white/5 transition-colors">
                                                <div className="w-1/4 h-3 bg-white/10 rounded"></div>
                                                <div className="w-1/4 h-3 bg-white/10 rounded mx-4"></div>
                                                <div className="w-1/4 h-3 bg-white/10 rounded"></div>
                                                <div className="w-1/4 h-3 bg-white/10 rounded mx-4"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </motion.div>
                </section>

                {/* 2. Flawless Replenishments */}
                <section className="py-24 max-w-6xl mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white font-serif italic">
                        Flawless <span className="not-italic font-sans relative inline-block">
                            <UnderlineAnnotation color="#ef4444">replenishments</UnderlineAnnotation>
                        </span>
                    </h2>
                    <p className="text-slate-400 max-w-3xl mx-auto text-lg mb-16">
                        Use order points and automated RFQs to make your supply chain more efficient. Odoo's inventory app automatically proposes vendor bills based on expected receipts. Or trigger rules to automatically create purchase orders.
                    </p>

                    <div className="relative max-w-4xl mx-auto">
                        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 bg-[#111] p-12 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/10 relative backdrop-blur-sm">
                            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-col items-center">
                                <div className="w-24 h-24 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/30 transition-transform hover:scale-105">
                                    <Truck className="w-10 h-10" strokeWidth={1.5} />
                                </div>
                                <span className="font-semibold text-slate-200">Draft Orders</span>
                            </motion.div>

                            <ArrowRight className="text-slate-600 w-8 h-8 hidden md:block" />

                            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="flex flex-col items-center">
                                <div className="w-24 h-24 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mb-4 border border-amber-500/30 transition-transform hover:scale-105">
                                    <ClipboardList className="w-10 h-10" strokeWidth={1.5} />
                                </div>
                                <span className="font-semibold text-slate-200">Vendor Bills</span>
                            </motion.div>

                            <ArrowRight className="text-slate-600 w-8 h-8 hidden md:block" />

                            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="flex flex-col items-center">
                                <div className="w-24 h-24 bg-red-500/20 text-red-500 rounded-2xl flex items-center justify-center mb-4 border border-red-500/30 transition-transform hover:scale-105">
                                    <PackageCheck className="w-10 h-10" strokeWidth={1.5} />
                                </div>
                                <span className="font-semibold text-slate-200">Receive</span>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* 3. Speed Up */}
                <section className="py-24 overflow-hidden relative">
                    <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center relative z-10">
                        <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex justify-center relative">
                            {/* Barcode scanner mockup icon */}
                            <div className="relative w-72 h-72 rounded-[2.5rem] bg-[#0a0a0a] flex items-center justify-center shadow-2xl rotate-[-5deg] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                                <div className="absolute top-0 right-0 w-full h-10 bg-red-500/80 rounded-t-[2rem] border-b border-white/10 backdrop-blur-md" />
                                <div className="absolute top-1/2 left-0 w-full h-1 bg-red-500 animate-pulse shadow-[0_0_30px_theme(colors.red.500)]" />
                                <ScanLine className="w-24 h-24 text-white/30" />
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-2 bg-white/10 rounded-full" />
                            </div>
                        </motion.div>

                        <div className="bg-[#111] p-12 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 backdrop-blur-sm">
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white font-serif italic leading-[1.2]">
                                <span className="not-italic font-sans relative inline-block">
                                    <UnderlineAnnotation color="#eab308">Speed up</UnderlineAnnotation>
                                </span> receipt, quality control and storage
                            </h2>
                            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                                Process your incoming and outgoing items easily with the barcode scanner. Wi-Fi and Bluetooth routing make it simple to track every product movement anywhere in your warehouse.
                            </p>
                            <div className="inline-flex items-center gap-3 bg-teal-500/10 text-teal-400 px-6 py-3 rounded-full font-medium text-sm border border-teal-500/20">
                                <QrCode className="w-5 h-5 text-teal-400" /> Fully integrated via Wi-Fi
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. Optimize your warehouse */}
                <section className="py-24 max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white font-serif italic leading-[1.2]">
                            Optimize your <span className="not-italic font-sans relative inline-block">
                                <CircleAnnotation color="#14b8a6">warehouse</CircleAnnotation>
                            </span>
                        </h2>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            Easily manage your stock routing and warehouse allocations. Keep track of scheduled dates and assign capacity seamlessly to avoid stockouts and overstocking.
                        </p>
                    </div>

                    <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative bg-[#111] p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 backdrop-blur-sm">
                        {/* Mock Calendar Grid */}
                        <div className="flex gap-4 mb-6 font-medium text-sm">
                            <div className="flex-1 text-center bg-white/5 text-slate-400 py-2 rounded-lg border border-white/5">Mon</div>
                            <div className="flex-1 text-center bg-white/5 text-slate-400 py-2 rounded-lg border border-white/5">Tue</div>
                            <div className="flex-1 text-center bg-white/5 text-slate-400 py-2 rounded-lg border border-white/5">Wed</div>
                            <div className="flex-1 text-center bg-teal-500/20 py-2 rounded-lg text-teal-400 border border-teal-500/30">Thu</div>
                        </div>
                        <div className="grid grid-cols-4 gap-3 md:gap-4 relative">
                            {/* Abstract tasks */}
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (
                                <div key={i} className="aspect-square bg-black/40 border border-white/5 rounded-xl relative overflow-hidden group hover:border-white/20 transition-colors">
                                    <div className="absolute top-2 left-2 text-xs text-slate-500 font-bold">{10 + i}</div>
                                    {i % 3 === 0 && <div className="absolute bottom-3 left-2 right-2 h-[6px] bg-purple-500/50 rounded-full" />}
                                    {i % 4 === 0 && <div className="absolute bottom-[22px] left-2 w-2/3 h-[6px] bg-teal-500/50 rounded-full" />}
                                    {i % 5 === 0 && <div className="absolute bottom-[40px] left-2 w-1/2 h-[6px] bg-amber-500/50 rounded-full" />}
                                </div>
                            ))}
                        </div>
                        {/* Decorative sticker */}
                        <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center font-bold text-lg rotate-12 shadow-[0_0_30px_rgba(234,179,8,0.3)] border-4 border-[#111]">
                            📅
                        </div>
                    </motion.div>
                </section>

                {/* 5. Minimize picking movements */}
                <section className="py-24 text-center max-w-6xl mx-auto px-6">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white font-serif italic">
                        <span className="not-italic font-sans relative inline-block">
                            <CircleAnnotation color="#10b981">Minimize</CircleAnnotation>
                        </span> picking movements
                    </h2>
                    <p className="text-slate-400 max-w-3xl mx-auto text-lg mb-16 leading-relaxed">
                        Get the most out of your picking operators. Pick, Pack, Ship. Put in pack. Pick and pack. Route to pack. Organize your workflow with advanced picking methods.
                    </p>

                    <div className="grid md:grid-cols-3 gap-8 text-left">
                        {[
                            { title: "Wave Picking", icon: Network, desc: "Process multiple orders simultaneously to minimize travel time in the warehouse.", img: "wave" },
                            { title: "Batch Picking", icon: Layers, desc: "Group similar items across multiple orders into a single picking pass.", img: "batch" },
                            { title: "Put to Light", icon: Box, desc: "Hardware integration to visually guide operators for rapid sorting and packing.", img: "light" }
                        ].map((method, i) => (
                            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} key={i} className="bg-[#111] p-8 rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/10 hover:border-white/20 transition-all flex flex-col items-center text-center group">
                                {/* Abstract diagram of picking */}
                                <div className="w-full h-32 bg-black/40 border border-white/5 rounded-2xl mb-6 relative overflow-hidden flex items-center justify-center group-hover:bg-white/5 transition-colors">
                                    {method.img === "wave" && (
                                        <div className="flex gap-2">
                                            <div className="w-2 h-16 bg-blue-500/50 rounded-full" />
                                            <div className="w-2 h-20 bg-blue-400/80 rounded-full" />
                                            <div className="w-2 h-12 bg-blue-500/50 rounded-full" />
                                            <div className="w-2 h-24 bg-teal-400/80 rounded-full ml-4 shadow-[0_0_10px_theme(colors.teal.400)]" />
                                            <div className="w-2 h-16 bg-teal-500/50 rounded-full" />
                                        </div>
                                    )}
                                    {method.img === "batch" && (
                                        <div className="flex gap-4 flex-col">
                                            <div className="flex gap-2">
                                                <div className="w-12 h-4 bg-purple-500/50 rounded-full" />
                                                <div className="w-12 h-4 bg-purple-500/50 rounded-full" />
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="w-16 h-4 bg-amber-400/80 rounded-full shadow-[0_0_10px_theme(colors.amber.400)]" />
                                                <div className="w-8 h-4 bg-amber-500/50 rounded-full" />
                                            </div>
                                        </div>
                                    )}
                                    {method.img === "light" && (
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-orange-500/20 border-2 border-orange-500/30" />
                                            <div className="w-8 h-8 rounded-lg bg-orange-500/80 shadow-[0_0_15px_theme(colors.orange.500)] border border-white/30" />
                                            <div className="w-8 h-8 rounded-lg bg-orange-500/20 border-2 border-orange-500/30" />
                                            <div className="w-8 h-8 rounded-lg bg-orange-500/20 border-2 border-orange-500/30" />
                                            <div className="w-8 h-8 rounded-lg bg-orange-500/20 border-2 border-orange-500/30" />
                                            <div className="w-8 h-8 rounded-lg bg-orange-500/20 border-2 border-orange-500/30" />
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-white">{method.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{method.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* 6. Routing */}
                <section className="py-24 overflow-hidden">
                    <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
                        <div className="bg-[#111] p-12 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 relative backdrop-blur-sm">
                            {/* Decorative line */}
                            <div className="absolute top-1/2 -left-6 w-12 h-1 bg-white/10 rounded-full" />
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white font-serif italic leading-[1.2]">
                                <span className="not-italic font-sans relative inline-block">
                                    <UnderlineAnnotation color="#ef4444">Routing</UnderlineAnnotation>
                                </span> has never been easier
                            </h2>
                            <p className="text-slate-400 text-lg leading-relaxed">
                                Manage drop-shipping, cross-docking, and multi-warehouse routing in just a few clicks. Full traceability from supplier to customer guarantees you never lose track of a single item.
                            </p>
                        </div>

                        <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex justify-start relative pl-12">
                            {/* Abstract Truck Graphic */}
                            <div className="bg-[#111] rounded-[2rem] p-12 border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.6)] relative z-10 w-full flex items-center justify-center overflow-hidden">
                                <div className="absolute inset-0 bg-black/40 rounded-[2rem] overflow-hidden">
                                    <div className="absolute bottom-10 left-0 w-full h-[2px] border-white/20 border-dashed border-t-2" />
                                </div>
                                <Truck className="w-40 h-40 text-slate-300 relative z-10 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]" strokeWidth={1} />
                                <div className="absolute top-1/3 right-1/4 w-4 h-4 rounded-full bg-teal-400 animate-ping opacity-75 z-20 shadow-[0_0_15px_theme(colors.teal.400)]" />
                                <div className="absolute top-1/3 right-1/4 w-4 h-4 rounded-full bg-teal-500 z-20 shadow-[0_0_20px_theme(colors.teal.500)]" />
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* 7. All the features */}
                <section className="py-24 relative mt-12 bg-white/5 border-y border-white/10">
                    <div className="text-center mb-16 max-w-6xl mx-auto px-6 relative z-10">
                        <h2 className="text-4xl md:text-5xl font-bold text-white font-serif italic">
                            All the <span className="not-italic font-sans relative inline-block mx-2">
                                <CircleAnnotation color="#0ea5e9">features</CircleAnnotation>
                            </span> done right.
                        </h2>
                    </div>

                    <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-6 relative z-10">
                        {[
                            { title: "Barcode scanners", desc: "Native support for industry standard barcode scanners and mobile devices.", icon: ScanLine },
                            { title: "Double entry inventory", desc: "No more missing stock. Everything is a move from one location to another.", icon: ArrowRightLeft },
                            { title: "Multi-warehouse", desc: "Manage multiple warehouses and locations securely from a single dashboard.", icon: Map },
                            { title: "Traceability", desc: "Track lots and serial numbers downstream and upstream without effort.", icon: GitMerge },
                            { title: "Advanced routing", desc: "Push & pull rules automatically trigger transfers between your locations.", icon: Route },
                            { title: "Reporting & Dashboards", desc: "Actionable insights to optimize inventory levels and monitor staff performance.", icon: PieChart }
                        ].map((feat, i) => (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} key={i} className="bg-[#0a0a0a] rounded-2xl p-8 shadow-lg border border-white/10 flex items-start gap-6 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:border-white/20 transition-all cursor-pointer">
                                <div className={`p-4 rounded-xl shrink-0 border border-white/10 bg-white/5 text-slate-300`}>
                                    <feat.icon className="w-8 h-8" />
                                </div>
                                <div className="mt-1">
                                    <h3 className="font-bold text-white text-xl mb-2">{feat.title}</h3>
                                    <p className="text-slate-400 leading-relaxed">{feat.desc}</p>
                                </div>
                                {/* Top right decorative abstract shapes */}
                                <div className="absolute top-4 right-4 text-white/20">
                                    <ArrowDownToLine className="w-4 h-4 opacity-50" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* 8. Ecosystem */}
                <section className="py-24 max-w-6xl mx-auto px-6 text-center lg:text-left flex flex-col lg:flex-row items-center justify-between gap-12">
                    <div className="max-w-md">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 font-serif italic whitespace-nowrap">
                            One <span className="not-italic font-sans underline decoration-white/30 decoration-[3px] underline-offset-[6px]">need</span>,
                            one <span className="not-italic font-sans underline decoration-white/30 decoration-[3px] underline-offset-[6px]">app</span>.
                        </h2>
                        <p className="text-slate-400 text-lg">Full native integration with the ecosystem. Say goodbye to complex connections.</p>
                    </div>

                    <div className="flex flex-wrap gap-4 justify-center lg:justify-end">
                        {[
                            { name: "Sales", icon: BarChart3, color: "text-red-400 bg-red-500/20 border-red-500/30" },
                            { name: "Manufacturing", icon: Factory, color: "text-teal-400 bg-teal-500/20 border-teal-500/30" },
                            { name: "Purchase", icon: ShoppingCart, color: "text-purple-400 bg-purple-500/20 border-purple-500/30" },
                            { name: "Invoicing", icon: FileText, color: "text-blue-400 bg-blue-500/20 border-blue-500/30" }
                        ].map((app, i) => (
                            <div key={i} className="flex items-center gap-3 p-4 pr-6 rounded-2xl bg-[#111] border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all cursor-pointer min-w-[200px]">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${app.color}`}>
                                    <app.icon className="w-6 h-6" />
                                </div>
                                <span className="font-bold text-white text-lg">{app.name}</span>
                            </div>
                        ))}
                    </div>
                </section>
                <SocialProof />
                <CTASection />
            </div>
            <Footer />
        </main>
    );
}
