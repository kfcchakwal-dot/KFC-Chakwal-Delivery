import React from 'react';
import { useStore } from '../context/StoreContext';
import { MapPin, Phone, Clock, ShieldCheck, Bike, Share2, FileText, Smartphone } from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings, themeMode, openPolicyModal } = useStore();

  const isDark = themeMode === 'dark';
  const logoUrl = settings.headerFooter?.logoUrl;
  const aboutText = settings.headerFooter?.footerAboutText ||
    'Ye KFC Chakwal Delivery ek alag se delivery service hai hamari, Hum Kallar Kahar Motorway wali KFC branch se KFC pick kar ky Chakwal mein daily deliver karty hein.';
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
                <a href="tel:+923252777574" className="text-[11px] text-zinc-500 hover:text-[#e4002b] transition block mt-0.5">
                  {settings.phone}
                </a>
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

          {/* Chakwal Delivery Coverage (Strictly Within 3 KM) */}
          <div className="md:col-span-4 space-y-3">
            <h4 className={`font-bold uppercase text-xs tracking-wider ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              Chakwal Delivery Coverage (Within 3 KM)
            </h4>
            <div className={`p-3 rounded-2xl border text-xs space-y-1.5 ${
              isDark ? 'bg-[#151519] border-[#25252e]' : 'bg-white border-zinc-200 shadow-sm'
            }`}>
              <div className="flex items-center gap-1.5 text-[#e4002b] font-bold text-[11px]">
                <Bike className="w-3.5 h-3.5 shrink-0" />
                <span>Kallar Kahar ➔ Chakwal Service</span>
              </div>
              <p className="text-[11px] leading-relaxed text-zinc-400">
                Delivery Area: <strong className="text-zinc-200">Within 3 KM of Chakwal City</strong>.
              </p>
              <p className="text-[10px] text-amber-400 font-semibold">
                ⏰ Daily 4:00 PM se pehly order karein, sham 8:00 PM tak fresh delivery receive karein.
              </p>
            </div>

            {/* Policies Button */}
            <button
              type="button"
              onClick={() => openPolicyModal()}
              className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                isDark ? 'bg-[#1b1b22] hover:bg-[#23232c] border-zinc-800 text-zinc-200' : 'bg-white hover:bg-zinc-50 border-zinc-300 text-zinc-800'
              }`}
            >
              <FileText className="w-4 h-4 text-[#e4002b]" />
              <span>Read Store & Loyalty Policies</span>
            </button>
          </div>

          {/* Social Links & Payment Methods */}
          <div className="md:col-span-3 space-y-3">
            <h4 className={`font-bold uppercase text-xs tracking-wider ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              Connect & Social Media
            </h4>
            
            {/* Social Media Links */}
            <div className="flex flex-wrap gap-2">
              <a
                href={settings.socialLinks?.whatsapp || `https://wa.me/923252777574?text=${encodeURIComponent('Assalam o Alaikum KFC Chakwal Delivery, I have an inquiry about KFC menu and order.')}`}
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                aria-label="Contact on WhatsApp"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
              {settings.socialLinks?.facebook && (
                <a
                  href={settings.socialLinks.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#1877F2] hover:bg-[#166fe5] text-white text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Facebook</span>
                </a>
              )}
              {settings.socialLinks?.instagram && (
                <a
                  href={settings.socialLinks.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Instagram</span>
                </a>
              )}
              {settings.socialLinks?.tiktok && (
                <a
                  href={settings.socialLinks.tiktok}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>TikTok</span>
                </a>
              )}
            </div>

            <div className="pt-1 space-y-1.5 text-xs">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Payment Methods</span>
              {activePayments.map((p) => (
                <div
                  key={p.id}
                  className={`border p-2 rounded-xl flex items-center justify-between ${
                    isDark ? 'bg-[#16161a] border-[#25252c] text-zinc-300' : 'bg-white border-zinc-200 text-zinc-800'
                  }`}
                >
                  <span className="font-medium text-[11px]">{p.name}</span>
                  <span className="text-[9px] text-emerald-500 font-bold uppercase">Accepted</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Legal & Notice (100% Customer Facing) */}
        <div className={`mt-8 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] ${
          isDark ? 'border-[#1c1c22] text-zinc-500' : 'border-zinc-200 text-zinc-500'
        }`}>
          <p className="select-none" title="KFC Chakwal Delivery">
            {copyrightText}
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 text-center sm:text-right">
            <p>
              Independent Chakwal express food delivery · Flat Rs {settings.deliveryFee} · Hot & Fresh.
            </p>
            <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">|</span>
            <span className="text-zinc-500">Customer Store</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

