import React, { useState } from 'react';
import { Box, Check, X, Clock } from 'lucide-react';
import { apiFetch } from '@/lib/apiFetch';

export default function ResourceView({ projectId, requests, refresh }: { projectId: string, requests: any[], refresh: () => void }) {

    const handleAction = async (requestId: string, status: string) => {
        await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pms/${projectId}/resource-requests/${requestId}/approve`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
        refresh();
    };

    return (
        <div className="space-y-8">
            <div className="mb-6">
                <h2 className="text-xl font-bold">Smart Permissions Queue</h2>
                <p className="text-muted-foreground text-sm flex items-center gap-2">1-Click Manager Approvals for Resource Delegation</p>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-accent/50 text-xs uppercase tracking-wider text-muted-foreground">
                        <tr>
                            <th className="px-6 py-4 font-bold">Resource / Sub-Product</th>
                            <th className="px-6 py-4 font-bold">Requested Quantity</th>
                            <th className="px-6 py-4 font-bold">Requested By</th>
                            <th className="px-6 py-4 font-bold">Status</th>
                            <th className="px-6 py-4 font-bold text-right">Manager Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {requests.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                    No pending resource requests.
                                </td>
                            </tr>
                        ) : (
                            requests.map((r) => (
                                <tr key={r.id} className="hover:bg-accent/30 transition-colors">
                                    <td className="px-6 py-4 font-bold flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
                                            <Box size={14} className="text-muted-foreground" />
                                        </div>
                                        {r.subProductName}
                                    </td>
                                    <td className="px-6 py-4 font-black text-lg">{r.requestedQuantity}</td>
                                    <td className="px-6 py-4 text-muted-foreground">User #{r.requestedByUserId}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-md tracking-wider ${r.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500' :
                                            r.status === 'Denied' ? 'bg-rose-500/10 text-rose-500' :
                                                'bg-amber-500/10 text-amber-500'
                                            }`}>
                                            {r.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {r.status === 'Pending' ? (
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleAction(r.id, 'Approved')} className="w-8 h-8 flex items-center justify-center bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-colors" title="Approve">
                                                    <Check size={16} />
                                                </button>
                                                <button onClick={() => handleAction(r.id, 'Denied')} className="w-8 h-8 flex items-center justify-center bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-colors" title="Deny">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground flex items-center justify-end gap-1">
                                                <Clock size={12} /> {new Date(r.processedAt).toLocaleDateString()}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
