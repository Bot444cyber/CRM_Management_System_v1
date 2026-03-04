"use client";

import React, { useRef, useEffect, useState } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

interface InfiniteSliderProps {
    children: React.ReactNode;
    speed?: number;
    direction?: 'left' | 'right';
    className?: string;
    gap?: number;
}

export default function InfiniteSlider({
    children,
    speed = 50,
    direction = 'left',
    className = '',
    gap = 48,
}: InfiniteSliderProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollerRef = useRef<HTMLDivElement>(null);
    const [contentWidth, setContentWidth] = useState(0);
    const controls = useAnimation();
    const isInView = useInView(containerRef, { once: false, amount: 0.1 });

    useEffect(() => {
        if (scrollerRef.current) {
            setContentWidth(scrollerRef.current.scrollWidth / 2); // Half because we duplicate the content
        }
    }, [children, gap]);

    useEffect(() => {
        if (contentWidth > 0 && isInView) {
            const duration = contentWidth / speed;

            controls.start({
                x: direction === 'left' ? [-contentWidth, 0] : [0, -contentWidth],
                transition: {
                    duration: duration,
                    ease: 'linear',
                    repeat: Infinity,
                },
            });
        } else {
            controls.stop();
        }
    }, [contentWidth, speed, direction, controls, isInView]);

    return (
        <div
            ref={containerRef}
            className={`relative w-full overflow-hidden flex items-center ${className}`}
            style={{
                maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
            }}
        >
            <motion.div
                ref={scrollerRef}
                animate={controls}
                className="flex w-max"
                style={{ gap: `${gap}px` }}
            >
                {/* Render children twice to create the infinite effect */}
                {children}
                {children}
            </motion.div>
        </div>
    );
}
