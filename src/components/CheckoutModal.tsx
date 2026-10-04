import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { CustomerDetails, PaymentMethod } from '../types';
import { 
  X, 
  Bike, 
  MapPin, 
  ShieldCheck, 
  ArrowRight, 
  Award, 
  Sparkles,
  MessageSquare,
  Truck
} from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartSubtotal,
    effectiveDeliveryFee,
    cartTotal,
    discountAmount,
    appliedDiscount,
    loyaltyDiscountAmount,
    potentialPointsToEarn,
    formatPKR,
    createOrder,
    settings,
    currentUser,
    selectedDeliveryMethod,
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
    { id: 'jazzcash', name: 'JazzCash' },
    { id: 'easypaisa', name: 'Easypaisa' },
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
      area: 'Chakwal (Within 3 KM)',
    };

    const newOrder = createOrder(customer, paymentMethod);

    // Build complete WhatsApp message with Kallar Kahar service notice
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
      `Delivery Method: ${selectedDeliveryMethod.name}\n` +
      `Delivery Charges: ${newOrder.deliveryFee > 0 ? formatPKR(newOrder.deliveryFee) : 'FREE'}\n` +
      (newOrder.discount > 0 ? `Discount: -${formatPKR(newOrder.discount)}\n` : '') +
      (newOrder.loyaltyDiscount ? `Loyalty Points Discount: -${formatPKR(newOrder.loyaltyDiscount)}\n` : '') +
      `*Total Bill: ${formatPKR(newOrder.total)} (PKR)*\n` +
      `Payment: ${newOrder.paymentMethod.toUpperCase()}\n` +
      `-------------------------\n` +
      `*Customer Details:*\n` +
      `Name: ${customer.fullName}\n` +
      `Phone: ${customer.phone}\n` +
      `Address: ${customer.address}\n` +
      `Coverage: Within 3 KM of Chakwal City\n` +
      `Notice: KFC Kallar Kahar Motorway se pick ho kar sham 8:00 PM tak deliver hoga.\n`;

    const encodedMessage = encodeURIComponent(message);
    const cleanPhone = settings.whatsappNumber.replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

    if (isWhatsApp) {
      window.location.href = waUrl;
    }

    setIsCheckoutOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className={`border rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] ${
        isDark ? 'bg-[#15151a] border-[#2d2d38] text-white' : 'bg-white border-zinc-200 text-zinc-900'
      }`}>
        
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
          isDark ? 'bg-[#101014] border-[#25252e]' : 'bg-zinc-50 border-zinc-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#e4002b] rounded-xl flex items-center justify-center text-white font-black text-sm shadow">
              KFC
            </div>
            <div>
              <h2 className={`font-kfc text-2xl font-black uppercase tracking-tight leading-none ${
                isDark ? 'text-white' : 'text-zinc-900'
              }`}>
                Chakwal Delivery Checkout
              </h2>
              <p className="text-zinc-400 text-xs mt-0.5">
                {selectedDeliveryMethod.name} · Within 3 KM
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCheckoutOpen(false)}
            className={`p-2 rounded-xl cursor-pointer ${
              isDark ? 'text-zinc-400 hover:text-white bg-[#1c1c22]' : 'text-zinc-500 hover:text-zinc-900 bg-zinc-200'
            }`}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - 3 Customer Fields */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          
          {formError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-xl flex items-center gap-2 font-bold">
              <span>Error: {formError}</span>
            </div>
          )}

          {/* 3 Simple Fields Container */}
          <div className={`p-4 sm:p-5 rounded-2xl border space-y-4 ${
            isDark ? 'bg-[#121216] border-[#25252e]' : 'bg-zinc-50 border-zinc-200'
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
                  isDark ? 'bg-[#1a1a20] border-[#2d2d38] text-white' : 'bg-white border-zinc-300 text-zinc-900'
                }`}
                required
              />
            </div>

            {/* Field 2: Phone */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                2. Phone Number * (Orders confirmed via WhatsApp/Call)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0300-1234567"
                className={`w-full text-xs rounded-xl px-3.5 py-2.5 border focus:outline-none focus:border-[#e4002b] ${
                  isDark ? 'bg-[#1a1a20] border-[#2d2d38] text-white' : 'bg-white border-zinc-300 text-zinc-900'
                }`}
                required
              />
            </div>

            {/* Field 3: Address */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                3. Complete Delivery Address in Chakwal (Within 3 KM) *
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House / Street #, Mohallah, Landmark, Chakwal"
                className={`w-full text-xs rounded-xl px-3.5 py-2.5 border focus:outline-none focus:border-[#e4002b] ${
                  isDark ? 'bg-[#1a1a20] border-[#2d2d38] text-white' : 'bg-white border-zinc-300 text-zinc-900'
                }`}
                required
              />
            </div>
          </div>

          {/* Payment Method Selection */}
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
                        ? 'border-[#e4002b] bg-[#e4002b]/10 text-[#e4002b] font-bold'
                        : isDark ? 'border-[#282834] bg-[#121216] text-zinc-300' : 'border-zinc-200 bg-white text-zinc-700'
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
          <div className={`p-4 rounded-2xl border space-y-1.5 text-xs ${
            isDark ? 'bg-[#121216] border-[#25252e]' : 'bg-zinc-50 border-zinc-200'
          }`}>
            <div className="flex justify-between text-zinc-400">
              <span>Items Total ({cart.length})</span>
              <span className={`font-bold tabular-nums ${isDark ? 'text-white' : 'text-zinc-900'}`}>{formatPKR(cartSubtotal)}</span>
            </div>

            {(discountAmount > 0 || (appliedDiscount && appliedDiscount.type === 'free_shipping')) && (
              <div className="flex justify-between text-emerald-500 font-bold">
                <span>Discount ({appliedDiscount?.code || 'Auto Deal'})</span>
                <span className="tabular-nums font-mono">
                  -{discountAmount > 0 ? formatPKR(discountAmount) : 'Free Delivery'}
                </span>
              </div>
            )}

            {loyaltyDiscountAmount > 0 && (
              <div className="flex justify-between text-amber-500 font-bold">
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>Loyalty Points Discount</span>
                </span>
                <span className="tabular-nums font-mono">
                  -{formatPKR(loyaltyDiscountAmount)}
                </span>
              </div>
            )}

            <div className="flex justify-between text-zinc-400">
              <span>Delivery Fee ({selectedDeliveryMethod.name})</span>
              <span className={`font-bold tabular-nums ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                {effectiveDeliveryFee > 0 ? formatPKR(effectiveDeliveryFee) : 'FREE'}
              </span>
            </div>

            <div className="flex justify-between font-black text-sm pt-2 border-t border-zinc-700/20">
              <span className={isDark ? 'text-white' : 'text-zinc-900'}>Payable Total (PKR)</span>
              <span className="text-base text-[#e4002b] tabular-nums font-mono">{formatPKR(cartTotal)}</span>
            </div>

            {potentialPointsToEarn > 0 && (
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 pt-1 border-t border-zinc-700/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Is order par aapko <strong>+{potentialPointsToEarn} loyalty points</strong> milenge! (10 pts per 300 Rs)</span>
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className={`p-4 sm:p-5 border-t flex flex-col sm:flex-row items-center gap-3 ${
          isDark ? 'bg-[#101014] border-[#25252e]' : 'bg-zinc-50 border-zinc-200'
        }`}>
          {/* Order via WhatsApp */}
          <button
            type="button"
            onClick={() => handlePlaceOrder(true)}
            className="w-full sm:w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg active:scale-95"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Order via WhatsApp (Instant Receipt)</span>
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
