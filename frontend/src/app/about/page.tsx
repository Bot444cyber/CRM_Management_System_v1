'use client';

import React, { useState } from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import { Target, Users, Zap, Building, Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Squares from '@/components/Design/Squares';

const values = [
    {
        title: "Everything in One Place",
        description: "Why pay for a separate website builder, calendar, and CRM? We bring your storefront, history logs, and analytics together.",
        icon: <Zap className="w-5 h-5" />
    },
    {
        title: "Built for Everyone",
        description: "Our tools are made for real business owners, not just tech experts. Simple dashboards mean you spend less time clicking and more time selling.",
        icon: <Users className="w-5 h-5" />
    },
    {
        title: "Grow Naturally",
        description: "Whether you just need a simple business showcase or a full system to manage thousands of leads, our platform scales with you.",
        icon: <Target className="w-5 h-5" />
    }
];

export default function AboutPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleValue = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <main className="min-h-screen bg-black text-white selection:bg-white/30 flex flex-col">
            <Header />

            {/* Background Texture */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
                <Squares
                    direction="diagonal"
                    speed={0.3}
                    squareSize={24}
                    borderColor="#222"
                    hoverFillColor="#1a1a1a"
                />
            </div>

            <div className="flex-1 pt-32 pb-24 px-6 sm:px-8 md:px-12 max-w-7xl mx-auto w-full">

                {/* Hero / Mission Statement */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="max-w-4xl mx-auto text-center mb-32 relative"
                >
                    {/* Glow effect */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-white/5 blur-[120px] rounded-full pointer-events-none" />

                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tighter mb-8">
                        The simple way to <br />
                        <span className="text-white/40">run your entire business online.</span>
                    </h1>
                    <p className="text-lg sm:text-xl md:text-2xl text-neutral-400 leading-relaxed font-light relative z-10">
                        We started because managing a business shouldn't mean logging into five different apps. We built a single place for your website, contacts, numbers, and meetings.
                    </p>
                </motion.div>

                {/* Core Values Section (List format like FAQ) */}
                <div className="mb-32 flex justify-center">
                    <div className="max-w-4xl w-full">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5 }}
                            className="text-3xl font-bold mb-12 text-center tracking-tight"
                        >
                            Our Core Values
                        </motion.h2>

                        <div className="flex flex-col gap-4">
                            {values.map((value, index) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                                    key={index}
                                    className="border border-neutral-800 rounded-2xl bg-[#0c0c10] overflow-hidden hover:border-white hover:bg-white hover:text-black transition-all duration-300 group"
                                >
                                    <button
                                        onClick={() => toggleValue(index)}
                                        className="w-full flex items-center justify-between p-6 text-left focus:outline-none cursor-pointer"
                                        aria-expanded={openIndex === index}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-xl bg-white/5 group-hover:bg-black/5 border border-white/10 group-hover:border-black/10 transition-colors">
                                                {React.cloneElement(value.icon, { className: "text-white/70 group-hover:text-black transition-colors" })}
                                            </div>
                                            <span className="text-lg font-medium pr-8">{value.title}</span>
                                        </div>
                                        <span className="text-neutral-400 group-hover:text-black shrink-0 bg-neutral-900 group-hover:bg-neutral-200 p-2 rounded-full transition-colors">
                                            {openIndex === index ? (
                                                <Minus className="w-5 h-5" />
                                            ) : (
                                                <Plus className="w-5 h-5" />
                                            )}
                                        </span>
                                    </button>
                                    <AnimatePresence>
                                        {openIndex === index && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                            >
                                                <div className="p-6 pt-0 text-neutral-400 group-hover:text-neutral-600 leading-relaxed text-lg transition-colors ml-16">
                                                    {value.description}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Stats / By the numbers */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
                    className="border border-white/10 rounded-[2.5rem] p-8 sm:p-12 bg-[#0c0c10] relative overflow-hidden flex flex-col items-center text-center group hover:bg-white hover:text-black transition-all duration-700 hover:shadow-2xl hover:shadow-white/20 cursor-default"
                >
                    <Building className="w-12 h-12 text-white/20 group-hover:text-black/20 transition-colors duration-700 mb-8" />
                    <h2 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-12 group-hover:text-black transition-colors duration-700">NexusCRM by the numbers</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 w-full max-w-4xl border-t border-white/10 group-hover:border-black/10 pt-8 sm:pt-12 transition-colors duration-700">
                        <div>
                            <div className="text-5xl font-bold mb-2 group-hover:text-black transition-colors duration-700">10k+</div>
                            <div className="text-neutral-400 group-hover:text-neutral-500 font-medium tracking-wide text-sm uppercase transition-colors duration-700">Active Customers</div>
                        </div>
                        <div>
                            <div className="text-5xl font-bold mb-2 group-hover:text-black transition-colors duration-700">$2B+</div>
                            <div className="text-neutral-400 group-hover:text-neutral-500 font-medium tracking-wide text-sm uppercase transition-colors duration-700">Revenue Managed</div>
                        </div>
                        <div>
                            <div className="text-5xl font-bold mb-2 group-hover:text-black transition-colors duration-700">99.9%</div>
                            <div className="text-neutral-400 group-hover:text-neutral-500 font-medium tracking-wide text-sm uppercase transition-colors duration-700">Platform Uptime</div>
                        </div>
                    </div>
                </motion.div>

                {/* Back to Home CTA */}
                <div className="mt-24 text-center">
                    <Link href="/" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors border-b border-transparent hover:border-white pb-1 font-medium">
                        Back to Homepage
                    </Link>
                </div>

            </div>

            <Footer />
        </main>
    );
}
