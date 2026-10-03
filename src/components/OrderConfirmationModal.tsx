import React from 'react';
import { useStore } from '../context/StoreContext';
import { CheckCircle2, Clock, MapPin, Bike, Phone, X, Sparkles, ChefHat } from 'lucide-react';

export const OrderConfirmationModal: React.FC = () => {
  const { activeOrder, clearActiveOrder, formatPKR, settings } = useStore();

  if (!activeOrder) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#161619] border border-[#2d2d36] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="bg-gradient-to-b from-[#22070a] to-[#161619] p-6 text-center border-b border-[#282830] relative">
          <button
            onClick={clearActiveOrder}
            className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg bg-black/40 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 bg-[#e4002b] rounded-full flex items-center justify-center text-white mx-auto shadow-xl shadow-red-950/60 mb-3 animate-bounce">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <span className="text-[11px] font-black uppercase tracking-widest text-[#e4002b] bg-red-950/60 px-3 py-1 rounded-full border border-red-900/60">
            Order Confirmed & Sent to Kitchen
          </span>

          <h2 className="font-kfc text-3xl sm:text-4xl font-black text-white uppercase mt-2">
            THANK YOU FOR YOUR ORDER!
          </h2>

          <p className="text-zinc-400 text-xs mt-1">
            Order Reference: <strong className="text-white font-mono text-sm">{activeOrder.id}</strong>
          </p>
        </div>

        {/* Order Status Stepper */}
        <div className="p-4 sm:p-6 space-y-6">
          <div className="bg-[#121214] border border-[#26262e] p-4 rounded-xl">
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="font-bold text-white flex items-center gap-1.5">
                <ChefHat className="w-4 h-4 text-[#e4002b]" />
                Estimated Chakwal Delivery
              </span>
              <span className="text-[#e4002b] font-black">35 - 45 Mins</span>
            </div>

            {/* Stepper visual */}
            <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
              <div className="space-y-1">
                <div className="h-1.5 bg-[#e4002b] rounded-full"></div>
                <span className="font-bold text-white">Received</span>
              </div>
              <div className="space-y-1">
                <div className="h-1.5 bg-[#e4002b] rounded-full animate-pulse"></div>
                <span className="font-bold text-red-400">Cooking</span>
              </div>
              <div className="space-y-1">
                <div className="h-1.5 bg-zinc-700 rounded-full"></div>
                <span className="text-zinc-500">Rider Dispatched</span>
              </div>
              <div className="space-y-1">
                <div className="h-1.5 bg-zinc-700 rounded-full"></div>
                <span className="text-zinc-500">Delivered</span>
              </div>
            </div>
          </div>

          {/* Delivery Details Card */}
          <div className="bg-[#1c1c20] border border-[#2a2a33] p-4 rounded-xl space-y-2 text-xs">
            <div className="flex items-center gap-2 text-zinc-300 font-bold border-b border-[#2e2e38] pb-2">
              <MapPin className="w-4 h-4 text-[#e4002b]" />
              <span>Delivery Details</span>
            </div>
            <div className="text-zinc-400 space-y-1 pt-1">
              <p><strong className="text-white">Customer:</strong> {activeOrder.customer.fullName} ({activeOrder.customer.phone})</p>
              <p><strong className="text-white">Chakwal Area:</strong> {activeOrder.customer.area}</p>
              <p><strong className="text-white">Address:</strong> {activeOrder.customer.address}</p>
              {activeOrder.customer.landmark && (
                <p><strong className="text-white">Landmark:</strong> {activeOrder.customer.landmark}</p>
              )}
              <p><strong className="text-white">Payment Method:</strong> {activeOrder.paymentMethod.toUpperCase()}</p>
            </div>
          </div>

          {/* Itemized Summary */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Ordered Items
            </h4>
            <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
              {activeOrder.items.map((i) => (
                <div key={i.cartItemId} className="flex justify-between text-xs text-zinc-300 bg-[#121214] p-2.5 rounded-lg border border-[#222228]">
                  <div>
                    <span className="font-bold text-white">{i.quantity}x {i.menuItem.name}</span>
                    {i.options.spiceLevel && (
                      <span className="text-[10px] text-amber-400 block">· {i.options.spiceLevel}</span>
                    )}
                    {i.options.drink && (
                      <span className="text-[10px] text-zinc-400 block">· {i.options.drink}</span>
                    )}
                  </div>
                  <span className="font-bold text-white tabular-nums">
                    {formatPKR(i.unitPrice * i.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Bill Totals */}
            <div className="bg-[#121214] border border-[#24242c] p-3 rounded-xl space-y-1.5 text-xs text-zinc-400">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="text-white font-bold tabular-nums">{formatPKR(activeOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Chakwal Delivery Fee</span>
                <span className="text-white font-bold tabular-nums">{formatPKR(activeOrder.deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-[#26262e]">
                <span>Total Amount (PKR)</span>
                <span className="text-[#e4002b] text-lg font-black tabular-nums">
                  {formatPKR(activeOrder.total)}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-[#121214] border-t border-[#282830] flex items-center justify-between gap-3">
          <a
            href={`tel:${settings.phone}`}
            className="flex items-center gap-1.5 text-xs font-bold text-zinc-300 hover:text-white px-3 py-2 rounded-lg bg-[#1c1c20] border border-[#2e2e36]"
          >
            <Phone className="w-3.5 h-3.5 text-[#e4002b]" />
            <span>Call Branch ({settings.phone})</span>
          </a>

          <button
            type="button"
            onClick={clearActiveOrder}
            className="bg-[#e4002b] hover:bg-[#c30025] text-white text-xs font-bold uppercase px-5 py-2.5 rounded-xl cursor-pointer transition-colors"
          >
            Back to Menu
          </button>
        </div>

      </div>
    </div>
  );
};
