import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { StoreBranch } from '../../types';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Phone,
  MapPin,
  Truck,
  CloudUpload,
  AlertCircle,
  X,
  Share2,
  Radio,
  Sparkles,
} from 'lucide-react';

export const BranchesManager: React.FC = () => {
  const {
    branches,
    activeBranch,
    setActiveBranch,
    addBranch,
    updateBranch,
    deleteBranch,
    pushAllSettingsToCloud,
    lastCloudSyncTimestamp,
    formatPKR,
    serverSyncStatus,
  } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<StoreBranch | null>(null);
  const [isPushing, setIsPushing] = useState(false);
  const [pushSuccess, setPushSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    companyName: string;
    tagline: string;
    city: string;
    address: string;
    phone: string;
    whatsappNumber: string;
    email: string;
    managerName: string;
    managerPhone: string;
    deliveryRadiusKm: number;
    deliveryRadiusText: string;
    openingTime: string;
    closingTime: string;
    orderCutoffTime: string;
    sameDayDeliveryBy: string;
    deliveryFee: number;
    minOrderAmount: number;
    taxRegistrationNumber: string;
    coverageAreas: string;
    isAvailable: boolean;
    isDefault: boolean;
    notes: string;
  }>({
    code: '',
    name: '',
    companyName: 'KFC Chakwal Delivery Enterprise',
    tagline: '',
    city: 'Chakwal',
    address: '',
    phone: '+92 325 2777574',
    whatsappNumber: '+92 325 2777574',
    email: 'kfcchakwal@gmail.com',
    managerName: '',
    managerPhone: '+92 325 2777574',
    deliveryRadiusKm: 5,
    deliveryRadiusText: 'Within 5 KM of city center',
    openingTime: '10:00 AM',
    closingTime: '10:00 PM',
    orderCutoffTime: '04:00 PM',
    sameDayDeliveryBy: '08:00 PM',
    deliveryFee: 399,
    minOrderAmount: 500,
    taxRegistrationNumber: '',
    coverageAreas: 'Chakwal City, Bhaun Road, Satellite Town',
    isAvailable: true,
    isDefault: false,
    notes: '',
  });

  const openAddModal = () => {
    setEditingBranch(null);
    setFormData({
      code: `KCD-0${branches.length + 1}`,
      name: '',
      companyName: 'KFC Chakwal Delivery Enterprise',
      tagline: 'Fast and Fresh Doorstep Delivery',
      city: 'Chakwal',
      address: '',
      phone: '+92 325 2777574',
      whatsappNumber: '+92 325 2777574',
      email: 'kfcchakwal@gmail.com',
      managerName: '',
      managerPhone: '+92 325 2777574',
      deliveryRadiusKm: 5,
      deliveryRadiusText: 'Within 5 KM of City Center',
      openingTime: '10:00 AM',
      closingTime: '10:00 PM',
      orderCutoffTime: '04:00 PM',
      sameDayDeliveryBy: '08:00 PM',
      deliveryFee: 399,
      minOrderAmount: 500,
      taxRegistrationNumber: '',
      coverageAreas: 'Chakwal City, Bhaun Road, Satellite Town, Tehsil Chowk',
      isAvailable: true,
      isDefault: branches.length === 0,
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (branch: StoreBranch) => {
    setEditingBranch(branch);
    setFormData({
      code: branch.code || '',
      name: branch.name || '',
      companyName: branch.companyName || '',
      tagline: branch.tagline || '',
      city: branch.city || 'Chakwal',
      address: branch.address || '',
      phone: branch.phone || '',
      whatsappNumber: branch.whatsappNumber || '',
      email: branch.email || '',
      managerName: branch.managerName || '',
      managerPhone: branch.managerPhone || '',
      deliveryRadiusKm: branch.deliveryRadiusKm || 5,
      deliveryRadiusText: branch.deliveryRadiusText || '',
      openingTime: branch.openingTime || '10:00 AM',
      closingTime: branch.closingTime || '10:00 PM',
      orderCutoffTime: branch.orderCutoffTime || '04:00 PM',
      sameDayDeliveryBy: branch.sameDayDeliveryBy || '08:00 PM',
      deliveryFee: branch.deliveryFee || 399,
      minOrderAmount: branch.minOrderAmount || 500,
      taxRegistrationNumber: branch.taxRegistrationNumber || '',
      coverageAreas: Array.isArray(branch.coverageAreas) ? branch.coverageAreas.join(', ') : '',
      isAvailable: branch.isAvailable !== false,
      isDefault: Boolean(branch.isDefault),
      notes: branch.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.address.trim()) {
      alert('Please fill in at least the Branch Name and Address.');
      return;
    }

    const areasArray = formData.coverageAreas
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingBranch) {
      await updateBranch(editingBranch.id, {
        code: formData.code,
        name: formData.name,
        companyName: formData.companyName,
        tagline: formData.tagline,
        city: formData.city,
        address: formData.address,
        phone: formData.phone,
        whatsappNumber: formData.whatsappNumber,
        email: formData.email,
        managerName: formData.managerName,
        managerPhone: formData.managerPhone,
        deliveryRadiusKm: Number(formData.deliveryRadiusKm),
        deliveryRadiusText: formData.deliveryRadiusText,
        openingTime: formData.openingTime,
        closingTime: formData.closingTime,
        orderCutoffTime: formData.orderCutoffTime,
        sameDayDeliveryBy: formData.sameDayDeliveryBy,
        deliveryFee: Number(formData.deliveryFee),
        minOrderAmount: Number(formData.minOrderAmount),
        taxRegistrationNumber: formData.taxRegistrationNumber,
        coverageAreas: areasArray,
        isAvailable: formData.isAvailable,
        isDefault: formData.isDefault,
        notes: formData.notes,
      });
    } else {
      await addBranch({
        code: formData.code,
        name: formData.name,
        companyName: formData.companyName,
        tagline: formData.tagline,
        city: formData.city,
        address: formData.address,
        phone: formData.phone,
        whatsappNumber: formData.whatsappNumber,
        email: formData.email,
        managerName: formData.managerName,
        managerPhone: formData.managerPhone,
        deliveryRadiusKm: Number(formData.deliveryRadiusKm),
        deliveryRadiusText: formData.deliveryRadiusText,
        openingTime: formData.openingTime,
        closingTime: formData.closingTime,
        orderCutoffTime: formData.orderCutoffTime,
        sameDayDeliveryBy: formData.sameDayDeliveryBy,
        deliveryFee: Number(formData.deliveryFee),
        minOrderAmount: Number(formData.minOrderAmount),
        taxRegistrationNumber: formData.taxRegistrationNumber,
        coverageAreas: areasArray,
        isAvailable: formData.isAvailable,
        isDefault: formData.isDefault,
        notes: formData.notes,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (branches.length <= 1) {
      alert('You must have at least one store branch configured.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete branch "${name}"?`)) {
      await deleteBranch(id);
    }
  };

  const handlePushAllSettings = async () => {
    setIsPushing(true);
    setPushSuccess(null);
    try {
      const ok = await pushAllSettingsToCloud();
      if (ok) {
        setPushSuccess('Settings pushed successfully! All admin browsers and customer devices have been refreshed in real-time via live cloud stream.');
        setTimeout(() => setPushSuccess(null), 6000);
      } else {
        alert('Failed to broadcast settings. Please verify server connection.');
      }
    } finally {
      setIsPushing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Multi-Device Live Broadcast */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white rounded-2xl p-5 sm:p-6 border border-zinc-700/60 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-lg font-black uppercase tracking-wider text-white">
              Multiple Companies & Store Branches
            </h2>
          </div>
          <p className="text-xs text-zinc-300 max-w-xl">
            Configure individual branch delivery fees, operating hours, phone numbers, and coverage areas. All changes sync in real-time to all admin devices and customer storefronts.
          </p>
          <div className="flex items-center gap-3 mt-2 text-[11px] text-zinc-400">
            <span>Status: <strong className="text-emerald-400 capitalize">{serverSyncStatus}</strong></span>
            {lastCloudSyncTimestamp && (
              <span>Last Broadcast: <strong>{new Date(lastCloudSyncTimestamp).toLocaleTimeString()}</strong></span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handlePushAllSettings}
            disabled={isPushing}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-md flex items-center gap-2 cursor-pointer transition active:scale-95 disabled:opacity-50"
            title="Push settings immediately to all active login admin browsers"
          >
            <CloudUpload className={`w-4 h-4 ${isPushing ? 'animate-bounce' : ''}`} />
            <span>{isPushing ? 'Broadcasting...' : 'Broadcast to All Devices Now'}</span>
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl bg-[#e4002b] hover:bg-[#c30025] text-white text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Company / Branch</span>
          </button>
        </div>
      </div>

      {pushSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-4 rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{pushSuccess}</span>
        </div>
      )}

      {/* Branches List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {branches.map((b) => {
          const isActive = b.id === activeBranch?.id;
          return (
            <div
              key={b.id}
              className={`rounded-2xl border p-5 transition-all relative ${
                isActive
                  ? 'bg-amber-50/70 border-2 border-amber-500 shadow-lg ring-4 ring-amber-400/20'
                  : 'bg-white border-zinc-200 hover:border-zinc-300 shadow-xs'
              }`}
            >
              {/* Top Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded">
                      {b.code}
                    </span>
                    <h3 className="text-sm font-black text-zinc-900">{b.name}</h3>
                    {b.isDefault && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        Headquarters
                      </span>
                    )}
                    {isActive ? (
                      <span className="text-[10px] bg-[#e4002b] text-white font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                        <Radio className="w-2.5 h-2.5 animate-pulse text-white" /> ACTIVE IN DASHBOARD
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveBranch(b.id)}
                        className="text-[10px] bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold px-2 py-0.5 rounded-full cursor-pointer"
                      >
                        Switch to Active →
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 font-medium">{b.companyName}</p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(b)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition cursor-pointer"
                    title="Edit Branch Settings"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {branches.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDelete(b.id, b.name)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                      title="Delete Branch"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Tagline */}
              {b.tagline && (
                <p className="text-xs italic text-zinc-600 mb-3 bg-zinc-50 p-2 rounded-lg border border-zinc-100">
                  "{b.tagline}"
                </p>
              )}

              {/* Branch Details Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs text-zinc-700 mb-4">
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-[#e4002b] shrink-0" />
                  <span className="truncate">{b.city}: {b.address}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>{b.phone}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>{b.openingTime} - {b.closingTime}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>Fee: {formatPKR(b.deliveryFee)} (Min: {formatPKR(b.minOrderAmount)})</span>
                </div>
              </div>

              {/* Coverage Areas */}
              <div className="mb-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Delivery Coverage Areas ({b.deliveryRadiusKm} KM Radius):
                </p>
                <div className="flex flex-wrap gap-1">
                  {b.coverageAreas.map((area, i) => (
                    <span key={i} className="text-[10px] bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-md font-medium">
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                <span className={`text-[11px] font-bold ${b.isAvailable ? 'text-emerald-600' : 'text-red-500'}`}>
                  ● {b.isAvailable ? 'Branch Operational & Taking Orders' : 'Branch Temporarily Closed'}
                </span>

                {!isActive && (
                  <button
                    type="button"
                    onClick={() => setActiveBranch(b.id)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-black text-white text-xs font-bold transition cursor-pointer"
                  >
                    Set as Current Branch
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Branch Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-zinc-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#e4002b]" />
                <h3 className="text-base font-black uppercase tracking-wide">
                  {editingBranch ? 'Edit Company / Branch' : 'Create New Company / Branch'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Row 1: Code and Name */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Branch Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. KCD-03"
                    className="w-full px-3 py-2 border rounded-xl font-mono text-xs focus:ring-2 focus:ring-[#e4002b] outline-hidden"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-zinc-700 mb-1">Branch Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Talagang Road Sub-Branch"
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-[#e4002b] outline-hidden"
                  />
                </div>
              </div>

              {/* Row 2: Company Name & Tagline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Company / Entity Name</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-[#e4002b] outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Branch Tagline / Subtitle</label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    placeholder="e.g. Fresh Hot Delivery to Talagang Corridor"
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-[#e4002b] outline-hidden"
                  />
                </div>
              </div>

              {/* Row 3: City and Address */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-[#e4002b] outline-hidden"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-zinc-700 mb-1">Full Physical Address *</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. Near Tehsil Chowk, Main Talagang Road"
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-[#e4002b] outline-hidden"
                  />
                </div>
              </div>

              {/* Row 4: Phone & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-[#e4002b] outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">WhatsApp Order Number</label>
                  <input
                    type="text"
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-[#e4002b] outline-hidden"
                  />
                </div>
              </div>

              {/* Row 5: Manager Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Branch Manager Name</label>
                  <input
                    type="text"
                    value={formData.managerName}
                    onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                    placeholder="e.g. Tariq Mehmood"
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-[#e4002b] outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Manager Direct Phone</label>
                  <input
                    type="text"
                    value={formData.managerPhone}
                    onChange={(e) => setFormData({ ...formData, managerPhone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-[#e4002b] outline-hidden"
                  />
                </div>
              </div>

              {/* Row 6: Delivery Fee and Min Order */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-50 p-3 rounded-xl border">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Delivery Fee (PKR)</label>
                  <input
                    type="number"
                    value={formData.deliveryFee}
                    onChange={(e) => setFormData({ ...formData, deliveryFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Min Order (PKR)</label>
                  <input
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Radius (KM)</label>
                  <input
                    type="number"
                    value={formData.deliveryRadiusKm}
                    onChange={(e) => setFormData({ ...formData, deliveryRadiusKm: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Cutoff Time</label>
                  <input
                    type="text"
                    value={formData.orderCutoffTime}
                    onChange={(e) => setFormData({ ...formData, orderCutoffTime: e.target.value })}
                    placeholder="4:00 PM"
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                  />
                </div>
              </div>

              {/* Row 7: Operating Hours */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Opening Time</label>
                  <input
                    type="text"
                    value={formData.openingTime}
                    onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                    placeholder="10:00 AM"
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Closing Time</label>
                  <input
                    type="text"
                    value={formData.closingTime}
                    onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                    placeholder="10:00 PM"
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Row 8: Coverage Areas */}
              <div>
                <label className="block font-bold text-zinc-700 mb-1">
                  Delivery Coverage Areas (Separated by comma)
                </label>
                <textarea
                  rows={2}
                  value={formData.coverageAreas}
                  onChange={(e) => setFormData({ ...formData, coverageAreas: e.target.value })}
                  placeholder="e.g. Chakwal City, Tehsil Chowk, Bhaun Road, Satellite Town"
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-[#e4002b] outline-hidden"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-6 pt-2 border-t">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-zinc-800">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    className="w-4 h-4 text-[#e4002b] rounded cursor-pointer"
                  />
                  <span>Branch Active & Taking Orders</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-zinc-800">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                  />
                  <span>Set as Main Headquarters</span>
                </label>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-300 hover:bg-zinc-100 text-zinc-700 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#e4002b] hover:bg-[#c30025] text-white font-black shadow-md transition cursor-pointer"
                >
                  {editingBranch ? 'Update Branch' : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
