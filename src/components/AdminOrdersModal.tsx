import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Order } from '../types';
import {
  X,
  ShoppingBag,
  Phone,
  MessageSquare,
  Printer,
  Clock,
  MapPin,
  Bike,
  ChefHat,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';

export const AdminOrdersModal: React.FC = () => {
  const {
    isOrdersDashboardOpen,
    setIsOrdersDashboardOpen,
    allOrders,
    updateOrderStatus,
    fetchOrders,
    formatPKR,
    settings,
  } = useStore();

  const [statusFilter, setStatusFilter] = useState<'all' | Order['status']>('all');
  const [search, setSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!isOrdersDashboardOpen) return null;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchOrders();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const filteredOrders = allOrders.filter((order) => {
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        order.id.toLowerCase().includes(q) ||
        order.customer.fullName.toLowerCase().includes(q) ||
        order.customer.phone.toLowerCase().includes(q) ||
        (order.customer.area && order.customer.area.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handlePrintReceipt = (order: Order) => {
    const itemsRows = order.items
      .map(
        (i) =>
          `<tr>
            <td style="padding: 6px 0; border-bottom: 1px dashed #ccc;">
              <strong>${i.quantity}x ${i.menuItem.name}</strong>
              ${i.options.spiceLevel ? `<div style="font-size: 11px; color: #555;">${i.options.spiceLevel}</div>` : ''}
              ${i.options.drink ? `<div style="font-size: 11px; color: #555;">${i.options.drink}</div>` : ''}
              ${i.options.addons.length ? `<div style="font-size: 11px; color: #555;">${i.options.addons.map((a) => a.name).join(', ')}</div>` : ''}
            </td>
            <td style="padding: 6px 0; border-bottom: 1px dashed #ccc; text-align: right; vertical-align: top;">
              ${formatPKR(i.unitPrice * i.quantity)}
            </td>
          </tr>`
      )
      .join('');

    const receiptHtml = `
      <html>
        <head>
          <title>Order Receipt - ${order.id}</title>
          <style>
            body { font-family: monospace; padding: 20px; max-width: 320px; margin: 0 auto; }
            h2, h3 { text-align: center; margin: 4px 0; }
            hr { border: none; border-top: 1px dashed #000; margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; }
          </style>
        </head>
        <body>
          <h2>${settings.storeName}</h2>
          <h3>Chakwal Delivery Slip</h3>
          <p style="text-align: center; font-size: 11px;">Ph: ${settings.phone} | Order: ${order.id}</p>
          <hr/>
          <p><strong>Customer:</strong> ${order.customer.fullName}</p>
          <p><strong>Phone:</strong> ${order.customer.phone}</p>
          <p><strong>Area:</strong> ${order.customer.area || 'Chakwal'}</p>
          <p><strong>Address:</strong> ${order.customer.address}</p>
          ${order.customer.landmark ? `<p><strong>Landmark:</strong> ${order.customer.landmark}</p>` : ''}
          ${order.customer.notes ? `<p><strong>Notes:</strong> ${order.customer.notes}</p>` : ''}
          <hr/>
          <table>
            <thead>
              <tr><th style="text-align: left;">Item</th><th style="text-align: right;">Price</th></tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>
          <hr/>
          <table>
            <tr><td>Subtotal:</td><td style="text-align: right;">${formatPKR(order.subtotal)}</td></tr>
            <tr><td>Delivery Fee:</td><td style="text-align: right;">${formatPKR(order.deliveryFee)}</td></tr>
            <tr><td><strong>Total Amount:</strong></td><td style="text-align: right; font-size: 14px;"><strong>${formatPKR(order.total)}</strong></td></tr>
            <tr><td>Payment:</td><td style="text-align: right;">${order.paymentMethod.toUpperCase()}</td></tr>
          </table>
          <hr/>
          <p style="text-align: center; font-size: 10px;">Thank you for ordering with KFC Chakwal Delivery!</p>
        </body>
      </html>
    `;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(receiptHtml);
      doc.close();
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    }
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  };

  const handleWhatsAppCustomer = (order: Order) => {
    const cleanPhone = order.customer.phone.replace(/[^0-9]/g, '');
    let formattedPhone = cleanPhone;
    if (cleanPhone.startsWith('0')) {
      formattedPhone = '92' + cleanPhone.slice(1);
    }
    const message = encodeURIComponent(
      `Assalam o Alaikum ${order.customer.fullName}!\n` +
      `Aapka KFC Chakwal order #${order.id} receive ho gaya hai.\n` +
      `Total Bill: ${formatPKR(order.total)} (${order.paymentMethod.toUpperCase()}).\n` +
      `Hamara rider jald aapke address (${order.customer.area}) par pohnch raha hai. Shukriya!`
    );
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#161619] border border-[#2d2d36] rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#282830] flex items-center justify-between bg-[#121214]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#e4002b] rounded-xl flex items-center justify-center text-white shadow-md">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-kfc text-2xl font-black text-white uppercase tracking-tight leading-none">
                  Incoming Orders Dashboard
                </h2>
                <span className="bg-[#e4002b] text-white text-[11px] font-black px-2 py-0.5 rounded-full">
                  {allOrders.length} Total
                </span>
              </div>
              <p className="text-zinc-400 text-xs mt-0.5">
                Real-time orders received from customers in Chakwal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className={`p-2 rounded-lg bg-[#1c1c20] text-zinc-300 hover:text-white border border-[#2e2e36] cursor-pointer ${
                isRefreshing ? 'animate-spin text-[#e4002b]' : ''
              }`}
              title="Refresh orders list"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsOrdersDashboardOpen(false)}
              className="text-zinc-400 hover:text-white p-2 rounded-lg bg-[#1c1c20] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 bg-[#141416] border-b border-[#26262d] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {(['all', 'confirmed', 'kitchen', 'dispatched', 'delivered'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-[#e4002b] text-white'
                    : 'bg-[#1c1c20] text-zinc-400 hover:text-white border border-[#2c2c34]'
                }`}
              >
                {st === 'all' ? 'All Orders' : st}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, name, phone, area..."
              className="w-full bg-[#1c1c20] border border-[#2e2e36] text-white text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:border-[#e4002b]"
            />
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-3" />
          </div>
        </div>

        {/* Orders List */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-[#121214] border border-[#24242c] rounded-2xl p-6">
              <ShoppingBag className="w-12 h-12 text-zinc-600 mx-auto" />
              <h3 className="font-kfc text-2xl font-black text-white uppercase">No Orders Found</h3>
              <p className="text-zinc-400 text-xs max-w-sm mx-auto">
                {statusFilter === 'all'
                  ? 'No customer orders have been placed yet. When a customer confirms an order on the website, it will immediately appear here.'
                  : `No orders currently in "${statusFilter}" status.`}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-[#1c1c20] border border-[#2a2a33] hover:border-zinc-700 rounded-2xl p-4 sm:p-5 transition-all shadow-lg space-y-4"
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#282832] pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-black text-white bg-black/60 px-2.5 py-1 rounded-lg border border-white/10">
                      #{order.id}
                    </span>
                    <span className="text-xs text-zinc-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#e4002b]" />
                      {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(order.date).toLocaleDateString()}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      {order.orderType}
                    </span>
                  </div>

                  {/* Status Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400 hidden sm:inline">Status:</span>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                      className="bg-[#121214] border border-[#373744] text-white text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#e4002b]"
                    >
                      <option value="confirmed">Confirmed (Received)</option>
                      <option value="kitchen">In Kitchen (Cooking)</option>
                      <option value="dispatched">Dispatched on Bike</option>
                      <option value="delivered">Delivered to Customer</option>
                    </select>
                  </div>
                </div>

                {/* Customer and Delivery Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1 bg-[#141416] p-3 rounded-xl border border-[#24242c]">
                    <p className="font-bold text-white text-sm">{order.customer.fullName}</p>
                    <p className="text-zinc-300 font-mono flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-[#e4002b]" />
                      {order.customer.phone}
                    </p>
                    <p className="text-zinc-400 flex items-start gap-1.5 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#e4002b] shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-white">{order.customer.area}:</strong> {order.customer.address}
                        {order.customer.landmark ? ` (Near ${order.customer.landmark})` : ''}
                      </span>
                    </p>
                    {order.customer.notes && (
                      <p className="text-amber-400/90 italic pt-0.5">
                        Instructions: "{order.customer.notes}"
                      </p>
                    )}
                  </div>

                  {/* Items Ordered List */}
                  <div className="space-y-1.5 bg-[#141416] p-3 rounded-xl border border-[#24242c]">
                    <p className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider mb-1">
                      Items Breakdown ({order.items.length})
                    </p>
                    <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                      {order.items.map((i) => (
                        <div key={i.cartItemId} className="flex justify-between text-xs text-zinc-300">
                          <div>
                            <span className="font-bold text-white">{i.quantity}x {i.menuItem.name}</span>
                            {i.options.spiceLevel && (
                              <span className="text-[10px] text-amber-400 ml-1">[{i.options.spiceLevel}]</span>
                            )}
                            {i.options.drink && (
                              <span className="text-[10px] text-zinc-400 ml-1">[{i.options.drink}]</span>
                            )}
                          </div>
                          <span className="tabular-nums font-semibold">{formatPKR(i.unitPrice * i.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-[#26262e] pt-1.5 flex justify-between items-center text-xs">
                      <span className="text-zinc-400">
                        Total Amount ({order.paymentMethod.toUpperCase()}):
                      </span>
                      <span className="text-sm font-black text-[#e4002b] tabular-nums">
                        {formatPKR(order.total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#25252e]">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-zinc-500">Quick Actions:</span>
                    <button
                      onClick={() => handleWhatsAppCustomer(order)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>WhatsApp Customer</span>
                    </button>

                    <a
                      href={`tel:${order.customer.phone}`}
                      className="bg-[#26262e] hover:bg-[#33333d] text-zinc-200 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                    >
                      <Phone className="w-3 h-3 text-[#e4002b]" />
                      <span>Call</span>
                    </a>
                  </div>

                  <button
                    onClick={() => handlePrintReceipt(order)}
                    className="bg-[#121214] hover:bg-[#202026] text-zinc-300 hover:text-white border border-[#33333d] text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-400" />
                    <span>Print Delivery KOT Slip</span>
                  </button>
                </div>

              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
