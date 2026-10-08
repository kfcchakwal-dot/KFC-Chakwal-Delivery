import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Lock, X, Mail, KeyRound, AlertCircle, ShieldCheck, Loader2 } from 'lucide-react';

export const AdminLoginModal: React.FC = () => {
  const {
    isAdminLoginModalOpen,
    setIsAdminLoginModalOpen,
    loginAdmin,
    resetAdminPassword,
  } = useStore();

  const [email, setEmail] = useState('kfcchakwal@gmail.com');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resetBusy, setResetBusy] = useState(false);

  if (!isAdminLoginModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Please provide both administrator email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const result = await loginAdmin(email.trim(), password);
      if (!result.success) {
        setErrorMessage(result.error || 'Authentication failed. Please check credentials.');
      } else {
        setIsAdminLoginModalOpen(false);
        setPassword('');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unexpected authentication error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#18181c] border border-[#2d2d36] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-200 text-white">
        
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 bg-[#e4002b] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-950/40">
            <Lock className="w-6 h-6" />
          </div>
          <button
            onClick={() => {
              setIsAdminLoginModalOpen(false);
              setErrorMessage('');
            }}
            className="text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-white/5 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h3 className="font-kfc text-3xl font-black text-white uppercase tracking-tight">
            KCD Seller Center
          </h3>
          <p className="text-zinc-400 text-xs mt-1">
            Secure administrative authentication for KFC Chakwal management. Powered by Firebase Authentication with role-based access control.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-950/50 border border-red-800 text-red-200 text-xs font-bold rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#e4002b]" />
              <span>Admin Email</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMessage('');
              }}
              placeholder="kfcchakwal@gmail.com"
              className="w-full bg-[#121214] border border-[#2e2e38] text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#e4002b] font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[#e4002b]" />
              <span>Admin Password</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMessage('');
              }}
              placeholder="Enter secure password"
              className="w-full bg-[#121214] border border-[#2e2e38] text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#e4002b] font-medium"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#e4002b] hover:bg-[#c30025] disabled:opacity-50 text-white font-kfc uppercase text-lg py-3 rounded-xl font-black cursor-pointer transition-all shadow-xl shadow-red-950/40 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Verifying Authorization...</span>
              </>
            ) : (
              <span>Sign In to Admin Portal</span>
            )}
          </button>
          <button
            type="button"
            disabled={resetBusy || isLoading}
            onClick={async () => {
              setResetBusy(true);
              setErrorMessage('');
              const result = await resetAdminPassword(email.trim());
              setResetBusy(false);
              setErrorMessage(result.success
                ? 'Password reset email bhej di gayi hai. Inbox/spam check karein.'
                : (result.error || 'Password reset email send nahi ho saka.'));
            }}
            className="w-full py-2 text-xs font-bold text-zinc-400 hover:text-white disabled:opacity-50 cursor-pointer"
          >
            {resetBusy ? 'Sending reset email...' : 'Forgot / Reset Admin Password'}
          </button>
        </form>

        <div className="bg-[#121214] p-3.5 rounded-2xl border border-[#26262e] text-[11px] text-zinc-400 space-y-1">
          <p className="font-semibold text-zinc-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Zero-Trust Security Verification</span>
          </p>
          <p className="text-zinc-500 leading-relaxed">
            All administrative actions are authenticated against server-verified cryptographic tokens and Firestore permission rules. No client URL bypasses permitted.
          </p>
        </div>

      </div>
    </div>
  );
};
