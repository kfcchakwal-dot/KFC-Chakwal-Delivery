import { RestaurantTenant, TenantSubscriptionStatus } from '../types/saas';

export interface SubscriptionEvaluation {
  currentStatus: TenantSubscriptionStatus;
  isExpired: boolean;
  isInGracePeriod: boolean;
  isSuspended: boolean;
  daysRemaining: number;
  graceDaysRemaining: number;
  message: string;
}

export function evaluateSubscription(tenant: RestaurantTenant): SubscriptionEvaluation {
  if (tenant.status === 'cancelled') {
    return {
      currentStatus: 'cancelled',
      isExpired: true,
      isInGracePeriod: false,
      isSuspended: true,
      daysRemaining: 0,
      graceDaysRemaining: 0,
      message: 'Subscription has been cancelled. Please contact platform support.',
    };
  }

  const now = new Date();
  const due = new Date(tenant.dueDate);
  const graceDays = typeof tenant.gracePeriodDays === 'number' ? tenant.gracePeriodDays : 5;
  const graceEnd = new Date(due.getTime() + graceDays * 24 * 60 * 60 * 1000);

  const diffMs = due.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const graceDiffMs = graceEnd.getTime() - now.getTime();
  const graceDaysRemaining = Math.max(0, Math.ceil(graceDiffMs / (1000 * 60 * 60 * 24)));

  if (now > graceEnd) {
    return {
      currentStatus: 'suspended',
      isExpired: true,
      isInGracePeriod: false,
      isSuspended: true,
      daysRemaining: 0,
      graceDaysRemaining: 0,
      message: 'Subscription has expired and grace period ended. Services are suspended pending payment.',
    };
  }

  if (now > due) {
    return {
      currentStatus: 'grace_period',
      isExpired: true,
      isInGracePeriod: true,
      isSuspended: false,
      daysRemaining: 0,
      graceDaysRemaining,
      message: `Subscription payment is due. Grace period active (${graceDaysRemaining} day${graceDaysRemaining === 1 ? '' : 's'} remaining).`,
    };
  }

  if (daysRemaining <= 3) {
    return {
      currentStatus: 'payment_due',
      isExpired: false,
      isInGracePeriod: false,
      isSuspended: false,
      daysRemaining,
      graceDaysRemaining,
      message: `Subscription will expire in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}.`,
    };
  }

  return {
    currentStatus: tenant.status === 'trial' ? 'trial' : 'active',
    isExpired: false,
    isInGracePeriod: false,
    isSuspended: false,
    daysRemaining,
    graceDaysRemaining,
    message: tenant.status === 'trial' ? 'Free trial active' : 'Subscription active',
  };
}

export function calculateNextRenewalDate(currentDueDate: string, billingCycle: 'monthly' | 'yearly'): string {
  const baseDate = new Date(currentDueDate);
  const now = new Date();
  // If current due date was already in the past, renew from now
  const anchor = baseDate.getTime() > now.getTime() ? baseDate : now;
  const next = new Date(anchor);

  if (billingCycle === 'yearly') {
    next.setFullYear(next.getFullYear() + 1);
  } else {
    next.setMonth(next.getMonth() + 1);
  }

  return next.toISOString();
}

export function formatSubscriptionStatus(status: TenantSubscriptionStatus): {
  label: string;
  badgeClass: string;
  dotClass: string;
} {
  switch (status) {
    case 'active':
      return {
        label: 'Active',
        badgeClass: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
        dotClass: 'bg-emerald-500',
      };
    case 'trial':
      return {
        label: 'Trial',
        badgeClass: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
        dotClass: 'bg-blue-500',
      };
    case 'payment_due':
      return {
        label: 'Payment Due',
        badgeClass: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
        dotClass: 'bg-amber-500',
      };
    case 'grace_period':
      return {
        label: 'Grace Period',
        badgeClass: 'bg-orange-500/10 text-orange-500 border border-orange-500/20',
        dotClass: 'bg-orange-500 animate-pulse',
      };
    case 'suspended':
      return {
        label: 'Suspended',
        badgeClass: 'bg-red-500/10 text-red-500 border border-red-500/20',
        dotClass: 'bg-red-500',
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        badgeClass: 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20',
        dotClass: 'bg-zinc-500',
      };
    default:
      return {
        label: status,
        badgeClass: 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20',
        dotClass: 'bg-zinc-500',
      };
  }
}
