import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { VipTierId } from '../../types';
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
  ArrowRight
} from 'lucide-react';

export const VipClubManager: React.FC = () => {
  const {
    vipTiers,
    vipRequests,
    approveVipRequest,
    rejectVipRequest,
    formatPKR,
    customerRecords,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const pendingRequests = vipRequests.filter((r) => r.status === 'pending');
  const approvedRequests = vipRequests.filter((r) => r.status === 'approved');

  const totalVipRevenue = approvedRequests.reduce((sum, r) => sum + r.amount, 0);

  const filteredRequests = vipRequests.filter((r) => {
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchesSearch = 
      !searchQuery.trim() ||
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone.includes(searchQuery) ||
      r.transactionId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Title */}
      <div className="border-b border-zinc-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight flex items-center gap-2">
            <Crown className="w-6 h-6 text-amber-500" />
            <span>Colonel's VIP Club Management</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Review customer one-time payments for Lifetime VIP Passes (Silver 3%, Gold 6%, Platinum 8%) and manage lifetime discounts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {pendingRequests.length > 0 && (
            <span className="bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-xl text-xs font-black animate-pulse">
              {pendingRequests.length} Pending Approval
            </span>
          )}
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
          <p className="text-2xl font-black text-amber-600 font-mono mt-1">
            {pendingRequests.length}
          </p>
          <p className="text-[10px] text-zinc-400 mt-0.5">Awaiting payment verification</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-zinc-200 shadow-sm">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Active Tiers</p>
          <p className="text-2xl font-black text-purple-600 font-mono mt-1">
            3 Tiers
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
              <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                {t.discountPercentage}% OFF
              </span>
            </div>
            <p className="text-base font-black text-[#e4002b] font-mono mt-1">
              {formatPKR(t.price)} <span className="text-xs text-zinc-400 font-normal">One-Time</span>
            </p>
            <p className="text-xs text-zinc-500 mt-1">{t.description}</p>
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
                placeholder="Search name, phone, TID..."
                className="text-xs rounded-xl pl-8 pr-3 py-1.5 border border-zinc-300 focus:outline-none focus:border-[#e4002b] bg-zinc-50"
              />
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2 pointer-events-none" />
            </div>

            {/* Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="text-xs rounded-xl px-3 py-1.5 border border-zinc-300 focus:outline-none bg-zinc-50"
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
                <th className="py-2.5 px-3">Method & TID</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 bg-white">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-400 text-xs">
                    No VIP membership requests found.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-zinc-50/80 transition">
                    <td className="py-3 px-3">
                      <p className="font-bold text-zinc-900">{req.customerName}</p>
                      <a href={`tel:${req.phone}`} className="text-[11px] text-zinc-500 font-mono hover:text-[#e4002b]">
                        {req.phone}
                      </a>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 text-[11px]">
                        {req.tierId} Pass ({req.tierId === 'silver' ? '3%' : req.tierId === 'gold' ? '6%' : '8%'} OFF)
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-zinc-900">
                      {formatPKR(req.amount)}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-semibold uppercase text-[11px] text-zinc-700">{req.paymentMethod}</p>
                      <p className="text-[10px] font-mono text-zinc-500">{req.transactionId}</p>
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
                      {req.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => approveVipRequest(req.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition cursor-pointer shadow-sm active:scale-95"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => rejectVipRequest(req.id)}
                            className="bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-bold px-2 py-1 rounded-lg transition cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-zinc-400 font-mono">Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
