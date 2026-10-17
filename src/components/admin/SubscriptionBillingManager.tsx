import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { formatSubscriptionStatus } from '../../utils/subscriptionUtils';
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Send,
  Building,
  Smartphone,
  Info,
  Calendar,
  Lock,
  ArrowUpRight,
  Receipt,
  FileCheck,
} from 'lucide-react';

export const SubscriptionBillingManager: React.FC = () => {
  const {
    currentTenant,
    subscriptionEvaluation,
    platformPaymentInstructions,
    subscriptionPayments,
    submitSubscriptionPayment,
    formatPKR,
    menuItems,
    branches,
  } = useStore();

  const [amount, setAmount] = useState<number>(currentTenant?.price || 9999);
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'jazzcash' | 'easypaisa' | 'raast'>('bank_transfer');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [proofUrl, setProofUrl] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const statusStyle = formatSubscriptionStatus(subscriptionEvaluation.currentStatus);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionRef.trim()) {
      alert('Please provide the Transaction / Reference Number from your payment receipt.');
      return;
    }
    if (amount <= 0) {
      alert('Payment amount must be greater than zero.');
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);
    try {
      const ok = await submitSubscriptionPayment({
        amount: Number(amount),
        paymentMethod,
        transactionRef: transactionRef.trim(),
        paymentDate,
        proofUrl: proofUrl.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      if (ok) {
        setFeedback({
          type: 'success',
          message: 'Payment details submitted successfully! The Platform Super Admin has been notified and will verify your transfer shortly.',
        });
        setTransactionRef('');
        setNotes('');
        setProofUrl('');
      } else {
        setFeedback({
          type: 'error',
          message: 'Failed to record payment. Please try again or reach out on WhatsApp support.',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const myPayments = (subscriptionPayments || []).filter(
    (p) => p.restaurantId === currentTenant?.id
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Subscription Status Card */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white rounded-3xl p-6 sm:p-8 border border-zinc-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusStyle.badgeClass}`}>
                <span className={`w-2 h-2 rounded-full ${statusStyle.dotClass}`} />
                {statusStyle.label}
              </span>
              <span className="text-xs text-zinc-400 bg-zinc-800/80 px-2.5 py-0.5 rounded-full font-mono">
                Tenant: {currentTenant?.slug || 'kfc-chakwal'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {currentTenant?.name || 'Restaurant'} Subscription
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
              {subscriptionEvaluation.message}
            </p>
          </div>

          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 sm:p-5 text-right min-w-[200px]">
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Current Plan</p>
            <p className="text-lg font-black text-amber-400 capitalize">{currentTenant?.planName || 'Professional'}</p>
            <p className="text-xs text-zinc-300 mt-1">
              <strong>{formatPKR(currentTenant?.price || 9999)}</strong> / {currentTenant?.billingCycle || 'monthly'}
            </p>
          </div>
        </div>

        {/* Timeline & Due Date Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-zinc-800/80 text-xs">
          <div>
            <p className="text-zinc-500 text-[10px] uppercase font-bold">Start Date</p>
            <p className="font-semibold text-zinc-200 mt-0.5">
              {currentTenant?.startDate ? new Date(currentTenant.startDate).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-zinc-500 text-[10px] uppercase font-bold">Due Date</p>
            <p className={`font-black mt-0.5 ${subscriptionEvaluation.isExpired ? 'text-red-400' : 'text-zinc-200'}`}>
              {currentTenant?.dueDate ? new Date(currentTenant.dueDate).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-zinc-500 text-[10px] uppercase font-bold">Days Remaining</p>
            <p className="font-black text-emerald-400 mt-0.5">
              {subscriptionEvaluation.isExpired ? 'Expired' : `${subscriptionEvaluation.daysRemaining} days`}
            </p>
          </div>
          <div>
            <p className="text-zinc-500 text-[10px] uppercase font-bold">Grace Period Policy</p>
            <p className="font-semibold text-zinc-300 mt-0.5">
              {currentTenant?.gracePeriodDays ?? 5} Days
              {subscriptionEvaluation.isInGracePeriod && (
                <span className="text-orange-400 text-[10px] block font-bold">
                  ({subscriptionEvaluation.graceDaysRemaining} days left)
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Plan Limits & Feature Entitlements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Resource Limits Card */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs">
          <h3 className="text-xs font-black uppercase tracking-wider text-zinc-800 mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#e4002b]" />
            Plan Usage Limits
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-zinc-600 mb-1">
                <span>Products Active</span>
                <strong>{menuItems.length} / {currentTenant?.limits?.maxProducts || 200}</strong>
              </div>
              <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#e4002b] h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (menuItems.length / (currentTenant?.limits?.maxProducts || 200)) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-zinc-600 mb-1">
                <span>Store Branches</span>
                <strong>{branches.length} / {currentTenant?.limits?.maxBranches || 2}</strong>
              </div>
              <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (branches.length / (currentTenant?.limits?.maxBranches || 2)) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-zinc-600 mb-1">
                <span>Staff Limit</span>
                <strong>Active / {currentTenant?.limits?.maxStaff || 8}</strong>
              </div>
              <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '25%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Feature Entitlements Summary */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs">
          <h3 className="text-xs font-black uppercase tracking-wider text-zinc-800 mb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Feature Entitlements ({currentTenant?.planName || 'Professional'})
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {Object.entries(currentTenant?.features || {}).map(([key, enabled]) => {
              const label = key
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, (str) => str.toUpperCase());
              return (
                <div
                  key={key}
                  className={`flex items-center gap-2 p-2 rounded-lg border ${
                    enabled
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900 font-medium'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-400 line-through'
                  }`}
                >
                  {enabled ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  )}
                  <span className="truncate">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Manual Payment Instructions (Configured by Super Admin) */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50/40 rounded-3xl border border-amber-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Building className="w-5 h-5 text-amber-700" />
          <h2 className="text-base font-black text-amber-950 uppercase tracking-wide">
            Platform Manual Payment Instructions
          </h2>
        </div>

        <p className="text-xs text-amber-900 mb-6 leading-relaxed max-w-3xl">
          {platformPaymentInstructions?.instructions}
        </p>

        {/* Payment Methods Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Bank */}
          <div className="bg-white rounded-2xl p-4 border border-amber-200/80 shadow-xs space-y-1 text-xs">
            <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Bank Transfer</p>
            <p className="font-black text-zinc-900">{platformPaymentInstructions?.bankName}</p>
            <p className="text-zinc-600">Title: <strong>{platformPaymentInstructions?.accountTitle}</strong></p>
            <p className="font-mono text-zinc-900 font-bold bg-zinc-50 p-1.5 rounded border border-zinc-100 text-[11px] select-all">
              {platformPaymentInstructions?.accountNumber}
            </p>
            {platformPaymentInstructions?.iban && (
              <p className="text-[10px] text-zinc-500 font-mono select-all">
                IBAN: {platformPaymentInstructions.iban}
              </p>
            )}
          </div>

          {/* JazzCash */}
          <div className="bg-white rounded-2xl p-4 border border-amber-200/80 shadow-xs space-y-1 text-xs">
            <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">JazzCash</p>
            <p className="font-mono text-base font-black text-zinc-900 select-all">
              {platformPaymentInstructions?.jazzCashNumber}
            </p>
            <p className="text-zinc-600">Title: <strong>{platformPaymentInstructions?.jazzCashTitle}</strong></p>
          </div>

          {/* EasyPaisa */}
          <div className="bg-white rounded-2xl p-4 border border-amber-200/80 shadow-xs space-y-1 text-xs">
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">EasyPaisa</p>
            <p className="font-mono text-base font-black text-zinc-900 select-all">
              {platformPaymentInstructions?.easyPaisaNumber}
            </p>
            <p className="text-zinc-600">Title: <strong>{platformPaymentInstructions?.easyPaisaTitle}</strong></p>
          </div>

          {/* Raast / WhatsApp */}
          <div className="bg-white rounded-2xl p-4 border border-amber-200/80 shadow-xs space-y-1 text-xs">
            <p className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">Raast & Support</p>
            <p className="font-mono text-sm font-bold text-zinc-900 select-all">
              Raast: {platformPaymentInstructions?.raastId || platformPaymentInstructions?.jazzCashNumber}
            </p>
            <p className="text-zinc-600">
              WhatsApp Help:{' '}
              <a
                href={`https://wa.me/${platformPaymentInstructions?.supportWhatsApp?.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-600 font-bold hover:underline"
              >
                {platformPaymentInstructions?.supportWhatsApp}
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Payment Submission Form */}
      <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <Receipt className="w-5 h-5 text-[#e4002b]" />
          <h2 className="text-base font-black text-zinc-900 uppercase tracking-wide">
            Submit Subscription Payment Record
          </h2>
        </div>
        <p className="text-xs text-zinc-500 mb-6">
          After completing your bank or mobile wallet transfer, submit the details below. Super Admin will verify the reference number and automatically reactivate or extend your subscription.
        </p>

        {feedback && (
          <div
            className={`p-4 rounded-xl text-xs mb-5 flex items-center gap-2.5 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-zinc-700 mb-1">Amount Paid (PKR) *</label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2.5 border rounded-xl font-bold text-sm text-zinc-900 focus:ring-2 focus:ring-[#e4002b] outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 mb-1">Payment Method *</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2.5 border rounded-xl font-medium text-xs text-zinc-900 focus:ring-2 focus:ring-[#e4002b] outline-hidden bg-white"
              >
                <option value="bank_transfer">Bank Transfer (Meezan / Online)</option>
                <option value="jazzcash">JazzCash</option>
                <option value="easypaisa">EasyPaisa</option>
                <option value="raast">Raast Instant Payment</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-zinc-700 mb-1">Payment Date *</label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2.5 border rounded-xl text-xs text-zinc-900 focus:ring-2 focus:ring-[#e4002b] outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-zinc-700 mb-1">
                Transaction ID / Reference Number *
              </label>
              <input
                type="text"
                required
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="e.g. TRX-281947291 or Bank Ref"
                className="w-full px-3 py-2.5 border rounded-xl font-mono text-xs text-zinc-900 focus:ring-2 focus:ring-[#e4002b] outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 mb-1">
                Receipt Screenshot URL / Proof (Optional)
              </label>
              <input
                type="text"
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                placeholder="https://... or uploaded image link"
                className="w-full px-3 py-2.5 border rounded-xl text-xs text-zinc-900 focus:ring-2 focus:ring-[#e4002b] outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-zinc-700 mb-1">Notes / Remarks</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Transferred from Muhammad Rizwan account for Monthly Renewal"
              className="w-full px-3 py-2.5 border rounded-xl text-xs text-zinc-900 focus:ring-2 focus:ring-[#e4002b] outline-hidden"
            />
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl bg-[#e4002b] hover:bg-[#c30025] text-white text-xs font-black shadow-md flex items-center gap-2 cursor-pointer transition active:scale-95 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Payment for Approval'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Submitted Payments & History */}
      <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-zinc-700" />
            <h2 className="text-base font-black text-zinc-900 uppercase tracking-wide">
              Payment & Invoice History
            </h2>
          </div>
          <span className="text-xs text-zinc-400 font-mono">
            {myPayments.length} records
          </span>
        </div>

        {myPayments.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-xs bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
            No payments submitted yet. When you submit payment proof, you can track verification status here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-500 uppercase tracking-wider font-bold border-b text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Reference #</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Details / Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {myPayments.map((p) => {
                  let badge = 'bg-amber-100 text-amber-800';
                  if (p.status === 'approved') badge = 'bg-emerald-100 text-emerald-800';
                  if (p.status === 'rejected') badge = 'bg-red-100 text-red-800';
                  return (
                    <tr key={p.id} className="hover:bg-zinc-50/70 transition">
                      <td className="py-3 px-3 font-medium text-zinc-900">{p.paymentDate}</td>
                      <td className="py-3 px-3 font-mono font-bold text-zinc-800">{p.transactionRef}</td>
                      <td className="py-3 px-3 uppercase text-zinc-600 font-medium">{p.paymentMethod.replace(/_/g, ' ')}</td>
                      <td className="py-3 px-3 font-black text-zinc-900">{formatPKR(p.amount)}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badge}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-zinc-500">
                        {p.status === 'approved' && p.reviewedAt && (
                          <span className="text-emerald-700">Verified by Super Admin</span>
                        )}
                        {p.status === 'rejected' && (
                          <span className="text-red-600 font-medium">
                            Rejected: {p.rejectionReason || 'Invalid reference'}
                          </span>
                        )}
                        {p.status === 'pending' && <span>Awaiting verification</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
