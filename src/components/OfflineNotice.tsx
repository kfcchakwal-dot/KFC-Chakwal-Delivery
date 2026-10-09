import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

export const OfflineNotice: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showRestoredNotice, setShowRestoredNotice] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowRestoredNotice(true);
      const timer = setTimeout(() => setShowRestoredNotice(false), 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowRestoredNotice(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      // Test actual connectivity with a head/get request
      const res = await fetch('/manifest.json', { method: 'HEAD', cache: 'no-store' });
      if (res.ok) {
        setIsOffline(false);
        setShowRestoredNotice(true);
        setTimeout(() => setShowRestoredNotice(false), 3000);
      } else {
        setIsOffline(true);
      }
    } catch {
      setIsOffline(!navigator.onLine);
    } finally {
      setIsRetrying(false);
    }
  };

  if (!isOffline && !showRestoredNotice) {
    return null;
  }

  if (showRestoredNotice) {
    return (
      <div className="bg-emerald-600 text-white text-xs font-bold py-2 px-3 text-center flex items-center justify-center gap-1.5 shadow-md sticky top-0 z-50 animate-in slide-in-from-top duration-200">
        <CheckCircle2 className="w-4 h-4 shrink-0" />
        <span>Internet connection restored! You are back online.</span>
      </div>
    );
  }

  return (
    <div className="bg-amber-600 text-white text-xs font-semibold py-2 px-3 flex items-center justify-between shadow-lg sticky top-0 z-50 animate-in slide-in-from-top duration-200">
      <div className="flex items-center gap-2 truncate">
        <WifiOff className="w-4 h-4 shrink-0 animate-pulse text-amber-200" />
        <span className="truncate">
          <strong>Offline Mode:</strong> Internet disconnected. Saved KFC menu is available.
        </span>
      </div>
      <button
        type="button"
        onClick={handleRetry}
        disabled={isRetrying}
        className="ml-2 bg-white text-amber-800 text-[11px] font-black px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1 hover:bg-amber-100 transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
        aria-label="Retry internet connection"
      >
        <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
        <span>{isRetrying ? 'Checking...' : 'Retry'}</span>
      </button>
    </div>
  );
};
