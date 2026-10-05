import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  X, 
  Sparkles, 
  Gift, 
  HelpCircle, 
  History, 
  CheckCircle2, 
  ArrowRight, 
  Coins, 
  Award,
  Zap,
  User,
  ShieldCheck
} from 'lucide-react';

export const LoyaltyProgramModal: React.FC = () => {
  const {
    isLoyaltyModalOpen,
    setIsLoyaltyModalOpen,
    currentUser,
    setIsCustomerAuthModalOpen,
    loyaltyTransactions,
    formatPKR,
    themeMode,
    setIsVipModalOpen,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'balance' | 'how-it-works' | 'history'>('balance');
  const isDark = themeMode === 'dark';

  if (!isLoyaltyModalOpen) return null;

  const points = currentUser?.loyaltyPoints || 0;
  const userTransactions = loyaltyTransactions.filter(
    (tx) => tx.customerId === currentUser?.id || tx.customerId === 'all'
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden max-h-[92vh] flex flex-col ${
        isDark ? 'bg-[#151518] border-[#292934] text-white' : 'bg-white border-zinc-200 text-zinc-900'
      }`}>
        
        {/* Header with KFC Red Branding */}
        <div className="bg-gradient-to-r from-[#e4002b] via-[#c30025] to-[#99001c] p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-inner shrink-0">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                KFC Chakwal Club
              </span>
              <h3 className="font-kfc text-2xl sm:text-3xl font-black uppercase tracking-tight leading-none mt-1">
                Loyalty Rewards Hub
              </h3>
            </div>
          </div>

          <button
            onClick={() => setIsLoyaltyModalOpen(false)}
            className="text-white/80 hover:text-white p-2 rounded-full bg-black/20 hover:bg-black/40 cursor-pointer"
            aria-label="Close loyalty modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className={`grid grid-cols-3 gap-1 p-2 border-b shrink-0 text-xs font-bold ${
          isDark ? 'bg-[#1a1a21] border-[#292934]' : 'bg-zinc-100 border-zinc-200'
        }`}>
          <button
            type="button"
            onClick={() => setActiveTab('balance')}
            className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'balance'
                ? 'bg-[#e4002b] text-white shadow-md'
                : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>My Points</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('how-it-works')}
            className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'how-it-works'
                ? 'bg-[#e4002b] text-white shadow-md'
                : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How It Works</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[#e4002b] text-white shadow-md'
                : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History</span>
          </button>
        </div>

        {/* Tab 1: Balance & Overview */}
        {activeTab === 'balance' && (
          <div className="p-5 overflow-y-auto space-y-4">
            
            {/* Main Balance Banner */}
            <div className={`p-5 rounded-3xl border text-center relative overflow-hidden ${
              isDark 
                ? 'bg-gradient-to-br from-[#1d1d26] to-[#121217] border-amber-500/30' 
                : 'bg-gradient-to-br from-amber-500/10 via-amber-100/50 to-orange-50 border-amber-300'
            }`}>
              <div className="relative z-10">
                <span className="text-xs uppercase font-extrabold text-amber-500 tracking-wider">
                  Available Loyalty Balance
                </span>
                <div className="flex items-center justify-center gap-2 my-2">
                  <Coins className="w-8 h-8 text-amber-500" />
                  <span className={`text-4xl sm:text-5xl font-black font-sans tabular-nums ${
                    isDark ? 'text-white' : 'text-zinc-900'
                  }`}>
                    {points}
                  </span>
                  <span className="text-lg font-bold text-amber-500">Pts</span>
                </div>

                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  Worth <strong className="text-emerald-500 font-mono text-sm">{formatPKR(points)} Direct Discount</strong> on your next Chakwal order!
                </p>

                {currentUser ? (
                  <div className="mt-3 inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Logged In as {currentUser.fullName} ({currentUser.phone})</span>
                  </div>
                ) : (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsLoyaltyModalOpen(false);
                        setIsCustomerAuthModalOpen(true);
                      }}
                      className="bg-[#e4002b] hover:bg-[#c30025] text-white text-xs font-bold uppercase px-5 py-2.5 rounded-xl shadow-lg cursor-pointer"
                    >
                      Login / Register to Save Points
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Teaser for Colonel's VIP Club Lifetime Pass */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
              isDark ? 'bg-gradient-to-r from-amber-500/15 to-orange-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-zinc-950 flex items-center justify-center font-black text-lg shrink-0">
                  ★
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase text-amber-500">
                    Want Lifetime 3% to 8% Discount?
                  </h4>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-300">
                    Join Colonel's VIP Club with a one-time payment starting at Rs. 499!
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsLoyaltyModalOpen(false);
                  setIsVipModalOpen(true);
                }}
                className="bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black uppercase px-3 py-2 rounded-xl shrink-0 cursor-pointer shadow"
              >
                View Pass
              </button>
            </div>

            {/* Quick Rules Snapshot */}
            <div className={`p-4 rounded-2xl border space-y-2.5 text-xs ${
              isDark ? 'bg-[#18181f] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
            }`}>
              <h4 className="font-bold uppercase tracking-wider text-[11px] text-[#e4002b]">
                Key Points Rules:
              </h4>
              <div className="space-y-1.5 text-zinc-400 dark:text-zinc-300 text-[11px]">
                <p>✓ <strong>Earn:</strong> 10 points for every Rs. 300 spent on food.</p>
                <p>✓ <strong>Redeem:</strong> 1 Point = 1 PKR deduction on checkout.</p>
                <p>✓ <strong>Min Order:</strong> Rs. 500 cart order required to redeem points.</p>
                <p>✓ <strong>Exclusive:</strong> Loyalty points cannot be combined with discount coupon codes.</p>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: How It Works */}
        {activeTab === 'how-it-works' && (
          <div className="p-5 overflow-y-auto space-y-4">
            
            <div className="space-y-3">
              {/* Step 1 */}
              <div className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
                isDark ? 'bg-[#18181f] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
              }`}>
                <div className="w-8 h-8 rounded-xl bg-[#e4002b] text-white flex items-center justify-center font-black text-sm shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-xs">Place an Order on KFC Chakwal</h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Whenever you order Zingers, Krunch Combos, or Buckets, your spent amount is tracked automatically.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
                isDark ? 'bg-[#18181f] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
              }`}>
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-zinc-950 flex items-center justify-center font-black text-sm shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-xs">Earn 10 Points on Every Rs. 300</h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    For example, an order of Rs. 1,500 earns you 50 Loyalty Points immediately added to your wallet.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
                isDark ? 'bg-[#18181f] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
              }`}>
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-xs">Redeem on Checkout for Instant Cash OFF</h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    At checkout, check the "Redeem Points" box to slash your total bill directly. 1 Point = 1 PKR direct discount!
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
                isDark ? 'bg-[#18181f] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
              }`}>
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-bold text-xs">Bonus Points on Reviews & VIP</h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Submit a meal review to claim +20 Bonus Points. Upgrade to Colonel's VIP Club for lifetime percentage discounts!
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 3: History */}
        {activeTab === 'history' && (
          <div className="p-5 overflow-y-auto space-y-3">
            {userTransactions.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-xs">
                <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No loyalty points history yet.</p>
                <p className="text-[11px] mt-1">Place your first order to start earning points!</p>
              </div>
            ) : (
              userTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
                    isDark ? 'bg-[#18181f] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                  }`}
                >
                  <div className="space-y-0.5 min-w-0 pr-2">
                    <p className="font-bold truncate">{tx.description}</p>
                    <p className="text-[10px] text-zinc-400 font-mono">
                      {new Date(tx.date).toLocaleDateString()} · {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <span className={`font-black font-mono text-sm shrink-0 px-2.5 py-1 rounded-xl ${
                    tx.type === 'earned' || tx.type === 'bonus'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/15 text-red-400 border border-red-500/30'
                  }`}>
                    {tx.type === 'earned' || tx.type === 'bonus' ? '+' : '-'}{tx.points} Pts
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Footer */}
        <div className={`p-4 border-t flex items-center justify-between shrink-0 ${
          isDark ? 'bg-[#111114] border-zinc-800' : 'bg-zinc-100 border-zinc-200'
        }`}>
          <button
            type="button"
            onClick={() => setIsLoyaltyModalOpen(false)}
            className="text-xs text-zinc-400 hover:text-white font-medium cursor-pointer"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => {
              setIsLoyaltyModalOpen(false);
              setIsVipModalOpen(true);
            }}
            className="bg-[#e4002b] hover:bg-[#c30025] text-white text-xs font-bold uppercase px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow"
          >
            <span>Colonel's VIP Club</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
