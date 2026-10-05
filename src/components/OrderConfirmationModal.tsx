import React, { useState, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Bike, 
  Phone, 
  X, 
  Sparkles, 
  ChefHat, 
  RotateCcw, 
  Camera, 
  Copy, 
  Check, 
  FileText,
  MessageSquare
} from 'lucide-react';

export const OrderConfirmationModal: React.FC = () => {
  const { 
    activeOrder, 
    clearActiveOrder, 
    formatPKR, 
    settings, 
    themeMode,
    repeatOrder 
  } = useStore();

  const [copiedSlip, setCopiedSlip] = useState(false);
  const receiptCardRef = useRef<HTMLDivElement>(null);

  if (!activeOrder) return null;

  const isDark = themeMode === 'dark';

  const handleRepeatOrder = () => {
    repeatOrder(activeOrder);
    clearActiveOrder();
  };

  const handleCopySlipText = () => {
    const itemsText = activeOrder.items
      .map((item) => `• ${item.quantity}x ${item.menuItem.name} - ${formatPKR(item.unitPrice * item.quantity)}`)
      .join('\n');

    const slip = `🍗 KFC CHAKWAL DELIVERY - OFFICIAL RECEIPT\n` +
      `Order #: ${activeOrder.id}\n` +
      `Date: ${new Date(activeOrder.date).toLocaleString()}\n` +
      `----------------------------------------\n` +
      `Customer: ${activeOrder.customer.fullName}\n` +
      `Phone: ${activeOrder.customer.phone}\n` +
      `Address: ${activeOrder.customer.address}\n` +
      (activeOrder.specialInstructions ? `Kitchen Notes: ${activeOrder.specialInstructions}\n` : '') +
      `----------------------------------------\n` +
      `ITEMS:\n${itemsText}\n` +
      `----------------------------------------\n` +
      `Subtotal: ${formatPKR(activeOrder.subtotal)}\n` +
      `Delivery Fee: ${activeOrder.deliveryFee > 0 ? formatPKR(activeOrder.deliveryFee) : 'FREE'}\n` +
      (activeOrder.discount > 0 ? `Discount: -${formatPKR(activeOrder.discount)}\n` : '') +
      (activeOrder.loyaltyDiscount ? `Loyalty Discount: -${formatPKR(activeOrder.loyaltyDiscount)}\n` : '') +
      `TOTAL BILL: ${formatPKR(activeOrder.total)} (PKR)\n` +
      `Payment: ${activeOrder.paymentMethod.toUpperCase()}\n` +
      `Status: CONFIRMED - Express Delivery Within Chakwal\n` +
      `Helpline: +92 325 2777574`;

    navigator.clipboard.writeText(slip);
    setCopiedSlip(true);
    setTimeout(() => setCopiedSlip(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className={`border rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] ${
        isDark ? 'bg-[#15151a] border-[#2b2b35] text-white' : 'bg-white border-zinc-200 text-zinc-900'
      }`}>
        
        {/* Top Header */}
        <div className="bg-[#e4002b] p-5 sm:p-6 text-center text-white relative shadow-md">
          <button
            onClick={clearActiveOrder}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1.5 rounded-full bg-black/20 hover:bg-black/30 cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-[#e4002b] mx-auto shadow-xl mb-2.5 animate-bounce">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="text-[10px] font-black uppercase tracking-widest bg-black/20 px-3 py-1 rounded-full">
            Order Confirmed & Sent to Fleet
          </span>

          <h2 className="font-kfc text-2xl sm:text-3xl font-black uppercase mt-1.5">
            THANK YOU FOR YOUR ORDER!
          </h2>

          <p className="text-white/90 text-xs mt-0.5">
            Order Reference: <strong className="font-mono text-base tracking-wider bg-black/30 px-2 py-0.5 rounded-md ml-1">{activeOrder.id}</strong>
          </p>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          
          {/* Action Quick Bar: Copy / Screenshot Tip */}
          <div className="flex items-center justify-between text-xs bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl text-amber-600 dark:text-amber-400">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 shrink-0" />
              <span className="font-semibold text-[11px]">
                Neechay di gayi <strong>Order Summary Slip</strong> ka screenshot le kar apne paas save rakhein!
              </span>
            </div>
            <button
              onClick={handleCopySlipText}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 font-bold text-[11px] shrink-0 flex items-center gap-1 cursor-pointer transition"
            >
              {copiedSlip ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSlip ? 'Copied!' : 'Copy Slip'}</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* SCREENSHOT-FRIENDLY RECEIPT SLIP CARD */}
          {/* ========================================================================= */}
          <div 
            ref={receiptCardRef}
            className="p-5 rounded-2xl border-2 border-dashed border-[#e4002b]/40 bg-white text-zinc-900 shadow-md space-y-3 font-sans relative"
          >
            {/* Top Receipt Header */}
            <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#e4002b] text-white flex items-center justify-center font-black text-xs">
                  KFC
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-tight text-zinc-900 leading-none">
                    KFC Chakwal Delivery
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
                    Official Order Receipt Slip
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs font-black text-[#e4002b] block">
                  #{activeOrder.id}
                </span>
                <span className="text-[10px] text-zinc-500 block">
                  {new Date(activeOrder.date).toLocaleDateString()} · {new Date(activeOrder.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Customer Details Box */}
            <div className="grid grid-cols-2 gap-2 text-[11px] bg-zinc-50 p-2.5 rounded-xl border border-zinc-200">
              <div>
                <span className="text-zinc-500 block text-[9px] uppercase font-bold">Customer</span>
                <span className="font-bold text-zinc-900">{activeOrder.customer.fullName}</span>
                <span className="text-zinc-600 block text-[10px]">{activeOrder.customer.phone}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[9px] uppercase font-bold">Delivery Zone</span>
                <span className="font-bold text-zinc-900 truncate block">{activeOrder.customer.address}</span>
                <span className="text-emerald-700 block text-[10px] font-bold">Chakwal City (Within 3 KM)</span>
              </div>
            </div>

            {/* Kitchen Instructions (if present) */}
            {activeOrder.specialInstructions && (
              <div className="bg-amber-50 border border-amber-300 p-2 rounded-xl text-[11px] text-amber-900 flex items-start gap-1.5">
                <ChefHat className="w-4 h-4 text-[#e4002b] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[10px] uppercase tracking-wider text-amber-800">Special Kitchen Notes:</strong>
                  <span>{activeOrder.specialInstructions}</span>
                </div>
              </div>
            )}

            {/* Items Table */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[10px] font-black uppercase text-zinc-500 border-b border-zinc-200 pb-1">
                <span>Item Description</span>
                <span>Amount</span>
              </div>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {activeOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start text-xs py-0.5 border-b border-zinc-100 last:border-0">
                    <div className="pr-2">
                      <span className="font-bold text-zinc-900">{item.quantity}x {item.menuItem.name}</span>
                      {(item.options.spiceLevel || item.options.drink || (item.options.addons && item.options.addons.length > 0)) && (
                        <p className="text-[10px] text-zinc-500">
                          {item.options.spiceLevel && <span>[{item.options.spiceLevel}] </span>}
                          {item.options.drink && <span>[{item.options.drink}] </span>}
                          {item.options.addons && item.options.addons.length > 0 && (
                            <span>(+{item.options.addons.map(a => a.name).join(', ')})</span>
                          )}
                        </p>
                      )}
                    </div>
                    <span className="font-mono font-bold text-zinc-900 shrink-0">
                      {formatPKR(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="pt-2 border-t-2 border-zinc-900 space-y-1 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal:</span>
                <span className="font-mono font-bold text-zinc-900">{formatPKR(activeOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Delivery Charges:</span>
                <span className="font-mono font-bold text-zinc-900">
                  {activeOrder.deliveryFee > 0 ? formatPKR(activeOrder.deliveryFee) : 'FREE'}
                </span>
              </div>
              {activeOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount:</span>
                  <span className="font-mono">-{formatPKR(activeOrder.discount)}</span>
                </div>
              )}
              {activeOrder.loyaltyDiscount && activeOrder.loyaltyDiscount > 0 && (
                <div className="flex justify-between text-amber-600 font-bold">
                  <span>Loyalty Points Discount:</span>
                  <span className="font-mono">-{formatPKR(activeOrder.loyaltyDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-zinc-900 pt-1 border-t border-zinc-300">
                <span>Total Payable:</span>
                <span className="text-base text-[#e4002b] font-mono">{formatPKR(activeOrder.total)}</span>
              </div>
              <div className="flex justify-between text-[10px] text-zinc-500 pt-0.5">
                <span>Payment Method:</span>
                <span className="font-bold text-zinc-800 uppercase">{activeOrder.paymentMethod}</span>
              </div>
            </div>

            {/* Bottom Receipt Footer */}
            <div className="pt-2 border-t border-zinc-200 text-center text-[10px] text-zinc-500 font-medium">
              ★ Picked from Kallar Kahar Motorway Branch · Delivered to Chakwal before 8:00 PM ★
            </div>
          </div>

          {/* Stepper Visual */}
          <div className={`border p-3.5 rounded-2xl ${
            isDark ? 'bg-[#111115] border-[#25252e]' : 'bg-zinc-50 border-zinc-200'
          }`}>
            <div className="flex items-center justify-between text-xs mb-2.5">
              <span className="font-bold flex items-center gap-1.5">
                <ChefHat className="w-4 h-4 text-[#e4002b]" />
                <span>Delivery Fleet Status</span>
              </span>
              <span className="text-[#e4002b] font-black">Delivery before 8:00 PM</span>
            </div>

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

          {/* Direct WhatsApp Confirmation Button */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <a
              href={`https://wa.me/923252777574?text=${encodeURIComponent(
                `🍗 *KFC CHAKWAL DELIVERY - ORDER CONFIRMATION*\n` +
                `Assalam o Alaikum, mera order receive ho gaya hai!\n` +
                `Order ID: #${activeOrder.id}\n` +
                `Name: ${activeOrder.customer.fullName}\n` +
                `Phone: ${activeOrder.customer.phone}\n` +
                `Address: ${activeOrder.customer.address}\n` +
                (activeOrder.specialInstructions ? `Kitchen Notes: ${activeOrder.specialInstructions}\n` : '') +
                `Total Bill: ${formatPKR(activeOrder.total)}\n` +
                `Please confirm rider dispatch timing from Kallar Kahar.`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="min-h-[46px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg cursor-pointer transition active:scale-95"
              aria-label="Confirm on WhatsApp"
            >
              <Phone className="w-4 h-4" />
              <span>WhatsApp Slip (+92 325 2777574)</span>
            </a>

            <a
              href="tel:+923252777574"
              className="min-h-[46px] bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs py-3 px-4 rounded-2xl flex items-center justify-center gap-2 border border-zinc-700 shadow-md cursor-pointer transition active:scale-95"
              aria-label="Call KFC Helpline"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Call Helpline (+92 325 2777574)</span>
            </a>
          </div>
        </div>

        {/* Modal Bottom Buttons: REPEAT ORDER & Return Home */}
        <div className={`p-4 border-t flex flex-col sm:flex-row gap-2.5 ${
          isDark ? 'bg-[#101014] border-[#25252e]' : 'bg-zinc-50 border-zinc-200'
        }`}>
          {/* REPEAT ORDER BUTTON */}
          <button
            type="button"
            onClick={handleRepeatOrder}
            className="flex-1 min-h-[46px] bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black text-xs py-3 px-3 rounded-2xl cursor-pointer flex items-center justify-center gap-2 shadow-md transition active:scale-95"
            aria-label="Repeat this order"
          >
            <RotateCcw className="w-4 h-4" />
            <span>🔁 Repeat This Order (Order Again)</span>
          </button>

          {/* Back to Menu */}
          <button
            type="button"
            onClick={clearActiveOrder}
            className="flex-1 min-h-[46px] bg-[#e4002b] hover:bg-[#c30025] text-white font-bold text-xs py-3 px-3 rounded-2xl cursor-pointer transition active:scale-95 flex items-center justify-center"
            aria-label="Continue ordering or return to home menu"
          >
            <span>Continue Ordering (Back to Menu)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
