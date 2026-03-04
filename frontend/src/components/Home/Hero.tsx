"use client";
import { motion } from 'motion/react';
import ImageTrail from './ImageTrail';
import ElectricBorder from '../Design/ElectricBorder';
import InfiniteSlider from '../Design/InfiniteSlider';

export default function Hero() {
  const images = [
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?q=80&w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1509343256512-d77a5cb3791b?q=80&w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=300&auto=format&fit=crop',
  ];

  const brands = [
    {
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />,
      name: 'Bolt',
    },
    {
      icon: <><circle cx="12" cy="12" r="3" fill="currentColor" className="text-white/40" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>,
      name: 'Global',
    },
    {
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />,
      name: 'Block',
    },
    {
      icon: <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
      name: 'Layers',
    },
    {
      icon: <><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></>,
      name: 'Media',
    },
    {
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />,
      name: 'Archive',
    },
  ];

  return (
    <section className="relative w-full min-h-screen bg-black text-white overflow-hidden flex flex-col items-center justify-center pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-4 sm:pb-8">
      {/* Background Image Trail */}
      <div className="absolute inset-0 z-0 opacity-30">
        <ImageTrail items={images} variant={1} />
      </div>

      {/* Content Container */}
      <div className="relative z-10 text-center px-5 sm:px-6 max-w-6xl mx-auto pointer-events-none w-full">

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="text-4xl sm:text-6xl md:text-8xl lg:text-[100px] font-bold tracking-tighter mb-6 sm:mb-8 md:mb-10 bg-clip-text text-transparent bg-linear-to-b from-white via-white to-white/30 leading-[0.95] py-2"
        >
          Everything Your Business{' '}
          <br className="hidden sm:block" />
          Needs to Grow
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/50 max-w-2xl mx-auto mb-8 sm:mb-10 md:mb-14 font-light leading-relaxed tracking-tight"
        >
          From beautiful websites to smart dashboards and lead management.
          Run your entire operation from one simple, powerful platform.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 justify-center pointer-events-auto items-center"
        >
          <ElectricBorder
            color="#ffffff"
            speed={2}
            chaos={0.12}
            borderRadius={9999}
            className="w-full sm:w-auto"
          >
            <button className="w-full sm:w-auto px-7 sm:px-10 py-4 sm:py-5 bg-white text-black rounded-full font-bold text-sm hover:bg-gray-200 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              Get Started — It&apos;s Free
            </button>
          </ElectricBorder>

          <button className="w-full sm:w-auto px-7 sm:px-10 py-4 sm:py-5 border border-white/10 bg-white/5 text-white rounded-full font-bold text-sm hover:bg-white hover:text-black hover:border-white transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-3 group">
            <span>Watch Demo</span>
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </motion.div>

        {/* Social proof micro-badges */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
          className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 pointer-events-auto"
        >
          {[
            { icon: '★', text: '4.9/5 on G2' },
            { icon: '✓', text: 'No credit card required' },
            { icon: '🔒', text: 'SOC 2 Compliant' },
          ].map((b) => (
            <span key={b.text} className="flex items-center gap-1.5 text-white/35 text-[11px] sm:text-xs font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/40 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white/60"></span>
              </span>
              {b.text}
            </span>
          ))}
        </motion.div>

        {/* Trusted by — Infinite Slider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-16 sm:mt-20 md:mt-28 pt-8 sm:pt-10 md:pt-12 border-t border-white/5 flex flex-col items-center gap-5 sm:gap-8 w-full"
        >
          <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">
            Trusted by industry leaders
          </p>
          <div className="w-full opacity-40 hover:opacity-100 transition-opacity duration-500">
            <InfiniteSlider speed={35} direction="right" gap={40}>
              {brands.map((brand) => (
                <div key={brand.name} className="flex items-center gap-2 sm:gap-3 text-lg sm:text-2xl font-bold text-white shrink-0">
                  <svg className="w-5 h-5 sm:w-8 sm:h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    {brand.icon}
                  </svg>
                  {brand.name}
                </div>
              ))}
            </InfiniteSlider>
          </div>
        </motion.div>
      </div>

      {/* Gradients */}
      <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-black/60 pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none z-0" />
    </section>
  );
}