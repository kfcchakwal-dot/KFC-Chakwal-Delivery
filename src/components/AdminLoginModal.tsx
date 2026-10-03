import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Lock, X, KeyRound, AlertCircle, ShieldCheck } from 'lucide-react';

export const AdminLoginModal: React.FC = () => {
  const {
    isAdminLoginModalOpen,
    setIsAdminLoginModalOpen,
    loginAdmin,
    settings,
  } = useStore();

  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isAdminLoginModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginAdmin(pin);
    if (!success) {
      setError(true);
      setPin('');
    } else {
      setError(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#18181c] border border-[#2d2d36] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 bg-[#e4002b] rounded-xl flex items-center justify-center text-white shadow-md">
            <Lock className="w-5 h-5" />
          </div>
          <button
            onClick={() => {
              setIsAdminLoginModalOpen(false);
              setError(false);
            }}
            className="text-zinc-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h3 className="font-kfc text-2xl font-black text-white uppercase tracking-tight">
            KFC Chakwal Admin Portal
          </h3>
          <p className="text-zinc-400 text-xs mt-1">
            Enter your secret store PIN to manage incoming orders, customize rates, and edit menu items.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[#e4002b]" />
              <span>Admin Security PIN</span>
            </label>
            <input
              type="password"
              maxLength={8}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError(false);
              }}
              placeholder="Enter PIN (Default: 7860)"
              className="w-full bg-[#121214] border border-[#2e2e38] text-white text-center text-lg tracking-widest font-mono rounded-xl px-4 py-3 focus:outline-none focus:border-[#e4002b]"
              autoFocus
              required
            />
            {error && (
              <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Incorrect PIN. Try default PIN: <strong>7860</strong></span>
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-[#e4002b] hover:bg-[#c30025] text-white font-kfc uppercase text-lg py-3 rounded-xl font-black cursor-pointer transition-all shadow-xl shadow-red-950/40"
          >
            Unlock Admin Access
          </button>
        </form>

        <div className="bg-[#121214] p-3 rounded-xl border border-[#26262e] text-[11px] text-zinc-400 space-y-1">
          <p className="font-semibold text-zinc-300 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Store Manager Protection</span>
          </p>
          <p>
            Default Store PIN: <strong className="text-white font-mono">7860</strong>
          </p>
          <p className="text-zinc-500">
            Customers cannot see this panel or edit prices when visiting normal links.
          </p>
        </div>

      </div>
    </div>
  );
};
