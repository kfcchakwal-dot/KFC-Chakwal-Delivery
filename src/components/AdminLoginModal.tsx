import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, AlertCircle, Loader2 } from 'lucide-react';

export const AdminLoginModal: React.FC = () => {
  const {
    isAdminLoginModalOpen,
    setIsAdminLoginModalOpen,
    loginAdmin,
  } = useStore();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isAdminLoginModalOpen) return null;

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const result = await loginAdmin();
      if (!result.success) {
        setErrorMessage(result.error || 'Admin access nahi mila.');
      } else {
        setIsAdminLoginModalOpen(false);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Google login nahi ho saka.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#18181c] border border-[#2d2d36] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-200 text-white">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 bg-[#e4002b] rounded-2xl flex items-center justify-center text-white shadow-lg">
            <span className="font-kfc font-black text-xl">KCD</span>
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
          <h3 className="font-kfc text-3xl font-black text-white uppercase tracking-tight">KCD Seller Center</h3>
          <p className="text-zinc-400 text-xs mt-1">Sirf authorized Google account se Admin Portal access karein.</p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-950/50 border border-red-800 text-red-200 text-xs font-bold rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full bg-white hover:bg-zinc-50 disabled:opacity-50 text-zinc-900 font-bold text-sm py-3 rounded-xl cursor-pointer transition flex items-center justify-center gap-2 border border-zinc-300"
        >
          <span className="font-black text-base">G</span>
          <span>{isLoading ? 'Please wait...' : 'Continue with Google'}</span>
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        </button>

        <p className="text-[11px] text-zinc-500 text-center">
          Sirf woh Gmail access kar sakti hai jo Admin Team mein authorize ki gayi ho.
        </p>
      </div>
    </div>
  );
};
