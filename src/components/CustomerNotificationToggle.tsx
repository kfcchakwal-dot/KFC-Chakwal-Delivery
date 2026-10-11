import React, { useState, useEffect } from 'react';
import { Bell, BellOff, BellRing, Check, AlertCircle, Loader2 } from 'lucide-react';
import {
  isPushNotificationSupported,
  getPushSubscriptionStatus,
  subscribeCustomerToPush,
  unsubscribeCustomerFromPush,
  PushSubscriptionStatus,
} from '../utils/pushNotifications';
import { useStore } from '../context/StoreContext';

interface Props {
  variant?: 'banner' | 'button' | 'pill';
  className?: string;
}

export const CustomerNotificationToggle: React.FC<Props> = ({ variant = 'button', className = '' }) => {
  const { currentUser, settings } = useStore();
  const [status, setStatus] = useState<PushSubscriptionStatus>(getPushSubscriptionStatus());
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setStatus(getPushSubscriptionStatus());
  }, []);

  if (!status.isSupported) {
    return null;
  }

  const handleToggle = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      if (status.isSubscribed) {
        const res = await unsubscribeCustomerFromPush();
        if (res.success) {
          setStatus(getPushSubscriptionStatus());
          setFeedback('Notifications band kar di gayi hain.');
        } else {
          setFeedback(res.error || 'Failed to unsubscribe.');
        }
      } else {
        const res = await subscribeCustomerToPush({
          vapidKey: settings.messagingVapidKey,
          customerId: currentUser?.id,
        });
        if (res.success) {
          setStatus(getPushSubscriptionStatus());
          setFeedback('✓ Notifications enable ho gayi hain! Deal alerts milenge.');
        } else {
          setFeedback(res.error || 'Permission allow nahi hui.');
        }
      }
    } catch (err: any) {
      setFeedback(err?.message || 'Error updating notification settings.');
    } finally {
      setLoading(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  if (variant === 'pill') {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <button
          type="button"
          disabled={loading}
          onClick={handleToggle}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
            status.isSubscribed
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200'
          }`}
          title={status.isSubscribed ? 'Notifications Active' : 'Enable Deals & Announcement Push Notifications'}
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : status.isSubscribed ? (
            <BellRing className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          ) : (
            <Bell className="w-3.5 h-3.5 text-zinc-500" />
          )}
          <span>{status.isSubscribed ? 'Notifications On' : 'Deal Alerts'}</span>
        </button>
        {feedback && (
          <span className="text-[11px] font-semibold text-zinc-600 bg-white border border-zinc-200 px-2 py-0.5 rounded-md shadow-xs animate-in fade-in">
            {feedback}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'banner') {
    if (status.isSubscribed || status.hasDeclined) {
      return null;
    }
    return (
      <div className={`bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-200/80 px-4 py-2.5 text-zinc-900 ${className}`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-6 h-6 rounded-full bg-[#e4002b] text-white flex items-center justify-center shrink-0">
              <Bell className="w-3.5 h-3.5" />
            </span>
            <span className="font-bold text-zinc-800">
              KFC Deals & Sale Alerts: <span className="font-normal text-zinc-600">Nayi promotions aur menu updates ke live push notifications payein.</span>
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={loading}
              onClick={handleToggle}
              className="bg-[#e4002b] hover:bg-[#c30025] text-white text-xs font-black px-3.5 py-1.5 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>Allow Deals Alerts</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-2xl border ${status.isSubscribed ? 'bg-emerald-50/70 border-emerald-200' : 'bg-white border-zinc-200'} space-y-2.5 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${status.isSubscribed ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-600'}`}>
            {status.isSubscribed ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
          </div>
          <div>
            <h4 className="text-xs font-black text-zinc-900">Push Notifications & Deal Alerts</h4>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              {status.isSubscribed
                ? 'Aap ka device registered hai. Naye announcements aur discount offers foran milenge.'
                : 'KFC Chakwal ki special discounts aur announcements ke alerts payein.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={handleToggle}
          className={`text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
            status.isSubscribed
              ? 'bg-zinc-200 hover:bg-zinc-300 text-zinc-800'
              : 'bg-[#e4002b] hover:bg-[#c30025] text-white shadow-xs'
          }`}
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : status.isSubscribed ? (
            <>
              <BellOff className="w-3.5 h-3.5" />
              <span>Turn Off</span>
            </>
          ) : (
            <>
              <Bell className="w-3.5 h-3.5" />
              <span>Enable Notifications</span>
            </>
          )}
        </button>
      </div>

      {feedback && (
        <p className={`text-xs font-semibold p-2 rounded-lg ${status.isSubscribed ? 'text-emerald-800 bg-emerald-100/60' : 'text-zinc-700 bg-zinc-100'}`}>
          {feedback}
        </p>
      )}

      {status.permission === 'denied' && (
        <div className="flex items-start gap-1.5 text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Browser settings mein notifications blocked hain. Allow karne ke liye address bar mein lock icon par click karein.</span>
        </div>
      )}
    </div>
  );
};
