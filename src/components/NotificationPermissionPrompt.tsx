import React, { useState, useEffect } from 'react';
import { Bell, BellOff, X, Check, Volume2, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const NotificationPermissionPrompt: React.FC = () => {
  const { customerNotificationAllowed, requestNotificationPermission } = useStore();
  const [isVisible, setIsVisible] = useState(false);
  const [hasPrompted, setHasPrompted] = useState(() => {
    return localStorage.getItem('kfc_notification_prompt_answered') === 'true';
  });

  useEffect(() => {
    // Only ask after a slight delay on initial visit if not answered yet
    if (!hasPrompted && !customerNotificationAllowed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [hasPrompted, customerNotificationAllowed]);

  if (!isVisible) return null;

  const handleAllow = async () => {
    localStorage.setItem('kfc_notification_prompt_answered', 'true');
    setHasPrompted(true);
    setIsVisible(false);
    await requestNotificationPermission();
  };

  const handleDismiss = () => {
    localStorage.setItem('kfc_notification_prompt_answered', 'true');
    setHasPrompted(true);
    setIsVisible(false);
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-40 max-w-sm bg-white border-2 border-red-600 rounded-3xl shadow-2xl p-4 sm:p-5 text-zinc-900 animate-in slide-in-from-bottom duration-300">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl bg-red-100 text-[#e4002b] flex items-center justify-center shrink-0">
          <Bell className="w-5 h-5 animate-bounce" />
        </div>
        <div className="flex-1 pr-2">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="font-kfc font-black text-sm uppercase text-zinc-900 tracking-tight">
              Order & Deal Alerts
            </span>
            <span className="text-[10px] bg-red-100 text-[#e4002b] font-bold px-1.5 py-0.5 rounded-full">
              Live Updates
            </span>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Kia aap order status, rider live updates aur daily discount deals k instant alerts receive karna chahty hein?
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-zinc-400 hover:text-zinc-700 p-1 rounded-full cursor-pointer"
          aria-label="Dismiss notification prompt"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3.5 pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
        <button
          onClick={handleDismiss}
          className="flex-1 px-3 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 rounded-xl hover:bg-zinc-100 transition cursor-pointer"
        >
          Not Now
        </button>
        <button
          onClick={handleAllow}
          className="flex-1 px-3 py-2 text-xs font-bold bg-[#e4002b] hover:bg-[#c30025] text-white rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Allow Alerts</span>
        </button>
      </div>
    </div>
  );
};
