import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { NavigationMenuItem, CustomPage } from '../../types';
import { KFC_CATEGORIES, DEFAULT_NAVIGATION_MENU_ITEMS, DEFAULT_CUSTOM_PAGES } from '../../data/kfcMenu';
import {
  Compass,
  Menu,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  ExternalLink,
  Save,
  Check,
  FileText,
  RotateCcw,
  Sparkles,
  Home,
  UtensilsCrossed,
  Flame,
  Star,
  Gift,
  Crown,
  Phone,
  Link as LinkIcon,
  X,
  Layers,
  Copy
} from 'lucide-react';

const ICON_OPTIONS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'utensils', label: 'Menu / Food', icon: UtensilsCrossed },
  { id: 'flame', label: 'Deals / Flame', icon: Flame },
  { id: 'star', label: 'Reviews / Star', icon: Star },
  { id: 'gift', label: 'Rewards / Gift', icon: Gift },
  { id: 'crown', label: 'VIP / Crown', icon: Crown },
  { id: 'file', label: 'Policies / Document', icon: FileText },
  { id: 'phone', label: 'WhatsApp / Phone', icon: Phone },
  { id: 'compass', label: 'Navigation / Compass', icon: Compass },
  { id: 'link', label: 'External Link', icon: LinkIcon },
];

