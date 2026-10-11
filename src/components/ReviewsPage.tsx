import React from 'react';
import { ArrowLeft, Star, MessageSquare, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const ReviewsPage: React.FC = () => {
  const { reviews, menuItems, viewProduct, goHome, settings, themeMode } = useStore();
  const config = settings.reviewWidgets || {};
  const dark = themeMode === 'dark';
  const visible = reviews
    .filter((review) => review.isVisible !== false)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const average = visible.length
    ? (visible.reduce((sum, review) => sum + Math.max(1, Math.min(5, Number(review.rating) || 0)), 0) / visible.length).toFixed(1)
    : '—';

  if (config.enabled === false || config.showOnReviewsPage === false) {
    return <main className="mx-auto max-w-3xl px-4 py-20 text-center"><h1 className="text-2xl font-black">Reviews temporarily unavailable</h1><button onClick={goHome} className="mt-5 rounded-xl bg-[#e4002b] px-5 py-3 text-sm font-bold text-white">Back to menu</button></main>;
  }

  return (
    <main className={`min-h-[65vh] ${dark ? 'bg-[#0e0e11] text-white' : 'bg-[#f8f9fa] text-zinc-900'}`}>
      <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10">
        <button type="button" onClick={goHome} className="mb-6 inline-flex items-center gap-2 rounded-xl border border-zinc-300 px-3 py-2 text-xs font-bold hover:text-[#e4002b]"><ArrowLeft className="h-4 w-4" /> Back to menu</button>
        <header className={`rounded-3xl border p-6 sm:p-9 ${dark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#e4002b]">KFC Chakwal Delivery</p>
          <h1 className="mt-2 text-3xl font-black uppercase sm:text-4xl">Customer Reviews</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">Customers share their experience with food, packaging and delivery. Select a product below to leave your own review on its product page.</p>
          <div className="mt-5 flex items-center gap-3"><Star className="h-6 w-6 fill-amber-400 text-amber-400" /><span className="text-2xl font-black text-amber-500">{average}</span><span className="text-sm text-zinc-500">average rating · {visible.length} published review{visible.length === 1 ? '' : 's'}</span></div>
        </header>
        <section className="mt-8">
          <h2 className="mb-4 text-xl font-black">Published feedback</h2>
          {visible.length ? <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {visible.map((review) => {
              const product = menuItems.find((item) => item.id === review.productId);
              return <article key={review.id} className={`rounded-2xl border p-5 ${dark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
                <div className="flex items-start justify-between gap-3"><div><p className="font-bold">{review.customerName || 'Customer'}</p><p className="mt-1 text-xs text-zinc-500">{product?.name || 'KFC Chakwal Delivery'}</p></div><span className="shrink-0 text-sm tracking-tight text-amber-500">{'★'.repeat(Math.max(1, Math.min(5, Number(review.rating) || 1)))}</span></div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-500">{review.comment}</p>
                <p className="mt-3 text-[11px] text-zinc-400">{review.date ? new Date(review.date).toLocaleDateString() : ''}</p>
                {product && <button type="button" onClick={() => viewProduct(product)} className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-[#e4002b]"><ShoppingBag className="h-4 w-4" /> View product / write review</button>}
              </article>;
            })}
          </div> : <div className={`rounded-2xl border p-8 text-center ${dark ? 'border-zinc-800' : 'border-zinc-200 bg-white'}`}><MessageSquare className="mx-auto h-8 w-8 text-zinc-400" /><p className="mt-3 font-bold">Abhi koi published review nahi.</p><p className="mt-1 text-sm text-zinc-500">Kisi product ko select karke apna genuine experience share karein.</p></div>}
        </section>
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-black">Review a product</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {menuItems.filter(item => item.status !== 'draft' && item.isAvailable !== false).slice(0, 16).map(item => <button type="button" key={item.id} onClick={() => viewProduct(item)} className={`overflow-hidden rounded-2xl border text-left transition hover:-translate-y-0.5 hover:border-[#e4002b] ${dark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-white'}`}><img src={item.image} alt={item.name} loading="lazy" className="aspect-square w-full object-cover" /><span className="block p-3 text-xs font-bold">{item.name}</span></button>)}
          </div>
        </section>
      </div>
    </main>
  );
};
