import React, { useState, useEffect } from 'react';
import { RefreshCw, X, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const AppUpdatePrompt: React.FC = () => {
  const { isCheckoutOpen } = useStore();
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    // Listen for custom event from index.html registration
    const handleUpdateAvailable = (e: Event) => {
      const reg = (e as CustomEvent).detail as ServiceWorkerRegistration;
      if (reg && reg.waiting) {
        setWaitingWorker(reg.waiting);
        setUpdateAvailable(true);
      }
    };

    window.addEventListener('pwa-update-available', handleUpdateAvailable);

    // Also check directly on registration
    navigator.serviceWorker.ready.then((reg) => {
      if (reg.waiting) {
        setWaitingWorker(reg.waiting);
        setUpdateAvailable(true);
      }
    }).catch(() => {});

    // Listen for controllerchange to reload smoothly
    let refreshing = false;
    const handleControllerChange = () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    };
    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    return () => {
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  // NEVER interrupt active checkout flow
  if (!updateAvailable || isCheckoutOpen) {
    return null;
  }

  const handleApplyUpdate = () => {
    setIsUpdating(true);
    try {
      if (waitingWorker) {
        waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      }
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((regs) => {
          regs.forEach((reg) => {
            if (reg.waiting) {
              reg.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        }).catch(() => {});
      }
    } catch (e) {
      console.warn('SW update postMessage:', e);
    }

    // Never hang indefinitely: enforce fast hard reload in 400ms max
    setTimeout(() => {
      window.location.reload();
    }, 400);
  };

  return (
    <div
      role="alert"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-[95] max-w-md bg-zinc-950/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-zinc-800 animate-in fade-in slide-in-from-bottom-3 duration-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#e4002b] text-white flex items-center justify-center shrink-0 shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white">Naya App Update Available</h4>
            <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
              Naye menu items aur features load karne ke liye update karein. Aap ki cart mehfooz rahegi.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setUpdateAvailable(false)}
          className="text-zinc-500 hover:text-zinc-300 p-1 transition"
          aria-label="Dismiss update notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setUpdateAvailable(false)}
          className="text-xs text-zinc-400 hover:text-white font-bold px-3 py-1.5 rounded-lg transition"
        >
          Baad mein
        </button>
        <button
          type="button"
          disabled={isUpdating}
          onClick={handleApplyUpdate}
          className="bg-[#e4002b] hover:bg-[#c30025] text-white text-xs font-black px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-red-950/30 transition cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
          <span>{isUpdating ? 'Updating...' : 'Update Karein'}</span>
        </button>
      </div>
    </div>
  );
};
