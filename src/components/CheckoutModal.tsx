import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { CustomerDetails, PaymentMethod } from '../types';
import { X, Check, Bike, Phone, MapPin, Building, CreditCard, MessageSquare, ShieldCheck, ArrowRight } from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartSubtotal,
    effectiveDeliveryFee,
    cartTotal,
    formatPKR,
    orderType,
    createOrder,
    settings,
    currentUser,
    themeMode,
  } = useStore();

  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [formError, setFormError] = useState('');

  if (!isCheckoutOpen) return null;

  const isDark = themeMode === 'dark';
  const availablePaymentMethods = settings.paymentMethods?.filter((p) => p.enabled) || [
    { id: 'cod', name: 'Cash on Delivery (COD)' },
  ];

  const handlePlaceOrder = (isWhatsApp: boolean = false) => {
    if (!fullName.trim()) {
      setFormError('Please enter your Name');
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      setFormError('Please enter a valid Phone Number (e.g. 0300-1234567)');
      return;
    }
    if (!address.trim()) {
      setFormError('Please enter your Delivery Address in Chakwal');
      return;
    }

    setFormError('');

    const customer: CustomerDetails = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      area: 'Chakwal',
    };

    const newOrder = createOrder(customer, paymentMethod);

    if (isWhatsApp) {
      // Build WhatsApp order message
      const itemsList = newOrder.items
        .map(
          (i) =>
            `• ${i.quantity}x ${i.menuItem.name} (${formatPKR(i.unitPrice * i.quantity)})${
              i.options.spiceLevel ? ` [${i.options.spiceLevel}]` : ''
            }${i.options.drink ? ` [${i.options.drink}]` : ''}`
        )
        .join('\n');

      const message = `🍗 *NEW ORDER - KFC CHAKWAL DELIVERY*\n` +
        `Order ID: #${newOrder.id}\n` +
        `-------------------------\n` +
        `*Items Ordered:*\n${itemsList}\n` +
        `-------------------------\n` +
        `Subtotal: ${formatPKR(newOrder.subtotal)}\n` +
        `Delivery Charges: ${formatPKR(newOrder.deliveryFee)}\n` +
        `*Total Amount: ${formatPKR(newOrder.total)} (PKR)*\n` +
        `Payment: ${newOrder.paymentMethod.toUpperCase()}\n` +
        `-------------------------\n` +
        `*Customer Details:*\n` +
        `Name: ${customer.fullName}\n` +
        `Phone: ${customer.phone}\n` +
        `Address: ${customer.address}\n`;

      const encodedMessage = encodeURIComponent(message);
      const cleanPhone = settings.whatsappNumber.replace(/[^0-9]/g, '');
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
      const a = document.createElement('a');
      a.href = waUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    setIsCheckoutOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className={`border rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] ${
        isDark ? 'bg-[#161619] border-[#2d2d36] text-white' : 'bg-white border-zinc-200 text-zinc-900'
      }`}>
        
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
          isDark ? 'bg-[#121214] border-[#282830]' : 'bg-zinc-50 border-zinc-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#e4002b] rounded-lg flex items-center justify-center text-white font-black text-sm">
              KFC
            </div>
            <div>
              <h2 className="font-kfc text-2xl font-black uppercase tracking-tight leading-none">
                Chakwal Delivery Checkout
              </h2>
              <p className="text-zinc-400 text-xs">
                Flat Delivery Rs {settings.deliveryFee} across Chakwal
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCheckoutOpen(false)}
            className={`p-2 rounded-lg cursor-pointer ${
              isDark ? 'text-zinc-400 hover:text-white bg-[#1c1c20]' : 'text-zinc-500 hover:text-zinc-900 bg-zinc-200'
            }`}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - ONLY 3 Requested Fields: Name, Phone Number, and Address */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          
          {formError && (
            <div className="p-3 bg-red-950/80 border border-red-800 text-red-200 text-xs rounded-xl flex items-center gap-2">
              <span className="font-bold">Error:</span>
              <span>{formError}</span>
            </div>
          )}

          {/* 3 Simple Fields Container */}
          <div className={`p-4 sm:p-5 rounded-2xl border space-y-4 ${
            isDark ? 'bg-[#121214] border-[#26262e]' : 'bg-zinc-50 border-zinc-200'
          }`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#e4002b] flex items-center gap-1.5">
              <span>Customer Information</span>
            </h3>

            {/* Field 1: Name */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                1. Your Name *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Malik Usman"
                className={`w-full text-xs rounded-xl px-3.5 py-2.5 border focus:outline-none focus:border-[#e4002b] ${
                  isDark ? 'bg-[#1c1c20] border-[#2e2e36] text-white' : 'bg-white border-zinc-300 text-zinc-900'
                }`}
                required
              />
            </div>

            {/* Field 2: Phone */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                2. Phone Number *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0300-1234567"
                className={`w-full text-xs rounded-xl px-3.5 py-2.5 border focus:outline-none focus:border-[#e4002b] ${
                  isDark ? 'bg-[#1c1c20] border-[#2e2e36] text-white' : 'bg-white border-zinc-300 text-zinc-900'
                }`}
                required
              />
            </div>

            {/* Field 3: Address */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                3. Complete Delivery Address in Chakwal *
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House / Street #, Mohallah, Landmark, Chakwal"
                className={`w-full text-xs rounded-xl px-3.5 py-2.5 border focus:outline-none focus:border-[#e4002b] ${
                  isDark ? 'bg-[#1c1c20] border-[#2e2e36] text-white' : 'bg-white border-zinc-300 text-zinc-900'
                }`}
                required
              />
            </div>
          </div>

          {/* Payment Method Selection (Customizable by Admin) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
              Select Payment Option
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {availablePaymentMethods.map((pm) => {
                const isSelected = paymentMethod === pm.id;
                return (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id as PaymentMethod)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#e4002b] bg-[#e4002b]/15 text-[#e4002b] font-bold'
                        : isDark ? 'border-[#2e2e36] bg-[#121214] text-zinc-300' : 'border-zinc-200 bg-white text-zinc-700'
                    }`}
                  >
                    <p className="text-xs font-bold">{pm.name}</p>
                    {pm.accountNumber && (
                      <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                        {pm.accountNumber} {pm.accountTitle ? `(${pm.accountTitle})` : ''}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Order Bill Summary */}
          <div className={`p-4 rounded-xl border space-y-1.5 text-xs ${
            isDark ? 'bg-[#121214] border-[#282830]' : 'bg-zinc-100 border-zinc-200'
          }`}>
            <div className="flex justify-between text-zinc-400">
              <span>Items Total ({cart.length})</span>
              <span className="font-bold tabular-nums">{formatPKR(cartSubtotal)}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Chakwal Delivery Fee</span>
              <span className="font-bold tabular-nums">{formatPKR(effectiveDeliveryFee)}</span>
            </div>
            <div className="flex justify-between font-black text-sm pt-2 border-t border-zinc-700/30">
              <span>Payable Total (PKR)</span>
              <span className="text-base text-[#e4002b] tabular-nums">{formatPKR(cartTotal)}</span>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className={`p-4 sm:p-5 border-t flex flex-col sm:flex-row items-center gap-3 ${
          isDark ? 'bg-[#121214] border-[#282830]' : 'bg-zinc-50 border-zinc-200'
        }`}>
          {/* Order via WhatsApp */}
          <button
            type="button"
            onClick={() => handlePlaceOrder(true)}
            className="w-full sm:w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Order via WhatsApp</span>
          </button>

          {/* Confirm & Place Order */}
          <button
            type="button"
            onClick={() => handlePlaceOrder(false)}
            className="w-full sm:w-1/2 bg-[#e4002b] hover:bg-[#c30025] text-white font-kfc uppercase text-lg py-3 px-4 rounded-xl font-black flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xl active:scale-95"
          >
            <span>CONFIRM & PLACE ORDER</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
