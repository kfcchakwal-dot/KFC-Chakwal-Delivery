import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Share2, 
  Copy, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Tag, 
  BarChart2, 
  Instagram, 
  Facebook 
} from 'lucide-react';

export const MetaAdsManager: React.FC = () => {
  const { settings, updateMetaCommerce, menuItems } = useStore();
  const config = settings.metaCommerce || {
    pixelId: '',
    conversionsApiToken: '',
    catalogFeedUrl: `${window.location.origin}/api/facebook-catalog.xml`,
    testEventCode: '',
    instagramShoppingEnabled: true,
    facebookShopEnabled: true,
    trackAddToCart: true,
    trackInitiateCheckout: true,
    trackPurchase: true,
  };

  const [pixelId, setPixelId] = useState(config.pixelId || '');
  const [capiToken, setCapiToken] = useState(config.conversionsApiToken || '');
  const [testEventCode, setTestEventCode] = useState(config.testEventCode || '');
  const [copiedFeed, setCopiedFeed] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const feedUrl = `${window.location.origin}/api/facebook-catalog.xml`;

  const handleCopyFeed = () => {
    navigator.clipboard.writeText(feedUrl);
    setCopiedFeed(true);
    setTimeout(() => setCopiedFeed(false), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMetaCommerce({
      pixelId: pixelId.trim(),
      conversionsApiToken: capiToken.trim(),
      testEventCode: testEventCode.trim(),
      catalogFeedUrl: feedUrl,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Title */}
      <div className="border-b border-zinc-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight flex items-center gap-2">
            <Share2 className="w-6 h-6 text-[#1877f2]" />
            <span>Facebook, Instagram & Meta Ads Manager</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Connect your KFC products catalog directly to Facebook Shop, Instagram Shopping, and run targeted Meta Ads with Pixel tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm">
            <Facebook className="w-4 h-4" />
            <span>Meta Verified Partner</span>
          </span>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold">Meta Commerce configurations saved successfully!</span>
        </div>
      )}

      {/* 1. Automated Product Catalog Feed for Facebook & Instagram Shop */}
      <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 text-white flex items-center justify-center">
              <Instagram className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900">
                Live Product Catalog Feed (XML / RSS)
              </h3>
              <p className="text-[11px] text-zinc-500">
                Syncs all {menuItems.length} active KFC items with prices, images, descriptions and stock to Meta Commerce Manager.
              </p>
            </div>
          </div>

          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
            Active Feed
          </span>
        </div>

        <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 font-mono text-xs">
          <span className="truncate text-zinc-800 font-semibold">{feedUrl}</span>
          <button
            type="button"
            onClick={handleCopyFeed}
            className="bg-[#1877f2] hover:bg-[#166fe5] text-white text-xs font-sans font-bold px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow shrink-0 active:scale-95"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copiedFeed ? 'Copied Feed URL!' : 'Copy Catalog URL'}</span>
          </button>
        </div>

        <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900 space-y-1">
          <p className="font-bold">How to sync in Meta Commerce Manager:</p>
          <p className="text-[11px] text-blue-800/90 leading-relaxed">
            1. Go to <strong>Meta Commerce Manager</strong> ➔ Catalogs ➔ Data Sources.<br />
            2. Choose <strong>Data Feed (Scheduled Feed)</strong>.<br />
            3. Paste the URL above and set schedule to <strong>Daily at 12:00 AM</strong>. Your Facebook & Instagram store will automatically sync!
          </p>
        </div>
      </div>

      {/* 2. Meta Pixel & Conversions API (CAPI) */}
      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm space-y-5">
        <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wider flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-[#1877f2]" />
          <span>Meta Pixel & Tracking Settings</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              Meta Pixel ID (15-16 Digits)
            </label>
            <input
              type="text"
              value={pixelId}
              onChange={(e) => setPixelId(e.target.value)}
              placeholder="e.g. 192837465019283"
              className="w-full text-xs font-mono rounded-xl px-3.5 py-2.5 border border-zinc-300 focus:outline-none focus:border-[#1877f2] bg-zinc-50 focus:bg-white"
            />
            <p className="text-[10px] text-zinc-500 mt-1">
              Found in Meta Events Manager ➔ Data Sources ➔ Settings.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              Test Event Code (Optional)
            </label>
            <input
              type="text"
              value={testEventCode}
              onChange={(e) => setTestEventCode(e.target.value)}
              placeholder="e.g. TEST12345"
              className="w-full text-xs font-mono rounded-xl px-3.5 py-2.5 border border-zinc-300 focus:outline-none focus:border-[#1877f2] bg-zinc-50 focus:bg-white"
            />
            <p className="text-[10px] text-zinc-500 mt-1">
              Used in Events Manager to test real-time conversions.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1">
            Meta Conversions API (CAPI) Access Token
          </label>
          <input
            type="password"
            value={capiToken}
            onChange={(e) => setCapiToken(e.target.value)}
            placeholder="EAABw..."
            className="w-full text-xs font-mono rounded-xl px-3.5 py-2.5 border border-zinc-300 focus:outline-none focus:border-[#1877f2] bg-zinc-50 focus:bg-white"
          />
          <p className="text-[10px] text-zinc-500 mt-1">
            Server-side tracking token to bypass iOS ad-blockers and Safari cookie limitations.
          </p>
        </div>

        {/* Standard Event Tracking Matrix */}
        <div className="pt-2 border-t border-zinc-100">
          <p className="text-xs font-bold text-zinc-700 mb-2">Automated Standard Events Triggered:</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>PageView</span>
            </div>
            <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>ViewContent</span>
            </div>
            <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>AddToCart</span>
            </div>
            <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Purchase</span>
            </div>
          </div>
        </div>

        <div className="pt-3">
          <button
            type="submit"
            className="bg-[#1877f2] hover:bg-[#166fe5] text-white text-xs font-bold uppercase px-6 py-2.5 rounded-xl shadow-md cursor-pointer transition active:scale-95"
          >
            Save Meta Settings
          </button>
        </div>
      </form>
    </div>
  );
};