export const PagesAndNavigationManager: React.FC = () => {
  const {
    settings,
    updateSettings,
    updateNavigationMenuItems,
    saveCustomPage,
    deleteCustomPage,
  } = useStore();

  const isHeaderSticky = settings.isHeaderSticky !== false;
  const menuItems: NavigationMenuItem[] = (
    settings.navigationMenuItems && settings.navigationMenuItems.length > 0
      ? settings.navigationMenuItems
      : DEFAULT_NAVIGATION_MENU_ITEMS
  ).slice().sort((a, b) => (a.order || 0) - (b.order || 0));

  const customPages: CustomPage[] = (
    settings.customPages && settings.customPages.length > 0
      ? settings.customPages
      : DEFAULT_CUSTOM_PAGES
  );

  // Notice & Feedback
  const [feedback, setFeedback] = useState<{ message: string; ok: boolean } | null>(null);

  const showNotice = (message: string, ok = true) => {
    setFeedback({ message, ok });
    setTimeout(() => setFeedback(null), 3000);
  };

  // Menu Item Modal State
  const [editingMenuItem, setEditingMenuItem] = useState<NavigationMenuItem | null>(null);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [menuFormLabel, setMenuFormLabel] = useState('');
  const [menuFormLinkType, setMenuFormLinkType] = useState('preset');
  const [menuFormPresetLink, setMenuFormPresetLink] = useState('/');
  const [menuFormCustomLink, setMenuFormCustomLink] = useState('');
  const [menuFormBadge, setMenuFormBadge] = useState('');
  const [menuFormIcon, setMenuFormIcon] = useState('compass');
  const [menuFormTarget, setMenuFormTarget] = useState<'_self' | '_blank'>('_self');

  // Custom Page Modal State
  const [editingPage, setEditingPage] = useState<CustomPage | null>(null);
  const [isPageModalOpen, setIsPageModalOpen] = useState(false);
  const [pageTitle, setPageTitle] = useState('');
  const [pageSlug, setPageSlug] = useState('');
  const [pageContent, setPageContent] = useState('');
  const [pagePublished, setPagePublished] = useState(true);

  // Toggle Sticky Header
  const handleToggleStickyHeader = (enabled: boolean) => {
    updateSettings({ isHeaderSticky: enabled });
    showNotice(enabled ? 'Sticky Header activated (Header top par fixed rahega).' : 'Sticky Header disabled (Header scroll ho jayega).');
  };

  // Open Add Menu Modal
  const handleOpenAddMenuModal = () => {
    setEditingMenuItem(null);
    setMenuFormLabel('');
    setMenuFormLinkType('preset');
    setMenuFormPresetLink('/');
    setMenuFormCustomLink('');
    setMenuFormBadge('');
    setMenuFormIcon('compass');
    setMenuFormTarget('_self');
    setIsMenuModalOpen(true);
  };

  // Open Edit Menu Modal
  const handleOpenEditMenuModal = (item: NavigationMenuItem) => {
    setEditingMenuItem(item);
    setMenuFormLabel(item.label);
    const isPreset = [
      '/',
      '#kfc-menu-section',
      '#daily-deals-section',
      'view:reviews',
      'view:rewards',
      'action:vip',
      'action:loyalty',
      'action:policies',
      'action:auth',
      'https://wa.me/923252777574',
    ].includes(item.link) || item.link.startsWith('category:') || item.link.startsWith('page:');

    if (isPreset) {
      setMenuFormLinkType('preset');
      setMenuFormPresetLink(item.link);
      setMenuFormCustomLink('');
    } else {
      setMenuFormLinkType('custom');
      setMenuFormPresetLink('/');
      setMenuFormCustomLink(item.link);
    }
    setMenuFormBadge(item.badge || '');
    setMenuFormIcon(item.icon || 'compass');
    setMenuFormTarget(item.target || '_self');
    setIsMenuModalOpen(true);
  };

  // Save Menu Item
  const handleSaveMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuFormLabel.trim()) {
      showNotice('Please enter menu item label.', false);
      return;
    }

    const finalLink = menuFormLinkType === 'preset' ? menuFormPresetLink : (menuFormCustomLink.trim() || '/');
    const updatedList = [...menuItems];

    if (editingMenuItem) {
      const idx = updatedList.findIndex((m) => m.id === editingMenuItem.id);
      if (idx !== -1) {
        updatedList[idx] = {
          ...editingMenuItem,
          label: menuFormLabel.trim(),
          link: finalLink,
          badge: menuFormBadge.trim() || undefined,
          icon: menuFormIcon,
          target: menuFormTarget,
        };
      }
    } else {
      const newItem: NavigationMenuItem = {
        id: `nav-${Date.now()}`,
        label: menuFormLabel.trim(),
        link: finalLink,
        badge: menuFormBadge.trim() || undefined,
        icon: menuFormIcon,
        target: menuFormTarget,
        isEnabled: true,
        order: updatedList.length + 1,
      };
      updatedList.push(newItem);
    }

    updateNavigationMenuItems(updatedList);
    setIsMenuModalOpen(false);
    showNotice('Navigation menu item save ho gaya!');
  };

  // Delete Menu Item
  const handleDeleteMenuItem = (id: string) => {
    if (!window.confirm('Is menu item ko remove karna hai?')) return;
    const updatedList = menuItems.filter((m) => m.id !== id).map((m, i) => ({ ...m, order: i + 1 }));
    updateNavigationMenuItems(updatedList);
    showNotice('Menu item remove kar diya gaya.');
  };

  // Toggle Menu Item Enabled
  const handleToggleMenuItem = (id: string) => {
    const updatedList = menuItems.map((m) => m.id === id ? { ...m, isEnabled: !m.isEnabled } : m);
    updateNavigationMenuItems(updatedList);
    showNotice('Item status update ho gaya.');
  };

  // Move Menu Item Up / Down
  const handleMoveMenuItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= menuItems.length) return;
    const updatedList = [...menuItems];
    const temp = updatedList[index];
    updatedList[index] = updatedList[targetIndex];
    updatedList[targetIndex] = temp;
    // Reassign order
    const ordered = updatedList.map((m, i) => ({ ...m, order: i + 1 }));
    updateNavigationMenuItems(ordered);
    showNotice('Menu order update ho gaya.');
  };

  // Reset to Default Menu Items
  const handleResetMenuToDefault = () => {
    if (!window.confirm('Navigation menu ko default original settings par reset karna hai?')) return;
    updateNavigationMenuItems(DEFAULT_NAVIGATION_MENU_ITEMS);
    showNotice('Navigation menu default settings par reset ho gaya.');
  };

  // Custom Page Handlers
  const handleOpenAddPageModal = () => {
    setEditingPage(null);
    setPageTitle('');
    setPageSlug('');
    setPageContent('<h3>Page Heading</h3>\n<p>Enter your content here...</p>');
    setPagePublished(true);
    setIsPageModalOpen(true);
  };

  const handleOpenEditPageModal = (page: CustomPage) => {
    setEditingPage(page);
    setPageTitle(page.title);
    setPageSlug(page.slug);
    setPageContent(page.content);
    setPagePublished(page.isPublished);
    setIsPageModalOpen(true);
  };

  const handleSavePage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageTitle.trim()) {
      showNotice('Page title is required.', false);
      return;
    }
    const slug = (pageSlug.trim() || pageTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')) || `page-${Date.now()}`;
    const page: CustomPage = {
      id: editingPage?.id || `page-${Date.now()}`,
      title: pageTitle.trim(),
      slug,
      content: pageContent,
      isPublished: pagePublished,
      createdAt: editingPage?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveCustomPage(page);
    setIsPageModalOpen(false);
    showNotice(`Page "${page.title}" successfully saved!`);
  };

  const handleDeletePage = (id: string) => {
    if (!window.confirm('Is page ko delete karna hai?')) return;
    deleteCustomPage(id);
    showNotice('Page delete kar diya gaya.');
  };

  const handleCopyPageLink = (slug: string) => {
    const url = `${window.location.origin}/?page=${slug}`;
    navigator.clipboard?.writeText(url);
    showNotice(`Page link copied: ${url}`);
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-red-100 text-[#e4002b] rounded-xl">
              <Compass className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black uppercase text-zinc-900 tracking-tight">
              Pages & Navigation Menus
            </h2>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Header ke left side par Navigation MENU ke items ko customize karein, links set karein, Sticky Header toggle karein aur custom store pages manage karein.
          </p>
        </div>

        {feedback && (
          <div className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs animate-in fade-in ${
            feedback.ok ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <Check className="w-4 h-4" />
            <span>{feedback.message}</span>
          </div>
        )}
      </div>

      {/* SECTION 1: HEADER BEHAVIOR (STICKY HEADER TOGGLE) */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#e4002b]" />
              <h3 className="font-bold text-sm text-zinc-900 uppercase">
                Header Sticky Behavior
              </h3>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Jab customer page scroll kare to Header screen ke top par chipka (sticky) rahe ya normal scroll ho jaye.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isHeaderSticky}
              onChange={(e) => handleToggleStickyHeader(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e4002b]"></div>
            <span className="ml-3 text-xs font-bold text-zinc-800">
              {isHeaderSticky ? 'Sticky Header: ON' : 'Sticky Header: OFF'}
            </span>
          </label>
        </div>

        <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Current status: <strong>{isHeaderSticky ? 'Always visible at top while scrolling' : 'Scrolls away with page'}</strong></span>
          <span className="font-mono text-zinc-400">isHeaderSticky: {String(isHeaderSticky)}</span>
        </div>
      </div>

      {/* SECTION 2: LEFT NAVIGATION MENU ITEMS */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Menu className="w-4 h-4 text-[#e4002b]" />
              <h3 className="font-bold text-sm text-zinc-900 uppercase">
                Header Left Navigation Menu Items ({menuItems.length})
              </h3>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Header ke hamburger icon (☰) par click karne par jo menu khulta hai, uske items aur links yahan se manage karein.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetMenuToDefault}
              className="px-3 py-2 rounded-xl border border-zinc-300 text-zinc-700 hover:bg-zinc-100 text-xs font-bold flex items-center gap-1.5 transition"
              title="Reset to default items"
            >
              <RotateCcw className="w-3.5 h-3.5 text-zinc-500" />
              <span>Reset Default</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAddMenuModal}
              className="px-4 py-2 rounded-xl bg-[#e4002b] hover:bg-[#c30025] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Menu Item</span>
            </button>
          </div>
        </div>

        {/* Menu Items List */}
        <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-xl overflow-hidden bg-white">
          {menuItems.map((item, index) => {
            const iconObj = ICON_OPTIONS.find((i) => i.id === item.icon);
            const IconComponent = iconObj?.icon || Compass;

            return (
              <div
                key={item.id}
                className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50/80 transition ${
                  !item.isEnabled ? 'opacity-60 bg-zinc-50/50' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Order control */}
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveMenuItem(index, 'up')}
                      className="p-1 rounded hover:bg-zinc-200 text-zinc-500 disabled:opacity-20 cursor-pointer"
                      title="Move up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={index === menuItems.length - 1}
                      onClick={() => handleMoveMenuItem(index, 'down')}
                      className="p-1 rounded hover:bg-zinc-200 text-zinc-500 disabled:opacity-20 cursor-pointer"
                      title="Move down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="p-2 rounded-xl bg-zinc-100 text-zinc-700 shrink-0">
                    <IconComponent className="w-4 h-4 text-[#e4002b]" />
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-zinc-900 truncate">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="bg-red-100 text-[#e4002b] text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
                          {item.badge}
                        </span>
                      )}
                      {!item.isEnabled && (
                        <span className="bg-zinc-200 text-zinc-600 text-[10px] font-bold px-1.5 py-0.5 rounded">
                          Hidden
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-500 truncate flex items-center gap-1.5 mt-0.5 font-mono">
                      <span>Link: {item.link}</span>
                      {item.target === '_blank' && <ExternalLink className="w-3 h-3 text-zinc-400" />}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleMenuItem(item.id)}
                    className={`p-2 rounded-xl border text-xs font-bold transition ${
                      item.isEnabled
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'border-zinc-200 bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                    }`}
                    title={item.isEnabled ? 'Hide from navigation' : 'Show in navigation'}
                  >
                    {item.isEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEditMenuModal(item)}
                    className="p-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-bold transition"
                    title="Edit menu item"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-zinc-600" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteMenuItem(item.id)}
                    className="p-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: STORE PAGES MANAGER */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#e4002b]" />
              <h3 className="font-bold text-sm text-zinc-900 uppercase">
                Custom Storefront Pages ({customPages.length})
              </h3>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Store ke custom pages create aur edit karein (jaise "About Us", "Delivery Coverage", "Terms of Service" waghera).
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddPagePage => handleOpenAddPageModal()}
            className="px-4 py-2 rounded-xl bg-[#e4002b] hover:bg-[#c30025] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Page</span>
          </button>
        </div>

        {/* Pages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {customPages.map((page) => (
            <div
              key={page.id}
              className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50 flex flex-col justify-between gap-3 transition"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-black text-sm text-zinc-900 truncate">
                    {page.title}
                  </h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    page.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-600'
                  }`}>
                    {page.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] font-mono text-zinc-500">/{page.slug}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyPageLink(page.slug)}
                    className="text-zinc-400 hover:text-zinc-700"
                    title="Copy direct page link"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-200/60">
                <span className="text-[10px] text-zinc-400">
                  {page.updatedAt ? new Date(page.updatedAt).toLocaleDateString() : 'Active'}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEditPageModal(page)}
                    className="px-2.5 py-1.5 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-bold flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePage(page.id)}
                    className="p-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold"
                    title="Delete page"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT MENU ITEM */}
      {/* ========================================================================= */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="font-black text-base text-zinc-900 uppercase">
                {editingMenuItem ? 'Edit Navigation Item' : 'Add New Navigation Item'}
              </h3>
              <button
                type="button"
                onClick={() => setIsMenuModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMenuItem} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-700 font-bold mb-1">Menu Label / Title *</label>
                <input
                  type="text"
                  value={menuFormLabel}
                  onChange={(e) => setMenuFormLabel(e.target.value)}
                  placeholder="e.g. Daily Deals, Family Buckets, About Us"
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-bold mb-1">Destination Link Type *</label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setMenuFormLinkType('preset')}
                    className={`p-2.5 rounded-xl border text-center font-bold ${
                      menuFormLinkType === 'preset'
                        ? 'bg-red-50 border-red-500 text-[#e4002b]'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-600'
                    }`}
                  >
                    Store Shortcut / Preset
                  </button>
                  <button
                    type="button"
                    onClick={() => setMenuFormLinkType('custom')}
                    className={`p-2.5 rounded-xl border text-center font-bold ${
                      menuFormLinkType === 'custom'
                        ? 'bg-red-50 border-red-500 text-[#e4002b]'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-600'
                    }`}
                  >
                    Custom URL / Link
                  </button>
                </div>

                {menuFormLinkType === 'preset' ? (
                  <select
                    value={menuFormPresetLink}
                    onChange={(e) => setMenuFormPresetLink(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2.5 font-bold"
                  >
                    <optgroup label="Core Store Views">
                      <option value="/">Home / Top (/)</option>
                      <option value="#kfc-menu-section">Menu Section (#kfc-menu-section)</option>
                      <option value="#daily-deals-section">Daily Deals 4% OFF (#daily-deals-section)</option>
                      <option value="view:reviews">Customer Reviews Page (view:reviews)</option>
                      <option value="view:rewards">Loyalty Rewards Program (view:rewards)</option>
                      <option value="action:vip">Colonel's VIP Club Membership (action:vip)</option>
                      <option value="action:policies">Store Policies & Terms (action:policies)</option>
                      <option value="action:auth">Customer Sign In / Profile (action:auth)</option>
                      <option value="https://wa.me/923252777574">WhatsApp Direct Chat</option>
                    </optgroup>
                    <optgroup label="Menu Categories">
                      {KFC_CATEGORIES.map((cat) => (
                        <option key={cat.id} value={`category:${cat.id}`}>
                          Category: {cat.name}
                        </option>
                      ))}
                    </optgroup>
                    {customPages.length > 0 && (
                      <optgroup label="Custom Store Pages">
                        {customPages.map((page) => (
                          <option key={page.id} value={`page:${page.slug}`}>
                            Page: {page.title} (/{page.slug})
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={menuFormCustomLink}
                    onChange={(e) => setMenuFormCustomLink(e.target.value)}
                    placeholder="e.g. /?page=about-us, https://wa.me/..., https://facebook.com/..."
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2.5 font-mono text-zinc-800"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-bold mb-1">Badge Text (Optional)</label>
                  <input
                    type="text"
                    value={menuFormBadge}
                    onChange={(e) => setMenuFormBadge(e.target.value)}
                    placeholder="e.g. HOT, NEW, 4% OFF"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 font-bold mb-1">Icon</label>
                  <select
                    value={menuFormIcon}
                    onChange={(e) => setMenuFormIcon(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 font-bold"
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-700 font-bold mb-1">Open Behavior</label>
                <select
                  value={menuFormTarget}
                  onChange={(e) => setMenuFormTarget(e.target.value as '_self' | '_blank')}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 font-bold"
                >
                  <option value="_self">Same Window (_self) - Recommended</option>
                  <option value="_blank">New Tab (_blank) - For external links/WhatsApp</option>
                </select>
              </div>

              <div className="pt-3 border-t border-zinc-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMenuModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-300 text-zinc-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#e4002b] hover:bg-[#c30025] text-white font-bold shadow-md cursor-pointer"
                >
                  Save Navigation Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT CUSTOM PAGE */}
      {/* ========================================================================= */}
      {isPageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-zinc-200 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 shrink-0">
              <h3 className="font-black text-base text-zinc-900 uppercase">
                {editingPage ? 'Edit Store Page' : 'Create New Store Page'}
              </h3>
              <button
                type="button"
                onClick={() => setIsPageModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePage} className="space-y-4 text-xs flex-1 overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-bold mb-1">Page Title *</label>
                  <input
                    type="text"
                    value={pageTitle}
                    onChange={(e) => {
                      setPageTitle(e.target.value);
                      if (!editingPage) {
                        setPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
                      }
                    }}
                    placeholder="e.g. About KFC Chakwal Delivery"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 font-bold mb-1">URL Slug *</label>
                  <input
                    type="text"
                    value={pageSlug}
                    onChange={(e) => setPageSlug(e.target.value)}
                    placeholder="e.g. about-us, delivery-coverage"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 font-mono text-zinc-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-700 font-bold mb-1">Page HTML / Rich Content *</label>
                <textarea
                  rows={8}
                  value={pageContent}
                  onChange={(e) => setPageContent(e.target.value)}
                  placeholder="<h3>Welcome</h3><p>Page description...</p>"
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl p-3 font-mono text-xs leading-relaxed"
                  required
                />
                <p className="text-[11px] text-zinc-400 mt-1">
                  Supports standard HTML tags like &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;.
                </p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                <span className="font-bold text-zinc-800">Publish Page (Make visible to customers)</span>
                <input
                  type="checkbox"
                  checked={pagePublished}
                  onChange={(e) => setPagePublished(e.target.checked)}
                  className="w-4 h-4 accent-[#e4002b]"
                />
              </div>

              <div className="pt-3 border-t border-zinc-100 flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsPageModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-300 text-zinc-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#e4002b] hover:bg-[#c30025] text-white font-bold shadow-md cursor-pointer"
                >
                  Save Store Page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
