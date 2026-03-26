import React, { useState } from 'react';
import { Flag, Plus, Check, Clock, AlertTriangle } from 'lucide-react';
import { apiFetch } from '@/lib/apiFetch';

function getDueDateUrgency(dueDate: string | null, status: string) {
    if (status === 'Completed' || !dueDate) return { color: '', label: '' };
    const days = (new Date(dueDate).getTime() - Date.now()) / (1000 * 3600 * 24);
    if (days < 0) return { color: 'text-rose-500', label: 'Overdue' };
    if (days < 3) return { color: 'text-rose-400', label: `${Math.ceil(days)}d left` };
    if (days < 7) return { color: 'text-amber-500', label: `${Math.ceil(days)}d left` };
    return { color: 'text-muted-foreground', label: new Date(dueDate).toLocaleDateString() };
}

export default function MilestoneView({ projectId, milestones, refresh }: {
    projectId: string; milestones: any[]; refresh: () => void;
}) {
    const [isCreating, setIsCreating] = useState(false);
    const [name, setName] = useState('');
    const [dueDate, setDueDate] = useState('');

    const handleCreate = async () => {
        if (!name) return;
        await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/${projectId}/milestones`, {
            method: 'POST',
            body: JSON.stringify({ name, dueDate })
        });
        setIsCreating(false); setName(''); setDueDate('');
        refresh();
    };

    const updateStatus = async (id: string, status: string, progress: number) => {
        await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/${projectId}/milestones/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ status, progress })
        });
        refresh();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold">Milestone Timeline</h2>
                    <p className="text-sm text-muted-foreground">Macro-tracking — outcomes over micro-tasks.</p>
                </div>
                <button onClick={() => setIsCreating(!isCreating)} className="bg-primary text-primary-foreground px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm">
                    <Plus size={16} /> Add Milestone
                </button>
            </div>

            {isCreating && (
                <div className="bg-card border border-border p-6 rounded-2xl flex items-end gap-4 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Milestone Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50" placeholder="e.g. Design Approved" />
                    </div>
                    <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Due Date</label>
                        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 dark:scheme-dark" />
                    </div>
                    <button onClick={handleCreate} className="bg-foreground text-background px-5 py-2.5 rounded-xl font-bold">Save</button>
                    <button onClick={() => setIsCreating(false)} className="px-5 py-2.5 text-muted-foreground font-bold">Cancel</button>
                </div>
            )}

            {/* Timeline */}
            <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-border before:to-transparent">
                {milestones.length === 0 ? (
                    <div className="text-center py-16 bg-card border border-dashed border-border rounded-2xl">
                        <Flag size={32} className="text-muted-foreground mx-auto mb-3" />
                        <p className="font-bold mb-1">No milestones planned</p>
                        <p className="text-sm text-muted-foreground">Add your first milestone above to start tracking progress.</p>
                    </div>
                ) : (
                    milestones.map(m => {
                        const isCompleted = m.status === 'Completed';
                        const urgency = getDueDateUrgency(m.dueDate, m.status);

                        return (
                            <div key={m.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                {/* Node */}
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-card shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow z-10 ${isCompleted ? 'text-emerald-500' : 'text-primary'}`}>
                                    {isCompleted ? <Check size={16} /> : <Flag size={16} />}
                                </div>

                                {/* Card */}
                                <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card border rounded-2xl p-5 shadow-sm transition-all hover:shadow-md ${isCompleted ? 'border-emerald-500/20' : urgency.label === 'Overdue' ? 'border-rose-500/30' : 'border-border hover:border-primary/30'}`}>
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md ${isCompleted ? 'bg-emerald-500/10 text-emerald-500' : m.status === 'In Progress' ? 'bg-primary/10 text-primary' : 'bg-accent text-muted-foreground'}`}>{m.status}</span>
                                        {urgency.label && (
                                            <span className={`text-[10px] font-bold flex items-center gap-1 ${urgency.color}`}>
                                                {urgency.label === 'Overdue' ? <AlertTriangle size={10} /> : <Clock size={10} />}
                                                {urgency.label}
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="font-bold text-base mb-3">{m.name}</h3>

                                    <div className="space-y-1.5 mb-4">
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="text-muted-foreground">Progress</span>
                                            <span>{m.progress}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                            <div className={`h-full transition-all duration-500 rounded-full ${isCompleted ? 'bg-emerald-500' : urgency.label === 'Overdue' ? 'bg-rose-500' : 'bg-primary'}`} style={{ width: `${m.progress}%` }} />
                                        </div>
                                    </div>

                                    {!isCompleted && (
                                        <div className="flex gap-2 pt-3 border-t border-border">
                                            <button onClick={() => updateStatus(m.id, 'In Progress', 50)} className="flex-1 text-[11px] font-bold uppercase tracking-wider bg-accent text-foreground py-2 rounded-lg hover:bg-accent/80 transition-colors">In Progress</button>
                                            <button onClick={() => updateStatus(m.id, 'Completed', 100)} className="flex-1 text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 py-2 rounded-lg hover:bg-emerald-500/20 transition-colors">Complete ✓</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
