import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  RestaurantTenant,
  TenantSubscriptionStatus,
  TenantPlanId,
  SubscriptionPlan,
  SubscriptionPaymentRecord,
} from '../../types/saas';
import { formatSubscriptionStatus } from '../../utils/subscriptionUtils';
import {
  ShieldAlert,
  Building2,
  Users,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  Edit2,
  Calendar,
  Lock,
  Unlock,
  Eye,
  Filter,
  Search,
  Check,
  X,
  FileText,
  DollarSign,
  ArrowRight,
  TrendingUp,
  Settings,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export const SuperAdminDashboard: React.FC = () => {
  const {
    platformTenants,
    platformPlans,
    subscriptionPayments,
    platformPaymentInstructions,
    createRestaurantTenant,
    updateRestaurantTenant,
    extendRestaurantSubscription,
    toggleRestaurantSuspension,
    approveSubscriptionPayment,
    rejectSubscriptionPayment,
    updatePlatformPaymentInstructions,
    updatePlatformPlans,
    switchTenant,
    tenantId,
    formatPKR,
  } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'restaurants' | 'payments' | 'plans' | 'instructions'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals state
  const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);
  const [isEditTenantOpen, setIsEditTenantOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<RestaurantTenant | null>(null);
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [extendingTenant, setExtendingTenant] = useState<RestaurantTenant | null>(null);
  const [extendDays, setExtendDays] = useState(30);

  // Rejection modal
  const [rejectingPaymentId, setRejectingPaymentId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Action status message
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 5000);
  };

  // Add / Edit Tenant Form State
  const [tenantForm, setTenantForm] = useState<{
    id: string;
    name: string;
    slug: string;
    tagline: string;
    ownerName: string;
    ownerEmail: string;
    ownerPhone: string;
    city: string;
    address: string;
    planId: TenantPlanId;
    billingCycle: 'monthly' | 'yearly';
    price: number;
    startDate: string;
    dueDate: string;
    gracePeriodDays: number;
    status: TenantSubscriptionStatus;
    features: RestaurantTenant['features'];
    limits: RestaurantTenant['limits'];
  }>({
    id: '',
    name: '',
    slug: '',
    tagline: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    city: 'Chakwal',
    address: '',
    planId: 'professional',
    billingCycle: 'monthly',
    price: 9999,
    startDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    gracePeriodDays: 5,
    status: 'active',
    features: {
      onlineOrdering: true,
      productManagement: true,
      pos: true,
      inventory: true,
      suppliers: true,
      staffRoles: true,
      advancedReporting: true,
      loyaltyPromotions: true,
      multiBranch: false,
      kitchenDisplay: false,
      customTheme: true,
      whatsappMarketing: true,
    },
    limits: {
      maxProducts: 200,
      maxBranches: 2,
      maxStaff: 8,
    },
  });

  // Calculate Metrics
  const totalRestaurants = platformTenants.length;
  const activeTenants = platformTenants.filter((t) => t.status === 'active' || t.status === 'trial').length;
  const overdueTenants = platformTenants.filter((t) => t.status === 'payment_due' || t.status === 'grace_period').length;
  const suspendedTenants = platformTenants.filter((t) => t.status === 'suspended').length;
  const pendingPayments = (subscriptionPayments || []).filter((p) => p.status === 'pending').length;
  const totalMonthlyRevenue = platformTenants.reduce((acc, t) => {
    if (t.status === 'suspended' || t.status === 'cancelled') return acc;
    return acc + (t.billingCycle === 'yearly' ? Math.round(t.price / 12) : t.price);
  }, 0);

  const filteredTenants = platformTenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openAddModal = () => {
    setTenantForm({
      id: '',
      name: '',
      slug: '',
      tagline: 'Fresh Food & Doorstep Delivery',
      ownerName: '',
      ownerEmail: '',
      ownerPhone: '+92 ',
      city: 'Chakwal',
      address: '',
      planId: 'professional',
      billingCycle: 'monthly',
      price: 9999,
      startDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      gracePeriodDays: 5,
      status: 'active',
      features: {
        onlineOrdering: true,
        productManagement: true,
        pos: true,
        inventory: true,
        suppliers: true,
        staffRoles: true,
        advancedReporting: true,
        loyaltyPromotions: true,
        multiBranch: false,
        kitchenDisplay: false,
        customTheme: true,
        whatsappMarketing: true,
      },
      limits: {
        maxProducts: 200,
        maxBranches: 2,
        maxStaff: 8,
      },
    });
    setIsAddTenantOpen(true);
  };

  const openEditModal = (t: RestaurantTenant) => {
    setEditingTenant(t);
    setTenantForm({
      id: t.id,
      name: t.name,
      slug: t.slug,
      tagline: t.tagline || '',
      ownerName: t.ownerName,
      ownerEmail: t.ownerEmail,
      ownerPhone: t.ownerPhone,
      city: t.city,
      address: t.address,
      planId: t.planId,
      billingCycle: t.billingCycle,
      price: t.price,
      startDate: t.startDate,
      dueDate: t.dueDate,
      gracePeriodDays: t.gracePeriodDays,
      status: t.status,
      features: { ...t.features },
      limits: { ...t.limits },
    });
    setIsEditTenantOpen(true);
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = (tenantForm.slug || tenantForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')).trim();
    if (!slug) {
      alert('Please enter a valid restaurant slug / ID.');
      return;
    }

    const plan = platformPlans.find((p) => p.id === tenantForm.planId);

    const ok = await createRestaurantTenant({
      id: slug,
      name: tenantForm.name,
      slug,
      tagline: tenantForm.tagline,
      ownerName: tenantForm.ownerName,
      ownerEmail: tenantForm.ownerEmail,
      ownerPhone: tenantForm.ownerPhone,
      city: tenantForm.city,
      address: tenantForm.address,
      currency: 'PKR',
      status: tenantForm.status,
      planId: tenantForm.planId,
      planName: plan?.name || 'Professional',
      billingCycle: tenantForm.billingCycle,
      price: tenantForm.price,
      startDate: tenantForm.startDate,
      dueDate: tenantForm.dueDate,
      gracePeriodDays: Number(tenantForm.gracePeriodDays),
      nextRenewalDate: tenantForm.dueDate,
      features: tenantForm.features,
      limits: tenantForm.limits,
    });

    if (ok) {
      setIsAddTenantOpen(false);
      showNotice(`Restaurant "${tenantForm.name}" created successfully with ID: ${slug}`);
    } else {
      alert('Failed to create restaurant. Check slug uniqueness.');
    }
  };

  const handleUpdateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;

    const plan = platformPlans.find((p) => p.id === tenantForm.planId);

    const ok = await updateRestaurantTenant(editingTenant.id, {
      name: tenantForm.name,
      tagline: tenantForm.tagline,
      ownerName: tenantForm.ownerName,
      ownerEmail: tenantForm.ownerEmail,
      ownerPhone: tenantForm.ownerPhone,
      city: tenantForm.city,
      address: tenantForm.address,
      status: tenantForm.status,
      planId: tenantForm.planId,
      planName: plan?.name || editingTenant.planName,
      billingCycle: tenantForm.billingCycle,
      price: tenantForm.price,
      startDate: tenantForm.startDate,
      dueDate: tenantForm.dueDate,
      gracePeriodDays: Number(tenantForm.gracePeriodDays),
      features: tenantForm.features,
      limits: tenantForm.limits,
    });

    if (ok) {
      setIsEditTenantOpen(false);
      showNotice(`Restaurant "${tenantForm.name}" updated successfully.`);
    } else {
      alert('Failed to update restaurant.');
    }
  };

  const handleExtendConfirm = async () => {
    if (!extendingTenant) return;
    const ok = await extendRestaurantSubscription(extendingTenant.id, extendDays);
    if (ok) {
      setIsExtendModalOpen(false);
      showNotice(`Subscription for "${extendingTenant.name}" extended by ${extendDays} days!`);
    } else {
      alert('Failed to extend subscription.');
    }
  };

  const handleToggleSuspension = async (t: RestaurantTenant) => {
    const suspend = t.status !== 'suspended';
    const reason = suspend
      ? prompt('Enter suspension reason (e.g. Non-payment of subscription fee):') || 'Administrative suspension'
      : undefined;

    const ok = await toggleRestaurantSuspension(t.id, suspend, reason);
    if (ok) {
      showNotice(`Restaurant "${t.name}" ${suspend ? 'suspended' : 'reactivated'} successfully.`);
    }
  };

  const handleApprovePayment = async (p: SubscriptionPaymentRecord) => {
    if (p.status === 'approved') {
      alert('Payment is already approved.');
      return;
    }
    if (window.confirm(`Approve payment of ${formatPKR(p.amount)} for "${p.restaurantName}"? This will reactivate the restaurant and automatically calculate the next billing cycle.`)) {
      const ok = await approveSubscriptionPayment(p.id);
      if (ok) {
        showNotice(`Payment #${p.transactionRef} approved! Restaurant "${p.restaurantName}" subscription renewed.`);
      } else {
        alert('Payment approval failed.');
      }
    }
  };

  const handleRejectPayment = async () => {
    if (!rejectingPaymentId) return;
    const ok = await rejectSubscriptionPayment(rejectingPaymentId, rejectionReason || 'Invalid reference or amount');
    if (ok) {
      setRejectingPaymentId(null);
      setRejectionReason('');
      showNotice('Payment submission marked as rejected.');
    } else {
      alert('Failed to reject payment.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Super Admin Top Header */}
      <div className="bg-gradient-to-r from-red-950 via-zinc-900 to-black text-white rounded-3xl p-6 sm:p-8 border border-red-900/50 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs uppercase tracking-widest font-black text-red-400">
                Platform Super Admin Control Panel
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Multi-Restaurant SaaS Master Console
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Platform owner management for tenant restaurants, subscription lifecycles, manual payment approvals, and entitlements.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={openAddModal}
              className="px-4 py-2.5 rounded-xl bg-[#e4002b] hover:bg-[#c30025] text-white text-xs font-black shadow-lg flex items-center gap-2 cursor-pointer transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create Restaurant Tenant</span>
            </button>
          </div>
        </div>

        {/* Global KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-red-900/40 text-xs">
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <p className="text-zinc-400 text-[10px] uppercase font-bold">Total Restaurants</p>
            <p className="text-xl font-black text-white mt-1">{totalRestaurants}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <p className="text-zinc-400 text-[10px] uppercase font-bold">Active Subscriptions</p>
            <p className="text-xl font-black text-emerald-400 mt-1">{activeTenants}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <p className="text-zinc-400 text-[10px] uppercase font-bold">Payment Due / Grace</p>
            <p className="text-xl font-black text-amber-400 mt-1">{overdueTenants}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <p className="text-zinc-400 text-[10px] uppercase font-bold">Suspended Accounts</p>
            <p className="text-xl font-black text-red-400 mt-1">{suspendedTenants}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <p className="text-zinc-400 text-[10px] uppercase font-bold">Pending Payments</p>
            <p className="text-xl font-black text-orange-400 mt-1">{pendingPayments}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <p className="text-zinc-400 text-[10px] uppercase font-bold">Est. Monthly Revenue</p>
            <p className="text-xl font-black text-teal-400 mt-1">{formatPKR(totalMonthlyRevenue)}</p>
          </div>
        </div>
      </div>

      {actionNotice && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs p-4 rounded-2xl flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{actionNotice}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Dashboard Overview', icon: TrendingUp },
          { id: 'restaurants', label: `All Restaurants (${platformTenants.length})`, icon: Building2 },
          { id: 'payments', label: `Payment Approvals (${pendingPayments})`, icon: CreditCard, badge: pendingPayments > 0 ? pendingPayments : undefined },
          { id: 'plans', label: 'Subscription Plans', icon: DollarSign },
          { id: 'instructions', label: 'Platform Payment Details', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#e4002b] text-white border-2 border-[#e4002b] shadow-md shadow-red-900/30 ring-2 ring-red-400/40'
                  : 'bg-white border border-zinc-200 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 font-bold'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-white text-[#e4002b]' : 'bg-[#e4002b] text-white'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SUB-TAB: RESTAURANTS */}
      {(activeSubTab === 'overview' || activeSubTab === 'restaurants') && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-xs">
            <div className="flex items-center gap-2 w-full sm:w-80 bg-zinc-50 border rounded-xl px-3 py-1.5 text-xs">
              <Search className="w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by restaurant name, slug, owner, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-hidden w-full text-xs"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <span className="text-[11px] font-bold text-zinc-500 uppercase">Status:</span>
              {['all', 'active', 'payment_due', 'grace_period', 'suspended'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition capitalize cursor-pointer ${
                    statusFilter === st
                      ? 'bg-[#e4002b] text-white border-2 border-[#e4002b] shadow-xs ring-2 ring-red-400/30'
                      : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100 font-bold'
                  }`}
                >
                  {st.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Restaurants Table */}
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 text-zinc-500 uppercase tracking-wider font-bold border-b text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Restaurant</th>
                    <th className="py-3 px-3">Owner Contact</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Plan / Cycle</th>
                    <th className="py-3 px-3">Due Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredTenants.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-zinc-500">
                        No restaurant tenants found matching your filter.
                      </td>
                    </tr>
                  ) : (
                    filteredTenants.map((t) => {
                      const stStyle = formatSubscriptionStatus(t.status);
                      const isCurrentActiveTenant = tenantId === t.id;
                      return (
                        <tr key={t.id} className="hover:bg-zinc-50/70 transition">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-red-100 text-[#e4002b] flex items-center justify-center font-black uppercase text-xs shrink-0">
                                {t.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-black text-zinc-900 truncate">{t.name}</span>
                                  {isCurrentActiveTenant && (
                                    <span className="text-[9px] bg-red-500 text-white font-bold px-1.5 rounded-sm">Current</span>
                                  )}
                                </div>
                                <p className="text-[11px] text-zinc-500 font-mono truncate">
                                  ID: {t.slug} · {t.city}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <p className="font-semibold text-zinc-800">{t.ownerName}</p>
                            <p className="text-[11px] text-zinc-500">{t.ownerPhone} · {t.ownerEmail}</p>
                          </td>

                          <td className="py-3 px-3">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${stStyle.badgeClass}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${stStyle.dotClass}`} />
                              {stStyle.label}
                            </span>
                          </td>

                          <td className="py-3 px-3">
                            <p className="font-bold text-zinc-900 capitalize">{t.planName}</p>
                            <p className="text-[11px] text-zinc-500">
                              {formatPKR(t.price)} / {t.billingCycle}
                            </p>
                          </td>

                          <td className="py-3 px-3">
                            <p className="font-bold text-zinc-800">
                              {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A'}
                            </p>
                            <p className="text-[10px] text-zinc-500">
                              Grace: {t.gracePeriodDays} days
                            </p>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Switch / View Tenant Portal */}
                              <button
                                type="button"
                                onClick={() => {
                                  switchTenant(t.id);
                                  showNotice(`Switched active portal to restaurant: ${t.name}`);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-[11px] transition cursor-pointer"
                                title="Switch current app session to this restaurant"
                              >
                                View Portal
                              </button>

                              {/* Extend Subscription */}
                              <button
                                type="button"
                                onClick={() => {
                                  setExtendingTenant(t);
                                  setExtendDays(30);
                                  setIsExtendModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                                title="Extend Subscription Manually"
                              >
                                <Calendar className="w-4 h-4" />
                              </button>

                              {/* Edit Tenant */}
                              <button
                                type="button"
                                onClick={() => openEditModal(t)}
                                className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-100 transition cursor-pointer"
                                title="Edit Details, Plan & Features"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              {/* Suspend / Reactivate */}
                              <button
                                type="button"
                                onClick={() => handleToggleSuspension(t)}
                                className={`p-1.5 rounded-lg transition cursor-pointer ${
                                  t.status === 'suspended'
                                    ? 'text-emerald-600 hover:bg-emerald-50'
                                    : 'text-red-500 hover:bg-red-50'
                                }`}
                                title={t.status === 'suspended' ? 'Reactivate Account' : 'Suspend Account'}
                              >
                                {t.status === 'suspended' ? (
                                  <Unlock className="w-4 h-4" />
                                ) : (
                                  <Lock className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: PAYMENTS APPROVALS */}
      {activeSubTab === 'payments' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-black uppercase tracking-wide text-zinc-900">
                  Manual Subscription Payment Approvals
                </h2>
                <p className="text-xs text-zinc-500">
                  Review submitted bank transfers, JazzCash, EasyPaisa, or Raast payments. Approving a payment automatically reactivates the restaurant and extends their due date according to their billing cycle.
                </p>
              </div>
              <span className="text-xs font-bold bg-zinc-100 px-3 py-1 rounded-full text-zinc-700">
                {subscriptionPayments.length} Total Submissions
              </span>
            </div>

            {subscriptionPayments.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-xs bg-zinc-50 rounded-2xl border border-dashed">
                No subscription payments have been submitted yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 text-zinc-500 uppercase tracking-wider font-bold border-b text-[10px]">
                    <tr>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Restaurant</th>
                      <th className="py-3 px-3">Method</th>
                      <th className="py-3 px-3">Reference #</th>
                      <th className="py-3 px-3">Amount</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {subscriptionPayments.map((p) => {
                      let badge = 'bg-amber-100 text-amber-800';
                      if (p.status === 'approved') badge = 'bg-emerald-100 text-emerald-800';
                      if (p.status === 'rejected') badge = 'bg-red-100 text-red-800';
                      return (
                        <tr key={p.id} className="hover:bg-zinc-50/70 transition">
                          <td className="py-3 px-3 font-semibold text-zinc-900">{p.paymentDate}</td>
                          <td className="py-3 px-3">
                            <span className="font-black text-zinc-900">{p.restaurantName}</span>
                            <span className="text-[10px] text-zinc-500 font-mono block">ID: {p.restaurantId}</span>
                          </td>
                          <td className="py-3 px-3 uppercase font-medium text-zinc-700">
                            {p.paymentMethod.replace(/_/g, ' ')}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-zinc-900">
                            {p.transactionRef}
                            {p.proofUrl && (
                              <a
                                href={p.proofUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="block text-[10px] text-blue-600 hover:underline mt-0.5"
                              >
                                View Receipt Proof ↗
                              </a>
                            )}
                          </td>
                          <td className="py-3 px-3 font-black text-zinc-900">{formatPKR(p.amount)}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badge}`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {p.status === 'pending' ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleApprovePayment(p)}
                                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                                >
                                  Approve & Renew
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setRejectingPaymentId(p.id)}
                                  className="px-2.5 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs transition cursor-pointer"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-zinc-400">
                                {p.status === 'approved' ? 'Verified by Super Admin' : 'Rejected'}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB: PLANS */}
      {activeSubTab === 'plans' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {platformPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-zinc-100 text-zinc-800">
                      {plan.badge || plan.id}
                    </span>
                    {plan.popular && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e4002b] text-white">
                        Recommended
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-black text-zinc-900 mb-1">{plan.name}</h3>
                  <p className="text-xs text-zinc-500 mb-4">{plan.description}</p>

                  <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 mb-4">
                    <p className="text-2xl font-black text-zinc-900">{formatPKR(plan.monthlyPrice)} <span className="text-xs text-zinc-500 font-medium">/ month</span></p>
                    <p className="text-xs text-zinc-600 mt-1 font-semibold">{formatPKR(plan.yearlyPrice)} / year (Save 17%)</p>
                  </div>

                  <div className="space-y-2 text-xs mb-6">
                    <p className="font-bold text-zinc-800 uppercase tracking-wider text-[10px]">Resource Limits:</p>
                    <p className="text-zinc-600">● Products: <strong>Up to {plan.limits.maxProducts} items</strong></p>
                    <p className="text-zinc-600">● Branches: <strong>Up to {plan.limits.maxBranches} branches</strong></p>
                    <p className="text-zinc-600">● Staff Accounts: <strong>Up to {plan.limits.maxStaff} users</strong></p>

                    <p className="font-bold text-zinc-800 uppercase tracking-wider text-[10px] pt-3">Included Features:</p>
                    {Object.entries(plan.features).map(([k, en]) => {
                      const name = k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
                      return (
                        <div key={k} className="flex items-center gap-2 text-xs">
                          {en ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <X className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
                          )}
                          <span className={en ? 'text-zinc-800 font-medium' : 'text-zinc-400 line-through'}>
                            {name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB: PAYMENT INSTRUCTIONS */}
      {activeSubTab === 'instructions' && (
        <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-xs max-w-3xl">
          <h2 className="text-base font-black text-zinc-900 uppercase tracking-wide mb-2">
            Configure Platform Payment Details
          </h2>
          <p className="text-xs text-zinc-500 mb-6">
            These payment details are displayed to all restaurant owners when paying their subscription fees.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              showNotice('Platform payment instructions saved successfully.');
            }}
            className="space-y-4 text-xs"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={platformPaymentInstructions?.bankName}
                  onChange={(e) =>
                    updatePlatformPaymentInstructions({ bankName: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Account Title</label>
                <input
                  type="text"
                  value={platformPaymentInstructions?.accountTitle}
                  onChange={(e) =>
                    updatePlatformPaymentInstructions({ accountTitle: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Account Number</label>
                <input
                  type="text"
                  value={platformPaymentInstructions?.accountNumber}
                  onChange={(e) =>
                    updatePlatformPaymentInstructions({ accountNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">IBAN Number</label>
                <input
                  type="text"
                  value={platformPaymentInstructions?.iban}
                  onChange={(e) =>
                    updatePlatformPaymentInstructions({ iban: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">JazzCash Number</label>
                <input
                  type="text"
                  value={platformPaymentInstructions?.jazzCashNumber}
                  onChange={(e) =>
                    updatePlatformPaymentInstructions({ jazzCashNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">JazzCash Title</label>
                <input
                  type="text"
                  value={platformPaymentInstructions?.jazzCashTitle}
                  onChange={(e) =>
                    updatePlatformPaymentInstructions({ jazzCashTitle: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">EasyPaisa Number</label>
                <input
                  type="text"
                  value={platformPaymentInstructions?.easyPaisaNumber}
                  onChange={(e) =>
                    updatePlatformPaymentInstructions({ easyPaisaNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">EasyPaisa Title</label>
                <input
                  type="text"
                  value={platformPaymentInstructions?.easyPaisaTitle}
                  onChange={(e) =>
                    updatePlatformPaymentInstructions({ easyPaisaTitle: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Raast ID</label>
                <input
                  type="text"
                  value={platformPaymentInstructions?.raastId}
                  onChange={(e) =>
                    updatePlatformPaymentInstructions({ raastId: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">WhatsApp Support Phone</label>
                <input
                  type="text"
                  value={platformPaymentInstructions?.supportWhatsApp}
                  onChange={(e) =>
                    updatePlatformPaymentInstructions({ supportWhatsApp: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-zinc-700 mb-1">Payment Instructions Note</label>
              <textarea
                rows={4}
                value={platformPaymentInstructions?.instructions}
                onChange={(e) =>
                  updatePlatformPaymentInstructions({ instructions: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-xl text-xs"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-black shadow-md cursor-pointer transition active:scale-95"
              >
                Save Payment Instructions
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CREATE RESTAURANT MODAL */}
      {isAddTenantOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 text-zinc-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3 mb-5">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#e4002b]" />
                <h3 className="text-base font-black uppercase tracking-wide">
                  Create New Restaurant Tenant
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddTenantOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Restaurant Name *</label>
                  <input
                    type="text"
                    required
                    value={tenantForm.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                      setTenantForm({ ...tenantForm, name, slug });
                    }}
                    placeholder="e.g. Burger Lab Chakwal"
                    className="w-full px-3 py-2 border rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-[#e4002b]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Unique Slug / Tenant ID *</label>
                  <input
                    type="text"
                    required
                    value={tenantForm.slug}
                    onChange={(e) => setTenantForm({ ...tenantForm, slug: e.target.value.toLowerCase().trim() })}
                    placeholder="e.g. burger-lab"
                    className="w-full px-3 py-2 border rounded-xl text-xs font-mono outline-hidden focus:ring-2 focus:ring-[#e4002b]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Owner Name *</label>
                  <input
                    type="text"
                    required
                    value={tenantForm.ownerName}
                    onChange={(e) => setTenantForm({ ...tenantForm, ownerName: e.target.value })}
                    placeholder="e.g. Tariq Mehmood"
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Owner Email *</label>
                  <input
                    type="email"
                    required
                    value={tenantForm.ownerEmail}
                    onChange={(e) => setTenantForm({ ...tenantForm, ownerEmail: e.target.value })}
                    placeholder="owner@gmail.com"
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Owner Phone *</label>
                  <input
                    type="text"
                    required
                    value={tenantForm.ownerPhone}
                    onChange={(e) => setTenantForm({ ...tenantForm, ownerPhone: e.target.value })}
                    placeholder="+92 325 2777574"
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">City</label>
                  <input
                    type="text"
                    value={tenantForm.city}
                    onChange={(e) => setTenantForm({ ...tenantForm, city: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-zinc-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={tenantForm.address}
                    onChange={(e) => setTenantForm({ ...tenantForm, address: e.target.value })}
                    placeholder="Main Commercial Area, Chakwal"
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Plan and Billing Cycle */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-zinc-50 p-3.5 rounded-xl border">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Plan Entitlement</label>
                  <select
                    value={tenantForm.planId}
                    onChange={(e) => {
                      const pid = e.target.value as TenantPlanId;
                      const plan = platformPlans.find((p) => p.id === pid);
                      setTenantForm({
                        ...tenantForm,
                        planId: pid,
                        price: plan?.monthlyPrice || 9999,
                        features: plan?.features || tenantForm.features,
                        limits: plan?.limits || tenantForm.limits,
                      });
                    }}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white font-bold"
                  >
                    <option value="basic">Basic Starter</option>
                    <option value="professional">Professional Growth</option>
                    <option value="enterprise">Enterprise Scale</option>
                    <option value="custom">Custom Plan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Billing Cycle</label>
                  <select
                    value={tenantForm.billingCycle}
                    onChange={(e) => setTenantForm({ ...tenantForm, billingCycle: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white font-bold"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Price (PKR)</label>
                  <input
                    type="number"
                    value={tenantForm.price}
                    onChange={(e) => setTenantForm({ ...tenantForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white font-bold"
                  />
                </div>
              </div>

              {/* Status and Grace Period */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Initial Status</label>
                  <select
                    value={tenantForm.status}
                    onChange={(e) => setTenantForm({ ...tenantForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-bold"
                  >
                    <option value="active">Active</option>
                    <option value="trial">Trial</option>
                    <option value="payment_due">Payment Due</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Grace Period (Days)</label>
                  <input
                    type="number"
                    value={tenantForm.gracePeriodDays}
                    onChange={(e) => setTenantForm({ ...tenantForm, gracePeriodDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={tenantForm.dueDate.split('T')[0]}
                    onChange={(e) => setTenantForm({ ...tenantForm, dueDate: new Date(e.target.value).toISOString() })}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Feature Toggles */}
              <div className="border-t pt-3">
                <p className="font-bold text-zinc-800 mb-2">Feature Toggles for this Restaurant:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.keys(tenantForm.features).map((key) => {
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
                    const checked = (tenantForm.features as any)[key];
                    return (
                      <label key={key} className="flex items-center gap-2 cursor-pointer font-medium text-zinc-700">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) =>
                            setTenantForm({
                              ...tenantForm,
                              features: {
                                ...tenantForm.features,
                                [key]: e.target.checked,
                              },
                            })
                          }
                          className="w-3.5 h-3.5 text-[#e4002b] rounded cursor-pointer"
                        />
                        <span className="truncate">{label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddTenantOpen(false)}
                  className="px-4 py-2 border rounded-xl hover:bg-zinc-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#e4002b] hover:bg-[#c30025] text-white font-black shadow-md cursor-pointer"
                >
                  Create Restaurant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT RESTAURANT MODAL */}
      {isEditTenantOpen && editingTenant && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 text-zinc-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3 mb-5">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[#e4002b]" />
                <h3 className="text-base font-black uppercase tracking-wide">
                  Edit Restaurant: {editingTenant.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditTenantOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTenant} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Restaurant Name</label>
                  <input
                    type="text"
                    required
                    value={tenantForm.name}
                    onChange={(e) => setTenantForm({ ...tenantForm, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Status</label>
                  <select
                    value={tenantForm.status}
                    onChange={(e) => setTenantForm({ ...tenantForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-bold"
                  >
                    <option value="active">Active</option>
                    <option value="trial">Trial</option>
                    <option value="payment_due">Payment Due</option>
                    <option value="grace_period">Grace Period</option>
                    <option value="suspended">Suspended</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Owner Name</label>
                  <input
                    type="text"
                    required
                    value={tenantForm.ownerName}
                    onChange={(e) => setTenantForm({ ...tenantForm, ownerName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Owner Email</label>
                  <input
                    type="email"
                    required
                    value={tenantForm.ownerEmail}
                    onChange={(e) => setTenantForm({ ...tenantForm, ownerEmail: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Owner Phone</label>
                  <input
                    type="text"
                    required
                    value={tenantForm.ownerPhone}
                    onChange={(e) => setTenantForm({ ...tenantForm, ownerPhone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Plan & Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-zinc-50 p-3.5 rounded-xl border">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Plan</label>
                  <select
                    value={tenantForm.planId}
                    onChange={(e) => setTenantForm({ ...tenantForm, planId: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white font-bold"
                  >
                    <option value="basic">Basic Starter</option>
                    <option value="professional">Professional Growth</option>
                    <option value="enterprise">Enterprise Scale</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={tenantForm.dueDate.split('T')[0]}
                    onChange={(e) => setTenantForm({ ...tenantForm, dueDate: new Date(e.target.value).toISOString() })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Grace Period (Days)</label>
                  <input
                    type="number"
                    value={tenantForm.gracePeriodDays}
                    onChange={(e) => setTenantForm({ ...tenantForm, gracePeriodDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                  />
                </div>
              </div>

              {/* Feature Toggles */}
              <div className="border-t pt-3">
                <p className="font-bold text-zinc-800 mb-2">Feature Entitlements:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.keys(tenantForm.features).map((key) => {
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
                    const checked = (tenantForm.features as any)[key];
                    return (
                      <label key={key} className="flex items-center gap-2 cursor-pointer font-medium text-zinc-700">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) =>
                            setTenantForm({
                              ...tenantForm,
                              features: {
                                ...tenantForm.features,
                                [key]: e.target.checked,
                              },
                            })
                          }
                          className="w-3.5 h-3.5 text-[#e4002b] rounded cursor-pointer"
                        />
                        <span className="truncate">{label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditTenantOpen(false)}
                  className="px-4 py-2 border rounded-xl hover:bg-zinc-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#e4002b] hover:bg-[#c30025] text-white font-black shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXTEND SUBSCRIPTION MODAL */}
      {isExtendModalOpen && extendingTenant && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-zinc-900 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-black uppercase text-zinc-900 mb-1">
              Extend Subscription: {extendingTenant.name}
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              Current Due Date: <strong>{new Date(extendingTenant.dueDate).toLocaleDateString()}</strong>
            </p>

            <div className="space-y-3 text-xs mb-6">
              <label className="block font-bold text-zinc-700">Select Extension Period:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { days: 30, label: '+30 Days' },
                  { days: 90, label: '+90 Days' },
                  { days: 365, label: '+1 Year' },
                ].map((opt) => (
                  <button
                    key={opt.days}
                    type="button"
                    onClick={() => setExtendDays(opt.days)}
                    className={`py-2 px-3 rounded-xl font-bold border transition cursor-pointer ${
                      extendDays === opt.days
                        ? 'bg-zinc-900 text-white border-zinc-900'
                        : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Or Custom Days:</label>
                <input
                  type="number"
                  value={extendDays}
                  onChange={(e) => setExtendDays(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-bold"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsExtendModalOpen(false)}
                className="px-4 py-2 border rounded-xl hover:bg-zinc-100 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExtendConfirm}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md cursor-pointer"
              >
                Confirm Extension
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT PAYMENT MODAL */}
      {rejectingPaymentId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-zinc-900 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-black uppercase text-red-600 mb-2">
              Reject Subscription Payment
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              Please enter the reason for rejecting this payment submission so the restaurant owner can correct it.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-bold text-zinc-700 mb-1">Rejection Reason *</label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Transaction ID not found in bank statement, or amount received was insufficient."
                className="w-full px-3 py-2 border rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectingPaymentId(null)}
                className="px-4 py-2 border rounded-xl hover:bg-zinc-100 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectPayment}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-md cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
