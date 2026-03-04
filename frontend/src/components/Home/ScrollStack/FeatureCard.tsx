"use client";

import React from 'react';

interface FeatureCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    image: string | React.ReactNode;
    color: string;
    borderColor: string;
    glowColor: string;
    badge?: string;
    badgeColor?: string;
    cta?: string;
    highlights?: string[];
}

export default function FeatureCard({
    title,
    description,
    icon,
    image,
    color,
    borderColor,
    glowColor,
    badge,
    badgeColor = "text-white/60 bg-white/5 border-white/10",
    cta = "Learn More",
    highlights = [],
}: FeatureCardProps) {
    return (
        /*
         * NO transform, NO backdrop-filter, NO filter on wrappers.
         * These create CSS stacking contexts that break z-index ordering between sticky cards.
         */
        <div
            className="relative rounded-2xl sm:rounded-[2rem] bg-[#0c0c10] border border-white/[0.07] w-full overflow-hidden"
            style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.03) inset, 0 32px 80px rgba(0,0,0,0.6)' }}
        >
            {/* Gradient tint overlay */}
            <div className={`absolute inset-0 bg-linear-to-br ${color} opacity-25 pointer-events-none`} />
            {/* Ambient glow blob */}
            <div className={`absolute -top-32 -left-32 sm:-top-48 sm:-left-48 w-72 h-72 sm:w-[600px] sm:h-[600px] rounded-full ${glowColor} opacity-[0.12] blur-3xl pointer-events-none`} />

            {/* ── Main Content Layout ── */}
            {/*
             * Mobile: flex-col — text on top, image on bottom
             * Desktop lg+: flex-row — text left, image right
             * Height: auto on mobile (natural content height), fixed on desktop
             */}
            <div className="relative flex flex-col lg:flex-row lg:h-[80vh] lg:min-h-[500px] lg:max-h-[820px]">

                {/* ─────── Text Panel ─────── */}
                <div className="flex flex-col justify-center px-5 py-8 sm:px-8 sm:py-10 md:px-12 md:py-12 lg:px-14 lg:py-14 lg:w-[45%] lg:flex-none">



                    {/* Title */}
                    <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 sm:mb-5 tracking-tighter leading-[1.05]">
                        {title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm sm:text-base md:text-lg text-white/50 leading-relaxed font-light max-w-md">
                        {description}
                    </p>

                    {/* Highlights chips */}
                    {highlights.length > 0 && (
                        <div className="mt-5 sm:mt-7 flex flex-wrap gap-1.5 sm:gap-2">
                            {highlights.map((h) => (
                                <span key={h} className="px-2.5 py-1 sm:px-3 rounded-full bg-white/5 border border-white/8 text-white/55 text-[10px] sm:text-xs font-medium">
                                    {h}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* CTA */}
                    <div className="mt-6 sm:mt-8 flex items-center gap-2 text-white/80 font-semibold text-xs sm:text-sm tracking-wide hover:text-black hover:bg-white px-5 py-2.5 rounded-full transition-all duration-300 w-fit group/btn border border-transparent hover:border-white cursor-pointer">
                        <span>{cta}</span>
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </div>
                </div>

                {/* ─────── Image / Component Panel ─────── */}
                {/*
                 * Mobile: fixed height so image is always visible
                 * Desktop: flex-1 fills the remaining row space
                 */}
                <div className="relative overflow-hidden h-48 sm:h-64 md:h-80 lg:h-auto lg:flex-1">
                    {/* Left fade — only meaningful on desktop where image is to the right */}
                    <div className="hidden lg:block absolute inset-y-0 left-0 w-12 bg-linear-to-r from-[#0c0c10] to-transparent z-10 pointer-events-none" />
                    {/* Top fade on mobile so image blends into text above */}
                    <div className="lg:hidden absolute inset-x-0 top-0 h-10 bg-linear-to-b from-[#0c0c10] to-transparent z-10 pointer-events-none" />
                    {/* Bottom vignette */}
                    <div className="absolute inset-x-0 bottom-0 h-16 sm:h-20 bg-linear-to-t from-[#0c0c10]/80 to-transparent z-10 pointer-events-none" />

                    {typeof image === 'string' ? (
                        <img
                            src={image}
                            alt={title}
                            className="absolute inset-0 w-full h-full object-cover object-center"
                        />
                    ) : (
                        <div className="absolute inset-0">
                            {image}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
