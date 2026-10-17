import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { StoreBranch } from '../types';
import { MapPin, ChevronDown, Check, Building2, Clock, Phone, Plus, ExternalLink } from 'lucide-react';

interface BranchSelectorProps {
  variant?: 'header' | 'admin' | 'compact';
  className?: string;
}

export const BranchSelector: React.FC<BranchSelectorProps> = ({ variant = 'header', className = '' }) => {
  const {
    branches,
    activeBranch,
    setActiveBranch,
    isAdmin,
    setIsAdmin,
    formatPKR,
  } = useStore();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  if (!branches || branches.length === 0) {
    return null;
  }

  const handleSelectBranch = (branch: StoreBranch) => {
    setActiveBranch(branch.id);
    setIsOpen(false);
  };

  if (variant === 'admin') {
    return (
      <div className={`relative inline-block ${className}`} ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 border border-amber-700/60 text-amber-200 text-xs font-bold transition cursor-pointer"
          title="Switch Active Store Branch"
        >
          <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate max-w-[140px] sm:max-w-[200px]">
            {activeBranch?.name || 'Main Branch'}
          </span>
          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1 rounded font-mono">
            {activeBranch?.code || 'HUB'}
          </span>
          <ChevronDown className={`w-3 h-3 text-amber-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-80 bg-zinc-900 border border-amber-900/60 rounded-xl shadow-2xl p-2 z-[999] text-zinc-100 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-3 py-2 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wider font-bold text-amber-400">Select Store Branch</p>
                <p className="text-[10px] text-zinc-400">All data & orders filter by selected branch</p>
              </div>
              <span className="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded font-mono">
                {branches.length} Branches
              </span>
            </div>

            <div className="max-h-64 overflow-y-auto divide-y divide-zinc-800/60 py-1">
              {branches.map((branch) => {
                const isCurrent = branch.id === activeBranch?.id;
                return (
                  <button
                    key={branch.id}
                    type="button"
                    onClick={() => handleSelectBranch(branch)}
                    className={`w-full text-left p-2.5 rounded-xl transition flex items-start justify-between gap-2 cursor-pointer ${
                      isCurrent
                        ? 'bg-amber-500/25 border-2 border-amber-400 text-white shadow-md ring-2 ring-amber-400/30'
                        : 'hover:bg-zinc-800/70 border border-zinc-800 text-zinc-300'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-white truncate">{branch.name}</span>
                        <span className="text-[9px] bg-zinc-800 text-zinc-300 px-1.5 py-0.2 rounded font-mono font-bold">{branch.code}</span>
                        {branch.isDefault && (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-black">HQ</span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-300 truncate">{branch.address}</p>
                      <div className="flex items-center gap-3 text-[10px] text-zinc-400 pt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 text-amber-400" /> {branch.openingTime} - {branch.closingTime}
                        </span>
                        <span>Delivery: {formatPKR(branch.deliveryFee)}</span>
                      </div>
                    </div>
                    {isCurrent ? (
                      <span className="text-[10px] bg-amber-400 text-zinc-950 font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-zinc-950 stroke-[3]" /> ACTIVE
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-500 font-bold shrink-0 mt-0.5 hover:text-white">
                        Switch →
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Header variant for storefront customers & header bar
  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/90 dark:bg-zinc-800/90 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 shadow-xs transition cursor-pointer"
        title="Select Delivery Branch & Area"
      >
        <MapPin className="w-3.5 h-3.5 text-[#e4002b] shrink-0" />
        <div className="text-left hidden sm:block">
          <p className="text-[10px] text-zinc-600 dark:text-zinc-400 uppercase font-black tracking-wider leading-none">Branch</p>
          <p className="text-xs font-bold text-zinc-900 dark:text-white leading-tight truncate max-w-[150px]">
            {activeBranch?.name || 'Main City Branch'}
          </p>
        </div>
        <div className="sm:hidden text-left truncate max-w-[120px] font-bold">
          {activeBranch?.city || 'Chakwal'}
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-84 max-w-[90vw] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-2 z-[999] text-zinc-900 dark:text-zinc-100 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">Choose Branch</p>
              <p className="text-[11px] text-zinc-500">Pick the nearest branch for fast delivery</p>
            </div>
            <span className="text-[10px] bg-red-50 dark:bg-red-950/40 text-[#e4002b] font-bold px-2 py-0.5 rounded-full">
              {branches.length} Available
            </span>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800 py-1">
            {branches.map((branch) => {
              const isCurrent = branch.id === activeBranch?.id;
              return (
                <button
                  key={branch.id}
                  type="button"
                  onClick={() => handleSelectBranch(branch)}
                  className={`w-full text-left p-3 rounded-2xl transition flex items-start justify-between gap-3 cursor-pointer ${
                    isCurrent
                      ? 'bg-red-500/10 dark:bg-red-950/60 border-2 border-[#e4002b] shadow-md ring-2 ring-[#e4002b]/30'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-xs font-black ${isCurrent ? 'text-[#e4002b] dark:text-red-400' : 'text-zinc-900 dark:text-white'}`}>
                        {branch.name}
                      </span>
                      <span className="text-[9px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-1.5 py-0.2 rounded font-mono font-bold">
                        {branch.code}
                      </span>
                      {branch.isDefault && (
                        <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.2 rounded font-black">
                          Main Hub
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-2">{branch.address}</p>
                    <div className="flex items-center gap-3 text-[10px] text-zinc-500 dark:text-zinc-400 pt-0.5 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 text-[#e4002b]" />
                        {branch.openingTime} - {branch.closingTime}
                      </span>
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                        Fee: {formatPKR(branch.deliveryFee)}
                      </span>
                      <span>Min Order: {formatPKR(branch.minOrderAmount)}</span>
                    </div>
                  </div>

                  {isCurrent ? (
                    <span className="text-[10px] bg-[#e4002b] text-white font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-white stroke-[3]" /> ACTIVE
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold shrink-0 mt-1 hover:text-[#e4002b]">
                      Select →
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
