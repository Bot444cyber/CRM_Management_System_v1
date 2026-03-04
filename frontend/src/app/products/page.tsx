'use client';

import React from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import { motion } from 'framer-motion';
import {
    Globe, ShoppingBag, Rss, MessageSquare, GraduationCap, MessageCircle,
    Users, DollarSign, Monitor, RefreshCw, Key,
    Calculator, FileText, Receipt, Files, Table, PenTool,
    Box, Factory, Wrench, CreditCard, Settings, CheckCircle,
    UserPlus, CalendarOff, Star, Share2, Truck,
    Megaphone, Mail, Smartphone, Heart, CalendarDays, ClipboardList,
    CheckSquare, Clock, Zap, LifeBuoy, Calendar, CalendarClock,
    ThumbsUp, Cpu, Phone, BookOpen
} from 'lucide-react';
import Link from 'next/link';
import Squares from '@/components/Design/Squares';

// Data strictly modeled after the provided categorized apps design
const productCategories = [
    // {
    //     name: "Website",
    //     apps: [
    //         { name: "Website", desc: "Enterprise website builder", icon: Globe, color: "text-blue-500" },
    //         { name: "eCommerce", desc: "Sell your products online", icon: ShoppingBag, color: "text-purple-500" },
    //         { name: "Blog", desc: "Publish and engage with visitors", icon: Rss, color: "text-pink-500" },
    //         { name: "eLearning", desc: "Manage and publish courses", icon: GraduationCap, color: "text-blue-500" },
    //     ]
    // },
    // {
    //     name: "Sales",
    //     apps: [
    //         { name: "CRM", desc: "Track leads and close opportunities", icon: Users, color: "text-blue-400" },
    //         { name: "Sales", desc: "From quotes to invoices", icon: DollarSign, color: "text-green-500" },
    //         { name: "Point of Sale", desc: "User friendly Point of Sale", icon: Monitor, color: "text-orange-500" },
    //         { name: "Subscriptions", desc: "Recurring billing and renewals", icon: RefreshCw, color: "text-cyan-500" },
    //         { name: "Rental", desc: "Manage contracts and deliveries", icon: Key, color: "text-yellow-500" }
    //     ]
    // },
    // {
    //     name: "Finance",
    //     apps: [
    //         { name: "Accounting", desc: "Manage financial and analytic accounting", icon: Calculator, color: "text-emerald-500" },
    //         { name: "Invoicing", desc: "Invoices & Payments", icon: FileText, color: "text-blue-500" },
    //         { name: "Expenses", desc: "Manage employee expenses", icon: Receipt, color: "text-rose-400" },
    //         { name: "Documents", desc: "AI document management", icon: Files, color: "text-purple-400" },
    //         { name: "Spreadsheet", desc: "Document spreadsheet", icon: Table, color: "text-green-400" },
    //         { name: "Sign", desc: "Send documents to sign", icon: PenTool, color: "text-indigo-400" }
    //     ]
    // },
    {
        name: "Inventory",
        apps: [
            { name: "Inventory", desc: "Manage your stock and logistics", icon: Box, color: "text-orange-500" },
            // { name: "Manufacturing", desc: "Manufacturing Orders & BOMs", icon: Factory, color: "text-slate-400" },
            // { name: "PLM", desc: "Product Lifecycle Management", icon: Wrench, color: "text-blue-500" },
            // { name: "Purchase", desc: "Purchase orders, receipts & vendors", icon: CreditCard, color: "text-emerald-400" },
            // { name: "Maintenance", desc: "Track equipment and manage requests", icon: Settings, color: "text-zinc-400" },
            // { name: "Quality", desc: "Control the quality of your products", icon: CheckCircle, color: "text-teal-400" }
        ]
    },
    // {
    //     name: "Human Resources",
    //     apps: [
    //         { name: "Employees", desc: "Centralize employee information", icon: Users, color: "text-blue-500" },
    //         { name: "Recruitment", desc: "Track your recruitment pipeline", icon: UserPlus, color: "text-purple-500" },
    //         { name: "Time Off", desc: "Allocate PTO and follow leaves", icon: CalendarOff, color: "text-orange-400" },
    //         { name: "Appraisals", desc: "Assess your employees", icon: Star, color: "text-yellow-400" },
    //         { name: "Referrals", desc: "Share job positions and track friends", icon: Share2, color: "text-pink-400" },
    //         { name: "Fleet", desc: "Manage vehicles and track costs", icon: Truck, color: "text-slate-500" }
    //     ]
    // },
    // {
    //     name: "Marketing",
    //     apps: [
    //         { name: "Marketing Automation", desc: "Build automated mailing campaigns", icon: Megaphone, color: "text-red-500" },
    //         { name: "Email Marketing", desc: "Design, send and track emails", icon: Mail, color: "text-blue-400" },
    //         { name: "SMS Marketing", desc: "Design, send and track SMS", icon: Smartphone, color: "text-teal-400" },
    //         { name: "Social Marketing", desc: "Manage social media and web pushes", icon: Heart, color: "text-rose-500" },
    //         { name: "Events", desc: "Publish events and track sales", icon: CalendarDays, color: "text-orange-500" },
    //         { name: "Surveys", desc: "Send your surveys and share them alive", icon: ClipboardList, color: "text-emerald-500" }
    //     ]
    // },
    // {
    //     name: "Services",
    //     apps: [
    //         { name: "Project", desc: "Organize and plan your tasks", icon: CheckSquare, color: "text-purple-500" },
    //         { name: "Timesheet", desc: "Track employee time spent", icon: Clock, color: "text-blue-500" },
    //         { name: "Field Service", desc: "Schedule and track onsite operations", icon: Zap, color: "text-amber-500" },
    //         { name: "Helpdesk", desc: "Track, prioritize and solve tickets", icon: LifeBuoy, color: "text-rose-400" },
    //         { name: "Planning", desc: "Manage your employee schedule", icon: Calendar, color: "text-teal-500" },
    //         { name: "Appointments", desc: "Allow people to book meetings", icon: CalendarClock, color: "text-indigo-400" }
    //     ]
    // },
    // {
    //     name: "Productivity",
    //     apps: [
    //         { name: "Discuss", desc: "Chat, mail gateways and private channels", icon: MessageSquare, color: "text-blue-400" },
    //         { name: "Approvals", desc: "Create and validate employee requests", icon: ThumbsUp, color: "text-green-500" },
    //         { name: "IoT", desc: "Basic models and actions for IoT", icon: Cpu, color: "text-slate-400" },
    //         { name: "VoIP", desc: "Make and receive phone calls", icon: Phone, color: "text-emerald-400" },
    //         { name: "Knowledge", desc: "Manage your knowledge base", icon: BookOpen, color: "text-purple-400" }
    //     ]
    // },
    // {
    //     name: "Customization",
    //     apps: [
    //         { name: "Studio", desc: "Create and customize your apps", icon: Wrench, color: "text-orange-500" }
    //     ]
    // }
];

