"use client";

import React from 'react';
import ScrollStack, { ScrollStackItem } from '../../Design/ScrollStack';
import FeatureCard from './FeatureCard';
import { motion } from 'framer-motion';

// ─── Feature Data ────────────────────────────────────────────────────────────
const features = [
    {
        title: "Showcase Your Business",
        description: "Launch a stunning website to show off what you do. Whether you need a simple portfolio, a landing page, or a full E-Commerce store, our easy builder gives you a professional online presence in minutes.",
        badge: "Websites",
        badgeColor: "text-purple-400 bg-purple-400/10 border-purple-400/20",
        cta: "Build a Website",
        icon: (
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
        image: "https://www.wtp.media/wp-content/uploads/2020/09/google-my-business-improve-ranking.jpg",
        color: "from-white/[0.05] to-transparent",
        borderColor: "border-white/[0.05]",
        glowColor: "bg-white/[0.03]",
        highlights: ["E-Commerce Ready", "Beautiful Themes", "Mobile Friendly", "No Coding Needed"]
    },
    {
        title: "Smart Data Dashboards",
        description: "Understand your business at a glance. Our dashboards turn complicated numbers into simple, easy-to-read charts so you always know exactly how much you are selling and growing.",
        badge: "Analytics",
        badgeColor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
        cta: "View Dashboards",
        icon: (
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
        image: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=2076&auto=format&fit=crop",
        color: "from-zinc-400/[0.04] to-transparent",
        borderColor: "border-white/[0.05]",
        glowColor: "bg-white/[0.02]",
        highlights: ["Live Sales Tracking", "Simple Charts", "Growth Reports", "Export Data"]
    },
    {
        title: "Lead Management",
        description: "Never lose a potential customer again. Keep track of everyone who is interested in your business, know exactly where they are in the buying process, and make sure to follow up at the perfect time.",
        badge: "CRM",
        badgeColor: "text-blue-400 bg-blue-400/10 border-blue-400/20",
        cta: "Manage Leads",
        icon: (
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
        color: "from-white/[0.04] to-transparent",
        borderColor: "border-white/[0.05]",
        glowColor: "bg-white/[0.03]",
        highlights: ["Customer Pipeline", "Lead Status Tracking", "Follow-up Alerts", "Conversion Rates"]
    },
    {
        title: "Contact & History Logs",
        description: "A secure digital notebook for every client interaction. Automatically save names, phone numbers, past chats, and a complete record of every transaction and purchase they have ever made.",
        badge: "Records",
        badgeColor: "text-sky-400 bg-sky-400/10 border-sky-400/20",
        cta: "View History",
        icon: (
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
        image: "https://webcdn.ringover.com/assets/desktop/com/features/call-logs/call-logs1.png",
        color: "from-slate-400/[0.05] to-transparent",
        borderColor: "border-white/[0.05]",
        glowColor: "bg-white/[0.03]",
        highlights: ["Secure Contact Info", "Transaction Records", "Past Conversations", "Easy Search"]
    },
    {
        title: "Scheduling & Reminders",
        description: "Let customers book meetings and services directly with you. Our system syncs with your calendar and automatically sends helpful text and email reminders so nobody misses an appointment.",
        badge: "Meetings",
        badgeColor: "text-orange-400 bg-orange-400/10 border-orange-400/20",
        cta: "Setup Calendar",
        icon: (
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
        image: "https://framerusercontent.com/images/xF34xFQ76Ari5St8pnL1PkXO2X0.png?width=1536&height=1024",
        color: "from-orange-400/[0.04] to-transparent",
        borderColor: "border-white/[0.05]",
        glowColor: "bg-white/[0.03]",
        highlights: ["Online Booking", "Calendar Sync", "SMS Reminders", "Email Alerts"]
    }
];

// ─── Features Section ────────────────────────────────────────────────────────
export default function Features() {
    return (
        <section className="relative w-full bg-black py-14 sm:py-20 md:py-28 lg:py-32 overflow-clip">

            {/* Section Header */}
            <div className="max-w-5xl mx-auto px-5 sm:px-6 mb-12 sm:mb-16 md:mb-24 lg:mb-28 text-center">

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.05 }}
                    className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-4 sm:mb-6 bg-clip-text text-transparent bg-linear-to-b from-white to-white/40"
                >
                    Elevate Your Operations
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.12 }}
                    className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/45 max-w-3xl mx-auto font-light leading-relaxed"
                >
                    From free website builder to AI-powered CRM — everything you need to grow your business is built right in.
                </motion.p>

                {/* Quick stats row */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="mt-8 sm:mt-10 md:mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 md:gap-16"
                >
                    {[
                        { value: "Free", label: "Website Builder" },
                        { value: "10x", label: "Faster Setup" },
                        { value: "1,000+", label: "Integrations" },
                        { value: "99.9%", label: "Uptime SLA" },
                    ].map((stat) => (
                        <div key={stat.label} className="text-center">
                            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight">{stat.value}</div>
                            <div className="text-sm text-white/40 mt-0.5">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* 
             * Scroll height:
             * Mobile (flex-col cards): each card is ~560px (auto text + 200px image)
             *   6 cards × ~100vh ≈ need ~900vh
             * Desktop (flex-row cards): 80vh card, tighter stacking → 720vh plenty
             */}
            <div className="h-[900vh] lg:h-[720vh] w-full">
                <ScrollStack
                    useWindowScroll={true}
                    itemDistance={160}
                    itemStackDistance={6}
                    stackPosition="12%"
                    baseScale={0.84}
                    rotationAmount={0}
                    blurAmount={0}
                >
                    {features.map((feature, idx) => (
                        <ScrollStackItem key={idx} itemClassName="w-full max-w-[1400px] mx-auto px-3 sm:px-4 md:px-8">
                            <FeatureCard
                                title={feature.title}
                                description={feature.description}
                                icon={feature.icon}
                                image={feature.image}
                                color={feature.color}
                                borderColor={feature.borderColor}
                                glowColor={feature.glowColor}
                                badge={feature.badge}
                                badgeColor={feature.badgeColor}
                                cta={feature.cta}
                                highlights={feature.highlights}
                            />
                        </ScrollStackItem>
                    ))}
                </ScrollStack>
            </div>
        </section>
    );
}
