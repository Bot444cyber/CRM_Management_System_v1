"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { X, Send, Users, AlertCircle, Loader2, Search, CheckSquare, Square, User, Settings as SettingsIcon } from 'lucide-react';
import ModalPortal from './ModalPortal';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/apiFetch';

interface WhatsAppContact {
    id: string;
    name: string;
    type: 'group' | 'contact';
}

interface WhatsAppPublishModalProps {
    isOpen: boolean;
    onClose: () => void;
    productDetails: any;
}

export default function WhatsAppPublishModal({ isOpen, onClose, productDetails }: WhatsAppPublishModalProps) {
    const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'group' | 'contact'>('all');

    useEffect(() => {
        if (isOpen) {
            fetchContacts();
        } else {
            // Reset state when closed
            setSelectedIds([]);
            setError('');
            setSearchQuery('');
            setActiveTab('all');
        }
    }, [isOpen]);

    const fetchContacts = async () => {
        setIsLoading(true);
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/whatsapp/groups`);

            if (!res.ok) {
                let errMsg = 'Failed to fetch contacts';
                try {
                    const errData = await res.json();
                    if (errData.message) errMsg = errData.message;
                } catch { } // ignore JSON parse error
                throw new Error(errMsg);
            }
            const data = await res.json();
            setContacts(data || []);
        } catch (err) {
            console.error("Fetch Contacts Error:", err);
            setError('Could not load WhatsApp contacts. Check API connection.');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredContacts = useMemo(() => {
        return contacts.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesTab = activeTab === 'all' || c.type === activeTab;
            return matchesSearch && matchesTab;
        });
    }, [contacts, searchQuery, activeTab]);

    const toggleContact = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleSelectAll = () => {
        if (selectedIds.length === filteredContacts.length && filteredContacts.length > 0) {
            setSelectedIds([]); // Deselect all currently filtered
        } else {
            const allFilteredIds = filteredContacts.map(c => c.id);
            // Merge unique
            setSelectedIds(Array.from(new Set([...selectedIds, ...allFilteredIds])));
        }
    };

    const isAllSelected = filteredContacts.length > 0 && filteredContacts.every(c => selectedIds.includes(c.id));

    const handlePublish = async () => {
        if (selectedIds.length === 0) {
            setError('Please select at least one contact or group to publish to.');
            return;
        }

        setIsPublishing(true);
        setError('');

        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/whatsapp/publish`, {
                method: 'POST',
                body: JSON.stringify({
                    groupIds: selectedIds,
                    productDetails: {
                        name: productDetails.name,
                        subProductsCount: productDetails.subProducts?.length || 0,
                    },
                    imageUrl: productDetails.imageUrl
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to publish');
            }

            toast.success(`Successfully sent to ${selectedIds.length} recipients!`);
            onClose();
        } catch (err: any) {
            console.error("Publish Error:", err);
            setError(err.message || 'An error occurred while publishing.');
        } finally {
            setIsPublishing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <ModalPortal>
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
                    onClick={onClose}
                />

                {/* Modal Window */}
                <div className="relative w-full max-w-2xl max-h-[92vh] bg-card border border-border/80 rounded-[2rem] shadow-2xl flex flex-col animate-in fade-in zoom-in-[0.98] duration-300 overflow-hidden">

                    {/* Header */}
                    <div className="flex items-center justify-between p-5 bg-gradient-to-br from-green-500/10 to-transparent border-b border-border/50 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/30 ring-4 ring-green-500/10">
                                <Send size={20} className="ml-1" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-foreground tracking-tight leading-tight">Announce Product</h2>
                                <p className="text-xs font-medium text-muted-foreground mt-0.5">Broadcast new product to your network.</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-9 h-9 rounded-full bg-muted/60 hover:bg-muted focus:ring-2 focus:ring-green-500/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col gap-4 overflow-hidden flex-1">
                        {error && (
                            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in slide-in-from-top-2 shrink-0 ${error.toLowerCase().includes('configure')
                                ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-500'
                                : 'bg-destructive/10 border-destructive/20 text-destructive'
                                }`}>
                                <div className="flex items-start sm:items-center gap-3">
                                    <AlertCircle size={20} className="shrink-0 mt-0.5 sm:mt-0" />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold">{
                                            error.toLowerCase().includes('configure') ? 'Setup Required' : 'Error'
                                        }</span>
                                        <span className="text-xs font-medium opacity-90 mt-0.5">{error}</span>
                                    </div>
                                </div>
                                {error.toLowerCase().includes('configure') && (
                                    <button
                                        onClick={() => {
                                            onClose();
                                            router.push('/dashboard/settings');
                                        }}
                                        className="shrink-0 flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                                    >
                                        <SettingsIcon size={14} />
                                        Go to Settings
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Search and Filters */}
                        <div className="flex flex-col sm:flex-row gap-3 items-center shrink-0">
                            {/* Search */}
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search by name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-muted/30 border border-border/80 rounded-[1rem] pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all font-medium text-foreground placeholder:text-muted-foreground/50"
                                />
                            </div>

                            {/* Tabs */}
                            <div className="flex bg-muted/30 p-1 rounded-[1rem] border border-border/80 w-full sm:w-auto">
                                <button
                                    onClick={() => setActiveTab('all')}
                                    className={`flex-1 sm:flex-none px-4 py-1.5 rounded-[0.75rem] text-[11px] font-bold transition-all ${activeTab === 'all' ? 'bg-background shadow-sm text-foreground ring-1 ring-border' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setActiveTab('group')}
                                    className={`flex-1 sm:flex-none px-4 py-1.5 rounded-[0.75rem] text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'group' ? 'bg-background shadow-sm text-foreground ring-1 ring-border' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    <Users size={12} /> Group
                                </button>
                                <button
                                    onClick={() => setActiveTab('contact')}
                                    className={`flex-1 sm:flex-none px-4 py-1.5 rounded-[0.75rem] text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'contact' ? 'bg-background shadow-sm text-foreground ring-1 ring-border' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    <User size={12} /> Contact
                                </button>
                            </div>
                        </div>

                        {/* Contacts List Area */}
                        <div className="flex flex-col flex-1 min-h-[150px] border border-border/80 rounded-2xl overflow-hidden bg-gradient-to-b from-muted/20 to-transparent shadow-sm">
                            {/* List Header */}
                            <div className="px-4 py-2.5 bg-muted/40 border-b border-border/80 flex items-center justify-between backdrop-blur-sm shrink-0">
                                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                    <Users size={13} className="text-foreground/70" /> {filteredContacts.length} Available
                                </span>
                                <button
                                    onClick={handleSelectAll}
                                    disabled={filteredContacts.length === 0}
                                    className="text-[10px] font-black text-green-600 hover:text-green-500 flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest bg-green-500/10 hover:bg-green-500/20 px-2.5 py-1 rounded-md"
                                >
                                    {isAllSelected ? <CheckSquare size={13} /> : <Square size={13} />}
                                    {isAllSelected ? "Deselect All" : "Select All"}
                                </button>
                            </div>

                            {/* List Items */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                                {isLoading ? (
                                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                                        <Loader2 className="w-6 h-6 animate-spin mb-3 text-green-500" />
                                        <span className="text-xs font-bold tracking-wide">Fetching Contacts...</span>
                                    </div>
                                ) : filteredContacts.length > 0 ? (
                                    filteredContacts.map(contact => {
                                        const isSelected = selectedIds.includes(contact.id);
                                        const isGroup = contact.type === 'group';
                                        return (
                                            <div
                                                key={contact.id}
                                                onClick={() => toggleContact(contact.id)}
                                                className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all border ${isSelected
                                                    ? 'bg-green-500/10 border-green-500/30'
                                                    : 'border-transparent hover:bg-muted/60'
                                                    }`}
                                            >
                                                {/* Checkbox */}
                                                <div className={`w-5 h-5 rounded-[6px] flex items-center justify-center border-2 transition-all shrink-0 ${isSelected
                                                    ? 'bg-green-500 border-green-500 text-white shadow-sm shadow-green-500/40 scale-105'
                                                    : 'bg-background border-muted-foreground/30'
                                                    }`}>
                                                    {isSelected && <CheckSquare size={12} className="text-white" />}
                                                </div>

                                                {/* Icon */}
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${isGroup ? 'bg-zinc-800/10 text-zinc-800 dark:text-zinc-400 ring-1 ring-zinc-800/20' : 'bg-orange-500/10 text-orange-500 ring-1 ring-orange-500/20'}`}>
                                                    {isGroup ? <Users size={18} /> : <User size={18} />}
                                                </div>

                                                {/* Detail */}
                                                <div className="flex flex-col min-w-0 flex-1 justify-center">
                                                    <span className="text-sm font-bold text-foreground truncate leading-tight">{contact.name}</span>
                                                    <span className="text-[10px] font-extrabold text-muted-foreground/70 uppercase tracking-widest mt-0.5">{isGroup ? 'Group Chat' : 'Direct Contact'}</span>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-xs opacity-60">
                                        <Search size={32} className="mb-3 opacity-20" />
                                        <span className="font-bold text-center text-sm">No contacts match.</span>
                                        <span className="mt-1 font-medium">Try adjusting your filters.</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Selection status */}
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground shrink-0">
                            <span className="bg-muted/50 px-2.5 py-1.5 rounded-lg border border-border/50">Total Selected: <span className="text-foreground ml-1">{selectedIds.length}</span></span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-5 border-t border-border/50 bg-gradient-to-t from-muted/30 to-transparent flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-background border border-border/80 px-3 py-2.5 rounded-xl flex items-center w-full sm:w-auto shadow-sm">
                            <AlertCircle size={14} className="mr-2 text-foreground/50 shrink-0" />
                            Image & Description enclosed.
                        </div>

                        <div className="flex items-center gap-2.5 w-full sm:w-auto">
                            <button
                                onClick={onClose}
                                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted transition-all uppercase tracking-widest border border-border/80 bg-background hover:text-foreground"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePublish}
                                disabled={isPublishing || selectedIds.length === 0}
                                className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all uppercase tracking-widest
                                    ${selectedIds.length > 0
                                        ? 'bg-green-500 hover:bg-green-400 text-white shadow-lg shadow-green-500/30 ring-2 ring-green-500/40 ring-offset-1 ring-offset-background'
                                        : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                                    }
                                `}
                            >
                                {isPublishing ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                                ) : (
                                    <><Send className="w-4 h-4 ml-0.5" /> Publish Now</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </ModalPortal>
    );
}
