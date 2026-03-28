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
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-secondary border border-border rounded-xl flex items-center justify-center text-muted-foreground shadow-sm">
                        <Settings size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-foreground uppercase tracking-tight">Project Settings</h2>
                        <p className="text-xs text-muted-foreground opacity-80 uppercase font-black tracking-widest leading-none">Configuration and management for this workspace node.</p>
                    </div>
                </div>
            </div>

            <div className="bg-card/40 border border-border/50 rounded-2xl p-6 md:p-8 space-y-8 shadow-sm backdrop-blur-md">
                <div className="grid grid-cols-1 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                            Project Designation
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-black text-foreground uppercase tracking-tight focus:ring-1 focus:ring-primary/50 transition-all outline-none"
                            placeholder="e.g. Enterprise CRM Launch"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                            Operational Description
                        </label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={3}
                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-bold text-muted-foreground focus:ring-1 focus:ring-primary/50 transition-all outline-none resize-none"
                            placeholder="Briefly describe the project goals..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                                Deployment Status
                            </label>
                            <div className="relative">
                                <select
                                    value={status}
                                    onChange={e => setStatus(e.target.value)}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-black text-foreground uppercase tracking-widest focus:ring-1 focus:ring-primary/50 transition-all outline-none appearance-none cursor-pointer"
                                >
                                    <option value="Active">Active</option>
                                    <option value="On Hold">On Hold</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Archived">Archived</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground opacity-40">
                                    <Sliders size={14} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                                Execution Deadline
                            </label>
                            <input
                                type="date"
                                value={deadline}
                                onChange={e => setDeadline(e.target.value)}
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-black text-foreground focus:ring-1 focus:ring-primary/50 transition-all outline-none cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end pt-4 border-t border-border/30">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-foreground hover:opacity-90 text-background px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg hover:-translate-y-px active:translate-y-0 disabled:opacity-50 flex items-center gap-2"
                    >
                        <Save size={14} />
                        {saving ? 'Processing...' : 'Sync Configuration'}
                    </button>
                </div>
            </div>

            {(currentUserRole === 'admin' || currentUserRole === 'manager') && (
                <div className="pt-4">
                    <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-6 md:p-8 space-y-6 shadow-xs">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-xl flex items-center justify-center shrink-0 border border-destructive/20 shadow-sm">
                                <ShieldAlert size={24} />
                            </div>
                            <div className="space-y-1.5 pt-0.5">
                                <h3 className="text-[11px] font-black text-destructive uppercase tracking-widest">Protocol Breach: Danger Zone</h3>
                                <p className="text-[11px] text-muted-foreground leading-relaxed font-bold uppercase opacity-80 tracking-tight">
                                    Deleting this project will permanently remove all associated tasks, milestones, and shared resources from the network. This action is final and irreversible. Proceed with extreme caution.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <AnimatePresence mode="wait">
                                {!showDeleteConfirm ? (
                                    <motion.button
                                        key="delete-btn"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="bg-destructive/10 hover:bg-destructive text-destructive hover:text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border border-destructive/20 shadow-xs"
                                    >
                                        Terminate Project
                                    </motion.button>
                                ) : (
                                    <motion.div
                                        key="confirm-box"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex items-center gap-2 p-2 bg-background border border-destructive/30 rounded-xl shadow-2xl"
                                    >
                                        <span className="text-[9px] font-black text-destructive uppercase px-3 tracking-widest">Confirm Termination?</span>
                                        <button
                                            onClick={handleDelete}
                                            className="bg-destructive hover:bg-destructive/90 text-white px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all"
                                        >
                                            YES, DELETE
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="bg-secondary hover:bg-accent text-muted-foreground px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all"
                                        >
                                            CANCEL
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
