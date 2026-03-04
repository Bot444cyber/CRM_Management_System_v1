"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LineChart,
  Megaphone,
  Package,
  Users,
  Plus,
  Layers,
  Trash2,
  ShoppingBag,
  Settings,
  ChevronRight,
  ChevronDown,
  Box,
  Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AddInventoryModal from './AddInventoryModal';
import { useInventory } from '@/context/InventoryContext';
import { ThemeToggle } from './ThemeToggle';

const Sidebar = ({ onClose }: { onClose?: () => void }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { inventories, addInventory, removeInventory, selectedInventoryId, setSelectedInventoryId } = useInventory();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  // Track which inventory nodes are open in the tree
  const [expandedInvIds, setExpandedInvIds] = useState<Set<string>>(new Set());
  // Track which main-product nodes are open
  const [expandedMpKeys, setExpandedMpKeys] = useState<Set<string>>(new Set());

  const toggleInv = (id: string) => {
    setExpandedInvIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleMp = (key: string) => {
    setExpandedMpKeys(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const handleSelectInventory = (id: string) => {
    setSelectedInventoryId(id);
    setConfirmDeleteId(null);
    if (pathname !== '/dashboard') router.push('/dashboard');
    onClose?.();
  };

  return (
    <div className="flex flex-col h-screen border-r border-border bg-sidebar overflow-hidden">
      {/* Main Sidebar Content */}
      <div className="w-[280px] flex flex-col py-6 px-4 overflow-y-auto overflow-x-hidden flex-1">

        {/* Logo / Header */}
        <Link href="/" className="flex items-center gap-3 px-2 mb-8 group hover:opacity-90 transition-opacity">
          <div className="w-[38px] h-[38px] bg-foreground rounded-[10px] flex items-center justify-center text-background font-black text-[17px] leading-none shrink-0 shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.15)] group-hover:shadow-[0_0_25px_rgba(0,0,0,0.15)] dark:group-hover:shadow-[0_0_25px_rgba(255,255,255,0.25)] transition-shadow">
            SE
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="text-foreground font-extrabold text-[17px] leading-tight tracking-[0.02em] -mb-[2px]">System Edge</h2>
            <p className="text-muted-foreground font-bold text-[9px] uppercase tracking-[0.25em] mt-0.5">SaaS Platform</p>
          </div>
        </Link>

        {/* Global Navigation */}
        <div className="mb-8">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 px-2">Navigation</p>
          <div className="space-y-1">
            <NavItem href="/dashboard" active={pathname === "/dashboard" && selectedInventoryId === null} icon={<Layers size={18} />} label="Inventories" onClick={() => { setSelectedInventoryId(null); onClose?.(); }} />
            <NavItem href="/dashboard/catalog" active={pathname === "/dashboard/catalog"} icon={<ShoppingBag size={18} />} label="All Products" onClick={onClose} />
            <NavItem href="/dashboard/analytics" active={pathname === "/dashboard/analytics"} icon={<LineChart size={18} />} label="Analytics" onClick={onClose} />
            <NavItem href="/dashboard/customers" active={pathname === "/dashboard/customers"} icon={<Users size={18} />} label="Customers" onClick={onClose} />
            <NavItem href="/dashboard/campaign" active={pathname === "/dashboard/campaign"} icon={<Megaphone size={18} />} label="Marketing" onClick={onClose} />
            <NavItem href="/dashboard/settings" active={pathname === "/dashboard/settings"} icon={<Settings size={18} />} label="Settings" onClick={onClose} />
          </div>
        </div>

        {/* ─── Active Assets Tree Graph ──────────────────────────── */}
        <div className="mb-6 flex-1">
          <div className="flex items-center justify-between mb-4 px-2">
            <p className="text-[10px] font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              Active Assets ({inventories.length}/5)
            </p>
          </div>

          {/* Tree Root */}
          <div className="space-y-1">
            {inventories.map((inv, invIdx) => {
              const isSelected = selectedInventoryId === inv.id && pathname === '/dashboard';
              const isOpen = expandedInvIds.has(inv.id);
              const isLast = invIdx === inventories.length - 1;

              return (
                <div key={inv.id} className="relative">
                  {/* ── Inventory Node (Level 0) ── */}
                  <div className={cn(
                    "relative group/inv flex items-center gap-0 rounded-xl transition-all duration-200",
                    isSelected ? "bg-accent text-accent-foreground" : "hover:bg-accent/50 text-foreground/70"
                  )}>

                    {/* Expand / Collapse toggle */}
                    <button
                      onClick={() => toggleInv(inv.id)}
                      className="shrink-0 w-7 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ChevronRight
                        size={14}
                        className={cn("transition-transform duration-200", isOpen && "rotate-90")}
                      />
                    </button>

                    {/* Inventory name button */}
                    <button
                      className="flex-1 flex items-center gap-2.5 py-2 pr-2 text-left min-w-0"
                      onClick={() => handleSelectInventory(inv.id)}
                    >
                      {/* Icon or Image */}
                      {inv.imageUrl ? (
                        <img
                          src={inv.imageUrl}
                          alt={inv.name}
                          className="w-6 h-6 rounded-md object-cover shrink-0 border border-border"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div className={cn(
                          "w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all",
                          isSelected ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
                        )}>
                          <Box size={11} />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <span className={cn(
                          "block text-[13px] font-bold truncate transition-colors leading-none",
                          isSelected ? "text-foreground" : "text-muted-foreground group-hover/inv:text-foreground"
                        )}>
                          {inv.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground leading-tight">
                          {inv.mainProducts.length} product{inv.mainProducts.length !== 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Active indicator dot */}
                      {isSelected && (
                        <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-foreground" />
                      )}
                    </button>

                    {/* Delete button (hover) */}
                    {confirmDeleteId !== inv.id && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(inv.id); }}
                        className="shrink-0 opacity-0 group-hover/inv:opacity-100 w-6 h-6 mr-1.5 flex items-center justify-center rounded-md text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title="Delete inventory"
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>

                  {/* Inline delete confirmation */}
                  {confirmDeleteId === inv.id && (
                    <div className="ml-7 mb-1 flex items-center gap-2 px-2 py-1.5 bg-red-500/5 border border-red-500/20 rounded-lg">
                      <span className="text-[9px] text-red-400/80 font-bold uppercase tracking-wider flex-1 truncate">Delete "{inv.name}"?</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeInventory(inv.id); setConfirmDeleteId(null); }}
                        className="text-[9px] font-extrabold text-red-400 border border-red-500/30 hover:bg-red-500/15 px-2 py-0.5 rounded-md transition-all uppercase tracking-wider"
                      >
                        Yes
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }}
                        className="text-[9px] font-bold text-muted-foreground border border-border hover:bg-muted hover:text-foreground px-2 py-0.5 rounded-md transition-all uppercase tracking-wider"
                      >
                        No
                      </button>
                    </div>
                  )}

                  {/* ── Children: Main Products (Level 1) ── */}
                  {isOpen && (
                    <div className="relative ml-[13px] pl-3 border-l border-border">
                      {inv.mainProducts.length === 0 ? (
                        <div className="relative py-2 pl-2">
                          <div className="absolute left-0 top-[14px] w-3 h-px bg-border" />
                          <span className="text-[10px] text-muted-foreground italic">No products yet</span>
                        </div>
                      ) : (
                        inv.mainProducts.map((mp, mpIdx) => {
                          const mpKey = `${inv.id}-${mpIdx}`;
                          const isMpOpen = expandedMpKeys.has(mpKey);
                          const hasChildren = mp.subProducts && mp.subProducts.length > 0;
                          const isMpLast = mpIdx === inv.mainProducts.length - 1;

                          return (
                            <div key={mpIdx} className="relative">
                              {/* Horizontal branch line */}
                              <div className="absolute left-0 top-[15px] w-3 h-px bg-border" />

                              <div className="group/mp flex items-center pl-3 py-1.5 pr-1 rounded-lg hover:bg-accent transition-colors cursor-default">
                                {/* Expand toggle (only if has children) */}
                                {hasChildren ? (
                                  <button
                                    onClick={() => toggleMp(mpKey)}
                                    className="shrink-0 w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                                  >
                                    <ChevronRight size={11} className={cn("transition-transform duration-200", isMpOpen && "rotate-90")} />
                                  </button>
                                ) : (
                                  <span className="shrink-0 w-5 h-5 flex items-center justify-center">
                                    <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                  </span>
                                )}

                                <Package size={12} className="shrink-0 text-muted-foreground mx-1.5" />
                                <span className="text-[12px] text-muted-foreground group-hover/mp:text-foreground font-semibold truncate transition-colors flex-1">
                                  {mp.name}
                                </span>
                                <span className="shrink-0 text-[9px] text-muted-foreground ml-1.5 font-bold tabular-nums">
                                  {mp.subProducts?.length ?? 0}
                                </span>
                              </div>

                              {/* ── Grandchildren: Sub-Products (Level 2) ── */}
                              {isMpOpen && hasChildren && (
                                <div className="relative ml-[9px] pl-3 border-l border-border/50">
                                  {mp.subProducts.map((sp, spIdx) => (
                                    <div key={spIdx} className="relative">
                                      {/* Horizontal branch line */}
                                      <div className="absolute left-0 top-[13px] w-3 h-px bg-border/50" />
                                      <div className="group/sp flex items-center pl-3 py-1 pr-1 rounded-md hover:bg-accent transition-colors">
                                        <Tag size={10} className="shrink-0 text-muted-foreground mr-1.5" />
                                        <span className="text-[11px] text-muted-foreground group-hover/sp:text-foreground truncate transition-colors">
                                          {sp.name || <em className="text-muted-foreground/50">Unnamed</em>}
                                        </span>
                                        {sp.status === 'Active' && (
                                          <span className="ml-auto shrink-0 w-1 h-1 rounded-full bg-emerald-500" />
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {inventories.length < 5 && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full mt-3 py-2.5 border border-border border-dashed rounded-xl flex items-center justify-center gap-2 text-[11px] font-bold text-muted-foreground hover:text-foreground hover:border-foreground/40 hover:bg-accent transition-all group uppercase tracking-wider"
              >
                <Plus size={13} className="group-hover:text-foreground transition-colors" /> Add Inventory
              </button>
            )}
            {inventories.length >= 5 && (
              <p className="text-center text-[10px] text-rose-500/80 font-medium mt-4 px-2 uppercase tracking-wide">Inventory limit reached (5/5)</p>
            )}
          </div>
        </div>
      </div>

      {/* Theme Toggle Footer Area */}
      <div className="p-4 border-t border-border mt-auto flex items-center justify-between">
        <span className="text-[11px] font-semibold text-muted-foreground">Appearance</span>
        <ThemeToggle />
      </div>

      <AddInventoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addInventory}
      />
    </div>
  );
};

const NavItem = ({ icon, label, badge, active = false, href, onClick }: { icon: React.ReactNode, label: string, badge?: string, active?: boolean, href?: string, onClick?: () => void }) => {
  const content = (
    <div className={cn(
      "flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-300",
      active
        ? "bg-foreground text-background shadow-md font-bold"
        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
    )} onClick={onClick}>
      <div className="flex items-center gap-3">
        <span className={cn("transition-colors", active ? "text-background" : "text-muted-foreground")}>{icon}</span>
        <span className="text-[13px] tracking-wide">{label}</span>
      </div>
      {badge && (
        <span className={cn(
          "text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest",
          badge === "99+" ? "bg-rose-500 text-primary-foreground" : (active ? "bg-background/20 text-background" : "bg-muted text-muted-foreground")
        )}>
          {badge}
        </span>
      )}
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }
  return content;
};

export default Sidebar;
