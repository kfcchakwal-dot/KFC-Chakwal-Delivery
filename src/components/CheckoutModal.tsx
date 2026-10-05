import React, { useState, useEffect } from 'react';
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
  Truck,
  Plus,
  Check,
  Building,
  Home,
  ShoppingBag,
  Crown
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
    vipDiscountAmount,
    potentialPointsToEarn,
    formatPKR,
    createOrder,
    settings,
    currentUser,
    addSavedAddress,
    selectedDeliveryMethod,
    themeMode,
  } = useStore();

  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [formError, setFormError] = useState('');
  
  // Add new address inline
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [newAddressLabel, setNewAddressLabel] = useState('Home');
  const [newAddressText, setNewAddressText] = useState('');

  // Sync if currentUser changes or loads
  useEffect(() => {
    if (currentUser) {
      if (!fullName) setFullName(currentUser.fullName);
      if (!phone) setPhone(currentUser.phone);
      if (!address) setAddress(currentUser.address);
    }
  }, [currentUser]);

  if (!isCheckoutOpen) return null;

  const isDark = themeMode === 'dark';
  const availablePaymentMethods = settings.paymentMethods?.filter((p) => p.enabled) || [
    { id: 'cod', name: 'Cash on Delivery (COD)' },
    { id: 'jazzcash', name: 'JazzCash' },
    { id: 'easypaisa', name: 'Easypaisa' },
  ];

  const savedAddresses = currentUser?.savedAddresses || [];

  const handleSaveInlineAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressText.trim()) return;
    addSavedAddress(newAddressLabel || 'Address', newAddressText.trim());
    setAddress(newAddressText.trim());
    setNewAddressText('');
    setIsAddingNewAddress(false);
  };

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
      notes: specialInstructions.trim() || undefined,
    };

    const newOrder = createOrder(customer, paymentMethod, specialInstructions.trim());

    // Build complete WhatsApp message with special instructions & Kallar Kahar service notice
    const itemsList = newOrder.items
      .map(
        (i) =>
          `• ${i.quantity}x ${i.menuItem.name} (${formatPKR(i.unitPrice * i.quantity)})${
            i.options.spiceLevel ? ` [${i.options.spiceLevel}]` : ''
          }${i.options.drink ? ` [${i.options.drink}]` : ''}${
            i.options.addons && i.options.addons.length > 0 ? ` (+${i.options.addons.map(a => a.name).join(', ')})` : ''
          }`
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
      (newOrder.vipDiscount ? `VIP Lifetime Discount (${newOrder.vipTierApplied?.toUpperCase()}): -${formatPKR(newOrder.vipDiscount)}\n` : '') +
      `*Total Bill: ${formatPKR(newOrder.total)} (PKR)*\n` +
      `Payment: ${newOrder.paymentMethod.toUpperCase()}\n` +
      `-------------------------\n` +
      `*Customer Details:*\n` +
      `Name: ${customer.fullName}\n` +
      `Phone: ${customer.phone}\n` +
      `Address: ${customer.address}\n` +
      (specialInstructions.trim() ? `*Special Kitchen Instructions:* ${specialInstructions.trim()}\n` : '') +
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
      <div className={`border rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] ${
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

        {/* Form Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          
          {formError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-xl flex items-center gap-2 font-bold">
              <span>Error: {formError}</span>
            </div>
          )}

          {/* Customer Information Container */}
          <div className={`p-4 sm:p-5 rounded-2xl border space-y-4 ${
            isDark ? 'bg-[#121216] border-[#25252e]' : 'bg-zinc-50 border-zinc-200'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#e4002b] flex items-center gap-1.5">
                <span>Customer Information & Address</span>
              </h3>
              {currentUser && (
                <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Logged In ({currentUser.phone})
                </span>
              )}
            </div>

            {/* Field 1: Name */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                1. Your Full Name *
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

            {/* Saved Addresses Quick Selector */}
            {savedAddresses.length > 0 && (
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Saved Addresses (Click to select)
                </label>
                <div className="flex flex-wrap gap-2">
                  {savedAddresses.map((sa) => {
                    const isSelected = address.trim().toLowerCase() === sa.address.trim().toLowerCase();
                    return (
                      <button
                        key={sa.id}
                        type="button"
                        onClick={() => setAddress(sa.address)}
                        className={`text-xs px-3 py-1.5 rounded-xl border flex items-center gap-1.5 cursor-pointer transition ${
                          isSelected
                            ? 'bg-[#e4002b] text-white border-[#e4002b] font-bold shadow-sm'
                            : isDark 
                              ? 'bg-[#1a1a20] border-[#2d2d38] text-zinc-300 hover:border-zinc-500' 
                              : 'bg-white border-zinc-300 text-zinc-700 hover:border-[#e4002b]'
                        }`}
                      >
                        <Home className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-semibold">{sa.label}:</span>
                        <span className="truncate max-w-[140px] text-[11px]">{sa.address}</span>
                        {isSelected && <Check className="w-3 h-3 text-white ml-0.5" />}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setIsAddingNewAddress(!isAddingNewAddress)}
                    className="text-xs px-2.5 py-1.5 rounded-xl border border-dashed border-[#e4002b] text-[#e4002b] hover:bg-[#e4002b]/10 flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add New Address</span>
                  </button>
                </div>
              </div>
            )}

            {/* Inline Add New Address Box */}
            {isAddingNewAddress && (
              <form onSubmit={handleSaveInlineAddress} className={`p-3 rounded-xl border space-y-2 text-xs ${
                isDark ? 'bg-[#17171d] border-zinc-700' : 'bg-white border-zinc-300'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#e4002b]">Save New Delivery Address</span>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewAddress(false)}
                    className="text-zinc-400 hover:text-zinc-600 text-xs"
                  >
                    Cancel
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={newAddressLabel}
                    onChange={(e) => setNewAddressLabel(e.target.value)}
                    className={`col-span-1 rounded-lg px-2.5 py-1.5 border text-xs ${
                      isDark ? 'bg-[#101014] border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-300'
                    }`}
                  >
                    <option value="Home">Home</option>
                    <option value="Office">Office</option>
                    <option value="Shop">Shop</option>
                    <option value="Other">Other</option>
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="Complete Street / Mohallah Address"
                    value={newAddressText}
                    onChange={(e) => setNewAddressText(e.target.value)}
                    className={`col-span-2 rounded-lg px-2.5 py-1.5 border text-xs ${
                      isDark ? 'bg-[#101014] border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-300'
                    }`}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#e4002b] hover:bg-[#c30025] text-white py-1.5 rounded-lg font-bold text-xs cursor-pointer shadow-sm"
                >
                  Save & Use This Address
                </button>
              </form>
            )}

            {/* Field 3: Address */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-zinc-400">
                  3. Complete Delivery Address in Chakwal (Within 3 KM) *
                </label>
                {!isAddingNewAddress && savedAddresses.length === 0 && (
                  <button
                    type="button"
                    onClick={() => setIsAddingNewAddress(true)}
                    className="text-[11px] text-[#e4002b] font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Save to Address Book</span>
                  </button>
                )}
              </div>
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

            {/* Field 4: Special Instructions / Notes for Kitchen Staff */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#e4002b]" />
                  <span>Special Instructions for Kitchen Staff (Optional)</span>
                </span>
                <span className="text-[10px] text-zinc-400">Kitchen & Rider Notes</span>
              </label>
              <textarea
                rows={2}
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g. Extra ketchup sachets please, make chicken extra crispy, or please ring bell twice upon arrival."
                className={`w-full text-xs rounded-xl px-3.5 py-2.5 border focus:outline-none focus:border-[#e4002b] ${
                  isDark ? 'bg-[#1a1a20] border-[#2d2d38] text-white placeholder-zinc-500' : 'bg-white border-zinc-300 text-zinc-900 placeholder-zinc-400'
                }`}
              />
              <p className="text-[10px] text-zinc-400 mt-1">
                Ye notes hamaray Kallar Kahar aur Chakwal kitchen rider team ko print slip par deliver honge.
              </p>
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

          {/* Order Bill Summary with Items Breakdown */}
          <div className={`p-4 rounded-2xl border space-y-2.5 text-xs ${
            isDark ? 'bg-[#121216] border-[#25252e]' : 'bg-zinc-50 border-zinc-200'
          }`}>
            <div className="flex items-center justify-between border-b border-zinc-700/20 pb-2">
              <span className="font-bold text-[11px] uppercase tracking-wider text-[#e4002b] flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Order Items Summary ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">Review</span>
            </div>

            {/* Itemized List with Quantities and Options */}
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {cart.map((i) => (
                <div key={i.cartItemId} className="flex justify-between items-start text-xs py-1 border-b border-zinc-200/60 dark:border-zinc-800/60 last:border-0">
                  <div className="pr-2 min-w-0">
                    <p className={`font-bold truncate ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                      {i.quantity}x {i.menuItem.name}
                    </p>
                    {(i.options.spiceLevel || i.options.drink || (i.options.addons && i.options.addons.length > 0)) && (
                      <p className="text-[10px] text-zinc-400 truncate">
                        {i.options.spiceLevel && <span>[{i.options.spiceLevel}] </span>}
                        {i.options.drink && <span>[{i.options.drink}] </span>}
                        {i.options.addons && i.options.addons.length > 0 && (
                          <span>(+{i.options.addons.map(a => a.name).join(', ')})</span>
                        )}
                      </p>
                    )}
                  </div>
                  <span className={`font-mono font-bold shrink-0 ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                    {formatPKR(i.unitPrice * i.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial Calculations */}
            <div className="pt-2 border-t border-zinc-700/20 space-y-1.5">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
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

              {vipDiscountAmount > 0 && (
                <div className="flex justify-between text-amber-500 font-bold">
                  <span className="flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5 text-amber-500" />
                    <span>VIP Lifetime Pass ({currentUser?.vipTier?.toUpperCase()})</span>
                  </span>
                  <span className="tabular-nums font-mono">
                    -{formatPKR(vipDiscountAmount)}
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
            </div>

            {potentialPointsToEarn > 0 && (
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 pt-1 border-t border-zinc-700/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Is order par aapko <strong>+{potentialPointsToEarn} loyalty points</strong> milenge! (10 pts per 300 Rs)</span>
              </div>
            )}
          </div>

          {/* Chakwal Branch Logistics Notice */}
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-[#e4002b] font-bold">
              <Truck className="w-4 h-4" />
              <span>Chakwal City Delivery Route Info</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Order confirmed hotay hi hamara rider Kallar Kahar Motorway branch se fresh KFC pick karta hai aur Sham 8:00 PM tak aapke address par deliver karta hai.
            </p>
          </div>
        </div>

        {/* Modal Footer / Action Buttons */}
        <div className={`p-4 sm:p-5 border-t flex flex-col sm:flex-row gap-3 ${
          isDark ? 'bg-[#101014] border-[#25252e]' : 'bg-zinc-50 border-zinc-200'
        }`}>
          {/* Option A: Direct Web Order */}
          <button
            type="button"
            onClick={() => handlePlaceOrder(false)}
            className="flex-1 bg-[#e4002b] hover:bg-[#c30025] active:scale-95 text-white font-bold text-xs py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-red-950/40 cursor-pointer transition"
          >
            <span>Confirm & Place Order</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Option B: Direct WhatsApp Order */}
          <button
            type="button"
            onClick={() => handlePlaceOrder(true)}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer transition"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Order via WhatsApp (+92 325 2777574)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
