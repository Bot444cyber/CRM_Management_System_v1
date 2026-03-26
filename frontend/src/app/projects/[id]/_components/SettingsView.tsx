"use client";

import React, { useState } from 'react';
import { Settings, Trash2, Save, AlertTriangle, ShieldAlert, CheckCircle2, Sliders, Info, Calendar, Layout, Globe, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/apiFetch';

export default function SettingsView({ projectId, project, currentUserRole, refresh }: {
    projectId: string;
    project: any;
    currentUserRole: string;
    refresh: () => void;
}) {
    const router = useRouter();
    const [name, setName] = useState(project.name);
    const [description, setDescription] = useState(project.description);
    const [status, setStatus] = useState(project.status);
    const [deadline, setDeadline] = useState(project.deadline ? project.deadline.split('T')[0] : '');
    const [saving, setSaving] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/${projectId}`, {
                method: 'PUT',
                body: JSON.stringify({ name, description, status, deadline })
            });
            if (res.ok) {
                toast.success('Project settings updated');
                refresh();
            } else {
                toast.error('Failed to update project');
            }
        } catch (e) {
            console.error(e);
            toast.error('An error occurred');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/${projectId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                toast.success('Project deleted');
                router.push('/projects');
            } else {
                toast.error('Failed to delete project');
            }
        } catch (e) {
            console.error(e);
            toast.error('Deletion failed');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto space-y-12 pb-32 px-4"
        >
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-bold tracking-tight mb-1">Project Settings</h2>
                    <p className="text-xs text-muted-foreground font-medium flex items-center gap-2 opacity-70">
                        <Sliders size={12} className="text-primary" /> Update project details, status, and timeline.
                    </p>
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20">
                    <Settings size={18} className="animate-[spin_4s_linear_infinite]" />
                </div>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-2xl p-8 shadow-xl relative overflow-hidden">
                <div className="grid grid-cols-1 gap-8 relative z-10">
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40 ml-1 flex items-center gap-2">
                            <Info size={10} className="text-primary/40" /> Project Name
                        </label>
                        <div className="relative group/input">
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold tracking-tight focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                                placeholder="e.g. Website Redesign"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40 ml-1 flex items-center gap-2">
                            <Layout size={10} className="text-primary/40" /> Description
                        </label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={3}
                            className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-xs font-medium leading-relaxed focus:ring-2 focus:ring-primary/10 transition-all outline-none resize-none"
                            placeholder="Enter project description..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40 ml-1 flex items-center gap-2">
                                <Globe size={10} className="text-primary/40" /> Status
                            </label>
                            <div className="relative">
                                <select
                                    value={status}
                                    onChange={e => setStatus(e.target.value)}
                                    className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider focus:ring-2 focus:ring-primary/10 transition-all outline-none appearance-none cursor-pointer"
                                >
                                    <option value="Active" className="bg-background text-foreground">Active</option>
                                    <option value="On Hold" className="bg-background text-foreground">Hold</option>
                                    <option value="Completed" className="bg-background text-foreground">Completed</option>
                                    <option value="Archived" className="bg-background text-foreground">Archived</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40 ml-1 flex items-center gap-2">
                                <Calendar size={10} className="text-primary/40" /> Deadline
                            </label>
                            <input
                                type="date"
                                value={deadline}
                                onChange={e => setDeadline(e.target.value)}
                                className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-primary/10 transition-all outline-none cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end pt-8 relative z-10">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold uppercase tracking-wider text-[10px] shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50"
                    >
                        <Save size={14} /> {saving ? 'Saving...' : 'Save Settings'}
                    </motion.button>
                </div>
            </div>

            {(currentUserRole === 'admin' || currentUserRole === 'manager') && (
                <div className="pt-8">
                    <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-8 relative overflow-hidden group/danger">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative z-10">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center shrink-0 border border-rose-500/20 shadow-lg shadow-rose-500/5">
                                    <ShieldAlert size={24} />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-lg font-bold text-rose-500 tracking-tight uppercase">Danger Zone</h3>
                                    <p className="text-[11px] text-rose-500/60 font-medium leading-relaxed max-w-sm">
                                        Deleting a project is permanent. All associated data, milestones, and member links will be removed.
                                    </p>
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                {!showDeleteConfirm ? (
                                    <motion.button
                                        key="delete-btn"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="w-full lg:w-auto bg-rose-500/10 text-rose-500 px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-[10px] hover:bg-rose-500 hover:text-white transition-all border border-rose-500/10 shadow-lg"
                                    >
                                        Delete Project
                                    </motion.button>
                                ) : (
                                    <motion.div
                                        key="confirm-box"
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex flex-col sm:flex-row items-center gap-3 bg-black/40 p-3 rounded-2xl border border-rose-500/20"
                                    >
                                        <div className="flex items-center gap-2 text-rose-500 text-[10px] font-bold uppercase tracking-wider px-3">
                                            Confirm Deletion?
                                        </div>
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            <button
                                                onClick={handleDelete}
                                                className="flex-1 sm:flex-none bg-rose-500 text-white px-5 py-2.5 rounded-lg font-bold uppercase tracking-wider text-[10px] hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20"
                                            >
                                                DELETE
                                            </button>
                                            <button
                                                onClick={() => setShowDeleteConfirm(false)}
                                                className="flex-1 sm:flex-none bg-white/5 text-foreground px-5 py-2.5 rounded-lg font-bold uppercase tracking-wider text-[10px] hover:bg-white/10 transition-colors border border-white/5"
                                            >
                                                CANCEL
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
