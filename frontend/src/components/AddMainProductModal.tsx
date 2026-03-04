"use client";

import React, { useState } from 'react';
import { X, Package, Layers, DollarSign, Box, Plus, AlertCircle } from 'lucide-react';
import ModalPortal from './ModalPortal';
import { SubProduct, MainProduct } from '@/context/InventoryContext';

interface AddMainProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (newMainProduct: MainProduct) => Promise<void>;
}

export default function AddMainProductModal({ isOpen, onClose, onSave }: AddMainProductModalProps) {
    const [name, setName] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [imageError, setImageError] = useState(false);
    const [subProducts, setSubProducts] = useState<SubProduct[]>([
        { name: '', price: '0.00', stock: 0, discount: 0, status: 'Active', imageUrl: '' }
    ]);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Main product name is required.');
            return;
        }

        const filteredSubs = subProducts.filter(sp => sp.name.trim() !== '');

        setIsSaving(true);
        await onSave({
            name: name.trim(),
            imageUrl: imageUrl.trim() || undefined,
            subProducts: filteredSubs,
        });
        setIsSaving(false);

        // Reset
        setName('');
        setImageUrl('');
        setImageError(false);
        setSubProducts([{ name: '', price: '0.00', stock: 0, discount: 0, status: 'Active', imageUrl: '' }]);
        onClose();
    };

    const updateSubProduct = (index: number, key: keyof SubProduct, val: any) => {
        const arr = [...subProducts];
        arr[index] = { ...arr[index], [key]: val };
        setSubProducts(arr);
    };

    return (
        <ModalPortal>
            <div className="fixed inset-0 z-9999 flex flex-col md:flex-row items-center justify-center md:items-stretch md:justify-end bg-black/80 backdrop-blur-md opacity-100 transition-opacity p-4 md:p-0">
                <div className="absolute inset-0" onClick={onClose} />

                <div className="relative w-full max-w-2xl md:w-[600px] bg-card border border-border md:border-y-0 md:border-r-0 md:border-l rounded-2xl md:rounded-l-2xl md:rounded-r-none flex flex-col shadow-2xl animate-in slide-in-from-bottom-10 md:slide-in-from-right-full duration-300 max-h-[90vh] md:max-h-screen">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 bg-muted/50 border-b border-border shrink-0 rounded-t-2xl md:rounded-none">
                        <h2 className="text-lg font-bold text-foreground flex items-center gap-3 tracking-wide">
                            <Package size={20} className="text-foreground" />
                            New Asset Category
                        </h2>
                        <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Scrollable Form Body */}
                    <div className="flex-1 overflow-y-auto p-6 bg-card">
                        <form id="add-product-form" onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold uppercase tracking-wider p-3 rounded-lg text-center">
                                    {error}
                                </div>
                            )}

                            {/* Base Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Category Name *</label>
                                    <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Medicines, Hardware, Produce, Software..."
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-foreground transition-all placeholder:text-muted-foreground font-bold" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        Cover Image URL <span className="text-muted-foreground/50 font-normal normal-case">(optional)</span>
                                    </label>
                                    <input type="url" value={imageUrl} onChange={(e) => { setImageUrl(e.target.value); setImageError(false); }}
                                        placeholder="https://example.com/category-image.jpg"
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-foreground/40 transition-all font-mono placeholder:text-muted-foreground/50" />
                                    <p className="text-[9px] text-muted-foreground pt-1 uppercase tracking-widest leading-relaxed">
                                        Tip: Paste a public link from services like Imgur or Cloudinary.
                                    </p>
                                </div>
                            </div>

                            {imageUrl && (
                                <div className="w-full h-32 rounded-xl border border-border overflow-hidden bg-background flex flex-col items-center justify-center relative shadow-inner">
                                    {imageError ? (
                                        <div className="flex flex-col items-center justify-center text-muted-foreground animate-in fade-in duration-300">
                                            <AlertCircle size={24} className="mb-2 text-destructive/50" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-destructive/80">Invalid Image URL</span>
                                        </div>
                                    ) : (
                                        <img
                                            src={imageUrl}
                                            alt="Preview"
                                            className="w-full h-full object-contain animate-in fade-in duration-300"
                                            onError={() => setImageError(true)}
                                            onLoad={() => setImageError(false)}
                                        />
                                    )}
                                </div>
                            )}

                            <hr className="border-border" />

                            {/* Sub Products */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                        <Layers size={12} /> Initial Items
                                    </label>
                                    <button type="button"
                                        onClick={() => setSubProducts([...subProducts, { name: '', price: '0.00', stock: 0, discount: 0, status: 'Active', imageUrl: '' }])}
                                        className="text-[10px] font-bold text-foreground hover:bg-muted transition-colors bg-muted/30 px-3 py-1.5 rounded-lg border border-border uppercase tracking-wider flex items-center gap-1.5">
                                        <Plus size={12} /> Add Item
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {subProducts.map((sub, index) => (
                                        <div key={index} className="relative bg-muted/20 border border-border p-5 rounded-2xl shadow-inner">
                                            <div className="flex items-center gap-3 mb-4">
                                                <input type="text" value={sub.name}
                                                    onChange={(e) => updateSubProduct(index, 'name', e.target.value)}
                                                    placeholder={`Item ${index + 1} Name`}
                                                    className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-foreground/40 transition-all font-bold placeholder:text-muted-foreground shadow-inner" />
                                                {subProducts.length > 1 && (
                                                    <button type="button" onClick={() => setSubProducts(subProducts.filter((_, i) => i !== index))}
                                                        className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors bg-background rounded-xl border border-border">
                                                        <X size={16} />
                                                    </button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Price</label>
                                                    <div className="relative">
                                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50"><DollarSign size={12} /></div>
                                                        <input type="text" value={sub.price} onChange={(e) => updateSubProduct(index, 'price', e.target.value)}
                                                            className="w-full bg-background border border-border rounded-lg pl-8 pr-3 py-2 text-xs text-foreground focus:outline-none focus:border-foreground/30 transition-all font-mono shadow-inner" />
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Stock</label>
                                                    <div className="relative">
                                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50"><Box size={12} /></div>
                                                        <input type="number" value={sub.stock} onChange={(e) => updateSubProduct(index, 'stock', parseInt(e.target.value) || 0)}
                                                            className="w-full bg-background border border-border rounded-lg pl-8 pr-3 py-2 text-xs text-foreground focus:outline-none focus:border-foreground/30 transition-all font-mono shadow-inner" />
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Status</label>
                                                    <select value={sub.status} onChange={(e) => updateSubProduct(index, 'status', e.target.value)}
                                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-foreground/30 transition-all cursor-pointer appearance-none shadow-inner">
                                                        <option value="Active">🟢 Active</option>
                                                        <option value="Draft">🟡 Draft</option>
                                                        <option value="Archived">⚪ Archived</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="mt-4 space-y-1.5">
                                                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Image URL <span className="text-muted-foreground/50 font-normal normal-case">(optional)</span></label>
                                                <input type="url" value={sub.imageUrl || ''} onChange={(e) => updateSubProduct(index, 'imageUrl', e.target.value)}
                                                    placeholder="https://example.com/item-image.jpg"
                                                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-xs text-foreground focus:outline-none focus:border-foreground/40 transition-all font-mono placeholder:text-muted-foreground/50 shadow-inner" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-border bg-muted/50 flex items-center justify-end gap-3 shrink-0 rounded-b-2xl md:rounded-none">
                        <button onClick={onClose}
                            className="px-6 py-3.5 rounded-xl text-sm font-bold border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all uppercase tracking-wider">
                            Cancel
                        </button>
                        <button type="submit" form="add-product-form" disabled={isSaving}
                            className="px-8 py-3.5 rounded-xl bg-foreground text-background text-sm font-extrabold flex items-center gap-2 hover:opacity-90 transition-all shadow-[0_0_20px_var(--tw-shadow-color)] shadow-foreground/20 uppercase tracking-wider disabled:opacity-60 disabled:cursor-not-allowed">
                            {isSaving ? 'Creating...' : 'Create Category'}
                        </button>
                    </div>
                </div>
            </div>
        </ModalPortal>
    );
}
