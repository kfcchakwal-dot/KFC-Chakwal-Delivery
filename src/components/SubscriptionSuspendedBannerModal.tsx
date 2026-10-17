import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Lock,
  AlertTriangle,
  Building,
  CreditCard,
  Send,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const SubscriptionSuspendedBannerModal: React.FC<{
  onOpenBillingTab?: () => void;
}> = ({ onOpenBillingTab }) => {
  const {
    currentTenant,
    subscriptionEvaluation,
    platformPaymentInstructions,
    submitSubscriptionPayment,
    formatPKR,
    isSuperAdmin,
  } = useStore();

  const [amount, setAmount] = useState<number>(currentTenant?.price || 9999);
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'jazzcash' | 'easypaisa' | 'raast'>('bank_transfer');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // If user is platform Super Admin, they have full override access
  if (isSuperAdmin) {
    return null;
  }

  // Case 1: Grace Period Warning Banner
  if (subscriptionEvaluation.isInGracePeriod && !subscriptionEvaluation.isSuspended) {
    return (
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 text-white px-4 py-2.5 text-xs font-bold shadow-md flex items-center justify-between gap-3 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-200 shrink-0 animate-bounce" />
          <span>
            <strong>Payment Due:</strong> Subscription grace period active ({subscriptionEvaluation.graceDaysRemaining} days remaining). Please submit payment to prevent service suspension.
          </span>
        </div>
        {onOpenBillingTab && (
          <button
            type="button"
            onClick={onOpenBillingTab}
            className="px-3 py-1 rounded-lg bg-white text-orange-700 hover:bg-orange-50 font-black text-xs transition cursor-pointer whitespace-nowrap shadow-xs"
          >
            Pay & Submit Proof →
          </button>
        )}
      </div>
    );
  }

  // Case 2: Suspended Account Full Screen Lockout
  if (subscriptionEvaluation.isSuspended) {
    const handleSubmitPayment = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!transactionRef.trim()) {
        alert('Please enter your transaction reference number.');
        return;
      }
      setIsSubmitting(true);
      try {
        const ok = await submitSubscriptionPayment({
          amount: Number(amount),
          paymentMethod,
          transactionRef: transactionRef.trim(),
          paymentDate,
          notes: notes.trim() || undefined,
        });
        if (ok) {
          setSubmittedSuccess(true);
        } else {
          alert('Submission failed. Please contact platform support.');
        }
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 z-[9999] bg-zinc-950/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 text-zinc-900 shadow-2xl border border-red-200 my-auto animate-in zoom-in-95 duration-200">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-100 text-red-700">
              Subscription Suspended
            </span>
            <h2 className="text-2xl font-black text-zinc-900 mt-2">
              {currentTenant?.name || 'Restaurant'} Account On Hold
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 max-w-md mx-auto mt-1">
              Your subscription grace period has ended. Operational access (Orders, Menu, POS, Billing) is temporarily suspended until renewal payment is approved.
            </p>
          </div>

          {/* Payment Instructions Card */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 sm:p-5 mb-6 text-xs text-zinc-800">
            <div className="flex items-center gap-2 mb-2 font-black uppercase tracking-wider text-amber-900">
              <Building className="w-4 h-4 text-amber-700" />
              <span>Platform Bank & Wallet Transfer Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div className="bg-white p-3 rounded-xl border border-amber-200/60">
                <p className="text-[10px] uppercase font-bold text-amber-800">Bank Transfer</p>
                <p className="font-black text-zinc-900">{platformPaymentInstructions?.bankName}</p>
                <p className="text-[11px] text-zinc-600">Title: <strong>{platformPaymentInstructions?.accountTitle}</strong></p>
                <p className="font-mono text-xs font-bold text-zinc-900 select-all bg-zinc-50 p-1 rounded mt-0.5">
                  {platformPaymentInstructions?.accountNumber}
                </p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-amber-200/60">
                <p className="text-[10px] uppercase font-bold text-red-600">JazzCash / EasyPaisa / Raast</p>
                <p className="font-mono text-xs font-bold text-zinc-900 select-all">
                  Mobile: {platformPaymentInstructions?.jazzCashNumber}
                </p>
                <p className="text-[11px] text-zinc-600">Title: <strong>{platformPaymentInstructions?.jazzCashTitle}</strong></p>
                <p className="text-[10px] text-zinc-500 mt-1">
                  WhatsApp Support:{' '}
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

            <p className="text-[11px] text-amber-900">
              Due Amount: <strong className="text-zinc-950 font-black">{formatPKR(currentTenant?.price || 9999)}</strong> ({currentTenant?.planName || 'Professional'} / {currentTenant?.billingCycle || 'monthly'})
            </p>
          </div>

          {/* Submission Form */}
          {submittedSuccess ? (
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-6 text-center text-emerald-900">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <h3 className="text-base font-black">Payment Record Submitted!</h3>
              <p className="text-xs text-emerald-800 max-w-sm mx-auto mt-1">
                Your payment reference has been delivered to the Platform Super Admin. Once approved, this screen will automatically unlock and your account will be reactivated.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitPayment} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Amount Paid *</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Method *</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-xl font-bold bg-white"
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="jazzcash">JazzCash</option>
                    <option value="easypaisa">EasyPaisa</option>
                    <option value="raast">Raast</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">
                  Transaction / Reference Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TRX-93821094 or Bank Deposit Slip #"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Sent via Meezan App from Tariq account"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-[#e4002b] hover:bg-[#c30025] text-white text-xs font-black shadow-lg flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Payment for Instant Activation'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return null;
};
