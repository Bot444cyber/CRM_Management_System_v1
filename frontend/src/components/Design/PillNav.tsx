"use client";
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Menu, X, User } from 'lucide-react';
import FlowingMenu from './FlowingMenu';

const PillNav = ({ logo, items }: { logo: string; items: any[] }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    // Check auth status
    const token = localStorage.getItem('accessToken') || localStorage.getItem('refreshToken') || document.cookie.includes('token');
    if (token) {
      setIsLoggedIn(true);
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const moveHighlight = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const { offsetLeft, offsetWidth } = e.currentTarget;
    gsap.to(highlightRef.current, {
      x: offsetLeft,
      width: offsetWidth,
      opacity: 1,
      duration: 0.4,
      ease: "power4.out",
    });
  };

  return (
    <div className={`fixed top-0 left-0 right-0 z-100 flex justify-center transition-all duration-500 ${isScrolled ? 'pt-3' : 'pt-6'}`}>
      <nav className={`
        relative z-20 flex items-center justify-between px-6 py-2 rounded-full border transition-all duration-500 w-[95%] max-w-6xl
        ${isScrolled
          ? 'bg-zinc-900/90 backdrop-blur-xl border-white/10 shadow-2xl'
          : 'bg-zinc-950 border-white/5 shadow-lg'}
      `}>

        {/* 1. Left Section: Logo (Flex-1 to take equal space) */}
        <div className="flex-1 flex items-center">
          <a href="/" className="flex items-center gap-2 group">
            <img src={logo} alt="Logo" className="w-8 h-8 rounded-full border border-white/20 group-hover:border-white group-hover:rotate-12 transition-all duration-300" />
            <span className="font-bold text-white tracking-tight text-lg group-hover:text-neutral-300 transition-colors">Nexus<span className="text-white/50">.</span></span>
          </a>
        </div>

        {/* 2. Center Section: Navigation Items (The "Centerpiece") */}
        <div className="hidden md:flex items-center justify-center relative bg-white/5 px-1 py-1 rounded-full border border-white/5">
          <div
            ref={highlightRef}
            className="absolute left-0 h-[80%] top-[10%] rounded-full bg-white opacity-0 pointer-events-none"
            style={{ zIndex: 0 }}
          />
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onMouseEnter={moveHighlight}
              onMouseLeave={() => gsap.to(highlightRef.current, { opacity: 0 })}
              className="relative z-10 px-4 py-1.5 text-[13px] font-medium text-zinc-400 hover:text-black transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* 3. Right Section: Actions */}
        <div className="flex-1 flex items-center justify-end gap-3">
          {isLoggedIn ? (
            <div className="hidden sm:flex items-center justify-center relative group cursor-pointer">
              {/* Outer Glow Effect */}
              <div className="absolute inset-0 bg-white/20 blur-md rounded-full group-hover:bg-white/40 transition-all duration-300" />

              {/* Avatar Container */}
              <div className="relative w-10 h-10 rounded-full border border-white/30 bg-black/50 backdrop-blur-sm shadow-[0_0_15px_rgba(255,255,255,0.2)] group-hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] flex items-center justify-center overflow-hidden transition-all duration-300">
                <img src="https://api.dicebear.com/7.x/notionists/svg?seed=NexusUser" alt="Account Logo" className="w-7 h-7 object-contain group-hover:scale-110 transition-transform duration-300" />
              </div>

              {/* Status Indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-black z-10 shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
            </div>
          ) : (
            <a href="/login" className="hidden sm:flex group items-center gap-2 bg-black border border-white/20 text-white text-[13px] font-bold px-5 py-2 rounded-full hover:bg-white hover:text-black hover:border-white transition-all active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
              <User size={14} className="group-hover:animate-pulse" />
              <span>Sign In</span>
            </a>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-white/70 hover:text-white p-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

      </nav>

      {/* Mobile Menu Dropdown (FlowingMenu Overlay) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-10 bg-[#060010] flex flex-col md:hidden animate-in fade-in duration-300 pt-24 pb-8">
          <div className="flex-1 min-h-0 w-full">
            <FlowingMenu
              items={items.map((item, idx) => {
                const demoImages = [
                  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=600&auto=format&fit=crop', // Home
                  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop', // Products
                  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600&auto=format&fit=crop', // Services
                  'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600&auto=format&fit=crop', // About
                  'https://images.unsplash.com/photo-1516387938699-a93567ec168e?q=80&w=600&auto=format&fit=crop'  // Contact
                ];
                return {
                  link: item.href,
                  text: item.label,
                  image: demoImages[idx % demoImages.length]
                };
              })}
              bgColor="#060010"
              textColor="#ffffff"
              marqueeBgColor="#ffffff"
              marqueeTextColor="#000000"
              borderColor="rgba(255,255,255,0.2)"
              speed={20}
            />
          </div>
          <div className="px-6 pt-6">
            {isLoggedIn ? (
              <a href="/dashboard" className="w-full flex justify-center items-center gap-3 bg-[#111] border border-white/10 text-white font-bold px-5 py-4 rounded-2xl hover:bg-[#222] transition-all text-lg shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden flex items-center justify-center">
                  <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Nexus&backgroundColor=transparent" alt="Profile" className="w-6 h-6 object-contain" />
                </div>
                My Account
              </a>
            ) : (
              <a href="/login" className="w-full flex justify-center items-center gap-2 bg-white text-black font-bold px-5 py-4 rounded-2xl hover:bg-gray-200 transition-all text-lg shadow-xl">
                <User size={18} />
                Sign In
              </a>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default PillNav;