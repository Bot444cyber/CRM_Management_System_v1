"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { apiFetch } from '@/lib/apiFetch';

export interface SubProduct {
    name: string;
    price: string;
    stock: number;
    discount: number;
    status: 'Active' | 'Draft' | 'Archived';
    imageUrl?: string;
    additionalImages?: string[];
}

export interface MainProduct {
    name: string;
    imageUrl?: string;
    subProducts: SubProduct[];
}

export interface Inventory {
    id: string;
    name: string;
    imageUrl?: string;
    mainProducts: MainProduct[];
    createdAt?: string;
}

interface InventoryContextType {
    inventories: Inventory[];
    selectedInventoryId: string | null;
    setSelectedInventoryId: (id: string | null) => void;
    // Pagination
    page: number;
    totalPages: number;
    total: number;
    limit: number;
    setPage: (page: number) => void;
    // CRUD
    addInventory: (inventory: Inventory) => Promise<void>;
    updateInventory: (id: string, data: Partial<Inventory>) => Promise<void>;
    removeInventory: (id: string) => Promise<void>;
    refreshInventories: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const ITEMS_PER_PAGE = 10;

export function InventoryProvider({ children }: { children: ReactNode }) {
    const [inventories, setInventories] = useState<Inventory[]>([]);
    const [selectedInventoryId, setSelectedInventoryId] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchInventories = async (pageNum = 1) => {
        try {
            const res = await apiFetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/inventories?page=${pageNum}&limit=${ITEMS_PER_PAGE}`
            );
            if (res.ok) {
                const json = await res.json();
                // Handle both paginated envelope and legacy plain array
                const rawData: any[] = Array.isArray(json) ? json : (json.data ?? []);
                setTotalPages(json.totalPages ?? 1);
                setTotal(json.total ?? rawData.length);

                const parsedData: Inventory[] = rawData.map((inv: any) => {
                    let mainProducts: MainProduct[] = [];
                    if (inv.mainProducts) {
                        mainProducts = typeof inv.mainProducts === 'string'
                            ? JSON.parse(inv.mainProducts)
                            : (Array.isArray(inv.mainProducts) ? inv.mainProducts : []);
                    }
                    if (mainProducts.length === 0 && inv.mainProduct) {
                        const subProducts = typeof inv.subProducts === 'string'
                            ? JSON.parse(inv.subProducts || '[]')
                            : (Array.isArray(inv.subProducts) ? inv.subProducts : []);
                        mainProducts = [{
                            name: inv.mainProduct,
                            imageUrl: inv.mainProductImageUrl || undefined,
                            subProducts,
                        }];
                    }
                    return {
                        id: inv.id,
                        name: inv.name,
                        imageUrl: inv.imageUrl || undefined,
                        mainProducts,
                        createdAt: inv.createdAt,
                    };
                });

                setInventories(parsedData);
                // We no longer auto-select the first inventory, so the user lands on the 'All Inventories' card view
                // if (parsedData.length > 0 && !selectedInventoryId) {
                //     setSelectedInventoryId(parsedData[0].id);
                // }
            }
        } catch (error) {
            console.error("Error fetching inventories:", error);
        }
    };

    useEffect(() => {
        fetchInventories(page);
    }, [page]);

    const handleSetPage = (newPage: number) => {
        setPage(newPage);
    };

    const addInventory = async (newInventory: Inventory) => {
        if (total >= 5) {
            alert('Maximum limit of 5 inventories reached.');
            return;
        }

        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/inventories`, {
                method: 'POST',
                body: JSON.stringify(newInventory)
            });

            if (res.ok) {
                await fetchInventories(page);
                // We keep them on the current view instead of forcing navigation to the new one immediately
                // if (!selectedInventoryId) setSelectedInventoryId(newInventory.id);
            } else {
                const errorData = await res.json();
                alert(errorData.message || 'Failed to add inventory');
            }
        } catch (error) {
            console.error("Error adding inventory:", error);
            alert('Network error while adding inventory');
        }
    };

    const updateInventory = async (id: string, data: Partial<Inventory>) => {
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/inventories/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });

            if (res.ok) {
                setInventories((prev) =>
                    prev.map(inv => inv.id === id ? { ...inv, ...data } : inv)
                );
            } else {
                const errorData = await res.json();
                alert(errorData.message || 'Failed to update inventory');
            }
        } catch (error) {
            console.error("Error updating inventory:", error);
            alert('Network error while updating inventory');
        }
    };

    const removeInventory = async (id: string) => {
        try {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/inventories/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setInventories((prev) => prev.filter(inv => inv.id !== id));
                setTotal(t => t - 1);
                if (selectedInventoryId === id) setSelectedInventoryId(null);
                // If current page is now empty, go back one
                if (inventories.length === 1 && page > 1) setPage(p => p - 1);
            } else {
                alert('Failed to delete inventory');
            }
        } catch (error) {
            console.error("Error completely removing inventory:", error);
        }
    };

    const refreshInventories = async () => {
        await fetchInventories(page);
    };

    return (
        <InventoryContext.Provider value={{
            inventories,
            selectedInventoryId,
            setSelectedInventoryId,
            page,
            totalPages,
            total,
            limit: ITEMS_PER_PAGE,
            setPage: handleSetPage,
            addInventory,
            updateInventory,
            removeInventory,
            refreshInventories
        }}>
            {children}
        </InventoryContext.Provider>
    );
}

export function useInventory() {
    const context = useContext(InventoryContext);
    if (context === undefined) {
        throw new Error('useInventory must be used within an InventoryProvider');
    }
    return context;
}
