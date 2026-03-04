"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Mosaic cell definitions ──────────────────────────────────────────────────
// Each cell is one of: photo URL, a colored shape, or empty
type Cell =
    | { type: 'photo'; src: string; round?: boolean }
    | { type: 'shape'; shape: 'sq' | 'circle' | 'rsq'; color: string }
    | { type: 'empty' };

const P = (src: string, round = false): Cell => ({ type: 'photo', src, round });
const SQ = (color: string): Cell => ({ type: 'shape', shape: 'sq', color });
const CI = (color: string): Cell => ({ type: 'shape', shape: 'circle', color });
const RS = (color: string): Cell => ({ type: 'shape', shape: 'rsq', color });
const EM = (): Cell => ({ type: 'empty' });

const VIOLET = '#27272a'; // zinc-800
const VIOLET2 = '#3f3f46'; // zinc-700
const ROSE = '#52525b'; // zinc-600
const INDIGO = '#18181b'; // zinc-900

// 5 rows × 11 columns = 55 cells
const rows: Cell[][] = [
    [EM(), P('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80', true), SQ(VIOLET), EM(), CI('#374151'), P('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80'), SQ(VIOLET2), RS('#374151'), P('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&q=80'), CI('#1f2937'), SQ(VIOLET)],
    [RS('#1f2937'), P('https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&q=80'), CI(VIOLET), EM(), EM(), SQ(VIOLET2), P('https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80', true), EM(), CI('#374151'), EM(), RS(VIOLET)],
    [P('https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80', true), SQ('#1f2937'), P('https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80'), EM(), EM(), EM(), EM(), EM(), EM(), CI('#374151'), P('https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&q=80', true)],
    [SQ(VIOLET), P('https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&q=80'), P('https://images.unsplash.com/photo-1495562569060-2eec283d3391?w=100&q=80', true), RS('#374151'), EM(), CI('#1f2937'), P('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80'), SQ(ROSE), CI(VIOLET), EM(), RS(VIOLET2)],
    [P('https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80'), RS('#1f2937'), P('https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=100&q=80', true), P('https://images.unsplash.com/photo-1554151228-14d9def656e4?w=100&q=80', true), SQ(VIOLET), CI('#374151'), P('https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80'), SQ(INDIGO), P('https://images.unsplash.com/photo-1520810627419-35e592be37ed?w=100&q=80', true), CI(VIOLET2), SQ('#374151')],
];

// ─── Testimonials ─────────────────────────────────────────────────────────────
const testimonials = [
    {
        quote: "The processing time for client documents has been noticeably reduced — in certain cases from 2 days to only 5 hours. As a result we can now focus on what matters: strategy and results.",
        name: "Harry Van Donink",
        title: "CEO, KPMG Belgium",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&q=80",
        company: "KPMG",
    },
    {
        quote: "NexusCRM unified our entire sales pipeline. Lead-to-close time dropped 40% in the first quarter. The team actually enjoys using it — that says everything.",
        name: "Sarah Chen",
        title: "VP Sales, Stripe",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&q=80",
        company: "Stripe",
    },
    {
        quote: "We replaced five tools with NexusCRM. Onboarding took one afternoon. The automation workflows alone save us 15 hours a week.",
        name: "Marcus Reid",
        title: "Founder, Launchpad.vc",
        avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=120&q=80",
        company: "Launchpad",
    },
];

// ─── Mosaic Cell Renderer ─────────────────────────────────────────────────────
function MosaicCell({ cell, i }: { cell: Cell; i: number }) {
    const base = "w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 shrink-0";
    if (cell.type === 'empty') return <div className={base} />;

    if (cell.type === 'photo') {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.015 }}
                className={`${base} overflow-hidden border-2 border-white/10 ${cell.round ? 'rounded-full' : 'rounded-xl'}`}
            >
                <img src={cell.src} alt="" className="w-full h-full object-cover" loading="lazy" />
            </motion.div>
        );
    }

    const shape = cell.shape;
    const cls = shape === 'circle' ? 'rounded-full' : shape === 'rsq' ? 'rounded-2xl' : 'rounded-lg';
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.015 }}
            className={`${base} ${cls}`}
            style={{ backgroundColor: cell.color, opacity: 0.7 }}
        />
    );
}

