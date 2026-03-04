'use client';

import React from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import { motion } from 'framer-motion';
import {
    LayoutTemplate, PaintBucket, Globe2, Sparkles, Smartphone, BarChart, ShoppingCart, Rocket,
    CalendarClock,
    GraduationCap,
    LifeBuoy,
    Megaphone,
    MessageCircle,
    Users,
    ArrowRight,
    Search,
    Target,
    Lightbulb,
    Beaker,
    Building2,
    Image as ImageIcon,
    Blocks,
    Palette
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

import Squares from '@/components/Design/Squares';
import SocialProof from '@/components/Home/SocialProof';

export default function WebsiteProductPage() {
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

            <div className="relative z-10 flex-1 pt-28 pb-24 w-full">

                {/* 1. Hero Section */}
                <section className="px-6 sm:px-8 md:px-12 max-w-7xl mx-auto text-center pt-8 sm:pt-16 mb-24">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-5xl sm:text-6xl md:text-7xl lg:text-[100px] font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-linear-to-b from-white via-white to-white/30 leading-[0.95]"
                    >
                        Scale your brand <span className="text-white/70 font-medium" style={{ fontFamily: "Georgia, serif", fontStyle: "italic", paddingRight: '1rem' }}>online</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                        className="text-lg text-white/50 max-w-3xl mx-auto mb-10"
                    >
                        Build visually stunning, high-performance websites without writing a single line of code. Everything you need from start to scale.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
                    >
                        <button className="bg-white text-black font-bold text-sm px-8 py-4 rounded-full hover:bg-gray-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)] w-full sm:w-auto">
                            Start now - It's free
                        </button>
                        <button className="bg-white/5 text-white font-bold text-sm px-8 py-4 rounded-full border border-white/10 hover:bg-white hover:text-black hover:border-white transition-all hover:scale-105 active:scale-95 w-full sm:w-auto flex items-center justify-center gap-2">
                            <Sparkles className="w-4 h-4" /> Try with AI
                        </button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                        className="relative rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] mx-auto max-w-5xl"
                    >
                        <div className="relative bg-[#0a0a0a]">
                            <img
                                src="https://odoocdn.com/openerp_website/static/src/img/apps/website/hero_image.webp"
                                alt="Website Builder Interface"
                                className="w-full h-auto opacity-90"
                            />
                        </div>
                    </motion.div>
                </section>

                {/* 2. Creation Process Section */}
                <section className="py-24 md:py-32 relative bg-black border-y border-white/5 overflow-hidden">
                    <div className="max-w-6xl mx-auto px-6 relative">
                        <div className="text-center mb-16 md:mb-24">
                            <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-b from-white via-white to-white/30 leading-[1.1]">
                                <span className="text-white">Dream it?</span><br />Build it!
                            </h2>
                        </div>

                        {/* Arrows and Text Grid */}
                        <div className="flex flex-row justify-between items-center md:items-start gap-2 sm:gap-4 md:gap-8 lg:gap-12 xl:gap-4 relative z-10 w-full lg:px-6">
                            {[
                                {
                                    title: "Set", desc: "your business", icon: Building2,
                                    cTop: "#333333", cBot: "#111111",
                                    rot: "rotate-[15deg]", mt: "-mt-[5px]"
                                },
                                {
                                    title: "Add", desc: "your logo", icon: ImageIcon,
                                    cTop: "#444444", cBot: "#1a1a1a",
                                    rot: "rotate-[5deg]", mt: "mt-[20px] sm:mt-[30px] md:mt-[50px] xl:mt-[75px]"
                                },
                                {
                                    title: "Select", desc: "additional features", icon: Blocks,
                                    cTop: "#555555", cBot: "#222222",
                                    rot: "rotate-[-5deg]", mt: "mt-[25px] sm:mt-[40px] md:mt-[60px] xl:mt-[85px]"
                                },
                                {
                                    title: "Choose", desc: "favorite theme", icon: Palette,
                                    cTop: "#666666", cBot: "#2a2a2a",
                                    rot: "rotate-[-15deg]", mt: "mt-[2px] sm:mt-[5px] md:-mt-[10px] xl:mt-[5px]"
                                }
                            ].map((step, i) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: i * 0.15 }}
                                    key={i}
                                    className={`flex flex-col items-center text-center ${step.mt} group w-1/4`}
                                >
                                    <div className={`mb-1 sm:mb-4 md:mb-6 transform transition-transform duration-500 group-hover:scale-110 ${step.rot}`}>
                                        {/* Flat 3D Arrow SVG */}
                                        <svg viewBox="0 0 100 100" className="w-12 h-12 sm:w-20 sm:h-20 lg:w-32 lg:h-32 xl:w-40 xl:h-40 drop-shadow-[0_15px_25px_rgba(0,0,0,0.5)]">
                                            <polygon points="0,20 100,50 25,50" fill={step.cTop} />
                                            <polygon points="25,50 100,50 0,80" fill={step.cBot} />
                                        </svg>
                                    </div>
                                    <div className="flex flex-col items-center px-0 sm:px-2 w-full">
                                        <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                                            <step.icon className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white/50" />
                                            <h3 className="text-white font-bold text-[10px] sm:text-sm md:text-lg lg:text-xl tracking-tight leading-tight">{step.title}</h3>
                                        </div>
                                        <p className="text-white/50 text-[8px] sm:text-[10px] md:text-xs lg:text-sm leading-[1.1] sm:leading-snug">{step.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 3. Template Showcase section */}
                <section className="py-24 max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <p className="text-white/40 text-sm font-semibold tracking-widest uppercase mb-4">Templates for every industry</p>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                            Start fast with beautiful templates.
                        </h2>
                    </div>

                    {/* Professional High-End SaaS Gallery */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {[
                            { name: "Creative Agency", type: "Portfolio & Agency", url: "https://cdn.psdrepo.com/images/2x/westwey-creative-agency-psd-freebie-h7.jpg", span: "lg:col-span-2 lg:row-span-2" },
                            { name: "Travel & Tours", type: "Booking & Directory", url: "https://cdn.psdrepo.com/images/1x/free-psd-travel-website-design-s7.jpg", span: "lg:col-span-1 lg:row-span-1" },
                            { name: "Surfing Institute", type: "Landing Page", url: "https://cdn.psdrepo.com/images/1x/daily-ui-026-surfing-institute-landing-page-design-free-psd-v1.jpg", span: "lg:col-span-1 lg:row-span-1" },
                            { name: "Oathjar Promise", type: "Corporate App", url: "https://colorlib.com/wp/wp-content/uploads/sites/2/Startuprr_One_Page_PSD_Template.jpg", span: "lg:col-span-2 lg:row-span-1" },
                            { name: "Construction Co.", type: "Business & Service", url: "https://cdn.psdrepo.com/images/1x/construction-company-website-e4.jpg", span: "lg:col-span-1 lg:row-span-1" }
                        ].map((template, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
                                className={`group flex flex-col cursor-pointer ${template.span}`}
                            >
                                <div className="relative w-full rounded-3xl overflow-hidden bg-neutral-900 border border-white/10 aspect-[4/3] mb-4">
                                    <img
                                        src={template.url}
                                        alt={template.name}
                                        className="w-full h-full object-cover object-top filter brightness-90 group-hover:brightness-100 transform transition-all duration-700 ease-out group-hover:scale-105"
                                    />
                                    {/* Subtle gradient overlay for depth */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* 6. Integration Hub Section */}
                <section className="py-24 bg-black border-t border-white/5 relative overflow-hidden">
                    <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-linear-to-b from-white via-white to-white/30 leading-[1.1]">
                                Scalable and fully <br />
                                <span className="text-white/70 font-medium" style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}>integrated</span>
                            </h2>
                            <p className="text-white/50 text-lg leading-relaxed">
                                Your website shouldn't exist in a silo. Natively connect your frontend to CRM, Inventory, e-Commerce, and Marketing tools without complex Zapier workflows.
                            </p>
                        </div>

                        <div className="relative h-[400px] flex items-center justify-center">
                            {/* Circular Integration Graphic */}
                            <div className="absolute w-full max-w-[400px] aspect-square rounded-full border border-white/10 border-dashed animate-[spin_60s_linear_infinite]" />
                            <div className="absolute w-[60%] max-w-[240px] aspect-square rounded-full border border-white/10 border-dashed animate-[spin_40s_linear_infinite_reverse]" />

                            {/* Center Hub */}
                            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-white/30 to-white/5 p-[1px] shadow-[0_0_40px_rgba(255,255,255,0.1)] z-10 relative">
                                <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                                    <Globe2 className="w-10 h-10 text-white" />
                                </div>
                            </div>

                            {/* Orbiting Icons */}
                            {[
                                { icon: ShoppingCart, color: 'text-white/70', pos: '-top-4 left-1/2 -translate-x-1/2' },
                                { icon: BarChart, color: 'text-white/70', pos: 'top-1/4 -right-4' },
                                { icon: Rocket, color: 'text-white/70', pos: '-bottom-4 left-1/2 -translate-x-1/2' },
                                { icon: LayoutTemplate, color: 'text-white/70', pos: 'bottom-1/4 -left-4' },
                            ].map((item, i) => (
                                <div key={i} className={`absolute ${item.pos} w-14 h-14 rounded-2xl bg-[#111115] border border-white/10 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.05)] transform transition-transform hover:scale-110 z-20`}>
                                    <item.icon className={`w-6 h-6 ${item.color}`} />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 4. Design Tools "Craft your site" */}
                <section className="py-24 relative overflow-hidden">
                    <div className="max-w-6xl mx-auto px-6 relative z-10">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tighter bg-clip-text text-transparent bg-linear-to-b from-white via-white to-white/30 leading-[1.1]">
                                Craft your site like a <span className="text-white/70 font-medium" style={{ fontFamily: "Georgia, serif", fontStyle: "italic", paddingRight: '0.5rem' }}>designer</span>
                            </h2>
                            <p className="text-white/50 max-w-2xl mx-auto text-lg leading-relaxed">
                                Experience an intuitive grid system, infinite Google Fonts, stunning dynamic gradients, and granular animation controls right in your browser.
                            </p>
                        </div>

                        {/* Designer UI Video */}
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8 }}
                            className="relative rounded-3xl bg-[#0a0a0e] border border-white/10 overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)] aspect-[16/10] md:aspect-[16/9] flex justify-center items-center"
                        >
                            <video
                                src="https://download.odoocdn.com/videos/odoo_com/video_website.webm"
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                            />
                        </motion.div>
                    </div>
                </section>

                {/* 7. Pricing Block */}
                <section className="py-24 w-full bg-black border-y border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0,transparent_50%)] pointer-events-none" />

                    <div className="max-w-4xl mx-auto px-6 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            whileInView={{ opacity: 1, scale: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
                            className="p-10 md:p-20 text-center relative overflow-hidden rounded-[2.5rem] border border-transparent transition-all duration-500 hover:bg-white/[0.02] hover:border-white/10 hover:shadow-[0_0_80px_rgba(255,255,255,0.05)] cursor-pointer group"
                        >
                            <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight leading-[1.1] group-hover:scale-[1.02] transition-transform duration-500 bg-clip-text text-transparent bg-linear-to-b from-white via-white to-white/30 truncate text-ellipsis overflow-hidden">
                                Start entirely free.<br />
                                <span className="text-white/70 font-medium tracking-normal w-full inline-block" style={{ fontFamily: "Georgia, serif", fontStyle: "italic", paddingRight: '0.2rem' }}>No catch.</span>
                            </h2>

                            <p className="text-white/50 max-w-lg mx-auto text-lg md:text-xl leading-relaxed mb-10 group-hover:text-white/70 transition-colors duration-500">
                                Unlimited pages, unlimited bandwidth, and full access to our design tools. We only charge when you need advanced custom domains and dedicated support.
                            </p>

                            <button className="bg-white text-black font-semibold tracking-wide rounded-full px-8 py-4 hover:scale-105 hover:bg-neutral-200 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] group-hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                                Create your first site
                            </button>
                        </motion.div>
                    </div>
                </section>

                {/* 8. Feature Grid */}
                <section className="py-24 max-w-6xl mx-auto px-6 relative">
                    <div className="text-center mb-16 relative inline-block left-1/2 -translate-x-1/2">
                        <div className="absolute -top-10 -left-10 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                        <h2 className="text-4xl md:text-5xl font-bold relative z-10 bg-clip-text text-transparent bg-linear-to-b from-white via-white to-white/30 leading-[1.1]">
                            All the <span className="text-white/70 font-medium" style={{ fontFamily: "Georgia, serif", fontStyle: "italic", paddingRight: '0.5rem' }}>features</span><br />done right.
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            { title: "Built-in SEO Tools", text: "Automatically generated sitemaps, customizable meta tags, and structured data to help you rank higher on Google.", icon: "🔍" },
                            { title: "Lightning Fast Hosting", text: "Global CDN infrastructure ensures your site loads instantly anywhere in the world with 99.9% uptime guaranteed.", icon: "⚡" },
                            { title: "Custom Domains", text: "Connect your own domain name seamlessly or register a new one directly through our platform in seconds.", icon: "🌐" },
                            { title: "Secure by Default", text: "Every site comes with a free, auto-renewing SSL certificate to keep your visitors' data completely safe.", icon: "🔒" },
                            { title: "Analytics Dashboard", text: "Detailed insights into traffic sources, user behavior, and conversion rates built directly into your editor.", icon: "📊" },
                            { title: "Mobile Optimized", text: "Our grid system guarantees your site looks flawless and functions perfectly on every device size automatically.", icon: "📱" }
                        ].map((feat, i) => (
                            <div key={i} className="bg-[#0a0a0a] rounded-3xl p-8 border border-white/10 hover:border-white/30 hover:bg-white/[0.02] hover:shadow-[0_0_40px_rgba(255,255,255,0.03)] transition-all duration-500 cursor-pointer relative group">
                                <div className="absolute top-8 right-8 text-2xl opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">{feat.icon}</div>
                                <h3 className="text-xl font-bold text-white mb-3 pr-10">{feat.title}</h3>
                                <p className="text-white/50 leading-relaxed text-sm pr-10 group-hover:text-white/70 transition-colors duration-500">{feat.text}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 9. Cross-sell / Ecosystem */}
                <section className="py-24 max-w-6xl mx-auto px-6 border-t border-white/5">
                    <h2 className="text-2xl font-bold text-white mb-2">
                        One <span className="underline decoration-white/40 decoration-[3px] underline-offset-[6px]">need</span>, one <span className="underline decoration-white/40 decoration-[3px] underline-offset-[6px]">app</span>.
                    </h2>
                    <p className="text-white/40 mb-10 text-sm">Expand your website's capabilities...</p>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { name: "eCommerce", icon: ShoppingCart },
                            { name: "CRM", icon: Users },
                            { name: "Marketing", icon: Megaphone },
                            { name: "Helpdesk", icon: LifeBuoy },
                            { name: "Blog", icon: (TextIcon: { className: string | undefined; }) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={TextIcon.className}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> },
                            { name: "eLearning", icon: GraduationCap },
                            { name: "Appointments", icon: CalendarClock },
                            { name: "Live Chat", icon: MessageCircle }
                        ].map((app, i) => (
                            <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-[#0a0a0a] border border-white/10 hover:border-white/30 hover:bg-white/[0.03] transition-all duration-300 cursor-pointer group">
                                <div className="w-10 h-10 rounded-lg bg-[#111115] flex items-center justify-center border border-white/5 group-hover:border-white/20 transition-all duration-300 group-hover:bg-white text-white/60 group-hover:text-black">
                                    <app.icon className="w-5 h-5 transition-colors duration-300" />
                                </div>
                                <span className="font-semibold text-sm text-white/60 group-hover:text-white transition-colors duration-300">{app.name}</span>
                            </div>
                        ))}
                    </div>
                </section>

            </div>
            <SocialProof />
            <Footer />
        </main>
    );
}
