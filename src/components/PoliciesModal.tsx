import React from 'react';
import { useStore } from '../context/StoreContext';
import { X, FileText, Bike, Clock, MapPin, Sparkles, ShieldCheck } from 'lucide-react';

export const PoliciesModal: React.FC = () => {
  const { 
    isPoliciesModalOpen, 
    setIsPoliciesModalOpen, 
    policies, 
    activePolicySlug, 
    settings,
    themeMode 
  } = useStore();

  if (!isPoliciesModalOpen) return null;

  const isDark = themeMode === 'dark';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden ${
        isDark ? 'bg-[#151518] border-[#292934] text-white' : 'bg-white border-zinc-200 text-zinc-900'
      }`}>
        {/* Header */}
        <div className="bg-[#e4002b] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5" />
            <div>
              <h3 className="font-kfc text-2xl font-black uppercase tracking-tight">
                Store Policies & Guidelines
              </h3>
              <p className="text-white/80 text-xs">
                KFC Chakwal Delivery Information & Loyalty Rules
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsPoliciesModalOpen(false)}
            className="text-white/80 hover:text-white p-1.5 rounded-full bg-black/20 hover:bg-black/40 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Highlights Strip */}
        <div className="p-4 bg-[#1a1a22] border-b border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-zinc-300">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-black/30">
            <Bike className="w-4 h-4 text-[#e4002b] shrink-0" />
            <span>Kallar Kahar ➔ Chakwal</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-black/30">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Cut-off: 4 PM (Delivery 8 PM)</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-black/30">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Radius: Within 3 KM</span>
          </div>
        </div>

        {/* Policies List */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {policies.map((policy) => {
            const isTargeted = activePolicySlug === policy.slug;

            return (
              <div
                key={policy.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isTargeted 
                    ? 'border-[#e4002b] bg-[#e4002b]/10' 
                    : isDark ? 'bg-[#191920] border-[#2a2a35]' : 'bg-zinc-50 border-zinc-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#e4002b]"></span>
                  <h4 className="font-bold text-sm text-white">{policy.title}</h4>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed pl-4">
                  {policy.content}
                </p>
              </div>
            );
          })}

          {/* Help Contact Box */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-white">Have a specific question or custom order?</p>
              <p className="text-emerald-400 mt-0.5">Contact WhatsApp: +92 325 2777574</p>
            </div>
            <a
              href="https://wa.me/923252777574"
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl cursor-pointer"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 flex justify-end">
          <button
            onClick={() => setIsPoliciesModalOpen(false)}
            className="text-xs font-bold text-white px-5 py-2 rounded-xl bg-[#e4002b] hover:bg-[#c30025] cursor-pointer"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
