import React, { useState } from 'react';
import { ArrowLeft, Star, MessageSquare, CheckCircle2, Sparkles, ThumbsUp, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const QUICK_TAGS = [
  'Crispy & Hot 🔥',
  'Super Fast Delivery 🛵',
  'Authentic KFC Taste 🍗',
  'Great Packaging 📦',
  'Polite Rider 🤝',
  'Value for Money 💰',
];

export const ReviewsPage: React.FC = () => {
  const { reviews, addReview, menuItems, viewProduct, goHome, settings, themeMode, currentUser, formatPKR } = useStore();
  const visibleReviews = reviews.filter((review) => review.isVisible !== false);
  const isDark = themeMode === 'dark';
  
  // Review form state
  const [customerName, setCustomerName] = useState(currentUser?.fullName || '');
  const [phoneOrOrder, setPhoneOrOrder] = useState(currentUser?.phone || '');
  const [selectedProductId, setSelectedProductId] = useState<string>('overall');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  // Rating filter
  const [filterRating, setFilterRating] = useState<'all' | number>('all');

  const average = visibleReviews.length
    ? (visibleReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / visibleReviews.length).toFixed(1)
    : '5.0';

  const filteredList = visibleReviews.filter((r) => {
    if (filterRating === 'all') return true;
    return Math.round(Number(r.rating || 0)) === filterRating;
  });

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!customerName.trim()) {
      setFormError('Baraye mehrbani apna naam darj karein.');
      return;
    }
    if (!comment.trim() && selectedTags.length === 0) {
      setFormError('Baraye mehrbani apna review ya feedback share karein.');
      return;
    }

    setSubmitting(true);
    try {
      const fullComment = selectedTags.length > 0
        ? `${selectedTags.join(' • ')}${comment.trim() ? `\n\n${comment.trim()}` : ''}`
        : comment.trim();

      await addReview({
        productId: selectedProductId === 'overall' ? 'overall-store' : selectedProductId,
        customerName: customerName.trim(),
        rating,
        comment: fullComment,
        customerUid: currentUser?.id || null,
        isVisible: true,
      });

      setSubmittedSuccess(true);
      setComment('');
      setSelectedTags([]);
      setTimeout(() => {
        setSubmittedSuccess(false);
      }, 7000);
    } catch (err: any) {
      setFormError(err?.message || 'Review submit nahi ho saka. Dobara koshish karein.');
    } finally {
      setSubmitting(false);
    }
  };

  const starLabels: Record<number, string> = {
    1: 'Poor (Thanda / Kharaab)',
    2: 'Fair (Theek Thaak)',
    3: 'Good (Acha Tha)',
    4: 'Very Good (Kafi Lazeez)',
    5: 'Excellent & Crispy! (5 Stars ⭐)',
  };

  return (
    <main className={`mx-auto min-h-[70vh] w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
      <button
        type="button"
        onClick={goHome}
        className="mb-6 inline-flex items-center gap-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-xs font-bold hover:border-[#e4002b] cursor-pointer transition shadow-2xs"
      >
        <ArrowLeft size={15} /> Back to menu
      </button>

      {/* Header Banner */}
      <header className="mb-8 rounded-3xl bg-gradient-to-r from-red-600 via-[#e4002b] to-amber-500 p-6 sm:p-8 text-white shadow-xl">
        <p className="text-xs font-black uppercase tracking-widest text-amber-200">KFC Chakwal Delivery</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-black uppercase tracking-tight">Customer Reviews & Ratings</h1>
        <p className="mt-2 text-sm sm:text-base text-zinc-100 max-w-2xl">
          Chakwal city ke food lovers ki asli raye aur ratings. Har review hamari service ko behtar banany mein madad deta hai.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-4 bg-black/20 backdrop-blur-xs p-3.5 rounded-2xl w-fit">
          <div className="flex items-center gap-2">
            <Star className="fill-amber-400 text-amber-400" size={24} />
            <strong className="text-2xl font-black">{average}</strong>
            <span className="text-sm font-medium text-zinc-200">/ 5.0</span>
          </div>
          <span className="text-sm text-zinc-200">· {visibleReviews.length} Verified Customer Reviews</span>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* REVIEW SUBMISSION FORM (FUNCTIONAL & ENGAGING)                            */}
      {/* ========================================================================= */}
      <section id="write-review" className="mb-10 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-7 shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#e4002b]/10 text-[#e4002b] flex items-center justify-center">
              <MessageSquare size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight text-zinc-900 dark:text-white">
                Apna Review & Rating Dein
              </h2>
              <p className="text-xs text-zinc-500">
                1 minute mein review share karein aur bonus points hasil karein!
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 px-3 py-1.5 rounded-full flex items-center gap-1">
            <Sparkles size={13} />
            <span>+{settings.loyaltyConfig?.reviewBonus ?? 20} Points</span>
          </span>
        </div>

        {submittedSuccess && (
          <div role="status" className="mb-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-black text-emerald-950">Bohat Shukriya! Aap ka review submit ho chuka hai.</p>
              <p className="text-emerald-800 mt-0.5">Aap ka feedback customer community aur kitchen team dono ke liye behtareen hai.</p>
            </div>
          </div>
        )}

        {formError && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-300 text-red-900 text-xs font-bold">
            {formError}
          </div>
        )}

        <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
          {/* Star Rating Interactive Selector */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
              Food & Delivery Rating (Click Stars) *
            </label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((s) => {
                  const filled = (hoverRating || rating) >= s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(s)}
                      className="p-1 text-2xl transition hover:scale-125 cursor-pointer focus:outline-none"
                      aria-label={`${s} star rating`}
                    >
                      <Star
                        size={28}
                        className={`transition ${
                          filled
                            ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                            : 'text-zinc-300 dark:text-zinc-700'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-xs font-black text-amber-700 dark:text-amber-400 ml-2">
                {starLabels[hoverRating || rating]}
              </span>
            </div>
          </div>

          {/* Customer Name & Phone/Order ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Aap Ka Naam (Customer Name) *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Ali Raza"
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-2.5 text-xs font-bold focus:bg-white dark:focus:bg-zinc-900 focus:border-[#e4002b] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Order ID ya Phone Number (Optional)
              </label>
              <input
                type="text"
                value={phoneOrOrder}
                onChange={(e) => setPhoneOrOrder(e.target.value)}
                placeholder="e.g. CKW-12345 ya 0300-xxxxxxx"
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-2.5 text-xs font-mono focus:bg-white dark:focus:bg-zinc-900 focus:border-[#e4002b] focus:outline-none"
              />
            </div>
          </div>

          {/* Product Selector */}
          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Konsay Item ka Review hai?
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-2.5 text-xs font-bold text-zinc-900 dark:text-white"
            >
              <option value="overall">🍗 Mukamal Order & Delivery Service (Overall)</option>
              {menuItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({formatPKR(item.baseKfcPrice)})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Compliment / Feedback Tags */}
          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Quick Highlights (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-2">
              {QUICK_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#e4002b] text-white border border-[#e4002b] shadow-xs'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'
                    }`}
                  >
                    <ThumbsUp size={12} className={isSelected ? 'text-white' : 'text-zinc-400'} />
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Comment Box */}
          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Aap Ka Tajruba (Your Experience & Feedback) *
            </label>
            <textarea
              rows={3}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Khane ka taste kesa laga? Rider time par pohancha? Chicken crispy thi?..."
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-3 text-xs focus:bg-white dark:focus:bg-zinc-900 focus:border-[#e4002b] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-zinc-500 flex items-center gap-1">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Real Customer Verified Reviews</span>
            </span>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-[#e4002b] hover:bg-[#c30025] px-6 py-3 font-black text-white text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Submitting Review...' : 'Submit Customer Review'}
            </button>
          </div>
        </form>
      </section>

      {/* ========================================================================= */}
      {/* REVIEWS LIST WITH RATING FILTER                                          */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <h2 className="text-xl font-black uppercase text-zinc-900 dark:text-white">
            Customer Feedback ({visibleReviews.length})
          </h2>

          {/* Star Filter Pills with High Contrast */}
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-xs text-zinc-500 font-bold mr-1">Filter:</span>
            <button
              type="button"
              onClick={() => setFilterRating('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                filterRating === 'all'
                  ? 'bg-[#e4002b] text-white shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
              }`}
            >
              All ({visibleReviews.length})
            </button>
            {[5, 4, 3].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setFilterRating(num)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  filterRating === num
                    ? 'bg-[#e4002b] text-white shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
                }`}
              >
                ★ {num} Stars
              </button>
            ))}
          </div>
        </div>

        {filteredList.length === 0 ? (
          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 text-center text-zinc-500 bg-white dark:bg-zinc-900">
            <p className="text-sm font-bold">Is rating ke reviews abhi available nahi hain.</p>
            <p className="text-xs mt-1">Upar diye gaye form se pehla review submit karein!</p>
          </div>
        ) : (
          <div className="grid gap-3.5 sm:grid-cols-2">
            {filteredList.map((review) => {
              const product = menuItems.find((item) => item.id === review.productId);
              return (
                <article
                  key={review.id}
                  className={`rounded-2xl border p-5 transition hover:shadow-md ${
                    isDark
                      ? 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                      : 'border-zinc-200 bg-white hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-black text-sm text-zinc-900 dark:text-white">{review.customerName}</h3>
                        <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 text-[9px] font-black uppercase text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                          Verified
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-amber-400">
                        {'★'.repeat(Math.max(0, Math.min(5, review.rating)))}
                        <span className="text-zinc-300 dark:text-zinc-700">
                          {'☆'.repeat(5 - Math.max(0, Math.min(5, review.rating)))}
                        </span>
                        <span className="ml-1 text-[11px] font-bold text-zinc-500">
                          ({review.rating}/5)
                        </span>
                      </div>
                    </div>
                    <time className="text-[10px] text-zinc-400 font-mono">
                      {review.date ? new Date(review.date).toLocaleDateString('en-PK') : 'Recently'}
                    </time>
                  </div>

                  <p className="mt-3 whitespace-pre-wrap text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal">
                    {review.comment}
                  </p>

                  {product && (
                    <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                      <span className="text-[11px] text-zinc-500">
                        Item: <strong className="text-zinc-800 dark:text-zinc-200">{product.name}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => viewProduct(product)}
                        className="rounded-lg border border-red-200 dark:border-red-900 px-2.5 py-1 text-[11px] font-bold text-[#e4002b] hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer transition"
                      >
                        Order This Item →
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
};
