'use client';

import React from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import { motion } from 'framer-motion';
import { Layers, Rocket, BarChart3, Users, History, CalendarDays, MonitorPlay, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

import Squares from '@/components/Design/Squares';

const services = [
    {
        title: "Business Showcase",
        description: "Launch your business online easily. Create a stunning website, portfolio, or E-Commerce store to showcase your products.",
        icon: <MonitorPlay />,
        features: ["E-Commerce Ready", "Customizable Websites", "Quick Setup"],
        tag: "Platform"
    },
    {
        title: "Analytics Dashboard",
        description: "Understand your business performance at a glance. Track sales, monitor traffic, and view easy-to-read charts.",
        icon: <BarChart3 />,
        features: ["Live Sales Tracking", "Clear Visual Charts", "Growth Reports"],
        tag: "Analytics"
    },
    {
        title: "Lead Management",
        description: "Never lose track of a potential customer. Capture leads, follow their journey, and manage your sales pipeline.",
        icon: <Users />,
        features: ["Customer Pipeline", "Lead Status", "Automated Follow-ups"],
        tag: "Sales"
    },
    {
        title: "History & Contacts",
        description: "Keep all your customer interactions neatly organized. Automatically save contact details and chat histories.",
        icon: <History />,
        features: ["Digital Directory", "Transaction Logs", "Past Interactions"],
        tag: "Database"
    },
    {
        title: "Smart Scheduling",
        description: "Let customers book meetings effortlessly. Sync with your calendar and send automated reminders.",
        icon: <CalendarDays />,
        features: ["Online Booking", "Calendar Sync", "Meeting Reminders"],
        tag: "Meetings"
    },
    {
        title: "All-in-One Workspace",
        description: "Stop juggling multiple tools. Run your entire operation from one powerful, easy-to-use SaaS platform.",
        icon: <Rocket />,
        features: ["Unified Platform", "Cloud Access", "Secure Data"],
        tag: "SaaS Core"
    }
];

export default function ServicesPage() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-white/30 flex flex-col overflow-hidden">
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


            <div className="relative z-10 flex-1 pt-32 pb-24 px-6 sm:px-8 md:px-12 max-w-7xl mx-auto w-full">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center mb-28 relative"
                >
                    <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tighter mb-8 text-white">
                        Powerful tools for <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
                            modern builders.
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
                        Replace your disconnected tools with one ecosystem. Manage your website, sales, leads, and scheduling in a single, unified workspace.
                    </p>
                </motion.div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {services.map((service, index) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                            key={index}
                            className="group relative h-full"
                        >
                            {/* Background Layer (Reveals on Hover) */}
                            <div className="absolute inset-0 bg-neutral-200 border border-neutral-300 rounded-3xl translate-y-1.5 translate-x-1.5 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out" />

                            {/* Main Card Content */}
                            <div className="relative h-full bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 flex flex-col group-hover:-translate-y-1.5 group-hover:-translate-x-1.5 transition-all duration-500 ease-out group-hover:bg-white group-hover:border-neutral-200 group-hover:shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)]">

                                {/* Header: Icon + Tag */}
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 group-hover:bg-black/5 group-hover:border-black/10 transition-colors duration-500">
                                        {React.cloneElement(service.icon, {
                                            className: "w-6 h-6 text-white group-hover:text-black transition-colors duration-500"
                                        })}
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-white/5 text-neutral-400 rounded-full border border-white/5 group-hover:bg-black/5 group-hover:text-black/60 group-hover:border-black/5 transition-colors duration-500">
                                        {service.tag}
                                    </span>
                                </div>

                                {/* Content */}
                                <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-black transition-colors duration-500 tracking-tight">
                                    {service.title}
                                </h3>
                                <p className="text-neutral-400 text-sm leading-relaxed mb-8 flex-1 group-hover:text-neutral-600 transition-colors duration-500">
                                    {service.description}
                                </p>

                                {/* Features List - Refined Design */}
                                <div className="space-y-3 mb-8 pt-6 border-t border-white/5 group-hover:border-black/5 transition-colors duration-500">
                                    {service.features.map((feature, i) => (
                                        <div key={i} className="flex items-center gap-3 text-sm font-medium text-neutral-300 group-hover:text-neutral-800 transition-colors duration-500">
                                            <CheckCircle2 className="w-4 h-4 text-white/40 group-hover:text-black/40 transition-colors duration-500" />
                                            {feature}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>

            <Footer />
        </main>
    );
}