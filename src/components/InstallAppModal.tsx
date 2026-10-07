import React, { useEffect, useState } from 'react';
import { Apple, Check, Smartphone, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallAppModal: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    setIsInstalled(standalone);
    setIsIOS(ios);

    const existing = (window as any).deferredPrompt as BeforeInstallPromptEvent | undefined;
    if (existing) setDeferredPrompt(existing);

    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      (window as any).deferredPrompt = event;
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handlePromptReady = () => {
      const prompt = (window as any).deferredPrompt as BeforeInstallPromptEvent | undefined;
      if (prompt) setDeferredPrompt(prompt);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      (window as any).deferredPrompt = null;
      setShowIOSGuide(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('pwa-prompt-ready', handlePromptReady);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('pwa-prompt-ready', handlePromptReady);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (isInstalled) return;

    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    const prompt = (window as any).deferredPrompt as BeforeInstallPromptEvent | null || deferredPrompt;
    if (!prompt) {
      // Browser has not exposed a native install prompt yet. Never fake an install.
      return;
    }

    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      (window as any).deferredPrompt = null;
      setDeferredPrompt(null);

      if (choice.outcome === 'accepted') {
        // appinstalled is the authoritative success event.
      }
    } catch (error) {
      console.error('PWA install prompt failed:', error);
    }
  };

  if (isInstalled) return null;

  return (
    <>
      <button
        type="button"
        onClick={handleInstall}
        className="fixed bottom-20 left-4 z-[45] bg-[#e4002b] hover:bg-[#c30025] active:scale-95 text-white px-4 py-3 rounded-full shadow-2xl border border-white/20 flex items-center gap-2 text-xs font-black uppercase tracking-wide transition-all"
        aria-label="Install KFC App"
      >
        {isIOS ? <Apple className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
        <span>Install App</span>
      </button>

      {showIOSGuide && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-3">
          <div className="w-full max-w-sm rounded-3xl bg-white text-zinc-900 shadow-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Apple className="w-5 h-5" />
                <h3 className="font-black text-lg">Install KFC App on iPhone</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="p-2 rounded-full bg-zinc-100"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <span className="w-7 h-7 rounded-full bg-[#e4002b] text-white flex items-center justify-center font-black shrink-0">1</span>
                <p>Safari ke neeche <strong>Share</strong> button tap karein.</p>
              </div>
              <div className="flex gap-3">
                <span className="w-7 h-7 rounded-full bg-[#e4002b] text-white flex items-center justify-center font-black shrink-0">2</span>
                <p><strong>Add to Home Screen</strong> select karein.</p>
              </div>
              <div className="flex gap-3">
                <span className="w-7 h-7 rounded-full bg-[#e4002b] text-white flex items-center justify-center font-black shrink-0">3</span>
                <p><strong>Add</strong> tap karein. KFC App Home Screen par install ho jayegi.</p>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-2xl bg-zinc-50 text-xs text-zinc-600 flex gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>iPhone par website se direct silent installation possible nahi hoti; Apple ka Add to Home Screen process zaroori hai.</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