export default function ProductsPage() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-white/30 flex flex-col overflow-hidden">
            <Header />

            {/* Background Texture */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <Squares
                    direction="diagonal"
                    speed={0.4}
                    squareSize={32}
                    borderColor="#1a1a1a"
                    hoverFillColor="#222222"
                />
            </div>

            <div className="relative z-10 flex-1 pt-32 pb-24 px-6 sm:px-8 md:px-12 max-w-[1400px] mx-auto w-full">

                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center mb-24 sm:mb-32 relative pt-10"
                >
                    <h1 className="text-5xl sm:text-7xl lg:text-[5.5rem] font-bold tracking-tighter mb-4 text-white" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                        One <span className="underline decoration-blue-500/80 decoration-[4px] underline-offset-[8px]">need</span>, one <span className="underline decoration-blue-500/80 decoration-[4px] underline-offset-[8px]">app</span>.
                    </h1>
                </motion.div>

                {/* Categories & Product Grids */}
                <div className="space-y-20 lg:space-y-28 max-w-6xl mx-auto">
                    {productCategories.map((category, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            className="relative"
                        >
                            <h2 className="text-3xl sm:text-4xl font-semibold mb-8 lg:mb-10 text-white/90" style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}>
                                {category.name}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                {category.apps.map((app, appIdx) => {
                                    let href = '#';
                                    switch (app.name.toLowerCase()) {
                                        case 'website':
                                            href = '/products/website';
                                            break;
                                            
                                        case 'crm':
                                            href = '/products/crm';
                                            break;

                                        case 'inventory':
                                            href = '/products/inventory';
                                            break;
                                    }

                                    return (
                                        <Link
                                            href={href}
                                            key={appIdx}
                                            className="group relative bg-[#0a0a0a]/50 backdrop-blur-sm border border-white/[0.08] rounded-2xl p-4 sm:p-5 flex items-center gap-4 sm:gap-5 hover:bg-white/[0.04] hover:border-white/20 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-1"
                                        >
                                            <div className={`w-14 h-14 shrink-0 bg-[#161616] rounded-[14px] border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#1a1a1a] transition-all duration-300 shadow-md`}>
                                                <app.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${app.color} opacity-90 group-hover:opacity-100`} strokeWidth={1.5} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-[15px] sm:text-[17px] font-bold text-white/90 group-hover:text-white transition-colors truncate">
                                                    {app.name}
                                                </h3>
                                                <p className="text-[11px] sm:text-[13px] text-white/40 leading-[1.4] mt-1 line-clamp-2 pr-2 group-hover:text-white/60 transition-colors">
                                                    {app.desc}
                                                </p>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
            <Footer />
        </main>
    );
}

