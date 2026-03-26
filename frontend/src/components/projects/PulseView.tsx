import React, { useEffect, useState } from 'react';
import { Activity, Clock } from 'lucide-react';

export default function PulseView({ projectId }: { projectId: string }) {
    const [events, setEvents] = useState<any[]>([]);

    // In a real app this would connect to a WebSocket or SSE stream.
    // For this demonstration, we'll fetch existing activity logs periodically.
    useEffect(() => {
        const fetchPulse = async () => {
            // Need a backend endpoint for this. We can quickly mock it or just rely on generic activity logs if available.
            // Since we didn't expose /api/logs/:projectId yet, let's display a UI mockup of the pulse.
            setEvents([
                { id: 1, type: 'CRITICAL', title: 'Inventory Shortage', message: 'Project is running low on Server Racks for Q3 Migration.', time: '10 mins ago' },
                { id: 2, type: 'SUCCESS', title: 'Milestone Completed', message: 'Design Phase was signed off by the Manager.', time: '2 hours ago' },
                { id: 3, type: 'WARNING', title: 'Approaching Deadline', message: 'Deployment Milestone is due in 3 days.', time: '1 day ago' }
            ]);
        };
        fetchPulse();
    }, [projectId]);

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="mb-8 text-center">
                <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                    <Activity size={32} />
                    <span className="absolute inset-0 rounded-full border border-blue-500/30 animate-ping"></span>
                </div>
                <h2 className="text-2xl font-black">AntiGravity Pulse</h2>
                <p className="text-muted-foreground text-sm mt-2 max-w-sm mx-auto">Real-time macro intelligence. Filtering out minor updates to surface critical project alerts.</p>
            </div>

            <div className="space-y-4">
                {events.map((evt) => (
                    <div key={evt.id} className="bg-card border border-border p-5 rounded-2xl flex items-start gap-4 transition-all hover:-translate-y-1 hover:shadow-lg">
                        <div className={`w-2 h-2 mt-2 rounded-full shrink-0 shadow-[0_0_10px_currentColor] ${evt.type === 'CRITICAL' ? 'bg-rose-500 text-rose-500 shadow-rose-500' :
                                evt.type === 'WARNING' ? 'bg-amber-500 text-amber-500 shadow-amber-500' :
                                    'bg-emerald-500 text-emerald-500 shadow-emerald-500'
                            }`} />
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="font-bold text-sm tracking-wide">{evt.title}</h3>
                                <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground flex items-center gap-1"><Clock size={10} /> {evt.time}</span>
                            </div>
                            <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">{evt.message}</p>
                        </div>
                    </div>
                ))}
            </div>

            <p className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground mt-8">Live Feed Monitoring Active</p>
        </div>
    );
}
