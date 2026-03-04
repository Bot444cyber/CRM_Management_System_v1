import React, { useState, useEffect } from 'react';
import { X, Save, Tag, DollarSign, Box, Percent, Wand2, Loader2, Camera as CameraIcon, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import ModalPortal from './ModalPortal';
import CameraScannerModal from './CameraScannerModal';

export interface ProductDetails {
    id: string;
    subProductIndex: number;
    mainProductIndex: number;
    name: string;
    parentInventoryName: string;
    parentMainProduct: string;
    price: string;
    stock: number;
    discount: number;
    status: 'Active' | 'Draft' | 'Archived';
    imageUrl?: string;
    additionalImages?: string[];
}

interface ProductDetailsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    product: ProductDetails | null;
    onSave: (updated: ProductDetails) => Promise<void>;
}

const ProductDetailsPanel = ({ isOpen, onClose, product, onSave }: ProductDetailsPanelProps) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [status, setStatus] = useState<'Active' | 'Draft' | 'Archived'>('Active');
    const [imageUrlValue, setImageUrlValue] = useState('');
    const [additionalImages, setAdditionalImages] = useState<string[]>([]);
    const [description, setDescription] = useState('');
    const [isExtracting, setIsExtracting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (product) {
            setName(product.name);
            setPrice(product.price);
            setStock(product.stock);
            setDiscount(product.discount);
            setStatus(product.status);
            setImageUrlValue(product.imageUrl || '');
            setAdditionalImages(product.additionalImages || []);
            setDescription(''); // Reset description for new product
        }
    }, [product]);

    if (!product) return null;

    const handleSave = async () => {
        if (!name.trim()) {
            alert("Sub-product name is required.");
            return;
        }
        setIsSaving(true);
        await onSave({
            ...product,
            name,
            price,
            stock,
            discount,
            status,
            imageUrl: imageUrlValue || undefined,
            additionalImages: additionalImages.filter(url => url.trim() !== ''),
        });
        setIsSaving(false);
        onClose();
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset file input so same file can be selected again
        e.target.value = '';

        setIsExtracting(true);
        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64String = reader.result as string;
                const matches = base64String.match(/^data:(.+);base64,(.+)$/);
                if (!matches) throw new Error('Invalid base64 string');

                const mimeType = matches[1];
                const imageBase64 = matches[2];

                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/ai/extract-product`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ imageBase64, mimeType }),
                });

                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error || 'Failed to extract product details');
                }

                const data = await res.json();

                if (data.name) setName(data.name);
                if (data.price) setPrice(String(data.price));
                if (data.stock !== undefined) setStock(Number(data.stock));
                if (data.discount !== undefined) setDiscount(Number(data.discount));
                if (data.description) setDescription(data.description);
            };
            reader.onerror = () => {
                throw new Error("Failed to read file");
            };
        } catch (error) {
            console.error("Extraction error:", error);
            alert("Error extracting product details: " + (error instanceof Error ? error.message : String(error)));
        } finally {
            setIsExtracting(false);
        }
    };

    const handleCameraCapture = async (imageBase64: string, mimeType: string) => {
        setIsExtracting(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/ai/extract-product`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64, mimeType }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to extract product details');
            }

            const data = await res.json();

            if (data.name) setName(data.name);
            if (data.price) setPrice(String(data.price));
            if (data.stock !== undefined) setStock(Number(data.stock));
            if (data.discount !== undefined) setDiscount(Number(data.discount));
            if (data.description) setDescription(data.description);
        } catch (error) {
            console.error("Extraction error:", error);
            alert("Error extracting product details: " + (error instanceof Error ? error.message : String(error)));
        } finally {
            setIsExtracting(false);
        }
    };

    return (
        <ModalPortal>
            <>
                {/* Backdrop */}
                <div
                    className={cn(
                        "fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-500",
                        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    )}
                    onClick={onClose}
                />

                {/* Slide-out Panel */}
                <div
                    className={cn(
                        "fixed top-0 right-0 bottom-0 w-full md:w-[450px] bg-card border-l border-border z-50 shadow-2xl transition-transform duration-500 ease-in-out flex flex-col",
                        isOpen ? "translate-x-0" : "translate-x-full"
                    )}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-muted/30">
                        <div>
                            <h2 className="text-lg font-bold text-foreground tracking-wide">Edit Detail</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] uppercase tracking-widest text-background font-bold bg-foreground px-2 py-0.5 rounded">
                                    {product.parentInventoryName}
                                </span>
                                <span className="text-muted-foreground/50 text-xs">/</span>
                                <span className="text-xs text-muted-foreground truncate max-w-[150px]">{product.parentMainProduct}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                            <button
                                onClick={() => setIsCameraOpen(true)}
                                disabled={isExtracting}
                                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all disabled:opacity-50"
                                title="Scan with Camera"
                            >
                                {isExtracting ? <Loader2 size={14} className="animate-spin" /> : <CameraIcon size={14} />}
                                {isExtracting ? 'Analyzing...' : 'Scan'}
                            </button>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isExtracting}
                                className="px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 border border-indigo-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all disabled:opacity-50"
                                title="Upload Image"
                            >
                                {isExtracting ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
                                {isExtracting ? 'Analyzing...' : 'Upload'}
                            </button>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    <CameraScannerModal
                        isOpen={isCameraOpen}
                        onClose={() => setIsCameraOpen(false)}
                        onCapture={handleCameraCapture}
                    />

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-5">

                        {/* Image URL + Live Preview */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                Product Image URL <span className="text-muted-foreground/50 normal-case font-normal tracking-normal">(paste direct image link)</span>
                            </label>
                            <input
                                type="url"
                                value={imageUrlValue}
                                onChange={(e) => setImageUrlValue(e.target.value)}
                                placeholder="https://cdn.yourstore.com/product.jpg"
                                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-foreground/50 focus:ring-1 focus:ring-foreground/30 transition-all font-mono shadow-inner placeholder:text-muted-foreground/50"
                            />
                            {/* Live preview box */}
                            <div className="w-full h-44 rounded-2xl border border-border overflow-hidden bg-background flex items-center justify-center">
                                {imageUrlValue ? (
                                    <img
                                        key={imageUrlValue}
                                        src={imageUrlValue}
                                        alt="Product preview"
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                            const el = (e.target as HTMLImageElement).parentElement;
                                            if (el) el.innerHTML = '<span class="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Could not load image</span>';
                                        }}
                                    />
                                ) : (
                                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Image Preview</span>
                                )}
                            </div>
                        </div>

                        {/* Additional Images Section */}
                        <div className="space-y-3 pt-4 border-t border-border">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-between">
                                <span>Additional Showcase Images</span>
                                <span className="text-muted-foreground/50 lowercase tracking-normal font-normal">Max 4</span>
                            </label>

                            <div className="grid grid-cols-2 gap-3">
                                {[0, 1, 2, 3].map((index) => (
                                    <div key={index} className="space-y-1.5 relative group">
                                        <input
                                            type="url"
                                            value={additionalImages[index] || ''}
                                            onChange={(e) => {
                                                const newImages = [...additionalImages];
                                                newImages[index] = e.target.value;
                                                setAdditionalImages(newImages);
                                            }}
                                            placeholder={`Image ${index + 1} URL`}
                                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-foreground/40 font-mono"
                                        />
                                        {additionalImages[index] && (
                                            <div className="w-full h-20 rounded-lg border border-border overflow-hidden bg-background">
                                                <img
                                                    src={additionalImages[index]}
                                                    alt={`Preview ${index}`}
                                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-5">
                            {/* Basic Info Section */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border pb-2">Basic Information</h3>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sub-Product Name</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50">
                                            <Tag size={14} />
                                        </div>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-foreground/50 focus:ring-1 focus:ring-foreground/50 transition-all font-medium shadow-inner"
                                        />
                                    </div>
                                </div>

                                {/* Segmented Control for Status */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Availability Status</label>
                                    <div className="flex bg-background border border-border rounded-xl p-1 shadow-inner relative">
                                        {(['Active', 'Draft', 'Archived'] as const).map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => setStatus(s)}
                                                className={cn(
                                                    "flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5",
                                                    status === s ? "bg-foreground text-background shadow-md border border-border" : "text-muted-foreground hover:text-foreground"
                                                )}
                                            >
                                                <span className={cn(
                                                    "w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]",
                                                    s === 'Active' ? 'bg-emerald-500 text-emerald-500' : s === 'Draft' ? 'bg-amber-500 text-amber-500' : 'bg-muted-foreground text-muted-foreground'
                                                )} />
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Inventory & Pricing Metrics */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border pb-2">Inventory Constraints</h3>

                                <div className="grid grid-cols-2 gap-4 bg-muted/20 border border-border p-4 rounded-2xl">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Unit Price</label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                                <DollarSign size={14} />
                                            </div>
                                            <input
                                                type="text"
                                                value={price}
                                                onChange={(e) => setPrice(e.target.value)}
                                                className="w-full bg-background border border-border rounded-lg pl-8 pr-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground/50 focus:ring-1 focus:ring-foreground/50 transition-all font-mono shadow-inner"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Discount</label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50">
                                                <Percent size={14} />
                                            </div>
                                            <input
                                                type="number"
                                                value={discount}
                                                onChange={(e) => setDiscount(Number(e.target.value))}
                                                className="w-full bg-background border border-border rounded-lg pl-8 pr-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground/50 focus:ring-1 focus:ring-foreground/50 transition-all font-mono shadow-inner"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 col-span-2">
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Stock Level</label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50">
                                                <Box size={14} />
                                            </div>
                                            <input
                                                type="number"
                                                value={stock}
                                                onChange={(e) => setStock(Number(e.target.value))}
                                                className="w-full bg-background border border-border rounded-lg pl-8 pr-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground/50 focus:ring-1 focus:ring-foreground/50 transition-all font-mono shadow-inner"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5 pt-2">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Product Description</label>
                                <textarea
                                    rows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Enter detailed specifications..."
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-foreground/50 focus:ring-1 focus:ring-foreground/50 transition-all resize-none shadow-inner"
                                />
                            </div>
                        </div>

                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-border bg-muted/30 flex items-center gap-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3.5 rounded-xl border border-border text-sm font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-all uppercase tracking-wider"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-1 py-3.5 rounded-xl bg-foreground hover:opacity-90 text-background text-sm font-extrabold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_var(--tw-shadow-color)] shadow-foreground/20 hover:shadow-[0_0_30px_var(--tw-shadow-color)] hover:shadow-foreground/40 uppercase tracking-wider disabled:opacity-60"
                        >
                            <Save size={16} />
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </>
        </ModalPortal>
    );
};

export default ProductDetailsPanel;
