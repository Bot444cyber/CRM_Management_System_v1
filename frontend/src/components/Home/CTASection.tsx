'use client';

import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CTASection() {
    return (
        <section className="bg-black text-white py-24 md:py-32 flex flex-col items-center justify-center text-center px-4 overflow-hidden">


            {/* Main Heading */}
            <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-5xl md:text-7xl lg:text-8xl font-bold max-w-4xl tracking-tight mb-6"
            >
                Let&apos;s talk about<br className="hidden md:block" /> your next big move
            </motion.h2>

            {/* Subtitle */}
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                className="text-neutral-400 text-lg md:text-xl max-w-2xl mb-12"
            >
                Hop on a call with us to see how our <br className="hidden md:block" />services can accelerate your growth.
            </motion.p>

            {/* CTA Button */}
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
            >
                <Link href="/contact" className="group flex items-center gap-2 bg-black border border-neutral-700 hover:bg-white hover:text-black hover:border-white transition-all duration-300 rounded-full px-8 py-4 text-lg font-medium">
                    Message Now
                    <ArrowUpRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                </Link>
            </motion.div>

            {/* Helper text */}
            <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-neutral-500 text-sm mt-4 font-medium tracking-wide"
            >
                Its Free
            </motion.p>
        </section>
    );
}
