import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  Apple, 
  X, 
  Check, 
  Share, 
  PlusSquare,
  Sparkles
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallAppModal: React.FC = () => {
  const { themeMode } = useStore();
  const isDark = themeMode === 'dark';

  const [isOpen, setIsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showAndroidManualTip, setShowAndroidManualTip] = useState(false);

  useEffect(() => {
    const checkStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(checkStandalone);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        setTimeout(() => setIsOpen(false), 1500);
      }
    } else {
      setShowAndroidManualTip(true);
    }
  };

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-install-app-modal', handleOpen);
    return () => window.removeEventListener('open-install-app-modal', handleOpen);
  }, []);

  if (!isOpen) {
    if (isStandalone) return null;
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 left-4 z-40 bg-[#e4002b] hover:bg-[#c30025] hover:scale-105 active:scale-95 text-white px-3.5 py-2.5 rounded-full shadow-2xl shadow-red-950/60 border border-white/20 flex items-center gap-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
        title="Install KFC Chakwal App"
      >
        <Smartphone className="w-4 h-4" />
        <span>Install App</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className={`w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden ${
        isDark ? 'bg-[#151518] border-[#292934]' : 'bg-white border-zinc-200'
      }`}>
        {/* Header */}
        <div className="bg-[#e4002b] p-4 sm:p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white p-1.5 flex items-center justify-center shrink-0 shadow">
              <img src="/pwa-192.png" alt="KFC Chakwal" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="font-kfc text-xl sm:text-2xl font-black uppercase tracking-tight">
                Install App
              </h3>
              <p className="text-white/90 text-xs font-medium">
                KFC Chakwal Delivery (Android & iPhone)
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="text-white/80 hover:text-white p-1.5 rounded-full bg-black/20 hover:bg-black/40 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content: Android & iPhone Clearly Mentioned */}
        <div className="p-4 sm:p-5 space-y-4">
          
          {/* 1. ANDROID */}
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isDark ? 'bg-[#1a1a21] border-[#2b2b36]' : 'bg-zinc-50 border-zinc-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <h4 className="font-bold text-sm text-white">Android Phone</h4>
              </div>
              <span className="text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                1-Click Direct
              </span>
            </div>

            {isInstalled ? (
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs bg-emerald-500/10 p-3 rounded-xl">
                <Check className="w-4 h-4" />
                <span>App successfully installed on Android!</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full bg-[#e4002b] hover:bg-[#c30025] active:scale-95 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <Download className="w-4 h-4" />
                <span>Install App on Android</span>
              </button>
            )}

            {showAndroidManualTip && (
              <p className="text-[11px] text-zinc-300 bg-black/40 p-2.5 rounded-xl border border-zinc-700/40">
                Chrome browser ke top-right <strong>3-dots (⋮)</strong> par tap kar ke <strong>"Install app"</strong> ya <strong>"Add to Home screen"</strong> select karein.
              </p>
            )}
          </div>

          {/* 2. IPHONE (APPLE) */}
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isDark ? 'bg-[#1a1a21] border-[#2b2b36]' : 'bg-zinc-50 border-zinc-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Apple className="w-5 h-5 text-zinc-200" />
                <h4 className="font-bold text-sm text-white">iPhone (Apple iOS)</h4>
              </div>
              <span className="text-[10px] font-bold uppercase bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded-full">
                Safari 3-Steps
              </span>
            </div>

            <div className="space-y-2 text-xs text-zinc-300">
              <div className="flex items-center gap-2.5 bg-black/30 p-2 rounded-xl">
                <span className="w-5 h-5 rounded-full bg-[#e4002b] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                  1
                </span>
                <span>Safari browser mein neeche <strong>Share icon (📤)</strong> tap karein.</span>
              </div>

              <div className="flex items-center gap-2.5 bg-black/30 p-2 rounded-xl">
                <span className="w-5 h-5 rounded-full bg-[#e4002b] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                  2
                </span>
                <span>Menu scroll kar ke <strong>"Add to Home Screen" (➕)</strong> select karein.</span>
              </div>

              <div className="flex items-center gap-2.5 bg-black/30 p-2 rounded-xl">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                  3
                </span>
                <span>Top-right par <strong>"Add"</strong> dabayein. App iPhone par save ho jayegi!</span>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="w-full text-xs font-bold text-zinc-400 hover:text-white py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 cursor-pointer transition text-center"
          >
            Close
          </button>

        </div>
      </div>
    </div>
  );
};
