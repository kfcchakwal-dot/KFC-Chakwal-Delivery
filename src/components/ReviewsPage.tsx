import React from 'react';
import { ArrowLeft, Star } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const ReviewsPage: React.FC = () => {
  const { reviews, menuItems, viewProduct, goHome, settings, themeMode } = useStore();
  const visibleReviews = reviews.filter((review) => review.isVisible !== false);
  const isDark = themeMode === 'dark';
  const average = visibleReviews.length ? (visibleReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / visibleReviews.length).toFixed(1) : '0.0';
  return (
    <main className={`mx-auto min-h-[60vh] w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
      <button type="button" onClick={goHome} className="mb-6 inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold hover:border-[#e4002b]"><ArrowLeft size={15}/> Back to menu</button>
      <header className="mb-6 rounded-3xl bg-gradient-to-r from-amber-500 to-red-600 p-6 text-white">
        <p className="text-xs font-black uppercase tracking-widest">KFC Chakwal Delivery</p>
        <h1 className="mt-2 text-3xl font-black">Customer Reviews</h1>
        <p className="mt-2 text-sm">Real feedback from customers about their meals and delivery.</p>
        <div className="mt-4 flex items-center gap-2"><Star className="fill-white" size={18}/><strong>{average}/5</strong><span className="text-sm">· {visibleReviews.length} reviews</span></div>
      </header>
      {settings.reviewWidgetConfig?.enabled === false || settings.reviewWidgetConfig?.showOnReviewsPage === false ? <p className="rounded-2xl border p-5 text-sm">Reviews page temporarily disabled.</p> : visibleReviews.length === 0 ? <p className="rounded-2xl border p-5 text-sm text-zinc-500">Abhi koi review available nahi. Product page par ja kar apna review share karein.</p> : (
        <div className="grid gap-3 sm:grid-cols-2">{visibleReviews.map((review) => {
          const product = menuItems.find((item) => item.id === review.productId);
          return <article key={review.id} className={`rounded-2xl border p-4 ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
            <div className="flex items-start justify-between gap-3"><div><h2 className="font-bold">{review.customerName}</h2><p className="text-xs text-amber-500">{'★'.repeat(Math.max(0, Math.min(5, review.rating)))}{'☆'.repeat(5 - Math.max(0, Math.min(5, review.rating)))}</p></div><time className="text-[10px] text-zinc-500">{review.date || ''}</time></div>
            <p className="mt-3 whitespace-pre-wrap text-sm">{review.comment}</p>
            {product && <button type="button" onClick={() => viewProduct(product)} className="mt-4 rounded-xl border px-3 py-2 text-xs font-bold text-[#e4002b] hover:bg-red-50">Review product: {product.name}</button>}
          </article>;
        })}</div>
      )}
    </main>
  );
};
