import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Discount, DiscountType } from '../../types';
import { 
  Tag, 
  Plus, 
  Search, 
  Percent, 
  DollarSign, 
  Truck, 
  Trash2, 
  Edit3, 
  Check, 
  Copy, 
  Sparkles, 
  AlertCircle,
  X,
  Layers,
  ArrowRight
} from 'lucide-react';

export const DiscountsManager: React.FC = () => {
  const { discounts, addDiscount, updateDiscount, deleteDiscount, formatPKR } = useStore();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'code' | 'automatic'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscountId, setEditingDiscountId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<DiscountType>('percentage');
  const [value, setValue] = useState<number>(10);
  const [minOrderAmount, setMinOrderAmount] = useState<number>(1000);
  const [isAutomatic, setIsAutomatic] = useState(false);
  const [usageLimit, setUsageLimit] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState<'active' | 'scheduled' | 'expired'>('active');

  const openCreateModal = () => {
    setEditingDiscountId(null);
    setCode('');
    setTitle('');
    setType('percentage');
    setValue(10);
    setMinOrderAmount(1000);
    setIsAutomatic(false);
    setUsageLimit(undefined);
    setStatus('active');
    setIsModalOpen(true);
  };

  const openEditModal = (d: Discount) => {
    setEditingDiscountId(d.id);
    setCode(d.code);
    setTitle(d.title);
    setType(d.type);
    setValue(d.value);
    setMinOrderAmount(d.minOrderAmount || 0);
    setIsAutomatic(d.isAutomatic);
    setUsageLimit(d.usageLimit);
    setStatus(d.status);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (!isAutomatic && !code.trim()) {
      alert('Please provide a discount code (e.g. KFC10, WELCOME50)');
      return;
    }

    if (editingDiscountId) {
      updateDiscount(editingDiscountId, {
        code: isAutomatic ? '' : code.trim().toUpperCase(),
        title: title.trim(),
        type,
        value: type === 'free_shipping' ? 0 : Number(value),
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : undefined,
        isAutomatic,
        usageLimit: usageLimit ? Number(usageLimit) : undefined,
        status,
      });
    } else {
      addDiscount({
        code: isAutomatic ? '' : code.trim().toUpperCase(),
        title: title.trim(),
        type,
        value: type === 'free_shipping' ? 0 : Number(value),
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : undefined,
        isAutomatic,
        usageLimit: usageLimit ? Number(usageLimit) : undefined,
        status,
        startDate: new Date().toISOString().split('T')[0],
      });
    }

    setIsModalOpen(false);
  };

  const handleCopy = (couponCode: string) => {
    navigator.clipboard.writeText(couponCode);
    setCopiedCode(couponCode);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredDiscounts = discounts.filter((d) => {
    const matchesSearch = 
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.code.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (filterType === 'code') return !d.isAutomatic;
    if (filterType === 'automatic') return d.isAutomatic;
    return true;
  });

  const totalUsedCount = discounts.reduce((acc, d) => acc + (d.usedCount || 0), 0);
  const activeCount = discounts.filter((d) => d.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#e4002b]" />
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              Discounts & Promotions
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Create discount codes (e.g. KFC50) or automatic cart discounts for your Chakwal customers.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-[#e4002b] hover:bg-[#c30025] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-red-950/40 cursor-pointer transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Discount</span>
        </button>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#18181d] border border-[#2b2b35] p-4 rounded-2xl">
          <span className="text-[11px] text-zinc-400 font-semibold block uppercase">Total Promotions</span>
          <p className="text-2xl font-black text-white mt-1">{discounts.length}</p>
        </div>

        <div className="bg-[#18181d] border border-[#2b2b35] p-4 rounded-2xl">
          <span className="text-[11px] text-emerald-400 font-semibold block uppercase">Active Offers</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">{activeCount}</p>
        </div>

        <div className="bg-[#18181d] border border-[#2b2b35] p-4 rounded-2xl">
          <span className="text-[11px] text-indigo-400 font-semibold block uppercase">Automatic Discounts</span>
          <p className="text-2xl font-black text-indigo-300 mt-1">
            {discounts.filter((d) => d.isAutomatic).length}
          </p>
        </div>

        <div className="bg-[#18181d] border border-[#2b2b35] p-4 rounded-2xl">
          <span className="text-[11px] text-amber-400 font-semibold block uppercase">Total Redemptions</span>
          <p className="text-2xl font-black text-amber-300 mt-1">{totalUsedCount}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-[#151518] p-3 rounded-2xl border border-[#26262e]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search discounts by code or title..."
            className="w-full bg-[#1c1c22] border border-[#2e2e38] text-white text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-[#e4002b]"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              filterType === 'all'
                ? 'bg-[#e4002b] text-white'
                : 'text-zinc-400 hover:text-white bg-[#1c1c22]'
            }`}
          >
            All ({discounts.length})
          </button>
          <button
            onClick={() => setFilterType('code')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              filterType === 'code'
                ? 'bg-[#e4002b] text-white'
                : 'text-zinc-400 hover:text-white bg-[#1c1c22]'
            }`}
          >
            Coupon Codes ({discounts.filter((d) => !d.isAutomatic).length})
          </button>
          <button
            onClick={() => setFilterType('automatic')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              filterType === 'automatic'
                ? 'bg-[#e4002b] text-white'
                : 'text-zinc-400 hover:text-white bg-[#1c1c22]'
            }`}
          >
            Automatic ({discounts.filter((d) => d.isAutomatic).length})
          </button>
        </div>
      </div>

      {/* Discounts List */}
      <div className="space-y-3">
        {filteredDiscounts.length === 0 ? (
          <div className="text-center py-12 bg-[#151518] rounded-2xl border border-[#26262e] p-6 space-y-3">
            <Tag className="w-10 h-10 text-zinc-600 mx-auto" />
            <p className="text-sm font-bold text-white">No discounts found</p>
            <p className="text-xs text-zinc-400">
              Create your first promotional code or automatic deal to increase customer orders.
            </p>
            <button
              onClick={openCreateModal}
              className="bg-[#e4002b] hover:bg-[#c30025] text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
            >
              Add Discount Now
            </button>
          </div>
        ) : (
          filteredDiscounts.map((discount) => {
            const isAuto = discount.isAutomatic;
            const isActive = discount.status === 'active';

            return (
              <div
                key={discount.id}
                className="bg-[#17171c] hover:bg-[#1a1a21] border border-[#2b2b35] p-4 sm:p-5 rounded-2xl transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    isAuto ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-red-500/20 text-[#e4002b] border border-red-500/30'
                  }`}>
                    {discount.type === 'percentage' && <Percent className="w-5 h-5" />}
                    {discount.type === 'fixed_amount' && <DollarSign className="w-5 h-5" />}
                    {discount.type === 'free_shipping' && <Truck className="w-5 h-5" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {!isAuto && (
                        <span className="font-mono font-black text-xs text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-lg tracking-wider">
                          {discount.code}
                        </span>
                      )}

                      {isAuto && (
                        <span className="text-[10px] font-black uppercase text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 rounded-md">
                          Automatic Discount
                        </span>
                      )}

                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-zinc-700/40 text-zinc-400 border border-zinc-700'
                      }`}>
                        {discount.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-sm">{discount.title}</h4>

                    <p className="text-xs text-zinc-400">
                      {discount.type === 'percentage' && `${discount.value}% off cart`}
                      {discount.type === 'fixed_amount' && `Rs. ${discount.value} flat discount`}
                      {discount.type === 'free_shipping' && 'Free Chakwal express delivery'}
                      {discount.minOrderAmount ? ` · Min order: ${formatPKR(discount.minOrderAmount)}` : ' · No min order'}
                      {` · Redemptions: ${discount.usedCount || 0} times`}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {!isAuto && (
                    <button
                      onClick={() => handleCopy(discount.code)}
                      className="p-2 rounded-xl border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white cursor-pointer transition text-xs flex items-center gap-1.5"
                      title="Copy code"
                    >
                      {copiedCode === discount.code ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span className="hidden sm:inline">
                        {copiedCode === discount.code ? 'Copied' : 'Copy'}
                      </span>
                    </button>
                  )}

                  <button
                    onClick={() =>
                      updateDiscount(discount.id, {
                        status: isActive ? 'expired' : 'active',
                      })
                    }
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      isActive
                        ? 'border-amber-500/40 text-amber-300 hover:bg-amber-500/10'
                        : 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10'
                    }`}
                  >
                    {isActive ? 'Deactivate' : 'Activate'}
                  </button>

                  <button
                    onClick={() => openEditModal(discount)}
                    className="p-2 rounded-xl border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white cursor-pointer transition"
                    title="Edit discount"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Delete discount "${discount.title}"?`)) {
                        deleteDiscount(discount.id);
                      }
                    }}
                    className="p-2 rounded-xl border border-red-900/40 hover:border-red-600 text-red-400 hover:bg-red-500/10 cursor-pointer transition"
                    title="Delete discount"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#16161a] border border-[#2b2b35] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#1f1f26] px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#e4002b]" />
                <h3 className="font-bold text-white text-base">
                  {editingDiscountId ? 'Edit Discount' : 'Create New Discount'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {/* Method: Code vs Automatic */}
              <div>
                <label className="block text-zinc-400 font-semibold mb-1.5">
                  Discount Application Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAutomatic(false)}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      !isAutomatic
                        ? 'border-[#e4002b] bg-[#e4002b]/10 text-white'
                        : 'border-zinc-800 bg-[#1a1a20] text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <span className="font-bold block text-sm">Discount Code</span>
                    <span className="text-[11px] text-zinc-400 mt-0.5 block">
                      Customer enters code at checkout (e.g. KFC50)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAutomatic(true)}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      isAutomatic
                        ? 'border-indigo-500 bg-indigo-500/10 text-white'
                        : 'border-zinc-800 bg-[#1a1a20] text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <span className="font-bold block text-sm">Automatic Deal</span>
                    <span className="text-[11px] text-zinc-400 mt-0.5 block">
                      Applies automatically if cart meets min order
                    </span>
                  </button>
                </div>
              </div>

              {/* Code (if not automatic) */}
              {!isAutomatic && (
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">
                    Discount Code *
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. KFC50, CHAKWAL10"
                    className="w-full bg-[#121215] border border-[#2b2b35] text-amber-300 font-mono font-bold text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#e4002b]"
                    required={!isAutomatic}
                  />
                </div>
              )}

              {/* Title / Description */}
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">
                  Title / Description *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Rs. 50 Off First Order or 10% Off Family Buckets"
                  className="w-full bg-[#121215] border border-[#2b2b35] text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#e4002b]"
                  required
                />
              </div>

              {/* Type & Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">
                    Discount Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as DiscountType)}
                    className="w-full bg-[#121215] border border-[#2b2b35] text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#e4002b]"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed_amount">Fixed Amount (PKR)</option>
                    <option value="free_shipping">Free Delivery (Rs 399 Off)</option>
                  </select>
                </div>

                {type !== 'free_shipping' && (
                  <div>
                    <label className="block text-zinc-400 font-semibold mb-1">
                      {type === 'percentage' ? 'Percentage (%)' : 'Amount in PKR'} *
                    </label>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => setValue(Number(e.target.value))}
                      min={1}
                      max={type === 'percentage' ? 100 : 10000}
                      className="w-full bg-[#121215] border border-[#2b2b35] text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#e4002b]"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Minimum Order Amount */}
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">
                  Minimum Purchase Amount (PKR)
                </label>
                <input
                  type="number"
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                  placeholder="e.g. 1000 (0 for no minimum)"
                  className="w-full bg-[#121215] border border-[#2b2b35] text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#e4002b]"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  Only carts with a subtotal equal to or above this amount will get the discount.
                </span>
              </div>

              {/* Status */}
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'active' | 'expired')}
                  className="w-full bg-[#121215] border border-[#2b2b35] text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#e4002b]"
                >
                  <option value="active">Active (Available for customers)</option>
                  <option value="expired">Expired / Inactive</option>
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white bg-[#1a1a20] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#e4002b] hover:bg-[#c30025] text-white font-bold px-5 py-2 rounded-xl cursor-pointer transition active:scale-95"
                >
                  {editingDiscountId ? 'Save Changes' : 'Create Discount'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
