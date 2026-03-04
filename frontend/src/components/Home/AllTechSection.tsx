"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Stack from '@/components/ui/Stack';
import ElectricBorder from '@/components/Design/ElectricBorder';
import { Target, BarChart3, Users, BookOpen, Clock, ShoppingCart, Layers, MonitorSmartphone, Hand } from 'lucide-react';

const techItems = [
    {
        id: 1,
        name: "Website Builder",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=400&fit=crop&grayscale=1",
        desc: "Create stunning business websites and portfolios in minutes.",
        icon: MonitorSmartphone,
        features: ["Drag & Drop", "Mobile Responsive", "Custom Domains"]
    },
    {
        id: 2,
        name: "Analytics Hub",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&fit=crop&grayscale=1",
        desc: "Real-time insights and beautiful charts for your business data.",
        icon: BarChart3,
        features: ["Live Dashboards", "Custom Reports", "Export Data"]
    },
    {
        id: 3,
        name: "Sales CRM",
        image: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=400&fit=crop&grayscale=1",
        desc: "Track leads, manage pipelines, and close more deals fast.",
        icon: Users,
        features: ["Lead Tracking", "Automated Follow-ups", "Pipeline View"]
    },
    {
        id: 4,
        name: "Contact Logs",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400&fit=crop&grayscale=1",
        desc: "A secure digital directory for every customer interaction.",
        icon: BookOpen,
        features: ["Interaction History", "Secure Records", "Quick Search"]
    },
    {
        id: 5,
        name: "Smart Scheduling",
        image: "https://images.unsplash.com/photo-1620286392120-d36009a97d10?q=80&w=400&fit=crop&grayscale=1",
        desc: "Automated booking system with helpful meeting reminders.",
        icon: Clock,
        features: ["Calendar Sync", "SMS Reminders", "Easy Booking"]
    },
    {
        id: 6,
        name: "E-Commerce",
        image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=400&fit=crop&grayscale=1",
        desc: "Sell products online with built-in payment processing.",
        icon: ShoppingCart,
        features: ["Inventory Tracking", "Secure Payments", "Order Management"]
    },
    {
        id: 7,
        name: "Unified Workspace",
        image: "https://images.unsplash.com/photo-1556742031-c6961e8560b0?q=80&w=300&fit=crop&grayscale=1",
        desc: "All your business tools combined in one powerful platform.",
        icon: Layers,
        features: ["Cloud Access", "Team Collaboration", "Data Security"]
    }
];

