import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Star, 
  Clock, 
  MessageCircle, 
  Award, 
  Trash2, 
  Plus, 
  Check, 
  RefreshCw,
  Send,
  X,
  Link2,
  Copy
} from 'lucide-react';

export const AutoReviewsManager: React.FC = () => {
  const {
    settings,
    updateAutoReview,
    reviews,
    addReview,
    deleteReview,
    setReviewVisibility,
    allOrders,
    sendReviewCollectionWhatsapp,
    getReviewWhatsAppUrl,
    sendTestReviewWhatsApp,
    formatPKR,
  } = useStore();

  const autoReview = settings.autoReview || {
    enabled: true,
    delayHours: 12,
    rewardPoints: 20,
    whatsappTemplate: 'Assalam o Alaikum {customer_name}! Umeed hai aap ka KFC meal bohot crispy aur piping hot tha. Baraye mehrbani 1 minute nikaal kar apna star rating aur review dein: {review_link}. Review submit karny par aapko 20 FREE Loyalty Points milenge!',
    autoSendWhatsapp: true,
  };

  const [enabled, setEnabled] = useState(autoReview.enabled);
  const [delayHours, setDelayHours] = useState(autoReview.delayHours || 12);
  const [rewardPoints, setRewardPoints] = useState(autoReview.rewardPoints || 20);
  const [template, setTemplate] = useState(autoReview.whatsappTemplate);
  const [isSaved, setIsSaved] = useState(false);
  const [actionNotice, setActionNotice] = useState<string>('');
  const [testPhone, setTestPhone] = useState('03252777574');
  const [testCustomerName, setTestCustomerName] = useState('Tariq Mehmood');

  // Add review modal state
  const [isAddingModalOpen, setIsAddingModalOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [newProductId, setNewProductId] = useState('krunch-burger');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateAutoReview({
      enabled,
      delayHours: Number(delayHours),
      rewardPoints: Number(rewardPoints),
      whatsappTemplate: template,
      autoSendWhatsapp: true,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleCreateReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim() || !newComment.trim()) return;
    addReview({
      productId: newProductId,
      customerName: newCustomerName.trim(),
      rating: newRating,
      comment: newComment.trim(),
    });
    setIsAddingModalOpen(false);
    setNewCustomerName('');
    setNewComment('');
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="border-b border-zinc-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
            <span>Customer Reviews & Auto 12-Hour Collection Flow</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Automatically collect customer feedback on WhatsApp within 12 hours of order delivery and reward loyalty points.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddingModalOpen(true)}
          className="bg-[#e4002b] hover:bg-[#c30025] text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Review Manually</span>
        </button>
      </div>

      {isSaved && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold animate-in fade-in duration-150">
          ✓ Review automation settings successfully saved!
        </div>
      )}

      {/* Auto Review Automation Configuration Card */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#e4002b]" />
            <span>Automated 12-Hour Feedback Engine</span>
          </h3>

          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-4 h-4 accent-[#e4002b]"
            />
            <span className="text-xs font-bold text-zinc-800">
              {enabled ? 'Auto Flow Active' : 'Disabled'}
            </span>
          </label>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-700 font-bold mb-1">
                Delay After Delivery (Hours) *
              </label>
              <input
                type="number"
                min={1}
                max={48}
                value={delayHours}
                onChange={(e) => setDelayHours(Number(e.target.value))}
                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2.5 font-bold font-mono"
              />
              <p className="text-[11px] text-zinc-400 mt-1">
                Default: 12 Hours after order dispatch/delivery
              </p>
            </div>

            <div>
              <label className="block text-zinc-700 font-bold mb-1">
                Reward Bonus Loyalty Points *
              </label>
              <input
                type="number"
                min={0}
                max={500}
                value={rewardPoints}
                onChange={(e) => setRewardPoints(Number(e.target.value))}
                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2.5 font-bold font-mono"
              />
              <p className="text-[11px] text-zinc-400 mt-1">
                Points credited to customer upon rating submission
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-zinc-700 font-bold mb-1">
                WhatsApp Request Message Template
              </label>
              <textarea
                rows={3}
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl p-3 leading-relaxed"
              />
              <p className="text-[11px] text-zinc-400 mt-1">
                Placeholders: {'{customer_name}'}, {'{review_link}'}
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="bg-[#e4002b] hover:bg-[#c30025] text-white font-bold px-5 py-2.5 rounded-xl shadow-md cursor-pointer transition active:scale-95"
            >
              Save Automation Settings
            </button>
          </div>
        </form>
      </div>

      {actionNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl text-xs font-bold animate-in fade-in flex items-center justify-between">
          <span>{actionNotice}</span>
          <button type="button" onClick={() => setActionNotice('')} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Manual Send & Test Review Links Card */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
          <div>
            <h3 className="font-black text-sm text-zinc-900 uppercase tracking-wider flex items-center gap-2">
              <Send className="w-4 h-4 text-[#e4002b]" />
              <span>Review Link Bhejny Wala Option & Live Test</span>
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Storefront ka direct functional review link copy karein, kisi bhi number par test WhatsApp message bhejein, ya customer orders ko directly review request send karein.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              const url = `${window.location.origin}/?reviews=true`;
              navigator.clipboard?.writeText(url);
              setActionNotice(`✓ General Storefront Review Link clipboard par copy ho gaya: ${url}`);
              setTimeout(() => setActionNotice(''), 3500);
            }}
            className="px-3.5 py-2 rounded-xl border border-zinc-300 bg-zinc-50 hover:bg-zinc-100 text-xs font-bold text-zinc-800 flex items-center gap-2 self-start sm:self-auto cursor-pointer transition active:scale-95 shadow-2xs"
          >
            <Link2 className="w-4 h-4 text-[#e4002b]" />
            <span>Copy General Review Link</span>
          </button>
        </div>

        {/* Live Test Review Link via WhatsApp */}
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Test Review Link Sending (Live WhatsApp Preview)</span>
            </span>
            <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">
              Instant Test
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-zinc-700 font-bold mb-1 text-[11px]">Test Customer Name:</label>
              <input
                type="text"
                value={testCustomerName}
                onChange={(e) => setTestCustomerName(e.target.value)}
                placeholder="e.g. Tariq Mehmood"
                className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 font-bold"
              />
            </div>
            <div>
              <label className="block text-zinc-700 font-bold mb-1 text-[11px]">Customer Phone Number:</label>
              <input
                type="text"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="e.g. 03252777574"
                className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 font-bold font-mono"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  if (!testPhone.trim()) {
                    alert('Baraye mehrbani phone number enter karein.');
                    return;
                  }
                  const url = sendTestReviewWhatsApp(testPhone.trim(), testCustomerName.trim() || 'Valued Customer');
                  setActionNotice(`✓ Review Link WhatsApp khul gaya! (${testPhone})`);
                  setTimeout(() => setActionNotice(''), 4000);
                }}
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition active:scale-95 cursor-pointer text-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Test Review Link on WhatsApp</span>
              </button>
            </div>
          </div>
        </div>

        {/* Orders Table for Sending Review Links */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-zinc-900 uppercase">
              Customer Orders ({allOrders.filter((o) => Boolean(o.customer?.phone)).length} Available)
            </h4>
            <span className="text-[11px] text-zinc-500">Delivered & recent orders par WhatsApp review request bhejein</span>
          </div>

          <div className="border border-zinc-200 rounded-xl overflow-hidden divide-y divide-zinc-100 max-h-72 overflow-y-auto">
            {allOrders.filter((o) => Boolean(o.customer?.phone)).length === 0 ? (
              <div className="p-4 text-center text-xs text-zinc-400">
                Koi customer order review link ke liye mojood nahi hai.
              </div>
            ) : (
              allOrders
                .filter((o) => Boolean(o.customer?.phone))
                .slice(0, 15)
                .map((order) => {
                  const directReviewUrl = `${window.location.origin}/?reviews=true&order=${order.id}&customer=${encodeURIComponent(order.customer.fullName || '')}`;
                  return (
                    <div key={order.id} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-zinc-50/80 transition">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-zinc-900">#{order.id} · {order.customer.fullName}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-100 text-zinc-600'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-500 mt-0.5 font-mono">
                          {order.customer.phone} · Total: {formatPKR(order.total)} · {new Date(order.date).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText(directReviewUrl);
                            setActionNotice(`✓ Order #${order.id} ka direct review link copy ho gaya!`);
                            setTimeout(() => setActionNotice(''), 3000);
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                          title="Copy direct review link"
                        >
                          <Copy className="w-3.5 h-3.5 text-zinc-500" />
                          <span>Copy Link</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            sendReviewCollectionWhatsapp(order);
                            setActionNotice(`✓ Order #${order.id} ke liye WhatsApp review request open ho gaya!`);
                            setTimeout(() => setActionNotice(''), 3500);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition active:scale-95"
                          title="WhatsApp par review link bhejein"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send on WhatsApp</span>
                        </button>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>

      {/* Customer Reviews Table */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wider flex items-center gap-2">
          <span>Customer Feedback & Ratings ({reviews.length})</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-zinc-200 rounded-xl overflow-hidden divide-y divide-zinc-200">
            <thead className="bg-zinc-50 text-zinc-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Rating</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Comment / Review</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 bg-white">
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-400 text-xs">
                    No customer reviews yet.
                  </td>
                </tr>
              ) : (
                reviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-zinc-50/80">
                    <td className="py-3 px-3 font-bold text-zinc-900">{rev.customerName}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-200'
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-zinc-500 text-[11px]">{rev.date}</td>
                    <td className="py-3 px-3 text-zinc-700 leading-relaxed max-w-md">
                      "{rev.comment}"
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${rev.isVisible === false ? 'bg-zinc-100 text-zinc-500' : 'bg-emerald-50 text-emerald-700'}`}>{rev.isVisible === false ? 'Hidden' : 'Visible'}</span>
                        <button type="button" onClick={async () => { try { await setReviewVisibility(rev.id, rev.isVisible === false); } catch (error: any) { alert(error?.message || 'Review visibility update nahi hui.'); } }} className="text-blue-600 hover:text-blue-800 p-1.5 cursor-pointer" title={rev.isVisible === false ? 'Show Review' : 'Hide Review'}>{rev.isVisible === false ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}</button>
                        <button type="button" onClick={async () => { if (!window.confirm('Is review ko permanently delete karna hai?')) return; try { await deleteReview(rev.id); } catch (error: any) { alert(error?.message || 'Review delete nahi hua.'); } }} className="text-red-500 hover:text-red-700 p-1.5 cursor-pointer" title="Delete Review"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Review Modal */}
      {isAddingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <h3 className="font-black text-base text-zinc-900 uppercase">
                Add Customer Review
              </h3>
              <button onClick={() => setIsAddingModalOpen(false)} className="text-zinc-400 hover:text-zinc-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-700 font-bold mb-1">Customer Name *</label>
                <input
                  type="text"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="e.g. Tariq Mehmood (Bhaun Road)"
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-bold mb-1">Star Rating (1 - 5)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className={`p-2 rounded-xl border flex items-center gap-1 font-bold ${
                        newRating === star ? 'bg-amber-50 border-amber-400 text-amber-700' : 'bg-zinc-50 border-zinc-200 text-zinc-600'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${star <= newRating ? 'fill-amber-400 text-amber-400' : ''}`} />
                      <span>{star}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-zinc-700 font-bold mb-1">Customer Comment *</label>
                <textarea
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Fresh and crispy chicken delivered fast..."
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl p-3"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-600 bg-zinc-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#e4002b] hover:bg-[#c30025] text-white font-bold shadow-md cursor-pointer"
                >
                  Publish Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
