import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { VipTierId } from '../../types';
import { ImageUploadPicker } from '../ImageUploadPicker';
import { 
  Crown, 
  Check, 
  X, 
  Clock, 
  Search, 
  DollarSign, 
  Users, 
  ShieldCheck, 
  Award,
  Sparkles,
  Phone,
  MessageCircle,
  Plus,
  Send,
  UserCheck
} from 'lucide-react';

export const VipClubManager: React.FC = () => {
  const {
    vipTiers,
    updateVipTierImage,
    vipRequests,
    approveVipRequest,
    rejectVipRequest,
    grantVipMembershipManual,
    formatPKR,
    customerRecords,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Manual Grant Modal State
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualPhone, setManualPhone] = useState('');
  const [manualTier, setManualTier] = useState<VipTierId>('gold');

  const pendingRequests = vipRequests.filter((r) => r.status === 'pending');
  const approvedRequests = vipRequests.filter((r) => r.status === 'approved');
  const totalVipRevenue = approvedRequests.reduce((sum, r) => sum + r.amount, 0);

  const filteredRequests = vipRequests.filter((r) => {
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchesSearch = 
      !searchQuery.trim() ||
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone.includes(searchQuery) ||
      (r.email && r.email.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const handleSendWhatsAppConfirmation = (req: typeof vipRequests[0]) => {
    const cleanPhone = req.phone.replace(/[^0-9]/g, '');
    const intlPhone = cleanPhone.startsWith('0') ? '92' + cleanPhone.slice(1) : cleanPhone;
    const tier = vipTiers.find((t) => t.id === req.tierId);
    const msg = 
      `Assalam o Alaikum ${req.customerName}!\n\n` +
      `🎉 Mubarak ho! Aapka KFC Chakwal Delivery *Lifetime VIP Pass (${tier?.name} - Flat ${tier?.discountPercentage}% OFF)* kamyabi se activate kar diya gaya hai!\n\n` +
      `Ab se aapko har order par *${tier?.discountPercentage}% Lifetime Discount* automatically checkout par milega.\n` +
      `Order karein: ${window.location.origin}/\n\n` +
      `Shukriya!\nKFC Chakwal Delivery Team`;
    window.open(`https://wa.me/${intlPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleManualGrantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPhone.trim()) return;
    grantVipMembershipManual(manualPhone.trim(), manualTier);
    setIsManualModalOpen(false);
    setManualPhone('');
    alert(`Lifetime ${manualTier.toUpperCase()} Pass granted to ${manualPhone}!`);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Title */}
      <div className="border-b border-zinc-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight flex items-center gap-2">
            <Crown className="w-6 h-6 text-[#e4002b]" />
            <span>Lifetime VIP Pass Management</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Review customer orders for Lifetime VIP Passes (Silver 3% = Rs 499, Gold 6% = Rs 899, Platinum 8% = Rs 999), send payment instructions, and approve discounts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {pendingRequests.length > 0 && (
            <span className="bg-red-50 text-[#e4002b] border border-red-200 px-3 py-1 rounded-xl text-xs font-black animate-pulse">
              {pendingRequests.length} Pending Approval
            </span>
          )}
          <button
            type="button"
            onClick={() => setIsManualModalOpen(true)}
            className="bg-[#e4002b] hover:bg-[#c30025] text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Grant Pass Manually</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-zinc-200 shadow-sm">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Total VIP Revenue</p>
          <p className="text-2xl font-black text-emerald-600 font-mono mt-1">
            {formatPKR(totalVipRevenue)}
          </p>
          <p className="text-[10px] text-zinc-400 mt-0.5">From one-time pass sales</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-zinc-200 shadow-sm">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Active VIP Members</p>
          <p className="text-2xl font-black text-zinc-900 font-mono mt-1">
            {approvedRequests.length}
          </p>
          <p className="text-[10px] text-zinc-400 mt-0.5">Lifetime discount active</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-zinc-200 shadow-sm">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Pending Approvals</p>
          <p className="text-2xl font-black text-[#e4002b] font-mono mt-1">
            {pendingRequests.length}
          </p>
          <p className="text-[10px] text-zinc-400 mt-0.5">Awaiting payment verification</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-zinc-200 shadow-sm">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Tier Options</p>
          <p className="text-2xl font-black text-zinc-900 font-mono mt-1">
            3 Passes
          </p>
          <p className="text-[10px] text-zinc-400 mt-0.5">3% (Rs 499), 6% (Rs 899), 8% (Rs 999)</p>
        </div>
      </div>

      {/* Tier Rules Reference */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {vipTiers.map((t) => (
          <div key={t.id} className="p-4 bg-white rounded-2xl border border-zinc-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-kfc text-lg font-black uppercase text-zinc-900">{t.name}</span>
              <span className="bg-red-50 text-[#e4002b] text-[10px] font-black px-2 py-0.5 rounded-full border border-red-100">
                {t.discountPercentage}% OFF
              </span>
            </div>
            <p className="text-base font-black text-black font-mono mt-1">
              {formatPKR(t.price)} <span className="text-xs text-zinc-400 font-normal">One-Time Fee</span>
            </p>
            <p className="text-xs text-zinc-500 mt-1">{t.description}</p>
            <div className="mt-3">
              <ImageUploadPicker
                label={`${t.name} image`}
                value={t.imageUrl || ''}
                onChange={(imageUrl) => {
                  void updateVipTierImage(t.id, imageUrl).catch((error: any) => alert(error?.message || 'VIP image save nahi hui.'));
                }}
                aspectRatio="wide"
                allowPresets={false}
                helperText="Image 600 KB se chhoti rakhein taa-ke fast load ho aur save ho sake."
              />
            </div>
          </div>
        ))}
      </div>

      {/* Requests Management Table */}
      <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wider flex items-center gap-2">
            <span>Membership Requests & Customer Ledger</span>
          </h3>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, phone..."
                className="text-xs rounded-xl pl-8 pr-3 py-1.5 border border-zinc-300 focus:outline-none focus:border-[#e4002b] bg-zinc-50"
              />
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2 pointer-events-none" />
            </div>

            {/* Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="text-xs rounded-xl px-3 py-1.5 border border-zinc-300 focus:outline-none bg-zinc-50 font-bold"
            >
              <option value="all">All Requests</option>
              <option value="pending">Pending Only</option>
              <option value="approved">Approved / Active</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-zinc-200 rounded-xl overflow-hidden divide-y divide-zinc-200">
            <thead className="bg-zinc-50 text-zinc-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Tier Selected</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 bg-white">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-400 text-xs">
                    No VIP pass requests found.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-zinc-50/80 transition">
                    <td className="py-3 px-3">
                      <p className="font-bold text-zinc-900">{req.customerName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-zinc-600 font-mono font-bold">{req.phone}</span>
                        {req.email && <span className="text-[10px] text-zinc-400 truncate max-w-[120px]">{req.email}</span>}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold uppercase text-[#e4002b] bg-red-50 px-2.5 py-0.5 rounded-lg border border-red-200 text-[11px]">
                        {req.tierId} Pass ({req.tierId === 'silver' ? '3%' : req.tierId === 'gold' ? '6%' : '8%'} OFF)
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-zinc-900">
                      {formatPKR(req.amount)}
                    </td>
                    <td className="py-3 px-3 text-zinc-500 text-[11px]">
                      {new Date(req.requestedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3">
                      {req.status === 'approved' ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                          <Check className="w-3 h-3" />
                          <span>Active VIP</span>
                        </span>
                      ) : req.status === 'rejected' ? (
                        <span className="bg-red-100 text-red-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full w-fit block">
                          Rejected
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3 animate-spin" />
                          <span>Pending Approval</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* WhatsApp Chat Button */}
                        <a
                          href={`https://wa.me/${req.phone.replace(/[^0-9]/g, '').startsWith('0') ? '92' + req.phone.replace(/[^0-9]/g, '').slice(1) : req.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 p-1.5 rounded-lg transition"
                          title="Chat on WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>

                        {req.status === 'pending' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                approveVipRequest(req.id);
                                handleSendWhatsAppConfirmation(req);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition cursor-pointer shadow-xs active:scale-95"
                            >
                              Approve & WhatsApp
                            </button>
                            <button
                              type="button"
                              onClick={() => rejectVipRequest(req.id)}
                              className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[11px] font-bold px-2 py-1 rounded-lg transition cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        ) : req.status === 'approved' ? (
                          <button
                            type="button"
                            onClick={() => handleSendWhatsAppConfirmation(req)}
                            className="text-[10px] text-[#e4002b] hover:underline font-bold flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            <span>Resend Confirmation</span>
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Grant Pass Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <h3 className="font-black text-base text-zinc-900 uppercase">
                Grant Lifetime VIP Pass Manually
              </h3>
              <button onClick={() => setIsManualModalOpen(false)} className="text-zinc-400 hover:text-zinc-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualGrantSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-700 font-bold mb-1">Customer Phone Number *</label>
                <input
                  type="text"
                  value={manualPhone}
                  onChange={(e) => setManualPhone(e.target.value)}
                  placeholder="e.g. 03252777574"
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-bold mb-1">Select VIP Pass Tier</label>
                <div className="grid grid-cols-3 gap-2">
                  {vipTiers.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setManualTier(t.id)}
                      className={`p-2.5 rounded-xl border text-center font-bold cursor-pointer transition ${
                        manualTier === t.id
                          ? 'bg-[#e4002b] text-white border-[#e4002b]'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-700'
                      }`}
                    >
                      <p className="uppercase text-[11px]">{t.name.split(' ')[0]}</p>
                      <p className="text-[10px] mt-0.5">{t.discountPercentage}% OFF</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-600 bg-zinc-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#e4002b] hover:bg-[#c30025] text-white font-bold shadow-md cursor-pointer"
                >
                  Confirm & Activate Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