export default function AllTechSection() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [hasInteracted, setHasInteracted] = useState(false);

    // Prepare cards for the stack component
    const stackCards = techItems.map((item, index) => ({
        id: item.id,
        content: (
            <motion.div
                className="w-full h-full relative rounded-2xl overflow-hidden border border-white/10 group cursor-pointer"
                onClick={() => setActiveIndex(index)}
                dragElastic={1}
                onDragEnd={() => { }}
            >
                {/* Image underlay */}
                <div className="absolute inset-0 bg-black/40 z-10 mix-blend-multiply transition-colors duration-500 group-hover:bg-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0c0c10] to-transparent z-10" />

                <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover grayscale transition-all duration-700 ease-out group-hover:scale-110 group-hover:grayscale-0"
                />

                {/* Meta Badge */}
                <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0c0c10]/80 backdrop-blur-md border border-white/10">
                    <item.icon className="w-4 h-4 text-white/70" />
                    <span className="text-white/90 text-sm font-semibold tracking-wide">{item.name}</span>
                </div>
            </motion.div>
        )
    }));

    const activeItem = techItems[activeIndex];

    return (
        <section className="bg-black pt-4 sm:pt-10 pb-20 sm:pb-28 w-full overflow-hidden relative">

            {/* Background Architecture Lines */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute left-1/4 inset-y-0 w-px bg-white/[0.02]" />
                <div className="absolute right-1/4 inset-y-0 w-px bg-white/[0.02]" />
                <div className="absolute top-[20%] inset-x-0 h-px bg-white/[0.02]" />
            </div>

            <div className="max-w-[1200px] mx-auto px-6 relative z-10">

                {/* Heading Area */}

                <div className="text-center md:text-left mb-16 sm:mb-20 border-b border-white/10 pb-10">
                    <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tighter text-white leading-tight">
                        Everything you need <br className="hidden md:block" />
                        <span className="text-white/30">to succeed.</span>
                    </h2>
                </div>

                {/* 2-Column Split: Stack Left, Details Right */}
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12 lg:gap-16">

                    {/* Left side: React-Bits Stack */}
                    <div className="w-full lg:w-1/2 flex justify-center lg:justify-center pt-8">
                        <div
                            className="relative w-full max-w-[460px] aspect-square flex flex-col items-center justify-center"
                            onPointerDown={() => setHasInteracted(true)}
                        >
                            {/* Ambient Glow behind stack */}
                            <div className="absolute inset-0 bg-white/5 blur-[80px] rounded-full pointer-events-none" />

                            <AnimatePresence>
                                {!hasInteracted && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        viewport={{ once: true, margin: "-100px" }}
                                        transition={{ delay: 0.5, duration: 0.5 }}
                                        className="absolute z-50 pointer-events-none flex flex-col items-center justify-center"
                                    >
                                        <motion.div
                                            animate={{
                                                x: [0, -60, 0],
                                                rotate: [0, -15, 0]
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                            className="bg-black/50 backdrop-blur-md p-4 rounded-full border border-white/20 shadow-2xl"
                                        >
                                            <Hand className="w-8 h-8 text-white/90" />
                                        </motion.div>
                                        <motion.span
                                            animate={{ opacity: [0.5, 1, 0.5] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="mt-6 text-white/90 font-mono text-xs font-bold tracking-[0.2em] uppercase bg-black/60 px-4 py-2 rounded-full backdrop-blur-md border border-white/10"
                                        >
                                            Drag or Click
                                        </motion.span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Interactive Stack */}
                            <div className="w-[440px] h-[520px]">
                                <ElectricBorder color="#ffffff" speed={2} chaos={0.12} borderRadius={24} className="w-full h-full p-4">
                                    <Stack
                                        randomRotation={false}
                                        sensitivity={100}
                                        sendToBackOnClick={true}
                                        cardDimensions={{ width: 400, height: 480 }}
                                        cardsData={stackCards}
                                        animationConfig={{ stiffness: 260, damping: 20 }}
                                        autoplayOptions={{
                                            autoplay: true,
                                            pauseOnHover: true,
                                            delay: 4000,
                                        }}
                                        onCardChange={(id) => {
                                            const index = techItems.findIndex(t => t.id === id);
                                            if (index !== -1) setActiveIndex(index);
                                        }}
                                    />
                                </ElectricBorder>
                            </div>
                        </div>
                    </div>

                    {/* Right side: Detailed Information Board */}
                    <div className="w-full lg:w-1/2 pt-4 lg:pt-12">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeItem.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="max-w-md"
                            >
                                <h3 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
                                    {activeItem.name}
                                </h3>
                                <p className="text-white/50 text-lg leading-relaxed mb-10">
                                    {activeItem.desc}
                                </p>

                                {/* Features List */}
                                <div className="space-y-4 border-t border-white/10 pt-8">
                                    <p className="font-mono text-xs text-white/40 uppercase tracking-widest mb-6">Key Capabilities</p>
                                    {activeItem.features.map((feat, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-6 h-6 rounded-full border border-white/10 bg-white/5">
                                                <svg className="w-3 h-3 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span className="text-white/80 font-medium">{feat}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-12">
                                    <button className="px-6 py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors w-full sm:w-auto">
                                        Explore {activeItem.name}
                                    </button>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                </div>

            </div>
        </section>
    );
}
