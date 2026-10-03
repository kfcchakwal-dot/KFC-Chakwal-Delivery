import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, User, Phone, MapPin, Mail, ShieldCheck, ArrowRight, LogIn, UserPlus } from 'lucide-react';

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
    if (!fullName.trim() || !phone.trim() || !address.trim()) return;

    signupUser({
      fullName: fullName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      email: email.trim() || undefined,
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone.trim()) return;
    loginUser(loginPhone.trim());
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className={`w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-200 ${
        isDark ? 'bg-[#18181c] border-[#2e2e38] text-white' : 'bg-white border-zinc-200 text-zinc-900'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#e4002b] flex items-center justify-center text-white shadow-md">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-kfc text-2xl font-black uppercase tracking-tight leading-none">
                Customer Account
              </h2>
              <p className="text-zinc-400 text-xs mt-0.5">KFC Chakwal Fast Ordering</p>
            </div>
          </div>

          <button
            onClick={() => setIsCustomerAuthModalOpen(false)}
            className="text-zinc-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If Already Logged In */}
        {currentUser ? (
          <div className="space-y-4">
            <div className={`p-4 rounded-2xl border space-y-1.5 text-xs ${
              isDark ? 'bg-[#121214] border-[#282830]' : 'bg-zinc-50 border-zinc-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#e4002b]">{currentUser.fullName}</span>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded">
                  Logged In
                </span>
              </div>
              <p className="text-zinc-400">Mobile: <strong className="text-white">{currentUser.phone}</strong></p>
              <p className="text-zinc-400">Delivery Address: <strong className="text-white">{currentUser.address}</strong></p>
            </div>

            <button
              type="button"
              onClick={logoutUser}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold py-2.5 rounded-xl cursor-pointer"
            >
              Sign Out (Logout)
            </button>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-[#121214] p-1 rounded-xl border border-zinc-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setTab('signup')}
                className={`py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  tab === 'signup' ? 'bg-[#e4002b] text-white shadow' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </button>

              <button
                type="button"
                onClick={() => setTab('login')}
                className={`py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  tab === 'login' ? 'bg-[#e4002b] text-white shadow' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            </div>

            {/* Signup Form */}
            {tab === 'signup' ? (
              <form onSubmit={handleSignup} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Malik Usman"
                    className={`w-full text-xs rounded-xl px-3.5 py-2.5 border focus:outline-none focus:border-[#e4002b] ${
                      isDark ? 'bg-[#121214] border-[#2e2e38] text-white' : 'bg-white border-zinc-300 text-zinc-900'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Mobile Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0300-1234567"
                    className={`w-full text-xs rounded-xl px-3.5 py-2.5 border focus:outline-none focus:border-[#e4002b] ${
                      isDark ? 'bg-[#121214] border-[#2e2e38] text-white' : 'bg-white border-zinc-300 text-zinc-900'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Complete Delivery Address in Chakwal *
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House / Street #, Sector, Chakwal"
                    className={`w-full text-xs rounded-xl px-3.5 py-2.5 border focus:outline-none focus:border-[#e4002b] ${
                      isDark ? 'bg-[#121214] border-[#2e2e38] text-white' : 'bg-white border-zinc-300 text-zinc-900'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@email.com"
                    className={`w-full text-xs rounded-xl px-3.5 py-2.5 border focus:outline-none focus:border-[#e4002b] ${
                      isDark ? 'bg-[#121214] border-[#2e2e38] text-white' : 'bg-white border-zinc-300 text-zinc-900'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#e4002b] hover:bg-[#c30025] text-white font-kfc uppercase text-lg py-3 rounded-xl font-black cursor-pointer shadow-lg transition-all"
                >
                  Create Account & Save
                </button>
              </form>
            ) : (
              /* Sign In Form */
              <form onSubmit={handleLogin} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Mobile Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    placeholder="0300-1234567"
                    className={`w-full text-xs rounded-xl px-3.5 py-2.5 border focus:outline-none focus:border-[#e4002b] ${
                      isDark ? 'bg-[#121214] border-[#2e2e38] text-white' : 'bg-white border-zinc-300 text-zinc-900'
                    }`}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#e4002b] hover:bg-[#c30025] text-white font-kfc uppercase text-lg py-3 rounded-xl font-black cursor-pointer shadow-lg transition-all"
                >
                  Sign In With Mobile
                </button>
              </form>
            )}

            <p className="text-[11px] text-zinc-500 text-center">
              Your details will automatically auto-fill every time you place an order.
            </p>
          </>
        )}

      </div>
    </div>
  );
};
