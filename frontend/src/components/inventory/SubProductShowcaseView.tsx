import React, { useState } from 'react';
import { Inventory, SubProduct } from '@/context/InventoryContext';
import { ArrowLeft, Star, StarHalf, Package, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubProductShowcaseViewProps {
    inventory: Inventory;
    mainProductIndex: number;
    subProductIndex: number;
    onBack: () => void;
    onSelectSubProduct: (index: number) => void;
}

const SubProductShowcaseView: React.FC<SubProductShowcaseViewProps> = ({
    inventory,
    mainProductIndex,
    subProductIndex,
    onBack,
    onSelectSubProduct
}) => {
    const mp = inventory.mainProducts[mainProductIndex];
    const sub = mp?.subProducts[subProductIndex];

    const [selectedImageIndex, setSelectedImageIndex] = useState(-1); // -1 means main image, 0-3 means additional

    if (!sub) return null;

    // Gather all images (Main + Additional)
    const images = [];
    if (sub.imageUrl) images.push({ url: sub.imageUrl, id: -1 });
    if (sub.additionalImages) {
        sub.additionalImages.forEach((url, i) => {
            if (url) images.push({ url, id: i });
        });
    }

    // Default main image if none selected or multiple fallback
    const currentDisplayImage = selectedImageIndex === -1
        ? sub.imageUrl
        : (sub.additionalImages ? sub.additionalImages[selectedImageIndex] : sub.imageUrl);

    // Dummy data for e-commerce feel
    const dummyDescription = "Embrace Elegance With This Stunning Product, Perfect For All Occasions. The Intricate Design And Premium Quality Adds A Touch Of Royal Charm To Your Wardrobe.";

    const originalPrice = parseFloat(sub.price) / (1 - (sub.discount / 100));

    // Get suggestions (other subproducts in the same main category) - max 3
    const suggestedProducts = mp.subProducts
        .map((p, index) => ({ p, index }))
        .filter(item => item.index !== subProductIndex)
        .slice(0, 3);

    return (
        <div className="flex flex-col animate-in fade-in duration-500 w-full h-full">

            {/* Header / Breadcrumb */}
            <div className="flex items-center gap-3 py-4 border-b border-border">
                <button
                    onClick={onBack}
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-muted border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                >
                    <ArrowLeft size={16} />
                </button>
                <div className="flex items-center gap-2 text-sm tracking-wide">
                    <span className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors" onClick={onBack}>{inventory.name}</span>
                    <span className="text-muted-foreground/50">/</span>
                    <span className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors" onClick={onBack}>{mp.name}</span>
                    <span className="text-muted-foreground/50">/</span>
                    <span className="text-foreground font-bold">{sub.name}</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col lg:flex-row py-6 gap-10 flex-1">

                {/* Left Side: Image Gallery & Thumbnail Options */}
                <div className="w-full lg:w-1/2 flex flex-col gap-4">
                    {/* Main Large Image */}
                    <div className="w-full aspect-square rounded-2xl overflow-hidden bg-muted border border-border relative group shadow-inner flex items-center justify-center">
                        {currentDisplayImage ? (
                            <img
                                src={currentDisplayImage}
                                alt={sub.name}
                                className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-700 ease-in-out cursor-zoom-in"
                            />
                        ) : (
                            <div className="text-muted-foreground gap-4 flex flex-col items-center justify-center">
                                <Package size={48} className="opacity-50" />
                                <span className="tracking-widest uppercase text-xs font-bold">No Image Available</span>
                            </div>
                        )}

                        {/* Status/Discount Badges */}
                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                            {sub.discount > 0 && (
                                <div className="bg-rose-500 text-white font-extrabold text-[10px] px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg shadow-rose-500/20">
                                    {sub.discount}% OFF
                                </div>
                            )}
                            {sub.stock === 0 && (
                                <div className="bg-background/80 backdrop-blur-md border border-border text-foreground font-extrabold text-[10px] px-3 py-1.5 rounded-full uppercase tracking-wider">
                                    Out of Stock
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Thumbnail Options (Horizontal) */}
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                        {images.map((img) => (
                            <button
                                key={img.id}
                                onClick={() => setSelectedImageIndex(img.id)}
                                className={cn(
                                    "min-w-[80px] w-20 aspect-square rounded-xl overflow-hidden border-2 transition-all p-0.5 shrink-0 bg-card",
                                    (selectedImageIndex === img.id || (selectedImageIndex === -1 && img.id === -1))
                                        ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)] scale-105"
                                        : "border-transparent opacity-60 hover:opacity-100 hover:border-border"
                                )}
                            >
                                <img src={img.url} alt="Option" className="w-full h-full object-cover rounded-lg" />
                            </button>
                        ))}
                        {images.length === 0 && (
                            <div className="min-w-[80px] w-20 aspect-square bg-muted rounded-xl border border-border flex items-center justify-center text-muted-foreground text-[10px] text-center p-2">
                                No Images
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Product Details */}
                <div className="w-full lg:w-1/2 flex flex-col">

                    {/* Brand / Title / Ratings */}
                    <div className="mb-6">
                        <p className="text-emerald-500 font-bold uppercase tracking-[0.2em] text-[10px] mb-2">{inventory.name}</p>
                        <h1 className="text-3xl md:text-4xl font-black text-foreground leading-tight tracking-tight mb-4 ">{sub.name}</h1>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center text-amber-500">
                                <Star size={14} fill="currentColor" />
                                <Star size={14} fill="currentColor" />
                                <Star size={14} fill="currentColor" />
                                <Star size={14} fill="currentColor" />
                                <StarHalf size={14} fill="currentColor" />
                            </div>
                            <span className="text-muted-foreground text-xs border-b border-border pb-0.5 cursor-pointer hover:text-foreground transition-colors">Read 14 Reviews</span>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="flex items-end gap-4 mb-2">
                        <span className="text-3xl font-black text-foreground">${sub.price}</span>
                        {sub.discount > 0 && (
                            <>
                                <span className="text-lg text-muted-foreground line-through mb-1">${isNaN(originalPrice) ? '0.00' : originalPrice.toFixed(2)}</span>
                                <span className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-2 border border-rose-500/30 px-2 py-0.5 rounded-md bg-rose-500/10">{sub.discount}% OFF</span>
                            </>
                        )}
                    </div>
                    <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider mb-8">Inclusive of all taxes</p>

                    {/* Short Description */}
                    <p className="text-muted-foreground text-sm leading-relaxed mb-8 border-l-2 border-border pl-4">{dummyDescription}</p>

                    {/* Suggested Products */}
                    {suggestedProducts.length > 0 && (
                        <div className="mt-4 pt-8 border-t border-border">
                            <h3 className="text-[11px] font-black text-foreground uppercase tracking-[0.15em] mb-6 flex items-center gap-2">
                                <Sparkles size={14} className="text-emerald-500" />
                                You May Also Like
                            </h3>

                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                                {suggestedProducts.map(({ p, index }) => (
                                    <button
                                        key={index}
                                        onClick={() => onSelectSubProduct(index)}
                                        className="min-w-[140px] max-w-[140px] group flex flex-col gap-3 text-left transition-all"
                                    >
                                        <div className="w-full aspect-4/5 rounded-xl overflow-hidden bg-muted border border-border group-hover:border-foreground/30 relative">
                                            {p.imageUrl ? (
                                                <img
                                                    src={p.imageUrl}
                                                    alt={p.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                    <Package size={24} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-foreground text-xs font-bold truncate group-hover:text-emerald-500 transition-colors">
                                                {p.name}
                                            </p>
                                            <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                                                ${parseFloat(p.price).toFixed(2)}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default SubProductShowcaseView;
