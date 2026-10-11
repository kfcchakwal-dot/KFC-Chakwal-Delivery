import React from 'react';
import { Star, MessageSquare, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const ReviewsWidget: React.FC<{ variant?: 'home' | 'compact' }> = ({ variant = 'home' }) => {
  const { reviews, settings, setCurrentView, themeMode } = useStore();
  const config = settings.reviewWidgets || {};
  if (config.enabled === false) return null;
  if (variant === 'home' && config.showOnHomePage !== true) return null;

  const visible = reviews
    .filter((review) => review.isVisible !== false)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const max = Math.max(1, Math.min(8, Number(config.maxReviewsOnWidgets) || 3));
  const shown = visible.slice(0, max);
  const average = visible.length
    ? (visible.reduce((sum, review) => sum + Math.max(1, Math.min(5, Number(review.rating) || 0)), 0) / visible.length).toFixed(1)
    : '—';
  const dark = themeMode === 'dark';

  return (
    <section className={`mx-auto my-8 w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${variant === 'compact' ? 'my-4' : ''}`}>
      <div className={`rounded-3xl border p-5 sm:p-7 ${dark ? 'border-zinc-800 bg-zinc-900 text-white' : 'border-zinc-200 bg-white text-zinc-900 shadow-sm'}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#e4002b]">Real customer feedback</p>
            <h2 className="mt-1 text-xl font-black sm:text-2xl">Customer Reviews</h2>
            <p className="mt-1 text-xs text-zinc-500">{visible.length} published review{visible.length === 1 ? '' : 's'}</p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-amber-500/10 px-3 py-2">
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            <span className="text-xl font-black text-amber-500">{average}</span>
          </div>
        </div>
        {shown.length ? (
          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
            {shown.map((review) => (
              <article key={review.id} className={`rounded-2xl border p-4 ${dark ? 'border-zinc-800 bg-zinc-950/60' : 'border-zinc-100 bg-zinc-50'}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-bold">{review.customerName || 'Customer'}</span>
                  <span className="shrink-0 text-xs tracking-tight text-amber-500">{'★'.repeat(Math.max(1, Math.min(5, Number(review.rating) || 1)))}</span>
                </div>
                <p className="mt-2 line-clamp-3 text-xs leading-5 text-zinc-500">{review.comment}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-5 rounded-xl bg-zinc-500/5 p-4 text-sm text-zinc-500">Abhi tak koi published review nahi. Product page par ja kar apna experience share karein.</p>
        )}
        <button type="button" onClick={() => { setCurrentView('reviews'); window.history.pushState({ kfcView: 'reviews' }, '', '?view=reviews'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#e4002b] px-4 py-2.5 text-xs font-black uppercase text-white transition hover:bg-[#c30025]">
          <MessageSquare className="h-4 w-4" /> View all reviews <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
};
