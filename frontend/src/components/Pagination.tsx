"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}

export default function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages: (number | "...")[] = [];
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        pages.push(1);
        if (page > 3) pages.push("...");
        for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
            pages.push(i);
        }
        if (page < totalPages - 2) pages.push("...");
        pages.push(totalPages);
        return pages;
    };

    return (
        <div className={cn("flex items-center justify-center gap-1.5 py-6", className)}>
            {/* Prev */}
            <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            >
                <ChevronLeft size={16} />
                <span className="hidden sm:inline">Prev</span>
            </button>

            {/* Page numbers */}
            {getPageNumbers().map((p, i) =>
                p === "..." ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-white/20 select-none">
                        ···
                    </span>
                ) : (
                    <button
                        key={p}
                        onClick={() => onPageChange(p as number)}
                        className={cn(
                            "w-9 h-9 rounded-lg text-sm font-medium transition-all",
                            p === page
                                ? "bg-white text-black"
                                : "text-white/40 hover:text-white hover:bg-white/5"
                        )}
                    >
                        {p}
                    </button>
                )
            )}

            {/* Next */}
            <button
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight size={16} />
            </button>
        </div>
    );
}