// ─── Sliding Testimonial Content ──────────────────────────────────────────────
function TestimonialContent({ t }: { t: typeof testimonials[0] }) {
    return (
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 w-full h-full">
            {/* Left Column: Quote */}
            <div className="flex-1 flex flex-col justify-start">
                <svg className="w-10 h-10 md:w-12 md:h-12 text-white/30 mb-6 opacity-80" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-white/80 text-lg sm:text-xl md:text-2xl leading-relaxed font-light tracking-wide">
                    {t.quote}
                </p>
            </div>

            {/* Right Column: Person Info */}
            <div className="flex md:flex-col items-center md:items-center justify-start md:justify-center gap-4 shrink-0 md:w-48 text-left md:text-center mt-4 md:mt-0">
                <img src={t.avatar} alt={t.name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-white/20" />
                <div>
                    <p className="text-white font-bold text-base sm:text-lg">{t.name}</p>
                    <p className="text-white/40 text-xs sm:text-sm mt-0.5 mb-3">{t.title}</p>
                    <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 inline-flex items-center justify-center">
                        <p className="text-white/60 text-xs font-semibold tracking-wide">{t.company}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Section ─────────────────────────────────────────────────────────────
export default function SocialProof() {
    const [active, setActive] = React.useState(0);

    React.useEffect(() => {
        const id = setInterval(() => setActive(a => (a + 1) % testimonials.length), 5000);
        return () => clearInterval(id);
    }, []);

    return (
        <section className="relative w-full bg-black py-20 sm:py-28 overflow-hidden">
            {/* Subtle radial glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02),transparent_65%)] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6">

                {/* ── Mosaic grid + centered heading ── */}
                <div className="relative">
                    {/* Grid rows */}
                    <div className="flex flex-col gap-3 sm:gap-4 lg:gap-6 items-center">
                        {rows.map((row, ri) => (
                            <div key={ri} className="flex gap-3 sm:gap-4 lg:gap-6 items-center justify-center">
                                {row.map((cell, ci) => (
                                    <MosaicCell key={ci} cell={cell} i={ri * 11 + ci} />
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Centered absolute heading overlaid on middle rows */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        {/* Frosted blur patch behind text */}
                        <div className="px-8 py-6 sm:px-14 sm:py-8 text-center" style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.9) 40%, transparent 80%)' }}>
                            {/* Happy annotation */}
                            <p className="text-white/60 text-xs sm:text-sm font-medium italic mb-1" style={{ fontFamily: 'cursive' }}>
                                ↙ happy
                            </p>
                            <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-[90px] font-extrabold tracking-tighter text-white leading-[1.05] mb-5">
                                Join{' '}
                                <span className="text-white/80">
                                    50,000+
                                </span>{' '}
                                users
                            </h2>
                            <p className="text-white/45 text-base sm:text-lg md:text-xl lg:text-2xl font-light">
                                who grow their business with NexusCRM
                            </p>
                        </div>
                    </div>

                    {/* Edge fades */}
                    <div className="absolute inset-y-0 left-0 w-12 sm:w-24 bg-linear-to-r from-black to-transparent pointer-events-none" />
                    <div className="absolute inset-y-0 right-0 w-12 sm:w-24 bg-linear-to-l from-black to-transparent pointer-events-none" />
                    <div className="absolute inset-x-0 top-0 h-12 sm:h-20 bg-linear-to-b from-black to-transparent pointer-events-none" />
                    <div className="absolute inset-x-0 bottom-0 h-12 sm:h-20 bg-linear-to-t from-black to-transparent pointer-events-none" />
                </div>
            </div>
        </section>
    );
}
