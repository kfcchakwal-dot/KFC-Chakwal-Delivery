import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { VipTierId } from '../types';
import { 
  X, 
  Crown, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  Smartphone,
  Copy,
  CheckCircle2
} from 'lucide-react';

export const VipClubModal: React.FC = () => {
  const {
    isVipModalOpen,
    setIsVipModalOpen,
    vipTiers,
    currentUser,
    setIsCustomerAuthModalOpen,
    requestVipMembership,
    themeMode,
    formatPKR,
  } = useStore();

  const [selectedTierId, setSelectedTierId] = useState<VipTierId>('silver');
  const [paymentMethod, setPaymentMethod] = useState<'jazzcash' | 'easypaisa' | 'bank_transfer'>('jazzcash');
  const [transactionId, setTransactionId] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);

  const isDark = themeMode === 'dark';

  if (!isVipModalOpen) return null;

  const selectedTier = vipTiers.find((t) => t.id === selectedTierId) || vipTiers[0];
  const isUserVipActive = currentUser?.vipStatus === 'active';
  const isUserVipPending = currentUser?.vipStatus === 'pending';

  const handleCopyPaymentNumber = () => {
    navigator.clipboard.writeText('03252777574');
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setIsCustomerAuthModalOpen(true);
      return;
    }
    if (!transactionId.trim()) return;

    requestVipMembership(selectedTierId, paymentMethod, transactionId.trim());
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden max-h-[92vh] flex flex-col ${
        isDark ? 'bg-[#151518] border-[#292934] text-white' : 'bg-white border-zinc-200 text-zinc-900'
      }`}>
        
        {/* VIP Gold Banner Header */}
        <div className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 p-5 text-zinc-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-950 text-amber-400 flex items-center justify-center shadow-lg shrink-0">
              <Crown className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-zinc-950/20 px-2 py-0.5 rounded-full">
                Lifetime Exclusive Program
              </span>
              <h3 className="font-kfc text-2xl sm:text-3xl font-black uppercase tracking-tight leading-none mt-1 text-zinc-950">
                Colonel's VIP Club
              </h3>
            </div>
          </div>

          <button
            onClick={() => setIsVipModalOpen(false)}
            className="text-zinc-950/80 hover:text-zinc-950 p-2 rounded-full bg-black/10 hover:bg-black/20 cursor-pointer"
            aria-label="Close VIP modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">

          {/* ACTIVE VIP MEMBER CARD */}
          {isUserVipActive ? (
            <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-transparent border border-amber-500/50 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center mx-auto shadow-xl">
                <Crown className="w-8 h-8" />
              </div>
              <h4 className="font-kfc text-2xl uppercase font-black text-amber-400">
                You are a VIP Member!
              </h4>
              <p className="text-xs text-zinc-300">
                Your <strong>{currentUser?.vipTier?.toUpperCase()} PASS</strong> is active. You enjoy guaranteed lifetime discount on every single order across Chakwal!
              </p>
              <div className="inline-block bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/40">
                ✓ Auto-Applied on All Checkouts
              </div>
            </div>
          ) : isUserVipPending || isSubmitted ? (
            <div className="p-5 rounded-3xl bg-blue-500/15 border border-blue-500/40 text-center space-y-3">
              <Clock className="w-10 h-10 text-blue-400 mx-auto animate-spin" />
              <h4 className="font-bold text-base text-blue-300">
                VIP Pass Request Received!
              </h4>
              <p className="text-xs text-zinc-300">
                Aapki one-time payment verification KFC Chakwal Delivery admin team ke paas chali gayi hai. 30 minutes ke andar verify karke aapka lifetime discount open kar diya jayega.
              </p>
              <p className="text-[11px] font-mono text-zinc-400">
                Status: Pending Manual Approval
              </p>
            </div>
          ) : (
            <>
              {/* TIER SELECTION CARDS */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                  Select Your Lifetime Tier (One-Time Payment):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {vipTiers.map((tier) => {
                    const isSelected = selectedTierId === tier.id;
                    return (
                      <div
                        key={tier.id}
                        onClick={() => setSelectedTierId(tier.id)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all relative ${
                          isSelected
                            ? 'border-amber-500 bg-amber-500/15 shadow-lg scale-[1.02]'
                            : isDark ? 'border-zinc-800 bg-[#1a1a21]' : 'border-zinc-200 bg-zinc-50'
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center text-xs font-black">
                            ✓
                          </span>
                        )}
                        <span className="text-[10px] font-black uppercase text-amber-500">
                          Flat {tier.discountPercentage}% OFF
                        </span>
                        <h4 className="font-kfc text-lg font-black uppercase truncate mt-0.5">
                          {tier.name}
                        </h4>
                        <div className="mt-1">
                          <span className="text-base font-black text-[#e4002b] font-mono">
                            {formatPKR(tier.price)}
                          </span>
                          <span className="text-[9px] text-zinc-400 ml-1">One-Time</span>
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-1 line-clamp-2">
                          {tier.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Perks List for Selected Tier */}
              <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
                isDark ? 'bg-[#1b1b22] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
              }`}>
                <h5 className="font-bold text-[11px] uppercase tracking-wider text-amber-500">
                  {selectedTier.name} Perks:
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-zinc-300">
                  {selectedTier.perks.map((p, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Instructions & Submission Form */}
              <form onSubmit={handleSubmitRequest} className="space-y-3 pt-2">
                <div className={`p-3.5 rounded-2xl border text-xs space-y-2 ${
                  isDark ? 'bg-[#18181f] border-zinc-800' : 'bg-amber-50/50 border-amber-200'
                }`}>
                  <p className="font-bold text-amber-500">One-Time Payment Instructions:</p>
                  <p className="text-[11px] text-zinc-400">
                    Send <strong>{formatPKR(selectedTier.price)}</strong> via JazzCash or Easypaisa to our official number:
                  </p>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-black/30 border border-zinc-700/50">
                    <span className="font-mono text-sm font-bold text-white">+92 325 2777574</span>
                    <button
                      type="button"
                      onClick={handleCopyPaymentNumber}
                      className="text-[11px] text-amber-400 hover:text-white flex items-center gap-1 cursor-pointer font-bold"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedNumber ? 'Copied!' : 'Copy Number'}</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-500">
                    Account Title: <strong>KFC Chakwal Delivery</strong>
                  </p>
                </div>

                {/* Payment Method Selector */}
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">
                    Select Your Payment Method:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['jazzcash', 'easypaisa', 'bank_transfer'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPaymentMethod(m)}
                        className={`p-2.5 rounded-xl border text-xs font-bold capitalize cursor-pointer transition ${
                          paymentMethod === m
                            ? 'bg-[#e4002b] text-white border-[#e4002b]'
                            : isDark ? 'bg-[#1b1b22] border-zinc-800 text-zinc-400' : 'bg-zinc-100 border-zinc-200 text-zinc-700'
                        }`}
                      >
                        {m === 'bank_transfer' ? 'Bank' : m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Transaction ID Input */}
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">
                    Transaction ID / TID (from SMS / Receipt) *
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="e.g. TID 18928374921"
                    className={`w-full text-xs rounded-xl px-3.5 py-2.5 border focus:outline-none focus:border-amber-500 font-mono ${
                      isDark ? 'bg-[#121214] border-[#2e2e38] text-white' : 'bg-white border-zinc-300 text-zinc-900'
                    }`}
                    required
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 font-kfc uppercase text-xl font-black py-3.5 px-4 rounded-xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition active:scale-98"
                >
                  <Crown className="w-5 h-5" />
                  <span>Activate {selectedTier.name} ({formatPKR(selectedTier.price)})</span>
                </button>
              </form>
            </>
          )}

        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex items-center justify-between shrink-0 ${
          isDark ? 'bg-[#111114] border-zinc-800' : 'bg-zinc-100 border-zinc-200'
        }`}>
          <span className="text-[11px] text-zinc-500">
            One-time payment · Valid for lifetime orders
          </span>

          <button
            type="button"
            onClick={() => setIsVipModalOpen(false)}
            className="text-xs text-zinc-400 hover:text-white font-medium cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
