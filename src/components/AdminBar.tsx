import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ShieldCheck, ShoppingBag, Settings2, Share2, LogOut, Check, ExternalLink } from 'lucide-react';

export const AdminBar: React.FC = () => {
  const {
    isAdmin,
    allOrders,
    setIsOrdersDashboardOpen,
    setIsCustomizerOpen,
    logoutAdmin,
  } = useStore();

  const [copied, setCopied] = useState(false);

  if (!isAdmin) return null;

  const pendingOrdersCount = allOrders.filter(
    (o) => o.status === 'confirmed' || o.status === 'kitchen'
  ).length;

  const handleCopyCustomerLink = () => {
    // Generate clean URL without ?admin=true
    const url = new URL(window.location.href);
    url.searchParams.delete('admin');
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-r from-[#1f1608] via-[#241a0b] to-[#1a1106] border-b border-amber-900/50 text-white text-xs px-4 py-2 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Admin Identifier */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <span className="font-kfc font-black text-amber-300 uppercase tracking-wider text-sm">
            KFC Chakwal · Store Manager Portal
          </span>
        </div>

        {/* Middle: Actions */}
        <div className="flex items-center gap-2">
          
          {/* Orders Dashboard Button */}
          <button
            onClick={() => setIsOrdersDashboardOpen(true)}
            className="bg-[#e4002b] hover:bg-[#c30025] text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Orders Dashboard</span>
            {pendingOrdersCount > 0 && (
              <span className="bg-white text-[#e4002b] text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {pendingOrdersCount} New
              </span>
            )}
          </button>

          {/* Customize Hub Button */}
          <button
            onClick={() => setIsCustomizerOpen(true)}
            className="bg-[#2a2012] hover:bg-[#382b18] text-amber-200 border border-amber-800/60 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Settings2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Rates & Menu Manager</span>
          </button>

          {/* Copy Clean Customer Link Button */}
          <button
            onClick={handleCopyCustomerLink}
            className="bg-[#2a2012] hover:bg-[#382b18] text-zinc-300 hover:text-white border border-amber-900/50 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Copy clean customer link (Admin controls hidden)"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Customer Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden sm:inline">Copy Customer Link</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Exit Admin */}
        <button
          onClick={logoutAdmin}
          className="text-zinc-400 hover:text-red-400 p-1.5 flex items-center gap-1 text-[11px] font-semibold transition-colors cursor-pointer"
          title="Exit to customer view"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Admin</span>
        </button>

      </div>
    </div>
  );
};
