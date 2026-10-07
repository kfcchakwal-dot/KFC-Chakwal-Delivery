import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  Apple, 
  X, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Zap,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallAppModal: React.FC = () => {
  const { themeMode, cartCount } = useStore();
  const isDark = themeMode === 'dark';

  const [isOpen, setIsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isAutoInstalling, setIsAutoInstalling] = useState(false);
  const [installSuccessMessage, setInstallSuccessMessage] = useState(false);

  useEffect(() => {
    const checkStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(checkStandalone);

    // Pick up early captured prompt if available
    if ((window as any).deferredPrompt) {
      setDeferredPrompt((window as any).deferredPrompt);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      (window as any).deferredPrompt = e;
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handlePromptReady = () => {
      if ((window as any).deferredPrompt) {
        setDeferredPrompt((window as any).deferredPrompt);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('pwa-prompt-ready', handlePromptReady);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('pwa-prompt-ready', handlePromptReady);
    };
  }, []);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-install-app-modal', handleOpen);
    return () => window.removeEventListener('open-install-app-modal', handleOpen);
  }, []);

  // The native PWA install prompt is the only real install mechanism.
  // A beforeinstallprompt event can be used only once, so we clear it after use.
  const handleSingleClickInstall = async () => {
    const prompt = (window as any).deferredPrompt || deferredPrompt;

    if (!prompt) {
      setInstallSuccessMessage(false);
      return;
    }

    setIsAutoInstalling(true);
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      (window as any).deferredPrompt = null;
      setDeferredPrompt(null);

      if (choice.outcome === 'accepted') {
        // The appinstalled event below is the authoritative success signal.
        setInstallSuccessMessage(false);
      }
    } catch (err) {
      console.error('PWA install prompt error:', err);
    } finally {
      setIsAutoInstalling(false);
    }
  };

  useEffect(() => {
    const handleInstalled = () => {
      setIsInstalled(true);
      setInstallSuccessMessage(true);
      setDeferredPrompt(null);
      (window as any).deferredPrompt = null;
      window.setTimeout(() => setIsOpen(false), 1800);
    };

    window.addEventListener('appinstalled', handleInstalled);
    return () => window.removeEventListener('appinstalled', handleInstalled);
  }, []);
  if (!isOpen) {
    if (isStandalone || cartCount > 0) return null;
    return (
      <button
        onClick={() => {
          setIsOpen(true);
          if (deferredPrompt) {
            deferredPrompt.prompt();
          }
        }}
        className="fixed bottom-20 left-4 z-30 bg-[#e4002b] hover:bg-[#c30025] hover:scale-105 active:scale-95 text-white px-4 py-2.5 rounded-full shadow-2xl shadow-red-950/60 border border-white/20 flex items-center gap-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
        title="Download / Install KFC Chakwal App"
        aria-label="Download KFC Chakwal App"
      >
        <Smartphone className="w-4 h-4 animate-bounce" />
        <span>Install KFC App</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className={`w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden max-h-[92vh] flex flex-col ${
        isDark ? 'bg-[#151518] border-[#292934] text-white' : 'bg-white border-zinc-200 text-zinc-900'
      }`}>
        
        {/* Header */}
        <div className="bg-[#e4002b] p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white p-1.5 flex items-center justify-center shrink-0 shadow-lg">
              <span className="font-kfc font-black text-2xl text-[#e4002b]">KFC</span>
            </div>
            <div>
              <h3 className="font-kfc text-2xl font-black uppercase tracking-tight leading-none">
                KFC Chakwal App
              </h3>
              <p className="text-white/90 text-xs font-medium mt-1">
                Official Fast Mobile Ordering App
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="text-white/80 hover:text-white p-1.5 rounded-full bg-black/20 hover:bg-black/40 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* Key Value Badges */}
          <div className="grid grid-cols-3 gap-2">
            <div className={`p-2.5 rounded-2xl border text-center ${
              isDark ? 'bg-[#1a1a22] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
            }`}>
              <Zap className="w-4 h-4 text-amber-500 mx-auto mb-1" />
              <p className="text-[10px] font-bold text-zinc-400 uppercase">Fast</p>
              <p className="text-xs font-black">1-Click Order</p>
            </div>

            <div className={`p-2.5 rounded-2xl border text-center ${
              isDark ? 'bg-[#1a1a22] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
            }`}>
              <Sparkles className="w-4 h-4 text-[#e4002b] mx-auto mb-1" />
              <p className="text-[10px] font-bold text-zinc-400 uppercase">Loyalty</p>
              <p className="text-xs font-black">Earn Points</p>
            </div>

            <div className={`p-2.5 rounded-2xl border text-center ${
              isDark ? 'bg-[#1a1a22] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
            }`}>
              <ShieldCheck className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
              <p className="text-[10px] font-bold text-zinc-400 uppercase">Security</p>
              <p className="text-xs font-black">Verified Halal</p>
            </div>
          </div>

          {/* SINGLE-CLICK MAIN AUTO INSTALL BUTTON */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSingleClickInstall}
              disabled={isAutoInstalling || isInstalled}
              className="w-full bg-[#e4002b] hover:bg-[#c30025] text-white p-4 rounded-2xl font-kfc uppercase text-xl font-black tracking-wide shadow-2xl shadow-red-950/60 flex items-center justify-center gap-2.5 transition-all active:scale-98 cursor-pointer disabled:opacity-75"
            >
              {isInstalled ? (
                <>
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  <span>App Already Installed!</span>
                </>
              ) : isAutoInstalling ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Preparing Download...</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-6 h-6 stroke-[2.5]" />
                  <span>Install KFC App</span>
                </>
              )}
            </button>
          </div>

          {/* Success Message Banner */}
          {installSuccessMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs flex items-start gap-2 animate-in fade-in duration-200">
              <Check className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">App Ready on Your Phone!</p>
                <p className="text-[11px] text-emerald-300/80 mt-0.5">
                  KFC Chakwal Delivery icon aapki phone screen par add kar diya gaya hai. Ab aap directly 1 tap se open kar sakty hein.
                </p>
              </div>
            </div>
          )}

          {/* Quick Android & iPhone Automatic Instructions */}
          <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
            isDark ? 'bg-[#1b1b22] border-zinc-800 text-zinc-300' : 'bg-zinc-50 border-zinc-200 text-zinc-700'
          }`}>
            <p className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-[#e4002b]" />
              <span>Instant Auto-Install Guide:</span>
            </p>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#e4002b]/15 text-[#e4002b] flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                <span>Click the <strong>Single-Click Install</strong> button above.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#e4002b]/15 text-[#e4002b] flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                <span>Screen par "Install" prompt aate hi tap karein.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#e4002b]/15 text-[#e4002b] flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                <span>iPhone user? Tap <strong>Share (iOS)</strong> ➔ <strong>Add to Home Screen</strong>.</span>
              </div>
            </div>
          </div>

          {/* No fake APK/manifest downloads: browser-native PWA installation only. */}
          {!deferredPrompt && !isInstalled && (
            <div className="pt-1 text-center">
              <p className="text-xs text-zinc-400">
                Install prompt unavailable. Chrome menu se <strong>Install app</strong> ya <strong>Add to Home screen</strong> choose karein.
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
