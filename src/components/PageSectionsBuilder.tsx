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
  Check
} from 'lucide-react';

export const PageSectionsBuilder: React.FC = () => {
  const { settings, updateSettings, themeMode } = useStore();
  const isDark = themeMode === 'dark';

  const [selectedPage, setSelectedPage] = useState<'home' | 'collection' | 'product' | 'wishlist' | 'all'>('home');
  const [editingSection, setEditingSection] = useState<PageSection | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<PageSection>>({
    type: 'image-with-text',
    page: 'home',
    title: '',
    subtitle: '',
    description: '',
    imageUrl: '/src/assets/images/kfc_hero_zinger_combo_1791015805739.jpg',
    imagePosition: 'right',
    badgeText: 'Chakwal Special',
    buttonText: 'Order Now',
    buttonLink: '#kfc-menu-section',
    estimatedTime: '30-40 Mins',
    deliveryFeeText: 'Flat Rs. 399',
    deliveryAreaText: 'All Chakwal Zones Covered',
    isVisible: true,
  });

  const sections = settings.customSections || [];
  const filteredSections = sections.filter((s) => selectedPage === 'all' || s.page === selectedPage || s.page === 'all');

  const handleOpenCreate = () => {
    setFormData({
      id: `sec-${Date.now()}`,
      type: 'image-with-text',
      page: selectedPage === 'all' ? 'home' : selectedPage,
      title: 'New Delicious Deal in Chakwal',
      subtitle: 'Crispy & Fresh Guarantee',
      description: 'Cooked fresh on order. Guaranteed hot, crispy, and delivering original KFC taste right to your location.',
      imageUrl: '/src/assets/images/kfc_hero_zinger_combo_1791015805739.jpg',
      imagePosition: 'right',
      badgeText: 'HOT DEAL',
      buttonText: 'Explore Menu',
      buttonLink: '#kfc-menu-section',
      estimatedTime: '30-40 Mins',
      deliveryFeeText: 'Flat Rs. 399',
      deliveryAreaText: 'All Chakwal Zones Covered',
      isVisible: true,
      order: sections.length + 1,
    });
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
      // Update
      const updated = sections.map((s) => (s.id === editingSection.id ? ({ ...s, ...formData } as PageSection) : s));
      updateSettings({ customSections: updated });
    } else {
      // Add
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
    // re-index
    list.forEach((s, idx) => { s.order = idx + 1; });
    updateSettings({ customSections: list });
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Page Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-base text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#e4002b]" />
            Visual Page Sections Builder
          </h4>
          <p className="text-xs text-zinc-400 mt-0.5">
            Add, customize, reorder, or remove Image with Text blocks, Delivery time banners, and announcement sections on any page.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#e4002b] hover:bg-[#c30025] text-white shadow-lg shadow-red-950/40 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Section</span>
        </button>
      </div>

      {/* Page Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-3">
        {(['home', 'collection', 'product', 'wishlist', 'all'] as const).map((pageKey) => (
          <button
            key={pageKey}
            type="button"
            onClick={() => setSelectedPage(pageKey)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              selectedPage === pageKey
                ? 'bg-zinc-800 text-white border border-[#e4002b]'
                : 'text-zinc-400 hover:text-white bg-zinc-900/50'
            }`}
          >
            {pageKey === 'all' ? 'All Pages' : `${pageKey} Page`}
          </button>
        ))}
      </div>

      {/* Modal / Inline Editor for Add/Edit Section */}
      {isCreatingNew && (
        <div className={`p-6 rounded-2xl border ${
          isDark ? 'bg-[#15151a] border-zinc-700' : 'bg-zinc-50 border-zinc-300'
        } space-y-4 animate-in fade-in duration-200`}>
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h5 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              {editingSection ? 'Edit Section' : 'Create New Section'}
            </h5>
            <button
              onClick={() => setIsCreatingNew(false)}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Section Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as SectionType })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="image-with-text">Image with Text Placeholder (Banner)</option>
                <option value="delivery-info">Delivery Time & Chakwal Area Banner</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Display On Page</label>
              <select
                value={formData.page}
                onChange={(e) => setFormData({ ...formData, page: e.target.value as any })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="home">Home Page</option>
                <option value="collection">Collection / Menu Page</option>
                <option value="product">Product Details Page</option>
                <option value="wishlist">Wishlist Page</option>
                <option value="all">All Pages</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-zinc-300 mb-1">Main Heading / Title</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Craving Real Crispy Chicken in Chakwal?"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-[#e4002b]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Subtitle / Tagline</label>
              <input
                type="text"
                value={formData.subtitle || ''}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="e.g. Hot, Juicy & Made Fresh on Order"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Badge Text (Top Pill)</label>
              <input
                type="text"
                value={formData.badgeText || ''}
                onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                placeholder="e.g. Chakwal Special / 100% Halal"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-zinc-300 mb-1">Description</label>
              <textarea
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Write your promotional or informative description..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs text-white outline-none"
              />
            </div>

            {formData.type === 'image-with-text' && (
              <>
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-xs font-bold text-zinc-300">
                    Section Image URL
                  </label>
                  <input
                    type="text"
                    value={formData.imageUrl || ''}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://... or /src/assets/images/..."
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                  />
                  <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-zinc-400">
                    <span>Quick presets:</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: '/src/assets/images/kfc_hero_zinger_combo_1791015805739.jpg' })}
                      className="text-xs text-indigo-400 hover:underline"
                    >
                      Hero Zinger
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: '/src/assets/images/kfc_bucket_crispy_chicken_1791015820219.jpg' })}
                      className="text-xs text-indigo-400 hover:underline"
                    >
                      Chicken Bucket
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: '/src/assets/images/kfc_krunch_burger_1791015834419.jpg' })}
                      className="text-xs text-indigo-400 hover:underline"
                    >
                      Krunch Burger
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: '/src/assets/images/kfc_hot_wings_platter_1791015846233.jpg' })}
                      className="text-xs text-indigo-400 hover:underline"
                    >
                      Hot Wings Platter
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Image Position</label>
                  <select
                    value={formData.imagePosition}
                    onChange={(e) => setFormData({ ...formData, imagePosition: e.target.value as 'left' | 'right' })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="right">Right Side</option>
                    <option value="left">Left Side</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Button Text</label>
                  <input
                    type="text"
                    value={formData.buttonText || ''}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    placeholder="e.g. Order Now / View Everyday Value"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </>
            )}

            {formData.type === 'delivery-info' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Estimated Time</label>
                  <input
                    type="text"
                    value={formData.estimatedTime || ''}
                    onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                    placeholder="e.g. 30-40 Mins"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Delivery Fee Text</label>
                  <input
                    type="text"
                    value={formData.deliveryFeeText || ''}
                    onChange={(e) => setFormData({ ...formData, deliveryFeeText: e.target.value })}
                    placeholder="e.g. Flat Rs. 399 Delivery Fee"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Areas Covered Text</label>
                  <input
                    type="text"
                    value={formData.deliveryAreaText || ''}
                    onChange={(e) => setFormData({ ...formData, deliveryAreaText: e.target.value })}
                    placeholder="e.g. Serving Saddar Bazaar, Talagang Road, Bhaun Road, Satellite Town..."
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </>
            )}
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsCreatingNew(false)}
              className="px-4 py-2 text-xs text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="bg-[#e4002b] hover:bg-[#c30025] text-white text-xs font-bold px-6 py-2 rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{editingSection ? 'Save Changes' : 'Create Section'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Sections List */}
      <div className="space-y-3">
        {filteredSections.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-zinc-800 rounded-2xl text-zinc-500 text-xs">
            No sections found for {selectedPage} page. Click "+ Add New Section" above to add your first custom section!
          </div>
        ) : (
          filteredSections.map((sec, idx) => (
            <div
              key={sec.id}
              className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                isDark ? 'bg-[#141418] border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => handleMoveOrder(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 text-zinc-500 hover:text-white disabled:opacity-30 cursor-pointer"
                    title="Move up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveOrder(idx, 'down')}
                    disabled={idx === filteredSections.length - 1}
                    className="p-1 text-zinc-500 hover:text-white disabled:opacity-30 cursor-pointer"
                    title="Move down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {sec.type === 'image-with-text' ? (
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
                    <img src={sec.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-[#e4002b]/15 text-[#e4002b] flex items-center justify-center shrink-0">
                    <Bike className="w-6 h-6" />
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      {sec.type}
                    </span>
                    <span className="text-[10px] text-[#e4002b] font-bold uppercase">
                      Page: {sec.page}
                    </span>
                  </div>
                  <h5 className="font-bold text-sm text-white mt-0.5">{sec.title}</h5>
                  <p className="text-xs text-zinc-400 line-clamp-1">{sec.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleVisibility(sec.id)}
                  className={`p-2 rounded-xl border text-xs cursor-pointer ${
                    sec.isVisible
                      ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                      : 'border-zinc-700 text-zinc-500 bg-zinc-800'
                  }`}
                  title={sec.isVisible ? 'Visible on site' : 'Hidden'}
                >
                  {sec.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEdit(sec)}
                  className="p-2 rounded-xl border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer"
                  title="Edit section"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(sec.id)}
                  className="p-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 cursor-pointer"
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
