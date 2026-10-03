import React from 'react';
import { useStore } from '../context/StoreContext';
import { MapPin, Phone, Clock, ShieldCheck, Bike, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings, chakwalAreas, setIsAdminLoginModalOpen, isAdmin, themeMode } = useStore();

  const isDark = themeMode === 'dark';
  const logoUrl = settings.headerFooter?.logoUrl;
  const aboutText = settings.headerFooter?.footerAboutText ||
    'Bringing authentic KFC Pakistan crispy chicken, Zingers, Krunch burgers, and family sharing meals straight to homes and workplaces across Chakwal.';
  const copyrightText = settings.headerFooter?.footerCopyrightText ||
    `© ${new Date().getFullYear()} ${settings.storeName}. All rights reserved.`;

  const activePayments = settings.paymentMethods?.filter((p) => p.enabled) || [
    { id: 'cod', name: 'Cash on Delivery (COD)' },
    { id: 'jazzcash', name: 'JazzCash' },
    { id: 'easypaisa', name: 'Easypaisa' },
  ];

  return (
    <footer className={`border-t transition-colors text-xs ${
      isDark ? 'bg-[#0e0e10] border-[#222228] text-zinc-400' : 'bg-zinc-100 border-zinc-300 text-zinc-600'
    }`}>
      {/* Top Value Props Strip */}
      <div className={`border-b ${isDark ? 'border-[#1c1c22] bg-[#121215]' : 'border-zinc-200 bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#e4002b]/15 text-[#e4002b] flex items-center justify-center shrink-0">
                <Bike className="w-5 h-5" />
              </div>
              <div>
                <h4 className={`font-bold text-xs ${isDark ? 'text-white' : 'text-zinc-900'}`}>Chakwal Fast Delivery</h4>
                <p className="text-[11px] text-zinc-500">Flat Rs {settings.deliveryFee} across Chakwal</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-950/60 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className={`font-bold text-xs ${isDark ? 'text-white' : 'text-zinc-900'}`}>100% Halal Verified</h4>
                <p className="text-[11px] text-zinc-500">Fresh chicken fried to order</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-950/60 text-amber-400 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className={`font-bold text-xs ${isDark ? 'text-white' : 'text-zinc-900'}`}>Delivery Hours</h4>
                <p className="text-[11px] text-zinc-500">{settings.openingHours}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-950/60 text-blue-400 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className={`font-bold text-xs ${isDark ? 'text-white' : 'text-zinc-900'}`}>Direct Support</h4>
                <p className="text-[11px] text-zinc-500">{settings.phone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={settings.storeName}
                  className="h-9 w-auto max-w-[120px] object-contain shrink-0"
                />
              ) : (
                <div className="flex gap-1 h-6 items-center">
                  <span className="w-2 h-6 bg-[#e4002b] rounded-sm transform -skew-x-6"></span>
                  <span className="w-2 h-5 bg-white border border-zinc-300 rounded-sm transform -skew-x-6"></span>
                  <span className="w-2 h-6 bg-[#e4002b] rounded-sm transform -skew-x-6"></span>
                </div>
              )}
              <span className={`font-kfc text-2xl font-black uppercase tracking-wider ${
                isDark ? 'text-white' : 'text-zinc-900'
              }`}>
                {settings.headerFooter?.headerTitle || settings.storeName}
              </span>
            </div>
            
            <p className={`text-xs leading-relaxed max-w-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              {aboutText}
            </p>

            <div className="pt-2 text-[11px] space-y-1">
              <p className={`flex items-center gap-1.5 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                <MapPin className="w-3.5 h-3.5 text-[#e4002b]" />
                <span>{settings.storeAddress}</span>
              </p>
              <p className={`flex items-center gap-1.5 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                <Clock className="w-3.5 h-3.5 text-[#e4002b]" />
                <span>Open Daily: {settings.openingHours}</span>
              </p>
            </div>
          </div>

          {/* Chakwal Delivery Sectors */}
          <div className="md:col-span-4 space-y-2">
            <h4 className={`font-bold uppercase text-xs tracking-wider ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              Chakwal Delivery Coverage
            </h4>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {chakwalAreas.slice(0, 10).map((area) => (
                <span
                  key={area.id}
                  className={`px-2.5 py-1 rounded-lg text-[11px] border ${
                    isDark ? 'bg-[#18181c] border-[#26262e] text-zinc-300' : 'bg-white border-zinc-200 text-zinc-700 shadow-sm'
                  }`}
                >
                  {area.name}
                </span>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="md:col-span-3 space-y-3">
            <h4 className={`font-bold uppercase text-xs tracking-wider ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              Accepted Payments
            </h4>
            <div className="space-y-1.5 text-xs">
              {activePayments.map((p) => (
                <div
                  key={p.id}
                  className={`border p-2 rounded-xl flex items-center justify-between ${
                    isDark ? 'bg-[#16161a] border-[#25252c] text-zinc-300' : 'bg-white border-zinc-200 text-zinc-800'
                  }`}
                >
                  <span className="font-medium">{p.name}</span>
                  <span className="text-[10px] text-emerald-500 font-bold">Enabled</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Legal & Notice */}
        <div className={`mt-8 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] ${
          isDark ? 'border-[#1c1c22] text-zinc-500' : 'border-zinc-200 text-zinc-500'
        }`}>
          <p>{copyrightText}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 text-center sm:text-right">
            <p>
              Independent Chakwal delivery portal · Delivery fee Rs {settings.deliveryFee} · PKR only.
            </p>
            <span>·</span>
            <button
              onClick={() => setIsAdminLoginModalOpen(true)}
              className="text-zinc-500 hover:text-[#e4002b] flex items-center gap-1 cursor-pointer transition-colors"
              title="Store Manager Login"
            >
              <Lock className="w-3 h-3 text-[#e4002b]" />
              <span>{isAdmin ? 'Admin Mode Active' : 'Store Admin'}</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

