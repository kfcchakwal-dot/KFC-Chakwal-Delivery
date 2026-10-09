import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { VipTierId } from '../types';
import { 
  X, 
  Crown, 
  Check, 
  Sparkles, 
  Clock, 
  MessageCircle,
  Phone,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const VipClubModal: React.FC = () => {
  const {
    isVipModalOpen,
    setIsVipModalOpen,
    vipTiers,
    currentUser,
    requestVipMembershipWhatsApp,
    formatPKR,
  } = useStore();

  const [selectedTierId, setSelectedTierId] = useState<VipTierId>('silver');
  const [customerName, setCustomerName] = useState(currentUser?.fullName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [isSent, setIsSent] = useState(false);

  if (!isVipModalOpen) return null;

  const selectedTier = vipTiers.find((t) => t.id === selectedTierId) || vipTiers[0];
  const isUserVipActive = currentUser?.vipStatus === 'active';
  const isUserVipPending = currentUser?.vipStatus === 'pending' || isSent;

  const handleOrderOnWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Please pehle phone OTP se login karein.');
      return;
    }
    if (!customerName.trim() || !phone.trim()) {
      alert('Please enter your Name and Phone Number.');
      return;
    }

    try {
      await requestVipMembershipWhatsApp(selectedTierId, customerName, phone, email);
      setIsSent(true);
    } catch (error: any) {
      alert(error?.message || 'VIP request create nahi ho saki.');
      return;
    }

    // Format WhatsApp message to 0325-2777574
    const message = 
      `Assalam o Alaikum! Mujhe KFC Chakwal Delivery ka Lifetime VIP Pass order karna hai:\n\n` +
      `👑 *Pass:* ${selectedTier.name} (Flat ${selectedTier.discountPercentage}% Lifetime OFF)\n` +
      `💰 *One-Time Fee:* ${formatPKR(selectedTier.price)}\n` +
      `👤 *Customer Name:* ${customerName.trim()}\n` +
      `📱 *Phone:* ${phone.trim()}\n` +
      (email.trim() ? `📧 *Email:* ${email.trim()}\n` : '') +
      `\nBaraye mehrbani payment transfer details (JazzCash / Easypaisa) send karein taake payment send karke mera pass manually approve kiya ja sake. Shukriya!`;

    const encoded = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/923252777574?text=${encoded}`;
    window.location.assign(whatsappUrl);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl border border-zinc-200 bg-white text-zinc-950 shadow-2xl overflow-hidden max-h-[94vh] flex flex-col">
        
        {/* Header - Signature Red Banner */}
        <div className="bg-[#e4002b] p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-black text-amber-400 flex items-center justify-center shadow-md shrink-0 border border-white/20">
              <Crown className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-black/30 px-2.5 py-0.5 rounded-full text-white inline-block">
                One-Time Payment · Lifetime Benefit
              </span>
              <h3 className="font-kfc text-2xl sm:text-3xl font-black uppercase tracking-tight leading-none mt-1">
                Lifetime VIP Pass
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsVipModalOpen(false)}
            className="text-white/80 hover:text-white p-2 rounded-full bg-black/20 hover:bg-black/30 cursor-pointer"
            aria-label="Close VIP modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">

          {/* ACTIVE VIP MEMBER CARD */}
          {isUserVipActive ? (
            <div className="p-6 rounded-3xl bg-red-50 border-2 border-[#e4002b] text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#e4002b] text-white flex items-center justify-center mx-auto shadow-lg">
                <Crown className="w-8 h-8 text-amber-300" />
              </div>
              <h4 className="font-kfc text-2xl uppercase font-black text-black">
                Lifetime VIP Pass Active!
              </h4>
              <p className="text-xs text-zinc-700 leading-relaxed max-w-sm mx-auto">
                Aapka <strong>{currentUser?.vipTier?.toUpperCase()} PASS</strong> kamyabi se active hai. Aapko har order par flat discount automatically mil raha hai.
              </p>
              <div className="inline-block bg-black text-white text-xs font-bold px-4 py-1.5 rounded-full">
                ✓ Guaranteed Discount on Every Checkout
              </div>
            </div>
          ) : isUserVipPending ? (
            <div className="p-6 rounded-3xl bg-zinc-50 border-2 border-amber-500 text-center space-y-3">
              <Clock className="w-12 h-12 text-amber-500 mx-auto animate-pulse" />
              <h4 className="font-kfc text-2xl uppercase font-black text-black">
                VIP Pass Order Sent on WhatsApp!
              </h4>
              <p className="text-xs text-zinc-700 leading-relaxed max-w-sm mx-auto">
                Aapka order hamaray WhatsApp (<strong>0325-2777574</strong>) par send ho chuka hai. Hum aapko payment details provide karein gy aur payment receive hony par aapka pass manually approve kiya jaye ga.
              </p>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs font-bold">
                Status: Pending Approval (Awaiting Payment Verification)
              </div>
              <div className="pt-2">
                <a
                  href="https://wa.me/923252777574"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#e4002b] hover:underline"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Open WhatsApp Helpline: 0325-2777574</span>
                </a>
              </div>
            </div>
          ) : (
            <>
              {/* TIER SELECTION CARDS */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-black block mb-2">
                  Select Your Pass Tier (One-Time Payment):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {vipTiers.map((tier) => {
                    const isSelected = selectedTierId === tier.id;
                    return (
                      <div
                        key={tier.id}
                        onClick={() => setSelectedTierId(tier.id)}
                        className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all relative ${
                          isSelected
                            ? 'border-[#e4002b] bg-red-50/60 shadow-md scale-[1.02]'
                            : 'border-zinc-200 bg-white hover:border-zinc-300'
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#e4002b] text-white flex items-center justify-center text-xs font-black">
                            ✓
                          </span>
                        )}
                        {tier.imageUrl && <img src={tier.imageUrl} alt={tier.name} loading="lazy" className="mb-2 h-20 w-full rounded-lg object-contain" />}
                        <span className="text-[11px] font-black uppercase text-[#e4002b] block">
                          Flat {tier.discountPercentage}% OFF
                        </span>
                        <h4 className="font-kfc text-lg font-black uppercase truncate mt-0.5 text-black">
                          {tier.name}
                        </h4>
                        <div className="mt-1">
                          <span className="text-xl font-black text-black font-mono">
                            {formatPKR(tier.price)}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-bold ml-1">One-Time</span>
                        </div>
                        <p className="text-[10px] text-zinc-600 mt-1 line-clamp-2">
                          {tier.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Tier Perks */}
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs space-y-2">
                <h5 className="font-black text-[11px] uppercase tracking-wider text-black flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#e4002b]" />
                  <span>{selectedTier.name} Perks:</span>
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-zinc-700 font-medium">
                  {selectedTier.perks.map((p, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[3]" />
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order via WhatsApp Form */}
              <form onSubmit={handleOrderOnWhatsApp} className="space-y-3 pt-1">
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs space-y-1">
                  <p className="font-black text-black flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#e4002b]" />
                    <span>How VIP Pass Order Works:</span>
                  </p>
                  <p className="text-[11px] text-zinc-600 leading-relaxed">
                    Neechy apna name aur number likh kar <strong>"Order Pass on WhatsApp"</strong> par click karein. Aapka order hamaray WhatsApp (0325-2777574) par jayega jahan hum aapko payment details den gy. Payment receive hony par aapka Lifetime Pass activate ho jaye ga!
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-black block mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Muhammad Ali"
                      className="w-full text-xs rounded-xl px-3.5 py-2.5 border border-zinc-300 focus:outline-none focus:border-[#e4002b] bg-white font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-black block mb-1">
                      WhatsApp Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="03252777574"
                      className="w-full text-xs rounded-xl px-3.5 py-2.5 border border-zinc-300 focus:outline-none focus:border-[#e4002b] bg-white font-mono font-bold"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-black block mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@gmail.com"
                      className="w-full text-xs rounded-xl px-3.5 py-2.5 border border-zinc-300 focus:outline-none focus:border-[#e4002b] bg-white font-medium"
                    />
                  </div>
                </div>

                {/* Main WhatsApp Order Button */}
                <button
                  type="submit"
                  className="w-full bg-[#e4002b] hover:bg-[#c30025] text-white font-kfc uppercase text-xl font-black py-3.5 px-4 rounded-2xl shadow-xl flex items-center justify-center gap-2.5 cursor-pointer transition active:scale-98"
                >
                  <MessageCircle className="w-6 h-6 fill-white text-[#e4002b]" />
                  <span>Order {selectedTier.name} on WhatsApp ({formatPKR(selectedTier.price)})</span>
                </button>
              </form>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-zinc-600 font-bold">
            Helpline: +92 325 2777574 · Valid for lifetime orders
          </span>

          <button
            type="button"
            onClick={() => setIsVipModalOpen(false)}
            className="text-xs text-zinc-600 hover:text-black font-bold cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
