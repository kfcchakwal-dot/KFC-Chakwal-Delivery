import React, { useEffect, useState } from 'react';
import {
  Apple,
  Check,
  Smartphone,
  X,
  ExternalLink,
  Copy,
  ShieldCheck,
  ShoppingBag,
  Download,
  AlertCircle
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallAppModal: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);
  const [copiedType, setCopiedType] = useState<'customer' | 'admin' | null>(null);

  useEffect(() => {
    // Detect standalone PWA mode
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    // Detect iOS
    const ios =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    // Detect if running inside an iframe (like AI Studio preview)
    const inIframe = window.self !== window.top;

    setIsInstalled(standalone);
    setIsIOS(ios);
    setIsInIframe(inIframe);

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
      setShowAndroidGuide(false);
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

  const getCustomerUrl = () => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/`;
  };

  const getAdminUrl = () => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/?app=seller`;
  };

  const copyToClipboard = async (text: string, type: 'customer' | 'admin') => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2500);
    } catch (e) {
      console.warn('Copy failed:', e);
    }
  };

  const openDirectAppInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleInstall = async () => {
    if (isInstalled) return;

    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    // AI Studio and other embedded previews cannot complete a PWA installation
    // from inside their iframe. Move the customer to the real top-level app
    // immediately from the same user gesture, where Chrome can show the native
    // installation prompt / three-dot Install app option.
    if (isInIframe) {
      const opened = window.open(getCustomerUrl(), '_blank', 'noopener,noreferrer');
      if (!opened) {
        window.top?.location.assign(getCustomerUrl());
      }
      return;
    }

    const prompt = ((window as any).deferredPrompt as BeforeInstallPromptEvent | null) || deferredPrompt;

    if (prompt) {
      try {
        await prompt.prompt();
        const choice = await prompt.userChoice;
        (window as any).deferredPrompt = null;
        setDeferredPrompt(null);
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
        }
        return;
      } catch (error) {
        console.error('PWA install prompt failed:', error);
      }
    }

    // If no direct prompt was captured or if inside iframe, show the guided install modal
    setShowAndroidGuide(true);
  };

  if (isInstalled) return null;

  return (
    <>
      {/* Floating Install App Button */}
      <button
        type="button"
        onClick={handleInstall}
        className="fixed bottom-20 left-4 z-[45] bg-[#e4002b] hover:bg-[#c30025] active:scale-95 text-white px-4 py-3 rounded-full shadow-2xl border-2 border-white/30 flex items-center gap-2 text-xs font-black uppercase tracking-wide transition-all shadow-red-950/40"
        aria-label="Install KFC App"
      >
        {isIOS ? <Apple className="w-4 h-4" /> : <Download className="w-4 h-4 animate-bounce" />}
        <span>Install App</span>
      </button>

      {/* Android & Web Installation / Direct Links Guide Modal */}
      {showAndroidGuide && (
        <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl bg-white text-zinc-900 shadow-2xl p-5 sm:p-6 space-y-4 my-auto border border-zinc-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#e4002b] flex items-center justify-center text-white shadow-md shadow-red-500/20">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-zinc-950 leading-tight">Install KFC Chakwal App</h3>
                  <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Android PWA Installation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAndroidGuide(false)}
                className="p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Iframe Warning & Direct Browser Button (When inside AI Studio Preview) */}
            {isInIframe && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900 leading-relaxed font-medium">
                    <strong>اہم نوٹ (Android Browser):</strong> آپ اس وقت <strong>AI Studio Preview Frame</strong> کے اندر ایپ دیکھ رہے ہیں۔ گوگل کروم سیکیورٹی کے تحت فریم کے اندر سے براہِ راست ایپ انسٹال کرنے پر <span className="font-bold underline text-amber-950">“This app cannot be installed”</span> کا ایرر دیتا ہے۔
                  </div>
                </div>
                <p className="text-[11px] text-amber-800 font-normal">
                  ایپ کو 100% کامیابی کے ساتھ اپنے موبائل پر ڈاؤن لوڈ / انسٹال کرنے کے لیے نیچے دیے گئے بٹن سے اسے براہِ راست اصل براؤزر (Chrome) میں کھولیں:
                </p>
                <button
                  type="button"
                  onClick={() => openDirectAppInNewTab(getCustomerUrl())}
                  className="w-full bg-amber-600 hover:bg-amber-700 active:scale-98 text-white font-black text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>براہِ راست کروم میں کھولیں (Open in Chrome)</span>
                </button>
              </div>
            )}

            {/* Step-by-Step Instructions */}
            <div className="space-y-2.5 text-xs">
              <h4 className="font-black text-zinc-900 uppercase tracking-wide text-[11px] text-zinc-400">
                اینڈرائیڈ پر انسٹال کرنے کا آسان طریقہ:
              </h4>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
                <span className="w-6 h-6 rounded-full bg-[#e4002b] text-white flex items-center justify-center font-black text-xs shrink-0">1</span>
                <p className="text-zinc-700 leading-tight">
                  کروم براؤزر کے اوپر دائیں کونے پر <strong>تین نقطوں (⋮)</strong> کے بٹن پر کلک کریں۔
                </p>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
                <span className="w-6 h-6 rounded-full bg-[#e4002b] text-white flex items-center justify-center font-black text-xs shrink-0">2</span>
                <p className="text-zinc-700 leading-tight">
                  مینیو میں سے <strong>“Install app”</strong> یا <strong>“Add to Home screen”</strong> منتخب کریں۔
                </p>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
                <span className="w-6 h-6 rounded-full bg-[#e4002b] text-white flex items-center justify-center font-black text-xs shrink-0">3</span>
                <p className="text-zinc-700 leading-tight">
                  <strong>“Install”</strong> پر کلک کریں — ایپ خود بخود آپ کی ہوم اسکرین پر انسٹال ہو جائے گی۔
                </p>
              </div>
            </div>

            {/* Direct App URLs Copy Section */}
            <div className="space-y-2 pt-2 border-t border-zinc-100">
              <h4 className="font-black text-zinc-900 text-xs flex items-center gap-1.5">
                <span>الگ الگ لنکس (Customer & Admin Links):</span>
              </h4>

              {/* Customer App Link Box */}
              <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
                    <ShoppingBag className="w-3.5 h-3.5 text-[#e4002b]" />
                    <span>Customer App (گاہکوں کے لیے)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(getCustomerUrl(), 'customer')}
                    className="text-[11px] font-bold text-[#e4002b] hover:underline flex items-center gap-1"
                  >
                    {copiedType === 'customer' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedType === 'customer' ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
                <div className="font-mono text-[11px] text-zinc-600 break-all bg-white p-2 rounded-lg border border-zinc-200 select-all">
                  {getCustomerUrl()}
                </div>
              </div>

              {/* Admin Portal Link Box */}
              <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#e4002b]" />
                    <span>Admin Portal (مالک / مینیجر کے لیے)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(getAdminUrl(), 'admin')}
                    className="text-[11px] font-bold text-[#e4002b] hover:underline flex items-center gap-1"
                  >
                    {copiedType === 'admin' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedType === 'admin' ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
                <div className="font-mono text-[11px] text-zinc-600 break-all bg-white p-2 rounded-lg border border-zinc-200 select-all">
                  {getAdminUrl()}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => openDirectAppInNewTab(getCustomerUrl())}
                className="flex-1 bg-[#e4002b] hover:bg-[#c30025] active:scale-98 text-white font-black text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>کروم میں کھولیں (Open in Chrome)</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAndroidGuide(false)}
                className="px-4 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs rounded-xl transition"
              >
                بند کریں
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Safari Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-3 sm:p-5">
          <div className="w-full max-w-sm rounded-3xl bg-white text-zinc-900 shadow-2xl p-5 space-y-4 border border-zinc-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-zinc-950 flex items-center justify-center text-white">
                  <Apple className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-zinc-950">Install on iPhone</h3>
                  <p className="text-[11px] text-zinc-500 font-bold uppercase">Apple Safari</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="p-2 rounded-full bg-zinc-100 hover:bg-zinc-200"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex gap-3 items-start p-2 rounded-xl bg-zinc-50">
                <span className="w-6 h-6 rounded-full bg-[#e4002b] text-white flex items-center justify-center font-black shrink-0">1</span>
                <p className="text-zinc-700">Safari کے نیچے <strong>Share</strong> بٹن پر ٹیپ کریں۔</p>
              </div>
              <div className="flex gap-3 items-start p-2 rounded-xl bg-zinc-50">
                <span className="w-6 h-6 rounded-full bg-[#e4002b] text-white flex items-center justify-center font-black shrink-0">2</span>
                <p className="text-zinc-700">تھوڑا نیچے سکرول کر کے <strong>“Add to Home Screen”</strong> منتخب کریں۔</p>
              </div>
              <div className="flex gap-3 items-start p-2 rounded-xl bg-zinc-50">
                <span className="w-6 h-6 rounded-full bg-[#e4002b] text-white flex items-center justify-center font-black shrink-0">3</span>
                <p className="text-zinc-700">اوپر دائیں طرف <strong>“Add”</strong> دبائیں۔ ایپ ہوم اسکرین پر آ جائے گی۔</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 bg-zinc-900 text-white font-black text-xs rounded-xl"
            >
              ٹھیک ہے (Done)
            </button>
          </div>
        </div>
      )}
    </>
  );
};
