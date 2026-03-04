import React from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import { Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import Lightning from '@/components/Design/Lightning';

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-white/30 relative overflow-hidden flex flex-col">
            {/* Ambient Background Effect */}
            <div className="absolute inset-0 pointer-events-none z-0 opacity-40 pt-20">
                <Lightning hue={220} speed={1} intensity={1} size={1} />
            </div>

            <Header />

            <div className="mt-20 flex-1 relative z-10 flex flex-col justify-center py-12 px-6 sm:px-8 md:px-12 max-w-7xl mx-auto w-full">
                <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">

                    {/* Left Column: Heading & Info */}
                    <div className="lg:w-1/2 flex flex-col justify-center">
                        <div className="mb-12">
                            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tighter mb-6">
                                Let&apos;s build <br className="hidden sm:block" />
                                <span className="text-white/40">something great.</span>
                            </h1>
                            <p className="text-lg text-neutral-400 max-w-md leading-relaxed">
                                Whether you have a question about features, pricing, need a demo, or anything else, our team is ready to answer all your questions.
                            </p>
                        </div>

                        <div className="space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-full bg-white/5 border border-white/10 shrink-0">
                                    <Mail className="w-6 h-6 text-white/70" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-white mb-1">Chat to sales</h3>
                                    <p className="text-neutral-400 mb-2">Speak to our friendly team.</p>
                                    <a href="mailto:hello@example.com" className="text-white font-medium hover:underline transition-all">hello@example.com</a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-full bg-white/5 border border-white/10 shrink-0">
                                    <MapPin className="w-6 h-6 text-white/70" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-white mb-1">Visit us</h3>
                                    <p className="text-neutral-400 mb-2">Visit our office HQ.</p>
                                    <span className="text-white font-medium">100 Smith Street<br />Collingwood VIC 3066 AU</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-full bg-white/5 border border-white/10 shrink-0">
                                    <Phone className="w-6 h-6 text-white/70" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-white mb-1">Call us</h3>
                                    <p className="text-neutral-400 mb-2">Mon-Fri from 8am to 5pm.</p>
                                    <a href="tel:+1(555)000-0000" className="text-white font-medium hover:underline transition-all">+1 (555) 000-0000</a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Interactive Form */}
                    <div className="lg:w-1/2 relative">
                        {/* Glow effect */}
                        <div className="absolute -inset-4 bg-white/5 rounded-[2.5rem] blur-2xl pointer-events-none" />

                        <div className="relative bg-[#0c0c10] border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl">
                            <h2 className="text-2xl font-bold mb-8">Send us a message</h2>
                            <form className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="firstName" className="text-sm font-medium text-neutral-400">First name</label>
                                        <input type="text" id="firstName" className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/50 transition-colors" placeholder="First name" required />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="lastName" className="text-sm font-medium text-neutral-400">Last name</label>
                                        <input type="text" id="lastName" className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/50 transition-colors" placeholder="Last name" required />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium text-neutral-400">Email</label>
                                    <input type="email" id="email" className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/50 transition-colors" placeholder="you@company.com" required />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-sm font-medium text-neutral-400">Message</label>
                                    <textarea id="message" rows={4} className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/50 transition-colors resize-none" placeholder="Leave us a message..." required></textarea>
                                </div>

                                <button type="submit" className="w-full bg-white text-black hover:bg-neutral-200 font-semibold rounded-xl px-6 py-4 transition-colors flex items-center justify-center gap-2 group">
                                    Send message
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </form>
                        </div>
                    </div>

                </div>
            </div>

            <div className="relative z-10">
                <Footer />
            </div>
        </main>
    );
}
