import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { PageSection, SectionType } from '../types';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Eye, 
  EyeOff, 
  Save, 
  Layers, 
  Sparkles, 
  Image as ImageIcon,
  Bike,
  ArrowUp,
  ArrowDown,
  Check,
  Smartphone,
  Monitor,
  Clock,
  MapPin,
  X
} from 'lucide-react';
import { ImageUploadPicker } from './ImageUploadPicker';

export const PageSectionsBuilder: React.FC = () => {
  const { settings, updateSettings, themeMode } = useStore();
  const isDark = themeMode === 'dark';

  const [selectedPage, setSelectedPage] = useState<'home' | 'collection' | 'product' | 'wishlist' | 'all'>('home');
  const [editingSection, setEditingSection] = useState<PageSection | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'mobile'>('desktop');

  // Real-time Form state (syncs live to preview)
  const [formData, setFormData] = useState<Partial<PageSection>>({
    type: 'image-with-text',
    page: 'home',
    title: 'New Delicious Deal in Chakwal',
    subtitle: 'Crispy & Fresh Guarantee',
    description: 'Cooked fresh on order. Guaranteed hot, crispy, and delivering original KFC taste right to your location in Chakwal.',
    imageUrl: '/src/assets/images/kfc_hero_zinger_combo_1791015805739.jpg',
    imagePosition: 'right',
    badgeText: 'Chakwal Special',
    buttonText: 'Order Now',
    buttonLink: '#kfc-menu-section',
    estimatedTime: '30-40 Mins',
    deliveryFeeText: 'Flat Rs. 399',
    deliveryAreaText: 'All Chakwal Zones Covered (Within 3 KM)',
    isVisible: true,
  });

  const sections = settings.customSections || [];
  const filteredSections = sections.filter((s) => selectedPage === 'all' || s.page === selectedPage || s.page === 'all');

  const handleOpenCreate = () => {
    const newDraft: Partial<PageSection> = {
      id: `sec-${Date.now()}`,
      type: 'image-with-text',
      page: selectedPage === 'all' ? 'home' : selectedPage,
      title: 'Crispy Chicken Box Delivery in Chakwal',
      subtitle: 'Original KFC Taste from Motorway',
      description: 'Chakwal shehar ke liye daily fresh KFC delivery service. Order karein aur apne ghar receive karein.',
      imageUrl: '/src/assets/images/kfc_hero_zinger_combo_1791015805739.jpg',
      imagePosition: 'right',
      badgeText: 'POPULAR OFFER',
      buttonText: 'Order Now',
      buttonLink: '#kfc-menu-section',
      estimatedTime: '30-40 Mins',
      deliveryFeeText: 'Flat Rs. 399',
      deliveryAreaText: 'Chakwal City & Surrounding 3 KM',
      isVisible: true,
      order: sections.length + 1,
    };
    setFormData(newDraft);
    setEditingSection(null);
    setIsCreatingNew(true);
  };

  const handleOpenEdit = (section: PageSection) => {
    setFormData({ ...section });
    setEditingSection(section);
    setIsCreatingNew(true);
  };

  const handleSave = () => {
    if (!formData.title?.trim()) return;

    if (editingSection) {
      // Update existing
      const updated = sections.map((s) => (s.id === editingSection.id ? ({ ...s, ...formData } as PageSection) : s));
      updateSettings({ customSections: updated });
    } else {
      // Add new
      const newSec: PageSection = {
        id: formData.id || `sec-${Date.now()}`,
        type: formData.type || 'image-with-text',
        page: formData.page || 'home',
        title: formData.title || '',
        subtitle: formData.subtitle || '',
        description: formData.description || '',
        imageUrl: formData.imageUrl || '/src/assets/images/kfc_hero_zinger_combo_1791015805739.jpg',
        imagePosition: formData.imagePosition || 'right',
        badgeText: formData.badgeText || '',
        buttonText: formData.buttonText || 'Order Now',
        buttonLink: formData.buttonLink || '#kfc-menu-section',
        estimatedTime: formData.estimatedTime || '30-40 Mins',
        deliveryFeeText: formData.deliveryFeeText || 'Flat Rs. 399',
        deliveryAreaText: formData.deliveryAreaText || 'All Chakwal Zones Covered',
        isVisible: formData.isVisible ?? true,
        order: sections.length + 1,
      };
      updateSettings({ customSections: [...sections, newSec] });
    }

    setIsCreatingNew(false);
    setEditingSection(null);
  };

  const handleDelete = (id: string) => {
    updateSettings({ customSections: sections.filter((s) => s.id !== id) });
  };

  const handleToggleVisibility = (id: string) => {
    const updated = sections.map((s) => (s.id === id ? { ...s, isVisible: !s.isVisible } : s));
    updateSettings({ customSections: updated });
  };

  const handleMoveOrder = (index: number, direction: 'up' | 'down') => {
    const list = [...sections];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    list.forEach((s, idx) => { s.order = idx + 1; });
    updateSettings({ customSections: list });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div>
          <h3 className="font-black text-xl text-zinc-900 flex items-center gap-2 uppercase tracking-tight">
            <Layers className="w-5 h-5 text-[#e4002b]" />
            <span>Shopify-Style Live Theme Section Editor</span>
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Realtime sub-sections customizer with live visual preview. Upload images, reorder blocks, and customize delivery banners instantly.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#e4002b] hover:bg-[#c30025] text-white shadow-md transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Section</span>
        </button>
      </div>

      {/* Page Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-200 pb-3">
        {(['home', 'collection', 'product', 'wishlist', 'all'] as const).map((pageKey) => (
          <button
            key={pageKey}
            type="button"
            onClick={() => setSelectedPage(pageKey)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              selectedPage === pageKey
                ? 'bg-[#e4002b] text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200'
            }`}
          >
            {pageKey === 'all' ? 'All Pages' : `${pageKey} Page`}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* SHOPIFY-STYLE SPLIT-SCREEN REAL-TIME EDITOR & LIVE PREVIEW */}
      {/* ========================================================================= */}
      {isCreatingNew ? (
        <div className="bg-white border border-zinc-200 rounded-3xl shadow-xl overflow-hidden">
          {/* Top Bar of Theme Editor */}
          <div className="bg-zinc-900 text-white px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <h4 className="font-bold text-xs uppercase tracking-wider">
                {editingSection ? 'Editing Sub-Section (Live Sync)' : 'New Sub-Section (Live Sync)'}
              </h4>
            </div>

            <div className="flex items-center gap-2">
              {/* Viewport switch: Desktop vs Mobile */}
              <div className="flex items-center bg-zinc-800 p-0.5 rounded-lg text-zinc-300">
                <button
                  type="button"
                  onClick={() => setPreviewViewport('desktop')}
                  className={`p-1.5 rounded-md ${previewViewport === 'desktop' ? 'bg-[#e4002b] text-white' : 'hover:text-white'}`}
                  title="Desktop View"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewViewport('mobile')}
                  className={`p-1.5 rounded-md ${previewViewport === 'mobile' ? 'bg-[#e4002b] text-white' : 'hover:text-white'}`}
                  title="Mobile View"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white cursor-pointer ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Split Container: Left Controls, Right Realtime Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
            {/* Left Controls Panel (Shopify Sidebar) */}
            <div className="lg:col-span-5 p-5 border-r border-zinc-200 space-y-4 overflow-y-auto max-h-[750px] bg-zinc-50 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-zinc-700">Section Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as SectionType })}
                  className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-[#e4002b]"
                >
                  <option value="image-with-text">Image with Text Promo Banner</option>
                  <option value="delivery-info">Delivery Timing & Chakwal Area Notice</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-zinc-700">Display Page</label>
                <select
                  value={formData.page}
                  onChange={(e) => setFormData({ ...formData, page: e.target.value as any })}
                  className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-[#e4002b]"
                >
                  <option value="home">Home Page</option>
                  <option value="collection">Collection / Menu Page</option>
                  <option value="product">Product Details Page</option>
                  <option value="wishlist">Wishlist Page</option>
                  <option value="all">All Pages</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-zinc-700">Badge Text (Top Pill)</label>
                <input
                  type="text"
                  value={formData.badgeText || ''}
                  onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                  placeholder="e.g. Chakwal Hot Deal / 100% Fresh"
                  className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#e4002b]"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-zinc-700">Main Heading / Title *</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Delicious Hot & Crispy KFC in Chakwal"
                  className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[#e4002b]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-zinc-700">Subtitle / Tagline</label>
                <input
                  type="text"
                  value={formData.subtitle || ''}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="e.g. Made Fresh on Order"
                  className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#e4002b]"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-zinc-700">Description</label>
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Write promotional or informational content..."
                  className="w-full bg-white border border-zinc-300 rounded-xl p-2.5 text-xs outline-none focus:border-[#e4002b]"
                />
              </div>

              {/* IMAGE UPLOAD PICKER (Replaces manual URL) */}
              {formData.type === 'image-with-text' && (
                <div className="space-y-3 pt-2 border-t border-zinc-200">
                  <ImageUploadPicker
                    label="Section Promotional Image (Upload from Device)"
                    value={formData.imageUrl || ''}
                    onChange={(newUrl) => setFormData({ ...formData, imageUrl: newUrl })}
                    aspectRatio="wide"
                    helperText="Upload any banner JPG/PNG from your mobile or PC, or select preset."
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-zinc-700 mb-1">Image Layout</label>
                      <select
                        value={formData.imagePosition}
                        onChange={(e) => setFormData({ ...formData, imagePosition: e.target.value as 'left' | 'right' })}
                        className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs outline-none"
                      >
                        <option value="right">Image on Right</option>
                        <option value="left">Image on Left</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-zinc-700 mb-1">Button Text</label>
                      <input
                        type="text"
                        value={formData.buttonText || ''}
                        onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                        placeholder="e.g. Order Now"
                        className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery specific fields */}
              {formData.type === 'delivery-info' && (
                <div className="space-y-2 pt-2 border-t border-zinc-200">
                  <div>
                    <label className="block font-bold text-zinc-700 mb-1">Estimated Delivery Time</label>
                    <input
                      type="text"
                      value={formData.estimatedTime || ''}
                      onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                      placeholder="e.g. Delivered by 8:00 PM"
                      className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-zinc-700 mb-1">Delivery Fee Badge</label>
                    <input
                      type="text"
                      value={formData.deliveryFeeText || ''}
                      onChange={(e) => setFormData({ ...formData, deliveryFeeText: e.target.value })}
                      placeholder="e.g. Flat Rs. 399 / Free on 2500+"
                      className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-zinc-700 mb-1">Coverage Areas Text</label>
                    <input
                      type="text"
                      value={formData.deliveryAreaText || ''}
                      onChange={(e) => setFormData({ ...formData, deliveryAreaText: e.target.value })}
                      placeholder="e.g. Within 3 KM of Chakwal City"
                      className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Save / Cancel Bar */}
              <div className="pt-4 border-t border-zinc-200 flex items-center justify-end gap-2 sticky bottom-0 bg-zinc-50 py-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-4 py-2 rounded-xl text-zinc-600 hover:bg-zinc-200 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="bg-[#e4002b] hover:bg-[#c30025] text-white px-5 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Sub-Section</span>
                </button>
              </div>
            </div>

            {/* Right Live Preview Canvas (Shopify Live Theme Simulator) */}
            <div className="lg:col-span-7 p-6 bg-[#f0f2f5] flex flex-col items-center justify-center overflow-y-auto">
              <div className="w-full mb-3 flex items-center justify-between text-xs text-zinc-500">
                <span className="font-bold flex items-center gap-1.5 text-zinc-700">
                  <Eye className="w-4 h-4 text-[#e4002b]" />
                  <span>Real-Time Live Canvas Preview</span>
                </span>
                <span className="text-[11px] bg-white px-2 py-0.5 rounded-full border border-zinc-300 font-medium">
                  {previewViewport === 'mobile' ? 'Mobile Phone View (375px)' : 'Full Desktop View'}
                </span>
              </div>

              {/* Viewport Frame */}
              <div className={`transition-all duration-200 w-full ${
                previewViewport === 'mobile' ? 'max-w-sm rounded-3xl border-4 border-zinc-800 shadow-2xl p-3 bg-white' : 'max-w-full'
              }`}>
                {/* RENDERED SUB-SECTION PREVIEW */}
                {formData.type === 'image-with-text' ? (
                  <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm overflow-hidden space-y-4">
                    <div className={`flex flex-col ${formData.imagePosition === 'left' ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-5`}>
                      <div className="flex-1 space-y-2 text-left">
                        {formData.badgeText && (
                          <span className="inline-block bg-[#e4002b] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-sm">
                            {formData.badgeText}
                          </span>
                        )}
                        <h4 className="font-kfc text-xl sm:text-2xl font-black uppercase text-zinc-900 leading-tight">
                          {formData.title || 'Section Heading'}
                        </h4>
                        {formData.subtitle && (
                          <p className="text-xs font-bold text-[#e4002b]">
                            {formData.subtitle}
                          </p>
                        )}
                        <p className="text-xs text-zinc-600 leading-relaxed">
                          {formData.description || 'Description will update live here as you type.'}
                        </p>
                        {formData.buttonText && (
                          <div className="pt-2">
                            <span className="inline-block bg-[#e4002b] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm">
                              {formData.buttonText}
                            </span>
                          </div>
                        )}
                      </div>

                      {formData.imageUrl && (
                        <div className="w-full md:w-56 h-40 rounded-xl overflow-hidden border border-zinc-200 shrink-0 bg-zinc-100">
                          <img
                            src={formData.imageUrl}
                            alt={formData.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/src/assets/images/kfc_hero_zinger_combo_1791015805739.jpg';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Delivery Banner Live Preview */
                  <div className="bg-gradient-to-r from-red-50 to-amber-50 rounded-2xl border border-red-200 p-5 shadow-sm space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#e4002b] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                        <Bike className="w-3.5 h-3.5" />
                        <span>{formData.badgeText || 'Chakwal Express Fleet'}</span>
                      </span>
                      {formData.estimatedTime && (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formData.estimatedTime}</span>
                        </span>
                      )}
                    </div>

                    <h4 className="font-kfc text-xl sm:text-2xl font-black uppercase text-zinc-900 leading-tight">
                      {formData.title || 'KFC Delivery Service in Chakwal'}
                    </h4>

                    <p className="text-xs text-zinc-700">
                      {formData.description || 'Direct from Kallar Kahar Motorway branch right to your door in Chakwal.'}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-1 text-xs">
                      {formData.deliveryFeeText && (
                        <span className="bg-white border border-zinc-300 font-bold px-3 py-1 rounded-xl text-zinc-800">
                          {formData.deliveryFeeText}
                        </span>
                      )}
                      {formData.deliveryAreaText && (
                        <span className="bg-white border border-zinc-300 font-semibold px-3 py-1 rounded-xl text-zinc-700 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#e4002b]" />
                          <span>{formData.deliveryAreaText}</span>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* ========================================================================= */}
      {/* SECTIONS LIST & REORDERING (SHOPIFY STYLE) */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-zinc-500 font-bold uppercase tracking-wider">
          <span>Configured Sections ({filteredSections.length})</span>
          <span>Order / Visibility / Actions</span>
        </div>

        {filteredSections.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-zinc-200 rounded-3xl bg-white text-zinc-500 text-xs space-y-2">
            <Layers className="w-8 h-8 text-zinc-400 mx-auto" />
            <p className="font-bold text-sm text-zinc-800">Koi sub-section configure nahi hai.</p>
            <p className="text-[11px]">Upar button dabayein aur realtime live preview ke sath naya section add karein!</p>
          </div>
        ) : (
          filteredSections.map((section, idx) => (
            <div
              key={section.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs ${
                section.isVisible 
                  ? 'bg-white border-zinc-200 hover:border-zinc-300' 
                  : 'bg-zinc-100 border-zinc-300 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Reorder Arrows */}
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => handleMoveOrder(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 rounded hover:bg-zinc-100 disabled:opacity-30 cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5 text-zinc-600" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveOrder(idx, 'down')}
                    disabled={idx === filteredSections.length - 1}
                    className="p-1 rounded hover:bg-zinc-100 disabled:opacity-30 cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5 text-zinc-600" />
                  </button>
                </div>

                {/* Section Thumbnail */}
                {section.imageUrl ? (
                  <img
                    src={section.imageUrl}
                    alt={section.title}
                    className="w-12 h-12 rounded-xl object-cover border border-zinc-200 shrink-0 bg-white"
                    onError={(e) => {
                      e.currentTarget.src = '/src/assets/images/kfc_hero_zinger_combo_1791015805739.jpg';
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-red-100 text-[#e4002b] flex items-center justify-center font-bold text-xs shrink-0">
                    <Bike className="w-5 h-5" />
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-[#e4002b] bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                      {section.type}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-bold bg-zinc-100 px-2 py-0.5 rounded-md">
                      {section.page.toUpperCase()} PAGE
                    </span>
                  </div>
                  <h4 className="font-bold text-zinc-900 text-sm mt-0.5">{section.title}</h4>
                  <p className="text-[11px] text-zinc-500 line-clamp-1">{section.description}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => handleToggleVisibility(section.id)}
                  className={`p-2 rounded-xl border text-xs cursor-pointer transition ${
                    section.isVisible
                      ? 'border-emerald-300 text-emerald-600 hover:bg-emerald-50'
                      : 'border-zinc-300 text-zinc-400 hover:bg-zinc-200'
                  }`}
                  title={section.isVisible ? 'Visible (Click to hide)' : 'Hidden (Click to show)'}
                >
                  {section.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEdit(section)}
                  className="px-3 py-1.5 rounded-xl border border-zinc-300 text-zinc-700 hover:bg-zinc-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit in Live Preview</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete section "${section.title}"?`)) {
                      handleDelete(section.id);
                    }
                  }}
                  className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                  title="Delete section"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
