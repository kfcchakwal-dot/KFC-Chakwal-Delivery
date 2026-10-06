import React from 'react';
import { useStore } from '../context/StoreContext';
import { Coins, Sparkles, ArrowRight, Gift, UserPlus } from 'lucide-react';

export const LoyaltyPointsBanner: React.FC = () => {
  const { currentUser, setIsCustomerAuthModalOpen, goHome } = useStore();

  const handleRedeemNow = () => {
    // Scrolls to or navigates directly to Menu
    const menuEl = document.getElementById('kfc-menu-section');
    if (menuEl) {
      menuEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      goHome();
      setTimeout(() => {
        const el = document.getElementById('kfc-menu-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 my-4">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-amber-600 to-red-600 p-4 sm:p-5 text-white shadow-xl border border-amber-300/30">
        
        {/* Background decorative coin drops / sparkles effect */}
        <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full bg-yellow-300/20 blur-2xl pointer-events-none" />
        <div className="absolute right-20 top-2 text-yellow-200/40 text-4xl select-none pointer-events-none animate-pulse">
          🪙
        </div>
        <div className="absolute right-6 top-10 text-yellow-200/50 text-3xl select-none pointer-events-none animate-bounce">
          🪙
        </div>
        <div className="absolute right-36 bottom-2 text-yellow-200/30 text-2xl select-none pointer-events-none">
          🪙
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Left: Points / Register Info */}
          <div className="flex items-center gap-3.5">
            {/* Golden Coins Icon Illustration */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0 shadow-lg relative overflow-hidden">
              <span className="text-3xl sm:text-4xl filter drop-shadow">🪙</span>
              <div className="absolute -bottom-1 -right-1 text-xs">✨</div>
            </div>

            <div className="space-y-0.5">
              {currentUser ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="bg-white/25 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
                      Active Balance
                    </span>
                    <span className="text-xs text-yellow-100 font-bold">
                      Assalam o Alaikum, {currentUser.fullName.split(' ')[0]}!
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl sm:text-3xl font-black font-kfc tracking-tight text-white drop-shadow">
                      {currentUser.loyaltyPoints || 0} Points Available
                    </h3>
                    <span className="text-xs text-yellow-200 font-bold font-mono">
                      (= Rs. {currentUser.loyaltyPoints || 0} Discount)
                    </span>
                  </div>
                  <p className="text-[11px] text-white/90">
                    Use your points on checkout to get direct instant discount on any meal.
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="bg-white/25 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider flex items-center gap-1">
                      <Gift className="w-3 h-3" />
                      <span>Welcome Bonus</span>
                    </span>
                    <span className="text-xs text-yellow-100 font-bold">New Customer Offer</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black font-kfc tracking-tight text-white drop-shadow">
                    Register ho aur <span className="text-yellow-200 underline decoration-white">50 Points</span> haasil karo!
                  </h3>
                  <p className="text-[11px] text-white/90">
                    Sign up with your mobile number to instantly claim 50 free reward points.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {!currentUser && (
              <button
                type="button"
                onClick={() => setIsCustomerAuthModalOpen(true)}
                className="bg-white/20 hover:bg-white/30 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-white/40 backdrop-blur-sm transition cursor-pointer flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register Now (Get 50 Pts)</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleRedeemNow}
              className="bg-white hover:bg-yellow-50 text-red-600 font-black text-xs sm:text-sm px-6 py-2.5 rounded-xl uppercase tracking-wider shadow-xl transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Redeem Now</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
