"use client";

import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock, Calendar, CheckCircle2, MoreVertical, Timer, Activity, TrendingUp, Zap, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TimeTrackerPage() {
    const [isRunning, setIsRunning] = useState(false);
    const [time, setTime] = useState(0);

    useEffect(() => {
        let interval: any;
        if (isRunning) {
            interval = setInterval(() => {
                setTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning]);

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="h-full bg-background/50 flex flex-col p-6 md:p-10 space-y-10 overflow-y-auto custom-scrollbar">

            {/* Mission Control Timer */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-12 relative overflow-hidden group shadow-2xl transition-all hover:bg-black/60">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl pointer-events-none group-hover:bg-primary/10 transition-all duration-700" />

                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                    <Timer size={24} className="text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black uppercase tracking-tight italic">Mission Stopwatch</h2>
                                    <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest mt-1">Operational Time Tracking</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                <Activity size={12} className="text-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">{isRunning ? 'Active Sync' : 'Paused'}</span>
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center py-10">
                            <motion.h1
                                className="text-8xl md:text-9xl font-black tracking-tighter text-foreground tabular-nums drop-shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.2)]"
                                animate={isRunning ? { scale: [1, 1.02, 1] } : {}}
                                transition={{ repeat: Infinity, duration: 1 }}
                            >
                                {formatTime(time)}
                            </motion.h1>

                            <div className="flex items-center gap-6 mt-12">
                                <button
                                    onClick={() => setIsRunning(!isRunning)}
                                    className={`
                                        w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-2xl hover:scale-110 active:scale-90
                                        ${isRunning ? 'bg-rose-500 text-white shadow-rose-500/20' : 'bg-primary text-primary-foreground shadow-primary/20'}
                                    `}
                                >
                                    {isRunning ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
                                </button>
                                <button
                                    onClick={() => { setTime(0); setIsRunning(false); }}
                                    className="w-16 h-16 rounded-full bg-white/5 border border-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all flex items-center justify-center hover:scale-110 active:scale-95"
                                >
                                    <RotateCcw size={24} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Active Assignment Section */}
                    <div className="p-1">
                        <div className="flex items-center justify-between mb-6 px-4">
                            <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-3">
                                <Target size={16} className="text-primary" />
                                Active Assignment
                            </h3>
                            <button className="text-[9px] font-black text-primary uppercase tracking-[0.2em] hover:opacity-60 transition-all italic underline decoration-2 underline-offset-4">Change Target</button>
                        </div>
                        <div className="bg-black/20 backdrop-blur-3xl border border-white/5 rounded-3xl p-6 flex items-center justify-between group hover:border-primary/20 transition-all">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center font-black text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">NC</div>
                                <div>
                                    <h4 className="text-sm font-black uppercase italic tracking-tight mb-1">Nexus Core V3 Synchronization</h4>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">Project: Cybernetics HQ</span>
                                        <div className="w-1 h-1 rounded-full bg-primary/20" />
                                        <span className="text-[9px] font-black text-primary uppercase tracking-widest italic">Phase 04</span>
                                    </div>
                                </div>
                            </div>
                            <button className="p-3 text-muted-foreground/30 hover:text-primary transition-colors">
                                <MoreVertical size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar: Performance & History */}
                <div className="space-y-10">
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-3 mb-6 px-4 font-mono">
                            <TrendingUp size={16} className="text-emerald-500" />
                            Efficiency Matrix
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <StatCard label="WEEKLY VELOCITY" value="42.8h" icon={<Clock size={12} />} color="text-primary" />
                            <StatCard label="PROJECT SYNC" value="94%" icon={<Zap size={12} />} color="text-emerald-500" />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-3 mb-6 px-4">
                            <Calendar size={16} className="text-muted-foreground/40" />
                            Mission Log
                        </h3>
                        <div className="space-y-3">
                            <LogItem title="Core Optimization" project="HQ" time="04:15:00" date="Today" />
                            <LogItem title="Resource Relay" project="Nexus" time="02:30:12" date="Yesterday" />
                            <LogItem title="Security Audit" project="HQ" time="01:45:00" date="24 Mar" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, color }: { label: string, value: string, icon: React.ReactNode, color: string }) {
    return (
        <div className="bg-black/20 backdrop-blur-3xl border border-white/5 rounded-3xl p-6 transition-all hover:bg-black/40">
            <div className={`p-2 w-fit rounded-lg bg-white/5 mb-4 ${color}`}>
                {icon}
            </div>
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 mb-1">{label}</p>
            <h4 className={`text-2xl font-black tracking-tight ${color}`}>{value}</h4>
        </div>
    );
}

function LogItem({ title, project, time, date }: { title: string, project: string, time: string, date: string }) {
    return (
        <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/5 transition-all group cursor-pointer">
            <div className="flex items-center gap-4">
                <CheckCircle2 size={14} className="text-emerald-500/40 group-hover:text-emerald-500 transition-colors" />
                <div>
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-foreground/80">{title}</h5>
                    <p className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-[0.15em]">{project} • {date}</p>
                </div>
            </div>
            <span className="text-[9px] font-black font-mono text-muted-foreground opacity-40 group-hover:opacity-100 transition-opacity">{time}</span>
        </div>
    );
}
