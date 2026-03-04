"use client";

import React, { useState } from 'react';
import { useInventory, SubProduct, MainProduct } from '@/context/InventoryContext';
import ProductDetailsPanel, { ProductDetails } from './ProductDetailsPanel';
import AddInventoryModal from './AddInventoryModal';

// New specialized components
import InventoryCardView from './inventory/InventoryCardView';
import MainProductCardView from './inventory/MainProductCardView';
import SubProductListView from './inventory/SubProductListView';
import SubProductShowcaseView from './inventory/SubProductShowcaseView';

const InventoryView = () => {
    const { inventories, selectedInventoryId, setSelectedInventoryId, updateInventory, addInventory } = useInventory();

    // UI State for drill-down navigation
    const [selectedMainProductIndex, setSelectedMainProductIndex] = useState<number | null>(null);
    const [showcaseSubProductIndex, setShowcaseSubProductIndex] = useState<number | null>(null);

    // Modal states
    const [selectedProduct, setSelectedProduct] = useState<ProductDetails | null>(null);
    const [showAddMainProduct, setShowAddMainProduct] = useState(false);
    const [showAddInventory, setShowAddInventory] = useState(false);

    const activeInventory = inventories.find(inv => inv.id === selectedInventoryId);

    // Context switching handler
    const handleSelectInventoryWrapper = (id: string) => {
        setSelectedInventoryId(id);
        setSelectedMainProductIndex(null); // Reset drill-down
        setShowcaseSubProductIndex(null);
    };

    const handleBackToInventories = () => {
        setSelectedInventoryId(null);
        setSelectedMainProductIndex(null);
        setShowcaseSubProductIndex(null);
    };

    const handleBackToMainProducts = () => {
        if (showcaseSubProductIndex !== null) {
            setShowcaseSubProductIndex(null); // Go back to list from showcase
        } else {
            setSelectedMainProductIndex(null); // Go back to main from list
        }
    };

    // Data mutation handlers
    const handleSaveProductDetails = async (updated: ProductDetails) => {
        if (!activeInventory) return;
        const newMainProducts = activeInventory.mainProducts.map((mp, mi) => {
            if (mi !== updated.mainProductIndex) return mp;
            if (updated.subProductIndex >= mp.subProducts.length) {
                return {
                    ...mp,
                    subProducts: [...mp.subProducts, {
                        name: updated.name, price: updated.price, stock: updated.stock,
                        discount: updated.discount, status: updated.status, imageUrl: updated.imageUrl,
                        additionalImages: updated.additionalImages
                    }]
                };
            }
            return {
                ...mp,
                subProducts: mp.subProducts.map((sp, si) =>
                    si === updated.subProductIndex
                        ? { ...sp, name: updated.name, price: updated.price, stock: updated.stock, discount: updated.discount, status: updated.status, imageUrl: updated.imageUrl, additionalImages: updated.additionalImages }
                        : sp
                )
            };
        });
        await updateInventory(activeInventory.id, { mainProducts: newMainProducts });
    };

    const handleAddMainProduct = async (newMP: MainProduct) => {
        if (!activeInventory) return;
        const newMainProducts = [...activeInventory.mainProducts, newMP];
        await updateInventory(activeInventory.id, { mainProducts: newMainProducts });
        setShowAddMainProduct(false);
    };

    const handleAddSubProduct = (mainProductIndex: number) => {
        if (!activeInventory) return;
        const mp = activeInventory.mainProducts[mainProductIndex];
        const newSub = { name: '', price: '0.00', stock: 0, discount: 0, status: 'Draft' as const, imageUrl: '', additionalImages: [] };

        setSelectedProduct({
            id: `${activeInventory.id}-${mainProductIndex}-${mp.subProducts.length}`,
            subProductIndex: mp.subProducts.length,
            mainProductIndex,
            name: newSub.name,
            parentInventoryName: activeInventory.name,
            parentMainProduct: mp.name,
            price: newSub.price,
            stock: newSub.stock,
            discount: newSub.discount,
            status: newSub.status,
            imageUrl: newSub.imageUrl,
        });
    };

    const handleEditSubProduct = (sub: SubProduct, subIndex: number, mainProductIndex: number) => {
        if (!activeInventory) return;
        setSelectedProduct({
            id: `${activeInventory.id}-${mainProductIndex}-${subIndex}`,
            subProductIndex: subIndex,
            mainProductIndex,
            name: sub.name,
            parentInventoryName: activeInventory.name,
            parentMainProduct: activeInventory.mainProducts[mainProductIndex]?.name || '',
            price: sub.price,
            stock: sub.stock,
            discount: sub.discount,
            status: sub.status,
            imageUrl: sub.imageUrl,
            additionalImages: (sub as any).additionalImages || [],
        });
    };

    const handleDeleteSubProduct = (subIndex: number) => {
        if (!activeInventory || selectedMainProductIndex === null) return;
        const newMainProducts = activeInventory.mainProducts.map((mp, mi) => {
            if (mi !== selectedMainProductIndex) return mp;
            return { ...mp, subProducts: mp.subProducts.filter((_, si) => si !== subIndex) };
        });
        updateInventory(activeInventory.id, { mainProducts: newMainProducts });
    };

    // ── Routing Logic ──

    // Level 1: All Inventories View
    if (!activeInventory) {
        return (
            <>
                <InventoryCardView
                    inventories={inventories}
                    onSelectInventory={handleSelectInventoryWrapper}
                    onAddInventory={() => setShowAddInventory(true)}
                />
                <AddInventoryModal
                    isOpen={showAddInventory}
                    onClose={() => setShowAddInventory(false)}
                    onAdd={async (inv) => {
                        await addInventory(inv);
                        setShowAddInventory(false);
                    }}
                />
            </>
        );
    }

    // Level 2: Main Products View
    if (selectedMainProductIndex === null) {
        return (
            <MainProductCardView
                inventory={activeInventory}
                onBack={handleBackToInventories}
                onSelectMainProduct={setSelectedMainProductIndex}
                onAddMainProduct={handleAddMainProduct}
                showAddModal={showAddMainProduct}
                setShowAddModal={setShowAddMainProduct}
            />
        );
    }

    // Level 3: Sub Products ListView or Showcase
    return (
        <>
            {showcaseSubProductIndex !== null ? (
                <SubProductShowcaseView
                    inventory={activeInventory}
                    mainProductIndex={selectedMainProductIndex}
                    subProductIndex={showcaseSubProductIndex}
                    onBack={handleBackToMainProducts}
                    onSelectSubProduct={setShowcaseSubProductIndex}
                />
            ) : (
                <SubProductListView
                    inventory={activeInventory}
                    mainProductIndex={selectedMainProductIndex}
                    onBack={handleBackToMainProducts}
                    onEditSubProduct={handleEditSubProduct}
                    onAddSubProduct={handleAddSubProduct}
                    onDeleteSubProduct={handleDeleteSubProduct}
                    onShowcaseSubProduct={(subIndex) => setShowcaseSubProductIndex(subIndex)}
                />
            )}

            <ProductDetailsPanel
                isOpen={!!selectedProduct}
                onClose={() => setSelectedProduct(null)}
                product={selectedProduct}
                onSave={handleSaveProductDetails}
            />
        </>
    );
};

export default InventoryView;
