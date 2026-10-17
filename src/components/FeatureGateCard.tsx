import React from 'react';
import { Lock, Sparkles, ArrowRight, ShieldAlert } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface FeatureGateCardProps {
  featureName: string;
  requiredPlan: 'Professional' | 'Enterprise';
  description: string;
  benefits?: string[];
  onUpgradeClick?: () => void;
}

export const FeatureGateCard: React.FC<FeatureGateCardProps> = ({
  featureName,
  requiredPlan,
  description,
  benefits = [],
  onUpgradeClick,
}) => {
  const { currentTenant } = useStore();

  return (
    <div className="bg-white rounded-2xl border border-amber-200/80 shadow-md p-6 sm:p-8 max-w-2xl mx-auto my-8 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/20">
        <Lock className="w-7 h-7" />
      </div>

      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 mb-3">
        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
        Requires {requiredPlan} Plan
      </span>

      <h3 className="text-xl font-black text-zinc-900 mb-2">
        Unlock {featureName}
      </h3>

      <p className="text-sm text-zinc-600 max-w-lg mx-auto mb-6">
        {description}
      </p>

      {benefits.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-4 text-left max-w-md mx-auto mb-6">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2">What you'll get:</p>
          <ul className="space-y-1.5 text-xs text-zinc-700">
            {benefits.map((b, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={onUpgradeClick}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#e4002b] to-[#b30022] hover:from-[#c30025] hover:to-[#90001b] text-white text-xs font-black shadow-md flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
        >
          <span>Upgrade to {requiredPlan}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <p className="text-[11px] text-zinc-600 mt-4">
        Current Plan: <strong className="text-zinc-700 uppercase">{currentTenant?.planName || 'Basic Starter'}</strong> · Managed centrally by Super Admin
      </p>
    </div>
  );
};
