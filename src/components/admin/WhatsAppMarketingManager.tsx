import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Send, 
  MessageCircle, 
  Users, 
  Sparkles, 
  Check, 
  CheckSquare, 
  Square, 
  Clock, 
  History,
  Phone,
  Flame,
  Award,
  Crown
} from 'lucide-react';

export const WhatsAppMarketingManager: React.FC = () => {
  const {
    customerRecords,
    marketingCampaigns,
    createMarketingBroadcast,
    formatPKR,
  } = useStore();

  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>(() => 
    customerRecords.map((c) => c.id)
  );
  const [filterAudience, setFilterAudience] = useState<'all' | 'vip' | 'frequent'>('all');
  const [campaignTitle, setCampaignTitle] = useState('Weekend Crispy Bucket Blast');
  const [messageText, setMessageText] = useState(
    'Assalam o Alaikum {name}! KFC Chakwal Delivery ka crispy chicken meal box ready hai. Kallar Kahar se fresh pick kiya gaya hai. Aaj order karein aur enjoy karein: ' + window.location.origin + '/'
  );
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const displayedCustomers = customerRecords.filter((c) => {
    if (filterAudience === 'vip') return Boolean(c.vipTier);
    if (filterAudience === 'frequent') return (c.totalOrdersCount || 0) >= 2;
    return true;
  });

  const toggleSelectAll = () => {
    if (selectedCustomerIds.length === displayedCustomers.length) {
      setSelectedCustomerIds([]);
    } else {
      setSelectedCustomerIds(displayedCustomers.map((c) => c.id));
    }
  };

  const toggleCustomer = (id: string) => {
    if (selectedCustomerIds.includes(id)) {
      setSelectedCustomerIds(selectedCustomerIds.filter((cid) => cid !== id));
    } else {
      setSelectedCustomerIds([...selectedCustomerIds, id]);
    }
  };

  const handleSendBroadcast = () => {
    const recipients = customerRecords.filter((c) => selectedCustomerIds.includes(c.id));
    if (recipients.length === 0) {
      alert('Please select at least one customer.');
      return;
    }

    createMarketingBroadcast({
      title: campaignTitle,
      channel: 'whatsapp',
      audience: filterAudience,
      targetAudience: `${recipients.length} Selected Customers`,
      recipientCount: recipients.length,
      sentCount: recipients.length,
      message: messageText,
    });

    setStatusNotice(`✓ Broadcast recorded for ${recipients.length} recipients! Opening WhatsApp...`);
    setTimeout(() => setStatusNotice(null), 5000);

    // Open WhatsApp for the first recipient with personalized message
    if (recipients[0]?.phone) {
      const clean = recipients[0].phone.replace(/[^0-9]/g, '');
      const intl = clean.startsWith('0') ? '92' + clean.slice(1) : clean;
      const personalized = messageText.replace('{name}', recipients[0].fullName);
      window.open(`https://wa.me/${intl}?text=${encodeURIComponent(personalized)}`, '_blank');
    }
  };

  const applyTemplate = (title: string, text: string) => {
    setCampaignTitle(title);
    setMessageText(text);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="border-b border-zinc-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight flex items-center gap-2">
            <Send className="w-6 h-6 text-[#e4002b]" />
            <span>WhatsApp Marketing & Bulk Broadcasts</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Send offers, daily deals, and discounts directly to your registered Chakwal customers on WhatsApp.
          </p>
        </div>

        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
          <MessageCircle className="w-4 h-4 text-emerald-600" />
          <span>Direct WhatsApp Web / App Integration</span>
        </span>
      </div>

      {statusNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold animate-in fade-in duration-150">
          {statusNotice}
        </div>
      )}

      {/* Main Grid: Composer + Customer Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Campaign Composer (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-5">
          <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wider flex items-center gap-2">
            <span>Compose WhatsApp Broadcast</span>
          </h3>

          {/* Quick Preset Templates */}
          <div>
            <label className="text-[11px] font-bold text-zinc-500 uppercase block mb-1.5">
              Quick Offer Templates:
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyTemplate(
                  'Friday Mega Bucket Blast',
                  'Assalam o Alaikum {name}! Friday Special Offer: Flat 4% OFF on Daily Deals. Freshly picked from Kallar Kahar and delivered to Chakwal before 8 PM. Order now: ' + window.location.origin + '/'
                )}
                className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition cursor-pointer"
              >
                🍗 Friday Bucket Blast
              </button>
              <button
                type="button"
                onClick={() => applyTemplate(
                  'Lifetime VIP Pass Invitation',
                  'Assalam o Alaikum {name}! Hamara "Lifetime VIP Pass" launch ho chuka hai. Flat 3%, 6% ya 8% lifetime discount haasil karein har order par. WhatsApp helpline: 0325-2777574.'
                )}
                className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-[#e4002b] transition cursor-pointer"
              >
                👑 VIP Pass Invitation
              </button>
              <button
                type="button"
                onClick={() => applyTemplate(
                  'Loyalty Points Reminder',
                  'Assalam o Alaikum {name}! Aapke KFC Chakwal account mein bonus loyalty points available hain. Apne next order par points redeem karein aur flat discount lein: ' + window.location.origin + '/'
                )}
                className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 transition cursor-pointer"
              >
                ⭐ Loyalty Points Reminder
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">Campaign Title (Internal Reference)</label>
              <input
                type="text"
                value={campaignTitle}
                onChange={(e) => setCampaignTitle(e.target.value)}
                className="w-full text-xs font-bold rounded-xl px-3.5 py-2.5 border border-zinc-300 focus:outline-none focus:border-[#e4002b] bg-zinc-50"
                placeholder="e.g. Sunday Family Festival Deal"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-zinc-700">WhatsApp Message Text</label>
                <span className="text-[10px] text-zinc-400 font-mono">Use {'{name}'} for customer's name</span>
              </div>
              <textarea
                rows={5}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="w-full text-xs rounded-xl p-3.5 border border-zinc-300 focus:outline-none focus:border-[#e4002b] bg-zinc-50 leading-relaxed font-sans"
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-100">
            <span className="text-xs text-zinc-600 font-bold">
              Selected: <strong className="text-black">{selectedCustomerIds.length}</strong> of {displayedCustomers.length} recipients
            </span>

            <button
              type="button"
              onClick={handleSendBroadcast}
              className="w-full sm:w-auto bg-[#e4002b] hover:bg-[#c30025] text-white text-xs font-bold uppercase px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer transition active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Broadcast on WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Right: Customer Audience Selector (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4 flex flex-col max-h-[620px]">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-zinc-600" />
              <span>Target Audience ({displayedCustomers.length})</span>
            </h3>

            <button
              type="button"
              onClick={toggleSelectAll}
              className="text-[11px] font-bold text-[#e4002b] hover:underline cursor-pointer"
            >
              {selectedCustomerIds.length === displayedCustomers.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          {/* Segment Filter */}
          <div className="flex gap-1.5 p-1 bg-zinc-100 rounded-xl text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setFilterAudience('all')}
              className={`flex-1 py-1.5 rounded-lg transition ${
                filterAudience === 'all' ? 'bg-white text-black shadow-xs' : 'text-zinc-600'
              }`}
            >
              All ({customerRecords.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterAudience('vip')}
              className={`flex-1 py-1.5 rounded-lg transition ${
                filterAudience === 'vip' ? 'bg-white text-[#e4002b] shadow-xs' : 'text-zinc-600'
              }`}
            >
              VIP Pass ({customerRecords.filter(c => c.vipTier).length})
            </button>
            <button
              type="button"
              onClick={() => setFilterAudience('frequent')}
              className={`flex-1 py-1.5 rounded-lg transition ${
                filterAudience === 'frequent' ? 'bg-white text-black shadow-xs' : 'text-zinc-600'
              }`}
            >
              2+ Orders
            </button>
          </div>

          {/* Customer Checklist */}
          <div className="overflow-y-auto flex-1 divide-y divide-zinc-100 border border-zinc-200 rounded-xl p-1 bg-zinc-50">
            {displayedCustomers.length === 0 ? (
              <div className="p-8 text-center text-zinc-400 text-xs">
                No customers in this segment.
              </div>
            ) : (
              displayedCustomers.map((cust) => {
                const isSelected = selectedCustomerIds.includes(cust.id);
                return (
                  <div
                    key={cust.id}
                    onClick={() => toggleCustomer(cust.id)}
                    className="p-2.5 hover:bg-white rounded-lg flex items-center justify-between cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="text-zinc-400">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#e4002b]" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-zinc-900 truncate">{cust.fullName}</p>
                        <p className="text-[10px] text-zinc-500 font-mono">{cust.phone}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {cust.vipTier && (
                        <span className="text-[9px] font-black uppercase text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 block">
                          {cust.vipTier} VIP
                        </span>
                      )}
                      <span className="text-[10px] text-zinc-400 font-mono">{cust.totalOrdersCount || 0} ord</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Broadcast History */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wider flex items-center gap-2">
          <History className="w-4 h-4 text-zinc-600" />
          <span>Past Broadcast History ({marketingCampaigns.length})</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-zinc-200 rounded-xl overflow-hidden divide-y divide-zinc-200">
            <thead className="bg-zinc-50 text-zinc-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-2.5 px-3">Title</th>
                <th className="py-2.5 px-3">Channel</th>
                <th className="py-2.5 px-3">Recipients</th>
                <th className="py-2.5 px-3">Date Sent</th>
                <th className="py-2.5 px-3">Message Preview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 bg-white">
              {marketingCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-400 text-xs">
                    No marketing campaigns sent yet.
                  </td>
                </tr>
              ) : (
                marketingCampaigns.map((camp) => (
                  <tr key={camp.id} className="hover:bg-zinc-50/80">
                    <td className="py-3 px-3 font-bold text-zinc-900">{camp.title}</td>
                    <td className="py-3 px-3">
                      <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border border-emerald-200">
                        WhatsApp
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-zinc-700">
                      {camp.recipientCount || camp.sentCount || 1} Recipients
                    </td>
                    <td className="py-3 px-3 text-zinc-500 text-[11px]">
                      {new Date(camp.sentAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-zinc-600 truncate max-w-xs text-[11px]">
                      {camp.message}
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
