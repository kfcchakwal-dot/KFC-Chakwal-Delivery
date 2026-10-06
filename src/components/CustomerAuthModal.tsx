import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { CustomerAddress, Order } from '../types';
import { 
  X, 
  User, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Award, 
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  RotateCcw,
  ShoppingBag,
  Home,
  LogOut
} from 'lucide-react';

export const CustomerAuthModal: React.FC = () => {
  const {
    isCustomerAuthModalOpen,
    setIsCustomerAuthModalOpen,
    currentUser,
    signupUser,
    sendPhoneOtp,
    verifyPhoneOtp,
    isOtpSent,
    setIsOtpSent,
    logoutUser,
    addSavedAddress,
    deleteSavedAddress,
    repeatOrder,
    allOrders,
    formatPKR,
    themeMode,
  } = useStore();

  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [profileSubTab, setProfileSubTab] = useState<'rewards' | 'addresses' | 'orders'>('rewards');
  
  // Registration form
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  
  // Login form
  const [loginPhone, setLoginPhone] = useState('');
  const [loginError, setLoginError] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpBusy, setOtpBusy] = useState(false);
  const [otpMode, setOtpMode] = useState<'login' | 'signup'>('login');

  // Add Address form
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newLabel, setNewLabel] = useState('Home');
  const [newAddressText, setNewAddressText] = useState('');

  if (!isCustomerAuthModalOpen) return null;

  const isDark = themeMode === 'dark';

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    if (!phone.trim() || phone.trim().length < 10) {
      setOtpError('Please enter a valid mobile number.');
      return;
    }
    setOtpError('');
    setOtpBusy(true);
    setOtpMode('signup');
    const result = await sendPhoneOtp(phone.trim(), 'customer-auth-recaptcha');
    setOtpBusy(false);
    if (!result.success) {
      setOtpError(result.error || 'OTP send nahi ho saka. Dobara try karein.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone.trim() || loginPhone.trim().length < 10) {
      setLoginError('Please enter a valid mobile number (e.g. 03001234567)');
      return;
    }
    setLoginError('');
    setOtpError('');
    setOtpBusy(true);
    setOtpMode('login');
    const result = await sendPhoneOtp(loginPhone.trim(), 'customer-auth-recaptcha');
    setOtpBusy(false);
    if (!result.success) {
      setLoginError(result.error || 'OTP send nahi ho saka. Dobara try karein.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length < 4) {
      setOtpError('OTP code enter karein.');
      return;
    }
    setOtpBusy(true);
    setOtpError('');
    const result = await verifyPhoneOtp(
      otpCode.trim(),
      otpMode === 'signup'
        ? {
            fullName: fullName.trim(),
            defaultAddress: address.trim() || 'Within 3 KM (Chakwal City)',
            email: email.trim() || undefined,
          }
        : undefined
    );
    setOtpBusy(false);
    if (!result.success) {
      setOtpError(result.error || 'OTP verify nahi ho saka.');
      return;
    }
    setOtpCode('');
    setIsOtpSent(false);
  };

  const handleAddAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressText.trim()) return;
    addSavedAddress(newLabel, newAddressText.trim());
    setNewAddressText('');
    setIsAddingAddress(false);
  };

  // Find customer's past orders
  const customerOrders = currentUser
    ? allOrders.filter(
        (o) =>
          o.customer.phone === currentUser.phone ||
          (currentUser.fullName && o.customer.fullName.toLowerCase() === currentUser.fullName.toLowerCase())
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden p-5 sm:p-7 space-y-5 max-h-[92vh] flex flex-col ${
        isDark ? 'bg-[#18181c] border-[#2e2e38] text-white' : 'bg-white border-zinc-200 text-zinc-900'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#e4002b] flex items-center justify-center text-white shadow-md">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`font-kfc text-2xl font-black uppercase tracking-tight leading-none ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                {currentUser ? 'My Account & Rewards' : 'KFC Customer Login'}
              </h2>
              <p className="text-zinc-400 text-xs mt-0.5">
                {currentUser ? `Welcome back, ${currentUser.fullName}!` : 'Chakwal Delivery Native Account'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCustomerAuthModalOpen(false)}
            className={`p-1.5 rounded-lg cursor-pointer ${
              isDark ? 'text-zinc-400 hover:text-white bg-[#222228]' : 'text-zinc-500 hover:text-zinc-900 bg-zinc-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* IF USER IS ALREADY LOGGED IN */}
        {/* ========================================================================= */}
        {currentUser ? (
          <div className="overflow-y-auto space-y-4 flex-1 pr-1">
            
            {/* Top Loyalty Highlight */}
            <div className={`border p-4 rounded-2xl relative overflow-hidden space-y-2 ${
              isDark 
                ? 'bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-red-500/20 border-amber-500/40 text-white' 
                : 'bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 border-amber-300 text-zinc-900'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-500/20 px-2.5 py-0.5 rounded-full">
                  KFC Chakwal Rewards
                </span>
                <Award className="w-5 h-5 text-amber-500" />
              </div>

              <div>
                <p className={`text-3xl font-black font-mono ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  {currentUser.loyaltyPoints || 0} <span className="text-sm font-sans font-bold text-amber-600">Points</span>
                </p>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                  Worth <strong className="text-emerald-600">Rs. {currentUser.loyaltyPoints || 0}</strong> flat discount on future orders!
                </p>
              </div>
            </div>

            {/* Sub-Navigation Tabs: Rewards | Saved Addresses | Past Orders */}
            <div className={`grid grid-cols-3 gap-1 p-1 rounded-xl border text-xs font-bold ${
              isDark ? 'bg-[#121214] border-zinc-800' : 'bg-zinc-100 border-zinc-200'
            }`}>
              <button
                type="button"
                onClick={() => setProfileSubTab('rewards')}
                className={`py-2 rounded-lg transition-colors cursor-pointer text-center ${
                  profileSubTab === 'rewards'
                    ? 'bg-[#e4002b] text-white shadow'
                    : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Profile & Rules
              </button>
              <button
                type="button"
                onClick={() => setProfileSubTab('addresses')}
                className={`py-2 rounded-lg transition-colors cursor-pointer text-center flex items-center justify-center gap-1 ${
                  profileSubTab === 'addresses'
                    ? 'bg-[#e4002b] text-white shadow'
                    : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Addresses ({(currentUser.savedAddresses || []).length})</span>
              </button>
              <button
                type="button"
                onClick={() => setProfileSubTab('orders')}
                className={`py-2 rounded-lg transition-colors cursor-pointer text-center flex items-center justify-center gap-1 ${
                  profileSubTab === 'orders'
                    ? 'bg-[#e4002b] text-white shadow'
                    : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Orders ({customerOrders.length})</span>
              </button>
            </div>

            {/* SUB-TAB 1: REWARDS & PROFILE */}
            {profileSubTab === 'rewards' && (
              <div className="space-y-3">
                <div className={`p-4 rounded-2xl border space-y-1.5 text-xs ${
                  isDark ? 'bg-[#121214] border-[#282830]' : 'bg-zinc-50 border-zinc-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#e4002b]">{currentUser.fullName}</span>
                    <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Verified Account
                    </span>
                  </div>
                  <p className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
                    Mobile: <strong className={isDark ? 'text-white' : 'text-zinc-900'}>{currentUser.phone}</strong>
                  </p>
                  <p className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
                    Current Default Address: <strong className={isDark ? 'text-white' : 'text-zinc-900'}>{currentUser.address}</strong>
                  </p>
                </div>

                {/* Loyalty Rules & Policy */}
                <div className={`p-4 rounded-2xl border space-y-2 text-xs ${
                  isDark ? 'bg-[#121214] border-[#282830]' : 'bg-zinc-50 border-zinc-200'
                }`}>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Official Loyalty Policy Rules</span>
                  </h4>

                  <ul className={`space-y-1.5 text-[11px] leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>10 Loyalty Points</strong> har Rs. 300 ki shopping par automatic credit hotay hain.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>1 Point = 1 Rupee (Rs. 1)</strong> flat direct discount in bucket checkout.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Points kabhi expire nahi hotay. Jab chahein direct redeem karein.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span><strong>Rule:</strong> Loyalty points kisi doosray discount coupon ke sath combine nahi ho saktay. Cart mein ya toh coupon lagega ya points.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* SUB-TAB 2: SAVED ADDRESSES */}
            {profileSubTab === 'addresses' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-zinc-400 uppercase tracking-wider">
                    My Saved Delivery Addresses
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsAddingAddress(!isAddingAddress)}
                    className="text-xs font-bold text-[#e4002b] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Address</span>
                  </button>
                </div>

                {/* Add Address Form */}
                {isAddingAddress && (
                  <form onSubmit={handleAddAddressSubmit} className={`p-3.5 rounded-2xl border space-y-2.5 text-xs ${
                    isDark ? 'bg-[#121215] border-zinc-700' : 'bg-zinc-50 border-zinc-300'
                  }`}>
                    <span className="font-bold text-xs text-[#e4002b] block">Add Address for Quick Checkout</span>
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        value={newLabel}
                        onChange={(e) => setNewLabel(e.target.value)}
                        className={`col-span-1 rounded-xl px-2.5 py-2 border text-xs ${
                          isDark ? 'bg-[#1a1a20] border-zinc-700 text-white' : 'bg-white border-zinc-300'
                        }`}
                      >
                        <option value="Home">Home</option>
                        <option value="Office">Office</option>
                        <option value="Shop">Shop</option>
                        <option value="Hostel">Hostel</option>
                        <option value="Other">Other</option>
                      </select>
                      <input
                        type="text"
                        required
                        placeholder="House / Street / Area in Chakwal"
                        value={newAddressText}
                        onChange={(e) => setNewAddressText(e.target.value)}
                        className={`col-span-2 rounded-xl px-3 py-2 border text-xs ${
                          isDark ? 'bg-[#1a1a20] border-zinc-700 text-white' : 'bg-white border-zinc-300'
                        }`}
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setIsAddingAddress(false)}
                        className="px-3 py-1.5 rounded-xl text-zinc-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-[#e4002b] hover:bg-[#c30025] text-white px-4 py-1.5 rounded-xl font-bold"
                      >
                        Save Address
                      </button>
                    </div>
                  </form>
                )}

                {/* List of saved addresses */}
                <div className="space-y-2">
                  {(currentUser.savedAddresses || []).length === 0 ? (
                    <div className="p-4 text-center text-xs text-zinc-500 border border-dashed rounded-xl">
                      Aapka koi saved address nahi hai. Upar button se naya address add karein!
                    </div>
                  ) : (
                    (currentUser.savedAddresses || []).map((addr: CustomerAddress) => (
                      <div
                        key={addr.id}
                        className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                          isDark ? 'bg-[#121214] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                            <Home className="w-4 h-4 text-[#e4002b]" />
                          </div>
                          <div>
                            <span className="font-bold text-xs block text-zinc-900 dark:text-white">{addr.label}</span>
                            <span className="text-zinc-500 text-[11px] block">{addr.address}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteSavedAddress(addr.id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition cursor-pointer"
                          title="Delete address"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* SUB-TAB 3: PAST ORDERS & REPEAT ORDER */}
            {profileSubTab === 'orders' && (
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-zinc-400 uppercase tracking-wider">
                  Past Orders & 1-Click Reorder
                </h4>

                {customerOrders.length === 0 ? (
                  <div className="p-6 text-center text-xs text-zinc-500 border border-dashed rounded-2xl space-y-2">
                    <ShoppingBag className="w-8 h-8 mx-auto text-zinc-400 opacity-60" />
                    <p>Abhi tak koi order record nahi mila.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {customerOrders.map((ord: Order) => (
                      <div
                        key={ord.id}
                        className={`p-3.5 rounded-2xl border space-y-2 text-xs ${
                          isDark ? 'bg-[#121214] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-mono font-bold text-xs text-[#e4002b]">#{ord.id}</span>
                            <span className="text-[10px] text-zinc-500 ml-2">
                              {new Date(ord.date).toLocaleDateString()}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded border border-emerald-500/20">
                            {ord.status}
                          </span>
                        </div>

                        <div className="text-[11px] text-zinc-400 space-y-0.5">
                          {ord.items.map((i, idx) => (
                            <p key={idx} className="truncate">
                              • {i.quantity}x {i.menuItem.name}
                            </p>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-zinc-700/20">
                          <div>
                            <span className="text-[10px] text-zinc-500">Bill: </span>
                            <strong className="text-zinc-900 dark:text-white font-mono">{formatPKR(ord.total)}</strong>
                          </div>

                          {/* REPEAT ORDER BUTTON */}
                          <button
                            type="button"
                            onClick={() => {
                              repeatOrder(ord);
                              setIsCustomerAuthModalOpen(false);
                            }}
                            className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-zinc-950 font-black text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer transition"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Repeat Order</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Logout Button */}
            <div className="pt-2 border-t border-zinc-800/40">
              <button
                type="button"
                onClick={logoutUser}
                className="w-full py-2.5 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out from this Device</span>
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* NATIVE LOGIN / REGISTRATION (NO GOOGLE / NO FACEBOOK) */
          /* ========================================================================= */
          <div className="overflow-y-auto space-y-4 flex-1 pr-1">
            
            {/* Banner */}
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs space-y-1">
              <p className="font-bold text-[#e4002b] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Apna Phone Number Enter Karein</span>
              </p>
              <p className={`text-[11px] ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                Firebase Phone OTP se secure login hoga. Aapke addresses aur loyalty points aapke account ke saath save rahenge.
              </p>
            </div>

            {/* Tabs: Sign In vs New Registration */}
            <div id="customer-auth-recaptcha" className="flex justify-center" />

            <div className={`grid grid-cols-2 gap-2 p-1 rounded-xl border text-xs font-bold ${
              isDark ? 'bg-[#121214] border-zinc-800' : 'bg-zinc-100 border-zinc-200'
            }`}>
              <button
                type="button"
                onClick={() => { setTab('login'); setIsOtpSent(false); setOtpCode(''); setOtpError(''); setLoginError(''); }}
                className={`py-2 rounded-lg transition-colors cursor-pointer ${
                  tab === 'login' 
                    ? 'bg-[#e4002b] text-white shadow' 
                    : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Existing Sign In
              </button>
              <button
                type="button"
                onClick={() => { setTab('signup'); setIsOtpSent(false); setOtpCode(''); setOtpError(''); setLoginError(''); }}
                className={`py-2 rounded-lg transition-colors cursor-pointer ${
                  tab === 'signup' 
                    ? 'bg-[#e4002b] text-white shadow' 
                    : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                New Account
              </button>
            </div>

            {/* Secure Firebase Phone OTP Sign In */}
            {tab === 'login' && (
              <form onSubmit={isOtpSent ? handleVerifyOtp : handleLogin} className="space-y-3.5 text-xs">
                {loginError && (
                  <div className="p-2.5 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-xl font-bold">
                    {loginError}
                  </div>
                )}
                {isOtpSent ? (
                  <>
                    <div>
                      <label className={`block mb-1 font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        OTP Code
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        required
                        placeholder="123456"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className={`w-full text-center text-lg tracking-[0.35em] rounded-xl px-3.5 py-3 focus:outline-none focus:border-[#e4002b] border ${isDark ? 'bg-[#121214] border-[#2b2b35] text-white' : 'bg-zinc-50 border-zinc-300 text-zinc-900'}`}
                      />
                    </div>
                    {otpError && <div className="p-2.5 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-xl font-bold">{otpError}</div>}
                    <button type="submit" disabled={otpBusy} className="w-full bg-[#e4002b] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2">
                      <span>{otpBusy ? 'Verifying...' : 'Verify OTP & Continue'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button type="button" disabled={otpBusy} onClick={() => { setIsOtpSent(false); setOtpCode(''); setOtpError(''); }} className="w-full py-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-bold">
                      Change Number
                    </button>
                  </>
                ) : (
                  <>
                    <div>
                      <label className={`block mb-1 font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Mobile Phone Number *</label>
                      <input type="tel" required placeholder="03001234567" value={loginPhone} onChange={(e) => setLoginPhone(e.target.value)} className={`w-full text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#e4002b] border ${isDark ? 'bg-[#121214] border-[#2b2b35] text-white' : 'bg-zinc-50 border-zinc-300 text-zinc-900'}`} />
                      <p className="text-[10px] text-zinc-400 mt-1">Is number par Firebase verification code SMS hoga.</p>
                    </div>
                    <button type="submit" disabled={otpBusy} className="w-full bg-[#e4002b] disabled:opacity-60 hover:bg-[#c30025] text-white font-bold py-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2">
                      <span>{otpBusy ? 'Sending OTP...' : 'Send OTP & Continue'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </form>
            )}

            {/* Form B: Secure Firebase Phone OTP New Account Registration */}
            {tab === 'signup' && (
              <form onSubmit={isOtpSent ? handleVerifyOtp : handleSignup} className="space-y-3 text-xs">
                {otpError && <div className="p-2.5 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-xl font-bold">{otpError}</div>}
                <div>
                  <label className={`block mb-1 font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Full Name *</label>
                  <input type="text" required placeholder="e.g. Muhammad Usman" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={isOtpSent} className={`w-full text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#e4002b] border ${isDark ? 'bg-[#121214] border-[#2b2b35] text-white' : 'bg-zinc-50 border-zinc-300 text-zinc-900'}`} />
                </div>
                <div>
                  <label className={`block mb-1 font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Mobile Phone (WhatsApp) *</label>
                  <input type="tel" required placeholder="03001234567" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={isOtpSent} className={`w-full text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#e4002b] border ${isDark ? 'bg-[#121214] border-[#2b2b35] text-white' : 'bg-zinc-50 border-zinc-300 text-zinc-900'}`} />
                </div>
                <div>
                  <label className={`block mb-1 font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Delivery Address (Within 3 KM) *</label>
                  <input type="text" required placeholder="House / Street / Area within 3km Chakwal" value={address} onChange={(e) => setAddress(e.target.value)} disabled={isOtpSent} className={`w-full text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#e4002b] border ${isDark ? 'bg-[#121214] border-[#2b2b35] text-white' : 'bg-zinc-50 border-zinc-300 text-zinc-900'}`} />
                </div>
                {isOtpSent ? (
                  <>
                    <div>
                      <label className={`block mb-1 font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>OTP Code</label>
                      <input type="text" inputMode="numeric" autoComplete="one-time-code" required placeholder="123456" value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))} className={`w-full text-center text-lg tracking-[0.35em] rounded-xl px-3.5 py-3 focus:outline-none focus:border-[#e4002b] border ${isDark ? 'bg-[#121214] border-[#2b2b35] text-white' : 'bg-zinc-50 border-zinc-300 text-zinc-900'}`} />
                    </div>
                    <button type="submit" disabled={otpBusy} className="w-full bg-[#e4002b] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2">
                      <span>{otpBusy ? 'Verifying...' : 'Verify OTP & Create Account'}</span>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                    </button>
                    <button type="button" disabled={otpBusy} onClick={() => { setIsOtpSent(false); setOtpCode(''); setOtpError(''); }} className="w-full py-2 text-zinc-400 font-bold">Change Number</button>
                  </>
                ) : (
                  <button type="submit" disabled={otpBusy} className="w-full bg-[#e4002b] disabled:opacity-60 hover:bg-[#c30025] text-white font-bold py-3 rounded-xl transition cursor-pointer shadow-lg shadow-red-950/20 active:scale-95 flex items-center justify-center gap-2">
                    <span>{otpBusy ? 'Sending OTP...' : 'Verify Phone & Create Account'}</span>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </button>
                )}
              </form>
            )}

            {/* Persistent Login Guarantee Info */}
            <div className={`p-3 rounded-xl border text-[11px] space-y-1 ${
              isDark ? 'bg-[#121214] border-[#22222a] text-zinc-400' : 'bg-zinc-50 border-zinc-200 text-zinc-600'
            }`}>
              <div className="flex items-center gap-1.5 font-bold text-emerald-500">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Secure Firebase Phone Session</span>
              </div>
              <p>
                Firebase aapka secure session manage karta hai. Logout karne par account session khatam ho jayega.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
