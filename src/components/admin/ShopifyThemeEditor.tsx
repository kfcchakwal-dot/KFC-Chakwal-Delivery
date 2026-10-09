import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { StoreSettings, PageSection } from '../../types';
import { ImageUploadPicker } from '../ImageUploadPicker';
import { 
  Smartphone, 
  Monitor, 
  Save, 
  RotateCcw, 
  ChevronRight, 
  ChevronDown, 
  Eye, 
  Sliders, 
  Sparkles, 
  Flame, 
  Truck, 
  Image as ImageIcon, 
  Layers, 
  Type, 
  Phone, 
  Share2, 
  Check, 
  ArrowLeft,
  X,
  Plus
} from 'lucide-react';
import { HeroBanner } from '../HeroBanner';
import { DailyDealsSection } from '../DailyDealsSection';
import { CategoryNav } from '../CategoryNav';
import { PageSectionsRenderer } from '../PageSectionsRenderer';

export const ShopifyThemeEditor: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { settings, updateSettings } = useStore();

  // Local draft state for real-time live preview before saving
  const [draftSettings, setDraftSettings] = useState<StoreSettings>({ ...settings });
  const [activeSection, setActiveSection] = useState<string>('announcement');
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  const handleUpdate = (updates: Partial<StoreSettings>) => {
    setDraftSettings((prev) => ({ ...prev, ...updates }));
  };

  const handleSaveAndPublish = () => {
    updateSettings(draftSettings);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  const handleReset = () => {
    setDraftSettings({ ...settings });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#f4f5f8] text-zinc-900 flex flex-col font-sans overflow-hidden">
      
      {/* ========================================================================= */}
      {/* SHOPIFY THEME EDITOR TOP BAR */}
      {/* ========================================================================= */}
      <header className="h-14 bg-white border-b border-zinc-200 px-4 flex items-center justify-between gap-4 shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-zinc-100 text-zinc-600 flex items-center gap-1 text-xs font-bold transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Exit Editor</span>
          </button>
          
          <div className="h-4 w-px bg-zinc-200" />

          <div className="flex items-center gap-2">
            <span className="font-kfc text-lg font-black uppercase text-[#e4002b]">KCD</span>
            <span className="text-xs font-bold text-zinc-800">Theme Live Customizer</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
              Shopify Mode
            </span>
          </div>
        </div>

        {/* Viewport controls (Desktop vs Mobile) */}
        <div className="flex items-center bg-zinc-100 p-1 rounded-xl border border-zinc-200 text-xs">
          <button
            type="button"
            onClick={() => setViewport('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
              viewport === 'desktop' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setViewport('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
              viewport === 'mobile' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile (375px)</span>
          </button>
        </div>

        {/* Save / Discard Actions */}
        <div className="flex items-center gap-2">
          {isSavedNotice && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-pulse">
              <Check className="w-3.5 h-3.5" />
              <span>Published Live!</span>
            </span>
          )}

          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-bold text-zinc-600 hover:text-zinc-900 px-3 py-2 rounded-xl hover:bg-zinc-100 transition cursor-pointer"
          >
            Discard
          </button>

          <button
            type="button"
            onClick={handleSaveAndPublish}
            className="bg-[#e4002b] hover:bg-[#c30025] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save & Publish</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN SPLIT VIEW: Left Sections Panel + Right Real-time Preview */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL: Section Accordions (Shopify Customizer Tree) */}
        <aside className="w-80 sm:w-96 bg-white border-r border-zinc-200 flex flex-col shrink-0 overflow-y-auto">
          <div className="p-4 border-b border-zinc-100 bg-zinc-50">
            <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-700">
              Template Sections
            </h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Edit any section below to see changes in real-time.
            </p>
          </div>

          <div className="divide-y divide-zinc-100">
            
            {/* 1. Announcement Bar */}
            <div className="border-b border-zinc-100">
              <button
                type="button"
                onClick={() => setActiveSection(activeSection === 'announcement' ? '' : 'announcement')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-50 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 bg-red-50 text-[#e4002b] rounded-lg">📢</span>
                  <div>
                    <h4 className="font-bold text-xs text-zinc-900">Announcement Bar</h4>
                    <p className="text-[10px] text-zinc-400">Top red notification bar</p>
                  </div>
                </div>
                {activeSection === 'announcement' ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronRight className="w-4 h-4 text-zinc-400" />}
              </button>

              {activeSection === 'announcement' && (
                <div className="p-4 bg-zinc-50/50 space-y-3 text-xs border-t border-zinc-100">
                  <label className="flex items-center gap-2 cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={draftSettings.showAnnouncement}
                      onChange={(e) => handleUpdate({ showAnnouncement: e.target.checked })}
                      className="w-4 h-4 accent-[#e4002b] rounded"
                    />
                    <span>Show Announcement Strip</span>
                  </label>

                  <div>
                    <label className="block text-zinc-600 font-semibold mb-1">Announcement Message</label>
                    <textarea
                      rows={2}
                      value={draftSettings.announcementText}
                      onChange={(e) => handleUpdate({ announcementText: e.target.value })}
                      className="w-full bg-white border border-zinc-300 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#e4002b]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 2. Header & Branding */}
            <div className="border-b border-zinc-100">
              <button
                type="button"
                onClick={() => setActiveSection(activeSection === 'header' ? '' : 'header')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-50 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 bg-red-50 text-[#e4002b] rounded-lg">🏷️</span>
                  <div>
                    <h4 className="font-bold text-xs text-zinc-900">Header & Brand Logo</h4>
                    <p className="text-[10px] text-zinc-400">Store title, logo image upload</p>
                  </div>
                </div>
                {activeSection === 'header' ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronRight className="w-4 h-4 text-zinc-400" />}
              </button>

              {activeSection === 'header' && (
                <div className="p-4 bg-zinc-50/50 space-y-3 text-xs border-t border-zinc-100">
                  <div>
                    <label className="block text-zinc-600 font-semibold mb-1">Store Name</label>
                    <input
                      type="text"
                      value={draftSettings.storeName}
                      onChange={(e) => handleUpdate({ storeName: e.target.value })}
                      className="w-full bg-white border border-zinc-300 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#e4002b]"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-600 font-semibold mb-1">Tagline</label>
                    <input
                      type="text"
                      value={draftSettings.tagline}
                      onChange={(e) => handleUpdate({ tagline: e.target.value })}
                      className="w-full bg-white border border-zinc-300 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#e4002b]"
                    />
                  </div>

                  {/* Logo Image Upload */}
                  <ImageUploadPicker
                    label="Storefront Logo Image"
                    value={draftSettings.headerFooter?.logoUrl || ''}
                    onChange={(url) =>
                      handleUpdate({
                        headerFooter: {
                          ...(draftSettings.headerFooter || {
                            headerTitle: 'KFC CHAKWAL DELIVERY',
                            footerAboutText: '',
                            footerCopyrightText: '',
                          }),
                          logoUrl: url,
                        },
                      })
                    }
                    helperText="Upload official brand logo PNG / JPG to replace default KFC stripes."
                  />
                </div>
              )}
            </div>

            {/* 3. Hero Banner */}
            <div className="border-b border-zinc-100">
              <button
                type="button"
                onClick={() => setActiveSection(activeSection === 'hero' ? '' : 'hero')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-50 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 bg-red-50 text-[#e4002b] rounded-lg">🔥</span>
                  <div>
                    <h4 className="font-bold text-xs text-zinc-900">Hero Section</h4>
                    <p className="text-[10px] text-zinc-400">Headlines, CTA, hero banner upload</p>
                  </div>
                </div>
                {activeSection === 'hero' ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronRight className="w-4 h-4 text-zinc-400" />}
              </button>

              {activeSection === 'hero' && (
                <div className="p-4 bg-zinc-50/50 space-y-3 text-xs border-t border-zinc-100">
                  {/* Enable / Remove Toggle */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-zinc-200">
                    <div>
                      <p className="font-bold text-zinc-900">Show 1st Section (Crispy. Juicy.)</p>
                      <p className="text-[10px] text-zinc-500">Toggle to display or completely remove from homepage</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={draftSettings.hero?.enabled ?? true}
                        onChange={(e) =>
                          handleUpdate({
                            hero: { ...(draftSettings.hero as any), enabled: e.target.checked },
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e4002b]"></div>
                    </label>
                  </div>

                  {draftSettings.hero?.enabled === false && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold flex items-center justify-between">
                      <span>✓ 1st Section is currently REMOVED / HIDDEN from home screen.</span>
                      <button
                        type="button"
                        onClick={() => handleUpdate({ hero: { ...(draftSettings.hero as any), enabled: true } })}
                        className="text-[#e4002b] font-bold underline cursor-pointer"
                      >
                        Restore
                      </button>
                    </div>
                  )}

                  <div>
                    <label className="block text-zinc-600 font-semibold mb-1">Headline</label>
                    <input
                      type="text"
                      value={draftSettings.hero?.headline || ''}
                      onChange={(e) =>
                        handleUpdate({
                          hero: { ...(draftSettings.hero as any), headline: e.target.value },
                        })
                      }
                      className="w-full bg-white border border-zinc-300 rounded-xl p-2.5 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-600 font-semibold mb-1">Highlight Word (Red)</label>
                    <input
                      type="text"
                      value={draftSettings.hero?.highlightText || ''}
                      onChange={(e) =>
                        handleUpdate({
                          hero: { ...(draftSettings.hero as any), highlightText: e.target.value },
                        })
                      }
                      className="w-full bg-white border border-zinc-300 rounded-xl p-2.5 text-xs"
                    />
                  </div>

                  <label className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-3">
                    <span><span className="block font-bold text-zinc-800">Show Hero Rich Text</span><span className="block text-[10px] text-zinc-500">Uncheck karne par hero description homepage se hide ho jayegi.</span></span>
                    <input type="checkbox" checked={(draftSettings.hero as any)?.showSubtext !== false} onChange={(e) => handleUpdate({ hero: { ...(draftSettings.hero as any), showSubtext: e.target.checked } })} className="h-4 w-4 accent-[#e4002b]" />
                  </label>

                  <div>
                    <label className="block text-zinc-600 font-semibold mb-1">Subtext / Description</label>
                    <textarea
                      rows={2}
                      value={draftSettings.hero?.subtext || ''}
                      onChange={(e) =>
                        handleUpdate({
                          hero: { ...(draftSettings.hero as any), subtext: e.target.value },
                        })
                      }
                      className="w-full bg-white border border-zinc-300 rounded-xl p-2.5 text-xs"
                    />
                  </div>

                  {/* Hero Banner Upload */}
                  <ImageUploadPicker
                    label="Hero Banner Image Upload"
                    value={draftSettings.hero?.imageUrl || ''}
                    aspectRatio="wide"
                    onChange={(url) =>
                      handleUpdate({
                        hero: { ...(draftSettings.hero as any), imageUrl: url },
                      })
                    }
                    helperText="Upload wide banner photo (16:9 recommended)."
                  />
                </div>
              )}
            </div>

            {/* 4. Daily 5 Deals */}
            <div className="border-b border-zinc-100">
              <button
                type="button"
                onClick={() => setActiveSection(activeSection === 'deals' ? '' : 'deals')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-50 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">⚡</span>
                  <div>
                    <h4 className="font-bold text-xs text-zinc-900">Daily 5 Deals (4% OFF)</h4>
                    <p className="text-[10px] text-zinc-400">Meal box automated discounts</p>
                  </div>
                </div>
                {activeSection === 'deals' ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronRight className="w-4 h-4 text-zinc-400" />}
              </button>

              {activeSection === 'deals' && (
                <div className="p-4 bg-zinc-50/50 space-y-3 text-xs border-t border-zinc-100">
                  <label className="flex items-center gap-2 cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={draftSettings.dailyDeal?.enabled ?? true}
                      onChange={(e) =>
                        handleUpdate({
                          dailyDeal: { ...(draftSettings.dailyDeal as any), enabled: e.target.checked },
                        })
                      }
                      className="w-4 h-4 accent-[#e4002b] rounded"
                    />
                    <span>Enable Daily 5 Deals Section</span>
                  </label>

                  <div>
                    <label className="block text-zinc-600 font-semibold mb-1">Discount %</label>
                    <input
                      type="number"
                      value={draftSettings.dailyDeal?.discountPercentage || 4}
                      onChange={(e) =>
                        handleUpdate({
                          dailyDeal: { ...(draftSettings.dailyDeal as any), discountPercentage: Number(e.target.value) },
                        })
                      }
                      className="w-full bg-white border border-zinc-300 rounded-xl p-2.5 text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-600 font-semibold mb-1">Section Title</label>
                    <input
                      type="text"
                      value={draftSettings.dailyDeal?.title || ''}
                      onChange={(e) =>
                        handleUpdate({
                          dailyDeal: { ...(draftSettings.dailyDeal as any), title: e.target.value },
                        })
                      }
                      className="w-full bg-white border border-zinc-300 rounded-xl p-2.5 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 5. Kallar Kahar Delivery Guarantee */}
            <div className="border-b border-zinc-100">
              <button
                type="button"
                onClick={() => setActiveSection(activeSection === 'delivery' ? '' : 'delivery')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-50 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">🚚</span>
                  <div>
                    <h4 className="font-bold text-xs text-zinc-900">Delivery Guarantee Strip</h4>
                    <p className="text-[10px] text-zinc-400">Timings, Kallar Kahar notice</p>
                  </div>
                </div>
                {activeSection === 'delivery' ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronRight className="w-4 h-4 text-zinc-400" />}
              </button>

              {activeSection === 'delivery' && (
                <div className="p-4 bg-zinc-50/50 space-y-3 text-xs border-t border-zinc-100">
                  <div>
                    <label className="block text-zinc-600 font-semibold mb-1">Delivery Badge Headline</label>
                    <input
                      type="text"
                      value={draftSettings.deliverySection?.headline || ''}
                      onChange={(e) =>
                        handleUpdate({
                          deliverySection: { ...(draftSettings.deliverySection as any), headline: e.target.value },
                        })
                      }
                      className="w-full bg-white border border-zinc-300 rounded-xl p-2.5 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-600 font-semibold mb-1">Kallar Kahar Pickup Notice</label>
                    <textarea
                      rows={2}
                      value={draftSettings.kallarKaharNotice || ''}
                      onChange={(e) => handleUpdate({ kallarKaharNotice: e.target.value })}
                      className="w-full bg-white border border-zinc-300 rounded-xl p-2.5 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 6. Typography & Fonts */}
            <div className="border-b border-zinc-100">
              <button
                type="button"
                onClick={() => setActiveSection(activeSection === 'typography' ? '' : 'typography')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-50 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 bg-zinc-100 text-zinc-700 rounded-lg">🔤</span>
                  <div>
                    <h4 className="font-bold text-xs text-zinc-900">Typography & Fonts</h4>
                    <p className="text-[10px] text-zinc-400">Heading & body font styles</p>
                  </div>
                </div>
                {activeSection === 'typography' ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronRight className="w-4 h-4 text-zinc-400" />}
              </button>

              {activeSection === 'typography' && (
                <div className="p-4 bg-zinc-50/50 space-y-3 text-xs border-t border-zinc-100">
                  <div>
                    <label className="block text-zinc-600 font-semibold mb-1">Headings Font</label>
                    <select
                      value={draftSettings.headingFont}
                      onChange={(e) => handleUpdate({ headingFont: e.target.value as any })}
                      className="w-full bg-white border border-zinc-300 rounded-xl p-2 text-xs"
                    >
                      <option value="Barlow Condensed">Barlow Condensed (Authentic Bold KFC)</option>
                      <option value="Plus Jakarta Sans">Plus Jakarta Sans (Modern Geometric)</option>
                      <option value="Oswald">Oswald (Tall Condensed)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-600 font-semibold mb-1">Body Font</label>
                    <select
                      value={draftSettings.bodyFont}
                      onChange={(e) => handleUpdate({ bodyFont: e.target.value as any })}
                      className="w-full bg-white border border-zinc-300 rounded-xl p-2 text-xs"
                    >
                      <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* 7. Footer & Helpline */}
            <div className="border-b border-zinc-100">
              <button
                type="button"
                onClick={() => setActiveSection(activeSection === 'footer' ? '' : 'footer')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-50 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">📞</span>
                  <div>
                    <h4 className="font-bold text-xs text-zinc-900">Footer & Contact Details</h4>
                    <p className="text-[10px] text-zinc-400">WhatsApp, Socials, About text</p>
                  </div>
                </div>
                {activeSection === 'footer' ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronRight className="w-4 h-4 text-zinc-400" />}
              </button>

              {activeSection === 'footer' && (
                <div className="p-4 bg-zinc-50/50 space-y-3 text-xs border-t border-zinc-100">
                  <div>
                    <label className="block text-zinc-600 font-semibold mb-1">WhatsApp Helpline</label>
                    <input
                      type="text"
                      value={draftSettings.whatsappNumber}
                      onChange={(e) => handleUpdate({ whatsappNumber: e.target.value })}
                      className="w-full bg-white border border-zinc-300 rounded-xl p-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-600 font-semibold mb-1">About Text</label>
                    <textarea
                      rows={2}
                      value={draftSettings.headerFooter?.footerAboutText || ''}
                      onChange={(e) =>
                        handleUpdate({
                          headerFooter: {
                            ...(draftSettings.headerFooter as any),
                            footerAboutText: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-white border border-zinc-300 rounded-xl p-2 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

          </div>
        </aside>

        {/* RIGHT AREA: Live Interactive Storefront Preview */}
        <main className="flex-1 bg-[#eceef2] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div
            className={`transition-all duration-300 bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-300 flex flex-col h-full max-h-[92vh] ${
              viewport === 'mobile' ? 'w-[375px]' : 'w-full max-w-5xl'
            }`}
          >
            {/* Mock Browser Header / Mobile Device Notch */}
            <div className="h-8 bg-zinc-100 border-b border-zinc-200 px-4 flex items-center justify-between text-[11px] text-zinc-400 select-none">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <span className="truncate max-w-[200px] font-mono text-[10px] text-zinc-500">
                kfcchakwaldelivery.pk {viewport === 'mobile' ? '(iPhone 375px)' : '(Desktop)'}
              </span>
              <span className="text-[10px] font-bold text-emerald-600 uppercase">Live Preview</span>
            </div>

            {/* Scrollable Storefront Preview Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden text-zinc-900 bg-[#f8f9fa]">
              
              {/* Preview Announcement Bar */}
              {draftSettings.showAnnouncement && (
                <div className="bg-[#e4002b] text-white text-[11px] font-semibold py-1.5 px-3 text-center">
                  🍗 {draftSettings.announcementText}
                </div>
              )}

              {/* Preview Header */}
              <div className="bg-white border-b border-zinc-200 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {draftSettings.headerFooter?.logoUrl ? (
                    <img
                      src={draftSettings.headerFooter.logoUrl}
                      alt="Logo"
                      className="h-8 object-contain"
                    />
                  ) : (
                    <div className="flex gap-0.5 h-6 items-center">
                      <span className="w-1.5 h-6 bg-[#e4002b] rounded-xs transform -skew-x-6"></span>
                      <span className="w-1.5 h-5 bg-white border border-zinc-300 rounded-xs transform -skew-x-6"></span>
                      <span className="w-1.5 h-6 bg-[#e4002b] rounded-xs transform -skew-x-6"></span>
                    </div>
                  )}
                  <div>
                    <h2
                      style={{ fontFamily: draftSettings.headingFont }}
                      className="font-black text-sm uppercase tracking-tight leading-none"
                    >
                      {draftSettings.storeName}
                    </h2>
                    <span className="text-[9px] text-zinc-400 font-bold uppercase">Within 3 KM</span>
                  </div>
                </div>

                <div className="text-[10px] font-bold text-[#e4002b] bg-red-50 px-2 py-1 rounded-lg">
                  Bucket (0)
                </div>
              </div>

              {/* Preview Hero Banner */}
              <div className="p-4 sm:p-6 bg-gradient-to-r from-red-600 to-red-800 text-white relative overflow-hidden">
                <div className="relative z-10 max-w-md space-y-2">
                  <span className="bg-white/20 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                    ⚡ Express Delivery Within 3 KM
                  </span>
                  <h1
                    style={{ fontFamily: draftSettings.headingFont }}
                    className="text-2xl sm:text-3xl font-black uppercase tracking-tight"
                  >
                    {draftSettings.hero?.headline}{' '}
                    <span className="text-amber-300">{draftSettings.hero?.highlightText}</span>
                  </h1>
                  <p className="text-xs text-white/90 leading-relaxed">
                    {draftSettings.hero?.subtext}
                  </p>
                </div>

                {draftSettings.hero?.imageUrl && (
                  <img
                    src={draftSettings.hero.imageUrl}
                    alt="Hero"
                    className="absolute right-0 bottom-0 w-44 sm:w-64 object-cover opacity-90 rounded-tl-3xl"
                  />
                )}
              </div>

              {/* Preview Delivery Guarantee */}
              <div className="p-3 bg-white border-y border-zinc-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#e4002b]" />
                  <div>
                    <p className="font-bold text-zinc-900">{draftSettings.deliverySection?.headline}</p>
                    <p className="text-[10px] text-zinc-500">{draftSettings.kallarKaharNotice}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#e4002b]">Order by 4 PM</span>
              </div>

              {/* Preview Daily 5 Deals */}
              {(draftSettings.dailyDeal?.enabled ?? true) && (
                <div className="p-4 bg-amber-50/60 border-b border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-amber-900 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-[#e4002b]" />
                      <span>{draftSettings.dailyDeal?.title}</span>
                    </span>
                    <span className="text-[10px] font-bold text-[#e4002b] bg-white px-2 py-0.5 rounded-full border border-red-200">
                      Flat {draftSettings.dailyDeal?.discountPercentage || 4}% OFF
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500">{draftSettings.dailyDeal?.subtitle}</p>
                </div>
              )}

              {/* Live Preview Notification */}
              <div className="p-8 text-center text-zinc-400 space-y-2">
                <p className="text-xs font-semibold">
                  (Menu Catalog, Cart & Checkout inherit these theme settings automatically)
                </p>
                <button
                  type="button"
                  onClick={handleSaveAndPublish}
                  className="bg-[#e4002b] hover:bg-[#c30025] text-white text-xs font-bold px-4 py-2 rounded-xl shadow cursor-pointer"
                >
                  Save & Apply to Live Store
                </button>
              </div>

            </div>
          </div>
        </main>

      </div>
    </div>
  );
};
