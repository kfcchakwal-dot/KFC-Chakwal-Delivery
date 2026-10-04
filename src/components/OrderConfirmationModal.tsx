import React from 'react';
import { useStore } from '../context/StoreContext';
import { CheckCircle2, Clock, MapPin, Bike, Phone, X, Sparkles, ChefHat } from 'lucide-react';

export const OrderConfirmationModal: React.FC = () => {
  const { activeOrder, clearActiveOrder, formatPKR, settings, themeMode } = useStore();

  if (!activeOrder) return null;

  const isDark = themeMode === 'dark';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className={`border rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl ${
        isDark ? 'bg-[#15151a] border-[#2b2b35] text-white' : 'bg-white border-zinc-200 text-zinc-900'
      }`}>
        
        {/* Top Header */}
        <div className="bg-[#e4002b] p-6 text-center text-white relative shadow-md">
          <button
            onClick={clearActiveOrder}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1.5 rounded-full bg-black/20 hover:bg-black/30 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-[#e4002b] mx-auto shadow-xl mb-3 animate-bounce">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <span className="text-[11px] font-black uppercase tracking-widest bg-black/20 px-3 py-1 rounded-full">
            Order Confirmed & Sent to Kallar Kahar Fleet
          </span>

          <h2 className="font-kfc text-3xl sm:text-4xl font-black uppercase mt-2">
            THANK YOU FOR YOUR ORDER!
          </h2>

          <p className="text-white/90 text-xs mt-1">
            Order Reference: <strong className="font-mono text-sm">{activeOrder.id}</strong>
          </p>
        </div>

        {/* Order Status Stepper */}
        <div className="p-4 sm:p-6 space-y-5">
          <div className={`border p-4 rounded-2xl ${
            isDark ? 'bg-[#111115] border-[#25252e]' : 'bg-zinc-50 border-zinc-200'
          }`}>
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="font-bold flex items-center gap-1.5">
                <ChefHat className="w-4 h-4 text-[#e4002b]" />
                <span>KFC Pickup & Delivery Timing</span>
              </span>
              <span className="text-[#e4002b] font-black">Before 8:00 PM</span>
            </div>

            {/* Stepper visual */}
            <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
              <div className="space-y-1">
                <div className="h-1.5 bg-[#e4002b] rounded-full"></div>
                <span className="font-bold text-[#e4002b]">Confirmed</span>
              </div>
              <div className="space-y-1">
                <div className="h-1.5 bg-[#e4002b] rounded-full animate-pulse"></div>
                <span className="font-bold text-amber-500">Kallar Kahar</span>
              </div>
              <div className="space-y-1">
                <div className="h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full"></div>
                <span className="text-zinc-400">On Highway</span>
              </div>
              <div className="space-y-1">
                <div className="h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full"></div>
                <span className="text-zinc-400">Delivered</span>
              </div>
            </div>
          </div>

          {/* Delivery Details Card */}
          <div className={`border p-4 rounded-2xl space-y-2 text-xs ${
            isDark ? 'bg-[#1a1a21] border-[#292934]' : 'bg-zinc-50 border-zinc-200'
          }`}>
            <div className="flex items-center gap-2 font-bold border-b border-zinc-700/20 pb-2">
              <MapPin className="w-4 h-4 text-[#e4002b]" />
              <span>Chakwal Delivery Information (Within 3 KM)</span>
            </div>
            <div className="space-y-1 pt-1 text-zinc-400">
              <p><strong className={isDark ? 'text-white' : 'text-zinc-900'}>Customer:</strong> {activeOrder.customer.fullName} ({activeOrder.customer.phone})</p>
              <p><strong className={isDark ? 'text-white' : 'text-zinc-900'}>Address:</strong> {activeOrder.customer.address}</p>
              <p><strong className={isDark ? 'text-white' : 'text-zinc-900'}>Payment Method:</strong> {activeOrder.paymentMethod.toUpperCase()}</p>
            </div>
          </div>

          {/* Ordered Items Summary */}
          <div className={`border p-4 rounded-2xl space-y-2 text-xs ${
            isDark ? 'bg-[#1a1a21] border-[#292934]' : 'bg-zinc-50 border-zinc-200'
          }`}>
            <div className="flex justify-between items-center font-bold border-b border-zinc-700/20 pb-2">
              <span>Items in Order ({activeOrder.items.length})</span>
              <span className="font-mono text-[#e4002b]">{formatPKR(activeOrder.total)}</span>
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {activeOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-[11px]">
                  <span>{item.quantity}x {item.menuItem.name}</span>
                  <span className="font-mono">{formatPKR(item.unitPrice * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Direct WhatsApp Confirmation & Notification Banner */}
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs space-y-1 text-center">
            <p className="font-bold text-emerald-600 flex items-center justify-center gap-1.5">
              <span>✓ Order Confirmation Message Ready</span>
            </p>
            <p className={`text-[11px] ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
              Aapka order receive ho chuka hai. WhatsApp par live receipt dekhne ya rider coordinate karne ke liye neechay button dabayein:
            </p>
          </div>

          <a
            href={`https://wa.me/923252777574?text=${encodeURIComponent(
              `🍗 *KFC CHAKWAL DELIVERY - ORDER CONFIRMATION*\n` +
              `Assalam o Alaikum, mera order receive ho gaya hai!\n` +
              `Order ID: #${activeOrder.id}\n` +
              `Name: ${activeOrder.customer.fullName}\n` +
              `Phone: ${activeOrder.customer.phone}\n` +
              `Address: ${activeOrder.customer.address}\n` +
              `Total Bill: ${formatPKR(activeOrder.total)}\n` +
              `Please confirm rider dispatch timing from Kallar Kahar.`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg cursor-pointer transition active:scale-95"
          >
            <Phone className="w-4 h-4" />
            <span>Open WhatsApp Live Receipt (+92 325 2777574)</span>
          </a>

          <button
            onClick={clearActiveOrder}
            className="w-full bg-[#e4002b] hover:bg-[#c30025] text-white font-bold text-xs py-3 rounded-2xl cursor-pointer"
          >
            Back to Home
          </button>
        </div>

      </div>
    </div>
  );
};
