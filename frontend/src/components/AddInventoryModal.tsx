"use client";

import React, { useState } from 'react';
import { X, Package, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MainProduct } from '@/context/InventoryContext';
import ModalPortal from './ModalPortal';

export interface InventoryData {
    id: string;
    name: string;
    imageUrl?: string;
    mainProducts: MainProduct[];
}

interface AddInventoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (inventory: InventoryData) => void;
}

export default function AddInventoryModal({ isOpen, onClose, onAdd }: AddInventoryModalProps) {
    const [name, setName] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [imageError, setImageError] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Inventory Name is required');
            return;
        }

        onAdd({
            id: Date.now().toString(),
            name: name.trim(),
            imageUrl: imageUrl.trim() || undefined,
            mainProducts: [],
        });

        setName('');
        setImageUrl('');
        setImageError(false);
        onClose();
    };

    return (
        <ModalPortal>
            <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose} />
                <div className="relative bg-card border border-border rounded-2xl w-full max-w-sm shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between p-6 border-b border-border bg-muted/50">
                        <h2 className="text-lg font-bold text-foreground flex items-center gap-3 tracking-wide">
                            <Package size={18} className="text-foreground" />
                            New Asset Container
                        </h2>
                        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-card">
                        {error && (
                            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold uppercase tracking-wider p-3 rounded-lg text-center">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 text-center">
                                Container Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Medical Supplies, Servers, Fresh Produce..."
                                className="w-full bg-background border border-border rounded-xl px-4 py-4 text-sm text-foreground focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground transition-all placeholder:text-muted-foreground text-center font-bold tracking-wide"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                                Asset Image URL <span className="text-muted-foreground/50 font-normal normal-case tracking-normal">(optional)</span>
                            </label>
                            <input
                                type="url"
                                value={imageUrl}
                                onChange={(e) => { setImageUrl(e.target.value); setImageError(false); }}
                                placeholder="https://example.com/asset-preview.jpg"
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/20 transition-all placeholder:text-muted-foreground/50 font-mono"
                            />
                            <p className="text-[9px] text-muted-foreground mt-2 text-center uppercase tracking-widest leading-relaxed">
                                Tip: Paste a public link from services like Imgur, Cloudinary, etc.
                            </p>

                            {imageUrl && (
                                <div className="mt-3 w-full h-28 rounded-xl border border-border overflow-hidden bg-background flex flex-col items-center justify-center relative shadow-inner">
                                    {imageError ? (
                                        <div className="flex flex-col items-center justify-center text-muted-foreground animate-in fade-in duration-300">
                                            <AlertCircle size={24} className="mb-2 text-destructive/50" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-destructive/80">Invalid Image URL</span>
                                        </div>
                                    ) : (
                                        <img
                                            src={imageUrl}
                                            alt="Inventory preview"
                                            className="w-full h-full object-contain animate-in fade-in duration-300"
                                            onError={() => setImageError(true)}
                                            onLoad={() => setImageError(false)}
                                        />
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="pt-1 flex justify-end gap-3">
                            <button
                                type="submit"
                                className="w-full py-3.5 bg-foreground text-background rounded-xl text-sm font-extrabold hover:opacity-90 transition-all uppercase tracking-widest"
                            >
                                Create Container
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </ModalPortal>
    );
}
