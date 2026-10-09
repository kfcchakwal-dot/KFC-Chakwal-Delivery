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
    loginUser,
    updateEmailMarketingConsent,
    resetCustomerPassword,
    signInWithGoogle,
    logoutUser,
    addSavedAddress,
    deleteSavedAddress,
    repeatOrder,
    allOrders,
    formatPKR,
    themeMode,
    settings,
  } = useStore();

  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [profileSubTab, setProfileSubTab] = useState<'rewards' | 'addresses' | 'orders'>('rewards');
  
  // Customer account form
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailMarketingConsent, setEmailMarketingConsent] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [signupError, setSignupError] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [authNotice, setAuthNotice] = useState('');
  const [marketingPreferenceBusy, setMarketingPreferenceBusy] = useState(false);
  const [marketingPreferenceNotice, setMarketingPreferenceNotice] = useState('');

  // Add Address form
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newLabel, setNewLabel] = useState('Home');
  const [newAddressText, setNewAddressText] = useState('');

  if (!isCustomerAuthModalOpen) return null;

  const isDark = themeMode === 'dark';

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');
    setAuthNotice('');
    setAuthBusy(true);
    try {
      const result = await signupUser({ fullName, email, password, emailMarketingConsent });
      if (result.error === 'ACCOUNT_CREATED_VERIFY') {
        setAuthNotice(settings.customerAuthCopy?.verificationMessage || 'Aapki Gmail par verification email bheji gayi hai. Inbox/Spam check karke email verify karein, phir Sign In karein.');
        setTab('login');
        setLoginEmail(email.trim().toLowerCase());
        setPassword('');
      } else if (!result.success) {
        setSignupError(result.error || 'Account create nahi ho saka.');
      }
    } catch (error: any) {
      setSignupError(error?.message || 'Account create nahi ho saka. Dobara try karein.');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setAuthNotice('');
    setAuthBusy(true);
    try {
      const result = await loginUser(loginEmail, loginPassword, emailMarketingConsent);
      if (!result.success) setLoginError(result.error || 'Sign In nahi ho saka.');
    } catch (error: any) {
      setLoginError(error?.message || 'Sign In nahi ho saka. Dobara try karein.');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoginError('');
    setSignupError('');
    setAuthNotice('');
    setAuthBusy(true);
    try {
      const result = await signInWithGoogle();
      if (!result.success) setLoginError(result.error || 'Google se login nahi ho saka.');
    } catch (error: any) {
      setLoginError(error?.message || 'Google se login nahi ho saka. Dobara try karein.');
    } finally {
      setAuthBusy(false);
    }
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

            <div className={`rounded-xl border p-3 space-y-2 ${isDark ? 'border-zinc-700 bg-zinc-900/60' : 'border-zinc-200 bg-zinc-50'}`}>
              <label className="flex items-start gap-2 text-xs">
                <input type="checkbox" checked={currentUser.emailMarketingConsent === true} disabled={marketingPreferenceBusy} onChange={async (e) => { const next = e.target.checked; setMarketingPreferenceBusy(true); setMarketingPreferenceNotice(''); try { await updateEmailMarketingConsent(next); setMarketingPreferenceNotice(next ? 'Email marketing subscription on ho gayi.' : 'Aap email marketing se unsubscribe ho gaye hain.'); } catch (error: any) { setMarketingPreferenceNotice(error?.message || 'Preference save nahi ho saki. Dobara try karein.'); } finally { setMarketingPreferenceBusy(false); } }} className="mt-0.5 h-4 w-4 shrink-0 accent-[#e4002b]" />
                <span className={isDark ? 'text-zinc-300' : 'text-zinc-700'}><strong>Email offers & promotions</strong><span className="block mt-1">KFC Chakwal Delivery se promotional emails receive karein. Checkbox uncheck karke kabhi bhi unsubscribe kar sakte hain.</span></span>
              </label>
              {marketingPreferenceBusy && <p className="text-[11px] text-zinc-500">Saving preference...</p>}
              {marketingPreferenceNotice && <p role="status" className="text-[11px] text-emerald-600">{marketingPreferenceNotice}</p>}
            </div>

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
            
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs space-y-1">
              <p className="font-bold text-[#e4002b]">KFC Chakwal Delivery Account</p>
              <p className={`text-[11px] ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                {settings.customerAuthCopy?.subtitle || 'Apna account banayein aur apne orders, addresses aur rewards manage karein.'}
              </p>
            </div>

            <div className={`grid grid-cols-2 gap-2 p-1 rounded-xl border text-xs font-bold ${isDark ? 'bg-[#121214] border-zinc-800' : 'bg-zinc-100 border-zinc-200'}`}>
              <button type="button" onClick={() => { setTab('login'); setLoginError(''); setSignupError(''); setAuthNotice(''); }} className={`py-2 rounded-lg transition-colors cursor-pointer ${tab === 'login' ? 'bg-[#e4002b] text-white shadow' : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'}`}>
                Existing Sign In
              </button>
              <button type="button" onClick={() => { setTab('signup'); setLoginError(''); setSignupError(''); setAuthNotice(''); }} className={`py-2 rounded-lg transition-colors cursor-pointer ${tab === 'signup' ? 'bg-[#e4002b] text-white shadow' : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'}`}>
                {settings.customerAuthCopy?.newAccountText || 'New Account'}
              </button>
            </div>

            {authNotice && <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs rounded-xl font-bold">{authNotice}</div>}
            {loginError && tab === 'login' && <div className="p-2.5 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-xl font-bold">{loginError}</div>}
            {signupError && tab === 'signup' && <div className="p-2.5 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-xl font-bold">{signupError}</div>}

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={authBusy}
              className="w-full bg-white text-zinc-900 border border-zinc-300 hover:border-zinc-400 disabled:opacity-60 font-bold py-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              <span className="font-black text-base">G</span>
              <span>{settings.customerAuthCopy?.googleButtonText || 'Continue with Google'}</span>
            </button>

            <div className="flex items-center gap-2 text-[10px] text-zinc-400">
              <div className="h-px bg-zinc-200 dark:bg-zinc-800 flex-1" />
              <span>YA</span>
              <div className="h-px bg-zinc-200 dark:bg-zinc-800 flex-1" />
            </div>

            {tab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-3 text-xs">
                <div>
                  <label className={`block mb-1 font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {settings.customerAuthCopy?.emailLabel || 'Apni Gmail ID / Email'}
                  </label>
                  <input type="email" required autoComplete="email" placeholder={settings.customerAuthCopy?.emailPlaceholder || 'example@gmail.com'} value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className={`w-full text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#e4002b] border ${isDark ? 'bg-[#121214] border-[#2b2b35] text-white' : 'bg-zinc-50 border-zinc-300 text-zinc-900'}`} />
                </div>
                <div>
                  <label className={`block mb-1 font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {settings.customerAuthCopy?.passwordLabel || 'Password'}
                  </label>
                  <div className="relative">
                    <input type={showLoginPassword ? 'text' : 'password'} required autoComplete="current-password" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className={`w-full text-xs rounded-xl px-3.5 py-2.5 pr-20 focus:outline-none focus:border-[#e4002b] border ${isDark ? 'bg-[#121214] border-[#2b2b35] text-white' : 'bg-zinc-50 border-zinc-300 text-zinc-900'}`} />
                    <button type="button" onClick={() => setShowLoginPassword((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#e4002b] px-2 py-1 cursor-pointer">
                      {showLoginPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <div className="flex items-center justify-end -mt-1">
                    <button
                      type="button"
                      disabled={resetBusy || !loginEmail.trim()}
                      onClick={async () => {
                        setLoginError('');
                        setAuthNotice('');
                        setResetBusy(true);
                        const result = await resetCustomerPassword(loginEmail);
                        setResetBusy(false);
                        if (result.success) {
                          setAuthNotice('Password reset email bhej di gayi hai. Apni email/Spam folder check karein aur link se naya password set karein.');
                        } else {
                          setLoginError(result.error || 'Password reset nahi ho saka.');
                        }
                      }}
                      className="text-[11px] font-bold text-[#e4002b] hover:underline disabled:opacity-40 cursor-pointer"
                    >
                      {resetBusy ? 'Sending...' : 'Forgot Password?'}
                    </button>
                  </div>
                </div>
                <label className={`flex items-start gap-2 rounded-xl border p-3 ${isDark ? 'border-zinc-700 bg-zinc-900/60 text-zinc-300' : 'border-zinc-200 bg-zinc-50 text-zinc-700'}`}>
                  <input type="checkbox" checked={emailMarketingConsent} onChange={(e) => setEmailMarketingConsent(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#e4002b]" />
                  <span className="leading-relaxed">I agree to receive promotional emails, offers and updates from KFC Chakwal Delivery. I can unsubscribe anytime.</span>
                </label>
                <button type="submit" disabled={authBusy} className="w-full bg-[#e4002b] disabled:opacity-60 hover:bg-[#c30025] text-white font-bold py-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2">
                  <span>{authBusy ? 'Please wait...' : (settings.customerAuthCopy?.signInButtonText || 'Sign In')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignup} className="space-y-3 text-xs">
                <div>
                  <label className={`block mb-1 font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {settings.customerAuthCopy?.fullNameLabel || 'Aap ka Naam'}
                  </label>
                  <input type="text" required placeholder="Muhammad Usman" value={fullName} onChange={(e) => setFullName(e.target.value)} className={`w-full text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#e4002b] border ${isDark ? 'bg-[#121214] border-[#2b2b35] text-white' : 'bg-zinc-50 border-zinc-300 text-zinc-900'}`} />
                </div>
                <div>
                  <label className={`block mb-1 font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {settings.customerAuthCopy?.emailLabel || 'Apni Gmail ID / Email'}
                  </label>
                  <input type="email" required autoComplete="email" placeholder={settings.customerAuthCopy?.emailPlaceholder || 'example@gmail.com'} value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#e4002b] border ${isDark ? 'bg-[#121214] border-zinc-300 text-zinc-900' : 'bg-zinc-50 border-zinc-300 text-zinc-900'}`} />
                </div>
                <div>
                  <label className={`block mb-1 font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {settings.customerAuthCopy?.passwordLabel || 'Password'}
                  </label>
                  <input type="password" required minLength={6} autoComplete="new-password" placeholder="Kam az kam 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} className={`w-full text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#e4002b] border ${isDark ? 'bg-[#121214] border-[#2b2b35] text-white' : 'bg-zinc-50 border-zinc-300 text-zinc-900'}`} />
                </div>
                <label className={`flex items-start gap-2 rounded-xl border p-3 ${isDark ? 'border-zinc-700 bg-zinc-900/60 text-zinc-300' : 'border-zinc-200 bg-zinc-50 text-zinc-700'}`}>
                  <input type="checkbox" checked={emailMarketingConsent} onChange={(e) => setEmailMarketingConsent(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#e4002b]" />
                  <span className="leading-relaxed">I agree to receive promotional emails, offers and updates from KFC Chakwal Delivery. I can unsubscribe anytime.</span>
                </label>
                <button type="submit" disabled={authBusy} className="w-full bg-[#e4002b] disabled:opacity-60 hover:bg-[#c30025] text-white font-bold py-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2">
                  <span>{authBusy ? 'Please wait...' : (settings.customerAuthCopy?.createAccountButtonText || 'Account Banayein')}</span>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </button>
              </form>
            )}

            <div className={`p-3 rounded-xl border text-[11px] ${isDark ? 'bg-[#121214] border-[#22222a] text-zinc-400' : 'bg-zinc-50 border-zinc-200 text-zinc-600'}`}>
              {settings.customerAuthCopy?.helperText || 'Google se login sab se asaan hai. Ya apni Gmail ID aur password se account use karein.'}
            </div>          </div>
        )}

      </div>
    </div>
  );
};
