import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  X, 
  User, 
  Phone, 
  MapPin, 
  Mail, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Award, 
  HelpCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const CustomerAuthModal: React.FC = () => {
  const {
    isCustomerAuthModalOpen,
    setIsCustomerAuthModalOpen,
    currentUser,
    signupUser,
    loginUser,
    logoutUser,
    themeMode,
  } = useStore();

  const [tab, setTab] = useState<'login' | 'signup'>('signup');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [loginPhone, setLoginPhone] = useState('');

  if (!isCustomerAuthModalOpen) return null;

  const isDark = themeMode === 'dark';

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) return;

    signupUser({
      fullName: fullName.trim(),
      phone: phone.trim(),
      address: address.trim() || 'Within 3 KM (Chakwal City)',
      email: email.trim() || undefined,
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone.trim()) return;
    loginUser(loginPhone.trim());
  };

  // Free 1-Click Social Sign-in
  const handleSocialLogin = (provider: 'Google' | 'Facebook') => {
    const demoName = provider === 'Google' ? 'Google Customer' : 'Facebook Customer';
    signupUser({
      fullName: demoName,
      phone: '+92 300 0000000',
      address: 'Within 3 KM (Chakwal City)',
      email: `user@${provider.toLowerCase()}.com`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className={`w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden p-6 sm:p-7 space-y-5 ${
        isDark ? 'bg-[#18181c] border-[#2e2e38] text-white' : 'bg-white border-zinc-200 text-zinc-900'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#e4002b] flex items-center justify-center text-white shadow-md">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`font-kfc text-2xl font-black uppercase tracking-tight leading-none ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                Customer Account
              </h2>
              <p className="text-zinc-400 text-xs mt-0.5">KFC Chakwal Loyalty & Rewards</p>
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

        {/* If Already Logged In */}
        {currentUser ? (
          <div className="space-y-4">
            
            {/* Loyalty Points Card */}
            <div className={`border p-4 rounded-2xl relative overflow-hidden space-y-2 ${
              isDark 
                ? 'bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-red-500/20 border-amber-500/40 text-white' 
                : 'bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 border-amber-300 text-zinc-900'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-500/15 px-2.5 py-0.5 rounded-full">
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

            {/* Profile Info */}
            <div className={`p-4 rounded-2xl border space-y-1.5 text-xs ${
              isDark ? 'bg-[#121214] border-[#282830]' : 'bg-zinc-50 border-zinc-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#e4002b]">{currentUser.fullName}</span>
                <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Active Customer
                </span>
              </div>
              <p className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
                Mobile: <strong className={isDark ? 'text-white' : 'text-zinc-900'}>{currentUser.phone}</strong>
              </p>
              <p className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
                Delivery Address: <strong className={isDark ? 'text-white' : 'text-zinc-900'}>{currentUser.address}</strong>
              </p>
            </div>

            {/* Loyalty Points Rules & How It Works */}
            <div className={`p-4 rounded-2xl border space-y-2 text-xs ${
              isDark ? 'bg-[#141418] border-[#24242c]' : 'bg-amber-50/70 border-amber-200'
            }`}>
              <p className="font-bold text-amber-600 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Loyalty Points Kaise Haasil Karein & Redeem Karein:
              </p>

              <ul className={`space-y-1.5 text-[11px] ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Earning Rate:</strong> Har <strong>Rs. 300 ki shopping par 10 Points</strong> miltay hain (1 Point = Rs. 1 Flat Discount).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Redemption:</strong> Bucket/Cart mein 1-click se redeem hotay hain.</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span><strong>Condition:</strong> Points akele redeem nahi hotay, redeem karnay ke liye <strong>Minimum Rs. 500</strong> ki shopping lazmi hai.</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span><strong>No Stacking:</strong> Loyalty points kisi doosray discount coupon code ke sath combine nahi hotay.</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={logoutUser}
              className={`w-full text-xs font-bold py-2.5 rounded-xl cursor-pointer transition ${
                isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
              }`}
            >
              Sign Out (Logout)
            </button>
          </div>
        ) : (
          <>
            {/* Loyalty Welcome Strip */}
            <div className={`border p-3 rounded-2xl flex items-center gap-3 ${
              isDark ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'
            }`}>
              <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
              <div className="text-xs">
                <p className={`font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>50 Free Points on Signup!</p>
                <p className={isDark ? 'text-zinc-400 text-[11px]' : 'text-zinc-600 text-[11px]'}>
                  Har Rs. 300 par 10 points earn karein (Min order Rs. 500 to redeem).
                </p>
              </div>
            </div>

            {/* Social 1-Click Fast Sign-In */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('Google')}
                  className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition ${
                    isDark ? 'bg-[#23232c] hover:bg-[#2c2c36] text-white border-[#333342]' : 'bg-white hover:bg-zinc-50 text-zinc-800 border-zinc-200 shadow-sm'
                  }`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialLogin('Facebook')}
                  className="bg-[#1877F2] hover:bg-[#166fe5] text-white py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition shadow-sm"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Facebook</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-zinc-400 text-[10px] uppercase font-bold my-1">
                <span className={`flex-1 h-px ${isDark ? 'bg-zinc-700/40' : 'bg-zinc-200'}`}></span>
                <span>Ya Phone Number Se Login Karein</span>
                <span className={`flex-1 h-px ${isDark ? 'bg-zinc-700/40' : 'bg-zinc-200'}`}></span>
              </div>
            </div>

            {/* Tabs */}
            <div className={`grid grid-cols-2 gap-2 p-1 rounded-xl border text-xs font-bold ${
              isDark ? 'bg-[#121214] border-zinc-800' : 'bg-zinc-100 border-zinc-200'
            }`}>
              <button
                type="button"
                onClick={() => setTab('signup')}
                className={`py-2 rounded-lg transition-colors cursor-pointer ${
                  tab === 'signup' 
                    ? 'bg-[#e4002b] text-white shadow' 
                    : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                New Account
              </button>
              <button
                type="button"
                onClick={() => setTab('login')}
                className={`py-2 rounded-lg transition-colors cursor-pointer ${
                  tab === 'login' 
                    ? 'bg-[#e4002b] text-white shadow' 
                    : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Existing Sign In
              </button>
            </div>

            {/* Sign Up Form */}
            {tab === 'signup' && (
              <form onSubmit={handleSignup} className="space-y-3 text-xs">
                <div>
                  <label className={`block mb-1 font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Muhammad Usman"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`w-full text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#e4002b] border ${
                      isDark ? 'bg-[#121214] border-[#2b2b35] text-white' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block mb-1 font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Mobile Phone (WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="03001234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#e4002b] border ${
                      isDark ? 'bg-[#121214] border-[#2b2b35] text-white' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block mb-1 font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Delivery Address (Within 3 KM) *</label>
                  <input
                    type="text"
                    required
                    placeholder="House / Street / Area within 3km Chakwal"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={`w-full text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#e4002b] border ${
                      isDark ? 'bg-[#121214] border-[#2b2b35] text-white' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#e4002b] hover:bg-[#c30025] text-white font-bold py-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>Register & Claim 50 Free Points</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Login Form */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-3 text-xs">
                <div>
                  <label className={`block mb-1 font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Registered Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="03001234567"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    className={`w-full text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#e4002b] border ${
                      isDark ? 'bg-[#121214] border-[#2b2b35] text-white' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#e4002b] hover:bg-[#c30025] text-white font-bold py-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </>
        )}

      </div>
    </div>
  );
};
