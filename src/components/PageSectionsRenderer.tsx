import React from 'react';
import { PageSection } from '../types';
import { useStore } from '../context/StoreContext';
import { Clock, Bike, ArrowRight, ShieldCheck, Sparkles, Plus, Edit2 } from 'lucide-react';

interface PageSectionsRendererProps {
  page: 'home' | 'collection' | 'product' | 'wishlist';
}

export const PageSectionsRenderer: React.FC<PageSectionsRendererProps> = ({ page }) => {
  const { settings, themeMode, isAdmin, setIsCustomizerOpen } = useStore();
  const isDark = themeMode === 'dark';

  const sections = (settings.customSections || [])
    .filter((sec) => (sec.page === page || sec.page === 'all') && sec.isVisible && sec.id !== 'sec-delivery-guarantee' && !/picked from kallar kahar/i.test([sec.title, sec.subtitle, sec.description, sec.badgeText].filter(Boolean).join(' ')))
    .sort((a, b) => a.order - b.order);

  if (sections.length === 0 && !isAdmin) return null;

  return (
    <div className="space-y-10 my-8">
      {sections.map((section) => {
        if (section.type === 'image-with-text') {
          const isImageLeft = section.imagePosition === 'left';
          return (
            <section
              key={section.id}
              className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`}
            >
              <div
                className={`rounded-3xl border overflow-hidden transition-all duration-300 ${
                  isDark
                    ? 'bg-[#151518] border-[#292933]'
                    : 'bg-white border-zinc-200 shadow-sm'
                }`}
              >
                <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${
                  isImageLeft ? '' : 'lg:flex-row-reverse'
                }`}>
                  {/* Image Column */}
                  <div className={`lg:col-span-6 relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-auto lg:h-[380px] w-full overflow-hidden ${
                    isImageLeft ? 'order-1' : 'order-1 lg:order-2'
                  }`}>
                    <img
                      src={section.imageUrl || '/src/assets/images/kfc_hero_zinger_combo_1791015805739.jpg'}
                      alt={section.title}
                      className="w-full h-full object-cover object-center"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.src = '/src/assets/images/kfc_hero_zinger_combo_1791015805739.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                    {section.badgeText && (
                      <span className="absolute top-4 left-4 bg-[#e4002b] text-white text-xs font-black uppercase px-3 py-1 rounded-full shadow-lg tracking-wider">
                        {section.badgeText}
                      </span>
                    )}
                  </div>

                  {/* Text Column */}
                  <div className={`lg:col-span-6 p-6 sm:p-10 lg:p-12 space-y-4 ${
                    isImageLeft ? 'order-2' : 'order-2 lg:order-1'
                  }`}>
                    {section.subtitle && (
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#e4002b]">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{section.subtitle}</span>
                      </div>
                    )}
                    <h2
                      style={{ fontFamily: settings.headingFont || 'Barlow Condensed' }}
                      className={`text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-tight ${
                        isDark ? 'text-white' : 'text-zinc-900'
                      }`}
                    >
                      {section.title}
                    </h2>
                    <p
                      style={{ fontFamily: settings.bodyFont || 'Plus Jakarta Sans' }}
                      className={`text-sm sm:text-base leading-relaxed ${
                        isDark ? 'text-zinc-300' : 'text-zinc-600'
                      }`}
                    >
                      {section.description}
                    </p>

                    {section.buttonText && (
                      <div className="pt-2 flex flex-wrap gap-3 items-center">
                        <a
                          href={section.buttonLink || '#kfc-menu-section'}
                          className="inline-flex items-center gap-2 bg-[#e4002b] hover:bg-[#c30025] text-white font-black text-xs uppercase px-6 py-3.5 rounded-xl shadow-lg shadow-red-950/40 hover:shadow-red-900/60 transition-all cursor-pointer"
                        >
                          <span>{section.buttonText}</span>
                          <ArrowRight className="w-4 h-4" />
                        </a>

                        {isAdmin && (
                          <button
                            onClick={() => setIsCustomizerOpen(true)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white"
                          >
                            <Edit2 className="w-3 h-3 text-amber-400" />
                            <span>Edit Section</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          );
        }

        if (section.type === 'delivery-info') {
          return (
            <section
              key={section.id}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            >
              <div
                className={`rounded-3xl border p-6 sm:p-8 lg:p-10 transition-all duration-300 relative overflow-hidden ${
                  isDark
                    ? 'bg-gradient-to-br from-[#18181f] via-[#141417] to-[#121214] border-[#2c2c36]'
                    : 'bg-gradient-to-br from-red-50/70 via-white to-zinc-50 border-zinc-200 shadow-sm'
                }`}
              >
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7 space-y-3">
                    <div className="inline-flex items-center gap-2 bg-[#e4002b]/10 text-[#e4002b] border border-[#e4002b]/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      <Bike className="w-3.5 h-3.5" />
                      <span>{section.badgeText || 'Chakwal Express'}</span>
                    </div>

                    <h2
                      style={{ fontFamily: settings.headingFont || 'Barlow Condensed' }}
                      className={`text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight ${
                        isDark ? 'text-white' : 'text-zinc-900'
                      }`}
                    >
                      {section.title}
                    </h2>

                    <p
                      style={{ fontFamily: settings.bodyFont || 'Plus Jakarta Sans' }}
                      className={`text-xs sm:text-sm leading-relaxed ${
                        isDark ? 'text-zinc-300' : 'text-zinc-600'
                      }`}
                    >
                      {section.description}
                    </p>
                  </div>

                  {/* Highlights Grid */}
                  <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                    <div
                      className={`p-4 rounded-2xl border ${
                        isDark
                          ? 'bg-[#1b1b22] border-[#2d2d38]'
                          : 'bg-white border-zinc-200 shadow-sm'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2">
                        <Clock className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold uppercase text-zinc-400 block">
                        Estimated Time
                      </span>
                      <p className="text-base sm:text-lg font-black text-amber-500 tabular-nums">
                        {section.estimatedTime || '30-40 Mins'}
                      </p>
                    </div>

                    <div
                      className={`p-4 rounded-2xl border ${
                        isDark
                          ? 'bg-[#1b1b22] border-[#2d2d38]'
                          : 'bg-white border-zinc-200 shadow-sm'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-[#e4002b]/10 text-[#e4002b] flex items-center justify-center mb-2">
                        <Bike className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold uppercase text-zinc-400 block">
                        Delivery Charges
                      </span>
                      <p className="text-base sm:text-lg font-black text-[#e4002b] tabular-nums">
                        {section.deliveryFeeText || `Rs. ${settings.deliveryFee}`}
                      </p>
                    </div>

                    <div
                      className={`col-span-2 p-3.5 rounded-2xl border flex items-center justify-between ${
                        isDark
                          ? 'bg-[#1b1b22] border-[#2d2d38]'
                          : 'bg-white border-zinc-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className={`text-xs font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                          {section.deliveryAreaText || 'Coverage across all Chakwal city zones'}
                        </span>
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => setIsCustomizerOpen(true)}
                          className="text-[11px] text-[#e4002b] font-bold hover:underline"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        }

        return null;
      })}

      {/* Admin Quick Add Section Banner */}
      {isAdmin && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setIsCustomizerOpen(true)}
            className={`w-full py-4 border-2 border-dashed rounded-2xl flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
              isDark
                ? 'border-zinc-800 hover:border-[#e4002b] text-zinc-400 hover:text-white bg-zinc-900/40'
                : 'border-zinc-300 hover:border-[#e4002b] text-zinc-600 hover:text-zinc-900 bg-zinc-50'
            }`}
          >
            <Plus className="w-4 h-4 text-[#e4002b]" />
            <span>+ Add New Custom Section on {page.toUpperCase()} Page (Image with Text / Delivery Info / Banners)</span>
          </button>
        </div>
      )}
    </div>
  );
};
