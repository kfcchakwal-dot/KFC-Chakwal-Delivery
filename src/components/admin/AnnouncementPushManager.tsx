import React, { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  Sparkles,
  Check,
  AlertCircle,
  Loader2,
  Eye,
  FileText,
  Users,
  Smartphone,
  ExternalLink,
  RefreshCw,
  Tag,
  Flame,
  Utensils,
  Megaphone,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { auth } from '../../lib/firebase';
import {
  sendPushNotificationViaServer,
  fetchNotificationHistory,
  fetchSubscribersCount,
  getCurrentDeviceFcmToken,
  subscribeCustomerToPush,
  getPushSubscriptionStatus,
} from '../../utils/pushNotifications';

interface NotificationLog {
  id: string;
  title: string;
  message: string;
  imageUrl?: string | null;
  targetUrl?: string;
  type: string;
  sentAt: string;
  sentCount: number;
  failureCount: number;
  totalTokens: number;
  createdBy?: string;
}

const KFC_IMAGE_PRESETS = [
  { label: 'Krunch Burger', url: '/src/assets/images/kfc_krunch_burger_1791015834419.jpg' },
  { label: 'Zinger Combo', url: '/src/assets/images/kfc_hero_zinger_combo_1791015805739.jpg' },
  { label: 'Chicken Bucket', url: '/src/assets/images/kfc_bucket_crispy_chicken_1791015820219.jpg' },
  { label: 'Hot Wings Platter', url: '/src/assets/images/kfc_hot_wings_platter_1791015846233.jpg' },
];

export const AnnouncementPushManager: React.FC = () => {
  const { settings, updateSettings, menuItems } = useStore();

  // Notification form state
  const [title, setTitle] = useState('🍗 Weekend Special Deal: KFC Chakwal');
  const [message, setMessage] = useState(
    'Fresh hot & crispy KFC meal boxes delivered to your doorstep in Chakwal! Order before 4:00 PM for delivery by 8:00 PM.'
  );
  const [imageUrl, setImageUrl] = useState('');
  const [targetUrl, setTargetUrl] = useState('/');
  const [notifType, setNotifType] = useState<'announcement' | 'discount' | 'promotion' | 'menu_update'>('promotion');

  // Async / status states
  const [subscribersCount, setSubscribersCount] = useState<number>(0);
  const [historyLogs, setHistoryLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [bannerPublishing, setBannerPublishing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Device test subscription state
  const [deviceSubStatus, setDeviceSubStatus] = useState(getPushSubscriptionStatus());

  const getAdminToken = async (): Promise<string | null> => {
    if (!auth.currentUser) return null;
    return await auth.currentUser.getIdToken();
  };

  const loadData = async () => {
    const token = await getAdminToken();
    if (!token) return;
    try {
      const [count, logs] = await Promise.all([
        fetchSubscribersCount(token),
        fetchNotificationHistory(token),
      ]);
      setSubscribersCount(count);
      setHistoryLogs(logs);
      setDeviceSubStatus(getPushSubscriptionStatus());
    } catch (err) {
      console.warn('Failed to load notification stats:', err);
    }
  };

  useEffect(() => {
    void loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle Publish as In-App Announcement Bar
  const handlePublishToBanner = async () => {
    setBannerPublishing(true);
    try {
      const newBar = {
        id: `announcement-${Date.now()}`,
        text: `${notifType === 'discount' ? '🏷️' : notifType === 'promotion' ? '🔥' : '🍗'} ${title}: ${message}`,
        enabled: true,
      };

      const existingBars = settings.announcementBars || [];
      const updatedBars = [newBar, ...existingBars.slice(0, 4)];

      updateSettings({
        showAnnouncement: true,
        announcementText: newBar.text,
        announcementBars: updatedBars,
      });

      setStatusMessage({
        text: '✓ Announcement published live to the top storefront banner across customer devices!',
        type: 'success',
      });
    } catch (err: any) {
      setStatusMessage({
        text: err?.message || 'Failed to publish announcement banner',
        type: 'error',
      });
    } finally {
      setBannerPublishing(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  // Handle Send Test Push to this device
  const handleSendTestPush = async () => {
    setTestLoading(true);
    setStatusMessage(null);
    try {
      let testToken = getCurrentDeviceFcmToken();

      // If this device isn't registered yet, prompt to subscribe it
      if (!testToken) {
        const sub = await subscribeCustomerToPush({ vapidKey: settings.messagingVapidKey });
        if (sub.success && sub.token) {
          testToken = sub.token;
          setDeviceSubStatus(getPushSubscriptionStatus());
        } else {
          throw new Error('This browser device is not subscribed to push notifications yet. Please click "Enable Test Device Alerts" first.');
        }
      }

      const adminToken = await getAdminToken();
      if (!adminToken) throw new Error('Admin authentication required.');

      const result = await sendPushNotificationViaServer(
        {
          title,
          message,
          imageUrl: imageUrl || undefined,
          targetUrl,
          type: notifType,
          testToken,
        },
        adminToken
      );

      if (result.success) {
        setStatusMessage({
          text: '✓ Real test push notification successfully delivered to this device!',
          type: 'success',
        });
      } else {
        setStatusMessage({
          text: result.error || 'Test notification delivery failed.',
          type: 'error',
        });
      }
    } catch (err: any) {
      setStatusMessage({
        text: err?.message || 'Failed to send test push notification',
        type: 'error',
      });
    } finally {
      setTestLoading(false);
      void loadData();
      setTimeout(() => setStatusMessage(null), 6000);
    }
  };

  // Handle Full Customer Push Broadcast
  const handleBroadcastPush = async () => {
    if (!window.confirm(`Are you sure you want to broadcast this push notification to all ${subscribersCount} subscribed customer devices?`)) {
      return;
    }

    setLoading(true);
    setStatusMessage(null);
    try {
      const adminToken = await getAdminToken();
      if (!adminToken) throw new Error('Admin authentication required.');

      const result = await sendPushNotificationViaServer(
        {
          title,
          message,
          imageUrl: imageUrl || undefined,
          targetUrl,
          type: notifType,
        },
        adminToken
      );

      if (result.success) {
        setStatusMessage({
          text: `✓ Broadcast complete! Sent to ${result.sentCount || 0} customer devices (${result.failureCount || 0} failed / pruned).`,
          type: 'success',
        });
      } else {
        setStatusMessage({
          text: result.error || 'Failed to broadcast push notification.',
          type: 'error',
        });
      }
    } catch (err: any) {
      setStatusMessage({
        text: err?.message || 'Error occurred while broadcasting push notification',
        type: 'error',
      });
    } finally {
      setLoading(false);
      void loadData();
      setTimeout(() => setStatusMessage(null), 8000);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'discount':
        return <Tag className="w-4 h-4 text-emerald-600" />;
      case 'promotion':
        return <Flame className="w-4 h-4 text-orange-600" />;
      case 'menu_update':
        return <Utensils className="w-4 h-4 text-amber-600" />;
      default:
        return <Megaphone className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#e4002b]" />
            <span>Customer Announcements & Push Notifications</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Compose announcements, publish live banner alerts, and dispatch real FCM push notifications to subscribed customer devices.
          </p>
        </div>

        {/* Live Audience Badge */}
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-4 py-2 rounded-2xl shadow-xs shrink-0">
          <Users className="w-4 h-4 text-[#e4002b]" />
          <div>
            <div className="text-[10px] font-bold uppercase text-[#e4002b] tracking-wider">Subscribed Devices</div>
            <div className="text-sm font-black text-zinc-900 tabular-nums">
              {subscribersCount} Active Customers
            </div>
          </div>
          <button
            type="button"
            onClick={loadData}
            title="Refresh subscriber count"
            className="ml-2 text-zinc-400 hover:text-zinc-700 p-1 rounded-lg transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Alert Status Banner */}
      {statusMessage && (
        <div
          role="status"
          className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2.5 animate-in fade-in duration-200 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : statusMessage.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <Check className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Grid: Form on Left, Live Previews on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Compose Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-zinc-200 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h3 className="font-black text-sm text-zinc-900 uppercase tracking-wide flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#e4002b]" />
              <span>Compose Message</span>
            </h3>
            <span className="text-[11px] font-semibold text-zinc-400">
              Free Firebase Cloud Messaging (FCM)
            </span>
          </div>

          {/* Notification Type Selector */}
          <div>
            <label className="block text-xs font-black text-zinc-700 mb-1.5 uppercase tracking-wider">
              Notification Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'promotion', label: 'Promotion', icon: Flame, color: 'text-orange-600' },
                { id: 'discount', label: 'Sale / Discount', icon: Tag, color: 'text-emerald-600' },
                { id: 'announcement', label: 'Announcement', icon: Megaphone, color: 'text-blue-600' },
                { id: 'menu_update', label: 'Menu Update', icon: Utensils, color: 'text-amber-600' },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = notifType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setNotifType(item.id as any)}
                    className={`flex items-center gap-1.5 p-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : item.color}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 🍗 Special Weekend Deal!"
              maxLength={100}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 font-semibold focus:outline-none focus:border-[#e4002b]"
            />
          </div>

          {/* Message Input */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              Notification Message <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter customer message..."
              maxLength={300}
              className="w-full rounded-xl border border-zinc-300 bg-white p-3 text-xs text-zinc-900 leading-relaxed focus:outline-none focus:border-[#e4002b]"
            />
            <div className="flex justify-end text-[10px] text-zinc-400 mt-1">
              {message.length} / 300 characters
            </div>
          </div>

          {/* Image URL with KFC Presets */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              Optional Image URL
            </label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://... or select preset below"
              className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:outline-none focus:border-[#e4002b]"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[10px] font-bold text-zinc-400 self-center mr-1">Presets:</span>
              {KFC_IMAGE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setImageUrl(preset.url)}
                  className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 transition"
                >
                  {preset.label}
                </button>
              ))}
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="text-[10px] font-bold px-2 py-1 rounded-lg bg-red-50 text-red-600 border border-red-100 transition"
                >
                  Clear Image
                </button>
              )}
            </div>
          </div>

          {/* Destination Link */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              Destination Link (Action upon clicking notification)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="/ or /?product=..."
                className="flex-1 rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 font-mono focus:outline-none focus:border-[#e4002b]"
              />
              <select
                onChange={(e) => e.target.value && setTargetUrl(e.target.value)}
                className="rounded-xl border border-zinc-300 bg-zinc-50 px-2 text-xs text-zinc-700 font-semibold"
                defaultValue=""
              >
                <option value="" disabled>Quick Destination</option>
                <option value="/">Home Storefront</option>
                <option value="/seller">Admin Dashboard</option>
                {menuItems.slice(0, 6).map((item) => (
                  <option key={item.id} value={`/?product=${item.id}`}>
                    Product: {item.name.slice(0, 20)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 border-t border-zinc-100 space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Button 1: Publish to Banner Strip */}
              <button
                type="button"
                disabled={bannerPublishing || !title.trim()}
                onClick={handlePublishToBanner}
                className="rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800 px-4 py-2.5 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                {bannerPublishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Megaphone className="w-3.5 h-3.5 text-blue-600" />}
                <span>Publish to App Banner</span>
              </button>

              {/* Button 2: Send Test Notification */}
              <button
                type="button"
                disabled={testLoading || !title.trim()}
                onClick={handleSendTestPush}
                className="rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-[#e4002b] px-4 py-2.5 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                {testLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Smartphone className="w-3.5 h-3.5" />}
                <span>Send Test to This Device</span>
              </button>
            </div>

            {/* Button 3: Broadcast Push to All Subscribed Customers */}
            <button
              type="button"
              disabled={loading || !title.trim() || subscribersCount === 0}
              onClick={handleBroadcastPush}
              className="w-full rounded-xl bg-[#e4002b] hover:bg-[#c30025] disabled:bg-zinc-300 text-white px-5 py-3 text-xs font-black transition flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Broadcasting FCM Push to Subscribed Customers...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>
                    Broadcast Push Notification ({subscribersCount} Subscribed Devices)
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Real-time Previews */}
        <div className="lg:col-span-5 space-y-4">
          {/* Lock Screen Push Preview */}
          <div className="bg-zinc-950 text-white rounded-2xl p-4 border border-zinc-800 shadow-md">
            <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 mb-3 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-zinc-300" />
                <span>Mobile Lock Screen Preview</span>
              </span>
              <span>NOW</span>
            </div>

            {/* Push Card */}
            <div className="bg-zinc-900/90 border border-zinc-700/60 rounded-xl p-3 shadow-lg space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-[#e4002b] text-white flex items-center justify-center font-black text-[10px]">
                  🍗
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-extrabold text-white truncate">
                    KFC Chakwal Delivery
                  </div>
                </div>
                <span className="text-[9px] text-zinc-400">1m ago</span>
              </div>

              <div>
                <div className="text-xs font-bold text-white leading-snug">
                  {title || 'Notification Title'}
                </div>
                <div className="text-[11px] text-zinc-300 mt-0.5 line-clamp-3 leading-relaxed">
                  {message || 'Notification message preview will appear here...'}
                </div>
              </div>

              {imageUrl && (
                <div className="mt-2 rounded-lg overflow-hidden border border-zinc-800 max-h-36 bg-black">
                  <img src={imageUrl} alt="Push Attachment" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="text-[10px] text-zinc-500 mt-2.5 text-center">
              Tap action opens: <span className="font-mono text-zinc-400">{targetUrl}</span>
            </div>
          </div>

          {/* Storefront Announcement Bar Preview */}
          <div className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-xs space-y-2">
            <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5 text-[#e4002b]" />
              <span>In-App Banner Preview</span>
            </div>

            <div className="bg-[#e4002b] text-white text-[11px] font-bold py-2 px-3 rounded-xl shadow-xs truncate">
              {notifType === 'discount' ? '🏷️' : notifType === 'promotion' ? '🔥' : '🍗'}{' '}
              {title}: {message}
            </div>
            <p className="text-[10px] text-zinc-400">
              Customers viewing the website or installed PWA will see this scrolling strip at the very top of the app.
            </p>
          </div>
        </div>
      </div>

      {/* History Log Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <h3 className="font-black text-sm text-zinc-900 uppercase tracking-wide flex items-center gap-2">
            <FileText className="w-4 h-4 text-zinc-500" />
            <span>Sent Notification History ({historyLogs.length})</span>
          </h3>
          <span className="text-[11px] text-zinc-400">
            Real-time server log from Firestore notifications
          </span>
        </div>

        {historyLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-400">
            Abhi koi push notification record nahi hai. Upar diye gaye form se pehla message bhejein.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-700">
              <thead>
                <tr className="border-b border-zinc-100 text-[10px] font-black uppercase text-zinc-400">
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Title & Message</th>
                  <th className="py-2.5 px-3 text-center">Delivery Result</th>
                  <th className="py-2.5 px-3">Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {historyLogs.slice(0, 20).map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-50/50">
                    <td className="py-3 px-3 text-[11px] text-zinc-500 whitespace-nowrap">
                      {new Date(log.sentAt).toLocaleString('en-PK')}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 uppercase">
                        {getTypeIcon(log.type)}
                        <span>{log.type}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 max-w-xs">
                      <div className="font-bold text-zinc-900 truncate">{log.title}</div>
                      <div className="text-[11px] text-zinc-500 truncate">{log.message}</div>
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 font-bold text-[11px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Check className="w-3 h-3" />
                        <span>{log.sentCount} sent</span>
                      </span>
                      {log.failureCount > 0 && (
                        <span className="ml-1 text-[10px] text-zinc-400">
                          ({log.failureCount} failed)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-[10px] text-zinc-500">
                      {log.targetUrl || '/'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
