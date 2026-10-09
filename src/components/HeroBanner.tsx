import React from 'react';
import { useStore } from '../context/StoreContext';
import { ArrowRight, Flame, ShieldCheck, Clock, Bike, Sparkles, Percent } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const { settings, setIsCustomizerOpen, isAdmin, themeMode } = useStore();

  const isDark = themeMode === 'dark';

  // If admin has removed/disabled 1st section (Crispy. Juicy.)
  if (settings.hero?.enabled === false) {
    return null;
  }

  const scrollToMenu = () => {
    const el = document.getElementById('kfc-menu-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const heroImage = settings.hero?.imageUrl || '/src/assets/images/kfc_hero_zinger_combo_1791015805739.jpg';
  const headline = settings.hero?.headline || 'CRISPY. JUICY.';
  const highlightText = settings.hero?.highlightText || "FINGER LICKIN'";
  const subtext = settings.hero?.subtext || 'Order your favorite KFC Pakistan Zingers, Krunch Combos, Hot Wings, and Mega Buckets delivered piping hot right to your doorstep anywhere in Chakwal.';
  const ctaText = settings.hero?.ctaButtonText || 'EXPLORE ALL ITEMS';
  const deliveryBadge = settings.hero?.deliveryBadgeText || 'Chakwal Delivery';

  return (
    <div className={`relative overflow-hidden border-b transition-colors ${
      isDark
        ? 'bg-gradient-to-r from-[#141416] via-[#1a080a] to-[#24060b] border-[#2e2e33]'
        : 'bg-gradient-to-r from-red-50 via-rose-50 to-orange-50 border-zinc-200'
    }`}>
      {/* Decorative KFC red accent ambient glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#e4002b]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 left-10 w-72 h-72 bg-[#e4002b]/10 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Headlines & CTA */}
          <div className="lg:col-span-7 space-y-5 text-left">
            
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="bg-[#e4002b] text-white font-extrabold uppercase px-2.5 py-1 rounded tracking-wider flex items-center gap-1.5 shadow-sm">
                <Bike className="w-3.5 h-3.5" />
                {deliveryBadge} · Rs {settings.deliveryFee}
              </span>
              {isAdmin ? (
                <span className={`font-semibold px-2.5 py-1 rounded border flex items-center gap-1.5 ${
                  isDark ? 'bg-[#242429] text-zinc-300 border-[#383842]' : 'bg-white text-zinc-800 border-zinc-300'
                }`}>
                  <Percent className="w-3.5 h-3.5 text-[#e4002b]" />
                  +{settings.markupPercentage}% Store Markup
                </span>
              ) : (
                <span className={`font-semibold px-2.5 py-1 rounded border flex items-center gap-1.5 ${
                  isDark ? 'bg-[#242429] text-zinc-300 border-[#383842]' : 'bg-white text-zinc-800 border-zinc-300'
                }`}>
                  <Flame className="w-3.5 h-3.5 text-[#e4002b]" />
                  Fresh & Hot to Your Doorstep
                </span>
              )}
              <span className="bg-emerald-950/60 text-emerald-400 font-semibold px-2.5 py-1 rounded border border-emerald-800/50 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                100% Halal Verified
              </span>
            </div>

            {/* Main Headline with KFC Display Font */}
            <div className="space-y-1">
              <h1 className={`font-kfc text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] ${
                isDark ? 'text-white' : 'text-zinc-900'
              }`}>
                {headline} <br />
                <span className="text-[#e4002b]">{highlightText}</span> {settings.hero?.endingText ?? 'GOOD.'}
              </h1>
              <p className={`text-sm sm:text-base max-w-xl pt-2 font-normal leading-relaxed ${
                isDark ? 'text-zinc-400' : 'text-zinc-600'
              }`}>
                {subtext}
              </p>
            </div>

            {/* Quick Feature Metric Cards */}
            <div className="grid grid-cols-3 gap-3 pt-2 max-w-lg">
              <div className={`border p-3 rounded-2xl ${
                isDark ? 'bg-[#18181c] border-[#2a2a30]' : 'bg-white border-zinc-200 shadow-sm'
              }`}>
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
                  <Clock className="w-3.5 h-3.5 text-[#e4002b]" />
                  <span>Avg Delivery</span>
                </div>
                <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>35 - 45 Mins</p>
              </div>

              <div className={`border p-3 rounded-2xl ${
                isDark ? 'bg-[#18181c] border-[#2a2a30]' : 'bg-white border-zinc-200 shadow-sm'
              }`}>
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
                  <Bike className="w-3.5 h-3.5 text-[#e4002b]" />
                  <span>Delivery Fee</span>
                </div>
                <p className={`text-sm font-bold tabular-nums ${isDark ? 'text-white' : 'text-zinc-900'}`}>Rs. {settings.deliveryFee}</p>
              </div>

              <div className={`border p-3 rounded-2xl ${
                isDark ? 'bg-[#18181c] border-[#2a2a30]' : 'bg-white border-zinc-200 shadow-sm'
              }`}>
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>Preparation</span>
                </div>
                <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Piping Hot</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
              <button
                onClick={scrollToMenu}
                className="buy-button w-full sm:w-auto min-h-[48px] bg-[#e4002b] hover:bg-[#c30025] text-white font-kfc uppercase text-xl px-7 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-red-950/50 hover:shadow-red-900/60 cursor-pointer active:scale-98"
                aria-label="Explore all KFC menu items"
              >
                <span>{ctaText}</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              {isAdmin && (
                <button
                  onClick={() => setIsCustomizerOpen(true)}
                  className={`text-xs font-semibold px-4 py-3 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                    isDark
                      ? 'bg-[#1c1c20] hover:bg-[#27272e] text-zinc-200 hover:text-white border-[#33333d]'
                      : 'bg-white hover:bg-zinc-100 text-zinc-800 border-zinc-300 shadow-sm'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Customize Banner & Hero</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Outer decorative glow and border */}
              <div className={`relative rounded-3xl overflow-hidden shadow-2xl border group ${
                isDark ? 'border-red-950/60 bg-[#161619]' : 'border-zinc-200 bg-white'
              }`}>
                <img
                  src={heroImage}
                  alt="KFC Zinger Combo with Fries and Drink"
                  className="w-full h-72 sm:h-84 object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.src = '/src/assets/images/kfc_hero_zinger_combo_1791015805739.jpg';
                  }}
                />

                {/* Scrim Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 pointer-events-none" />

                {/* Floating Tag */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-black/75 backdrop-blur-md border border-white/10 p-3 rounded-2xl text-white">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#e4002b]">
                      Most Ordered in Chakwal
                    </span>
                    <h3 className="font-bold text-white text-sm">Zinger Combo Meal</h3>
                    <p className="text-zinc-400 text-xs">Burger + Fries + Chilled Soft Drink</p>
                  </div>
                  <button
                    onClick={scrollToMenu}
                    className="bg-[#e4002b] hover:bg-[#c30025] text-white text-xs font-bold px-3 py-2 rounded-xl cursor-pointer transition-colors"
                  >
                    View Item
                  </button>
                </div>
              </div>

              {/* Floating Top Badge */}
              <div className="absolute -top-3 -right-3 bg-[#e4002b] text-white text-xs font-black px-3.5 py-1.5 rounded-full shadow-lg border-2 border-white transform rotate-6">
                CHAKWAL SPECIAL
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

