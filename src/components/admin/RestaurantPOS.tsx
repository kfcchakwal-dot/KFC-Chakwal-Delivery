import React, { useMemo, useState } from 'react';
import { Search, Plus, Minus, Trash2, Printer, Receipt, ShoppingCart, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { auth, db } from '../../lib/firebase';
import { doc, runTransaction } from 'firebase/firestore';
import type { CartItem, MenuItem, Order, OrderType } from '../../types';

type PosLine = { item: MenuItem; quantity: number };
const money = (n: number) => 'Rs ' + Math.round(n).toLocaleString('en-PK');

export const RestaurantPOS: React.FC<{ onOrderCreated?: () => void }> = ({ onOrderCreated }) => {
  const { menuItems, formatPKR, calculatePrice, settings } = useStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [cart, setCart] = useState<PosLine[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [payment, setPayment] = useState<'cod' | 'jazzcash' | 'easypaisa' | 'bank_transfer'>('cod');
  const [deliveryFee, setDeliveryFee] = useState(Number(settings.deliveryFee || 0));
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('fixed');
  const [taxPercentage, setTaxPercentage] = useState(0);
  const [serviceChargePercentage, setServiceChargePercentage] = useState(0);
  const [extraAmount, setExtraAmount] = useState(0);
  const [extraAmountReason, setExtraAmountReason] = useState('');
  const [cashTendered, setCashTendered] = useState<number | ''>('');
  const [printMode, setPrintMode] = useState<'bill' | 'kot'>('bill');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  const categories = useMemo(() => [...new Set(menuItems.map((i) => i.categoryId))], [menuItems]);
  const visibleItems = useMemo(() => menuItems.filter((item) =>
    (category === 'all' || item.categoryId === category) &&
    (!search.trim() || item.name.toLowerCase().includes(search.trim().toLowerCase()) || (settings.skuBarcodeConfig?.enabled !== false && (String(item.sku || '').toLowerCase().includes(search.trim().toLowerCase()) || String(item.barcode || '').toLowerCase().includes(search.trim().toLowerCase())))) &&
    item.isAvailable !== false
  ), [menuItems, category, search, settings.skuBarcodeConfig?.enabled]);

  const add = (item: MenuItem) => setCart((prev) => {
    const found = prev.find((x) => x.item.id === item.id);
    return found ? prev.map((x) => x.item.id === item.id ? { ...x, quantity: x.quantity + 1 } : x) : [...prev, { item, quantity: 1 }];
  });
  const changeQty = (id: string, delta: number) => setCart((prev) => prev.map((x) => x.item.id === id ? { ...x, quantity: x.quantity + delta } : x).filter((x) => x.quantity > 0));
  const subtotal = cart.reduce((sum, x) => sum + Number(calculatePrice(x.item.baseKfcPrice, x.item.sellingPrice) || x.item.baseKfcPrice || 0) * x.quantity, 0);
  const discountAmount = Math.min(subtotal, Math.max(0, discountType === 'percent' ? subtotal * Math.min(100, discount) / 100 : discount));
  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const taxAmount = taxableSubtotal * Math.min(100, Math.max(0, taxPercentage)) / 100;
  const serviceChargeAmount = taxableSubtotal * Math.min(100, Math.max(0, serviceChargePercentage)) / 100;
  const validExtraAmount = Math.max(0, Number(extraAmount) || 0);
  const total = Math.max(0, taxableSubtotal + taxAmount + serviceChargeAmount + (orderType === 'delivery' ? Math.max(0, deliveryFee) : 0) + validExtraAmount);

  const printReceipt = (mode: 'bill' | 'kot' = 'bill') => {
    setPrintMode(mode);
    setTimeout(() => {
      window.print();
    }, 50);
  };
  const createOrder = async () => {
    if (!auth.currentUser) { setNotice('Admin login session nahi mili. Dobara login karein.'); return; }
    if (!cart.length) { setNotice('Pehle cart mein products add karein.'); return; }
    if (orderType === 'delivery' && (!customerName.trim() || !phone.trim() || !address.trim())) { setNotice('Delivery ke liye customer name, phone aur address zaroori hain.'); return; }
    setBusy(true); setNotice('');
    try {
      const id = 'POS-' + Date.now().toString().slice(-8);
      const items: CartItem[] = cart.map(({ item, quantity }) => ({
        cartItemId: 'pos-' + item.id + '-' + Date.now(),
        menuItem: item,
        quantity,
        unitPrice: Number(calculatePrice(item.baseKfcPrice, item.sellingPrice) || item.baseKfcPrice || 0),
        options: { addons: [], specialInstructions: '' },
      }));
      const order: Order & Record<string, any> = {
        id, date: new Date().toISOString(), createdAt: new Date().toISOString(),
        orderType, items, subtotal, markupAmount: 0,
        deliveryFee: orderType === 'delivery' ? Math.max(0, deliveryFee) : 0,
        discount: discountAmount, taxPercentage, taxAmount, serviceChargePercentage, serviceChargeAmount,
        extraAmount: validExtraAmount,
        extraAmountReason: extraAmountReason.trim(),
        total,
        customer: { fullName: customerName.trim() || 'Walk-in Customer', phone: phone.trim(), email: email.trim(), address: address.trim(), notes: notes.trim() },
        specialInstructions: notes.trim(), paymentMethod: payment, paymentReceived: payment === 'cod' ? total : 0, paymentStatus: payment === 'cod' ? 'paid' : 'unpaid', status: 'confirmed',
        source: 'admin-pos', createdBy: auth.currentUser.uid,
      };
      const quantities = new Map<string, number>();
      cart.forEach(({ item, quantity }) => { if (item.trackInventory) quantities.set(item.id, (quantities.get(item.id) || 0) + quantity); });
      await runTransaction(db, async (transaction) => {
        const entries = Array.from(quantities.entries());
        const refs = entries.map(([productId]) => doc(db, 'products', productId));
        const snapshots = [];
        for (const ref of refs) snapshots.push(await transaction.get(ref));
        snapshots.forEach((snapshot, index) => {
          const [productId, quantity] = entries[index];
          const item = cart.find((line) => line.item.id === productId)?.item;
          if (!snapshot.exists()) throw new Error(`Inventory record missing for ${item?.name || productId}.`);
          const data = snapshot.data();
          if (data.trackInventory === true) {
            const available = Math.max(0, Number(data.stockQuantity || 0));
            if (available < quantity) throw new Error(`${item?.name || 'Product'} ka stock sirf ${available} available hai.`);
            transaction.update(refs[index], { stockQuantity: available - quantity, updatedAt: new Date().toISOString() });
          }
        });
        transaction.set(doc(db, 'orders', id), JSON.parse(JSON.stringify(order)));
      });
      setReceiptOrder(order);
      setNotice('Order ' + id + ' save ho gaya. Ab Sales Bill ya KOT print kar sakte hain.');
      onOrderCreated?.();
    } catch (e: any) {
      setNotice('Order save nahi hua: ' + (e?.message || 'Firebase error'));
    } finally { setBusy(false); }
  };

  return <div className="space-y-4">
    <style>{`
      @media print {
        body * { visibility: hidden !important; }
        #kfc-pos-receipt, #kfc-pos-receipt * { visibility: visible !important; }
        #kfc-pos-receipt { position: absolute; inset: 0 auto auto 0; width: 100%; color: #000 !important; background: #fff !important; padding: 8mm; }
        .pos-no-print { display: none !important; }
        @page { margin: 5mm; }
        #kfc-pos-receipt.thermal { width: 72mm; padding: 2mm; font-size: 11px; }
        #kfc-pos-receipt.a4 { width: 190mm; padding: 8mm; font-size: 13px; }
      }
    `}</style>
    <div className="pos-no-print flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div><h2 className="text-2xl font-black text-zinc-900">Restaurant POS</h2><p className="text-sm text-zinc-500">Fast billing · Cash/COD · Thermal aur A4 receipt</p></div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => printReceipt('bill')}
          disabled={!receiptOrder}
          className="rounded-xl bg-[#e4002b] text-white px-4 py-2 text-sm font-black disabled:opacity-40 flex items-center gap-2 shadow-sm"
        >
          <Printer size={16}/> Print Bill / Receipt
        </button>
        <button
          type="button"
          onClick={() => printReceipt('kot')}
          disabled={!receiptOrder}
          className="rounded-xl border border-zinc-800 bg-zinc-900 text-white px-4 py-2 text-sm font-black disabled:opacity-40 flex items-center gap-2 shadow-sm"
        >
          <Printer size={16}/> Print KOT (Kitchen Ticket)
        </button>
        <button
          type="button"
          onClick={() => {
            setCart([]);
            setReceiptOrder(null);
            setExtraAmount(0);
            setExtraAmountReason('');
            setCashTendered('');
            setNotice('New bill ready.');
          }}
          className="rounded-xl border border-zinc-300 bg-white hover:bg-zinc-100 px-4 py-2 text-sm font-bold text-zinc-800"
        >
          New Bill
        </button>
      </div>
    </div>
    {notice && <div role="status" className="pos-no-print rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 font-bold">{notice}</div>}
    <div className="pos-no-print grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
      <section className="rounded-2xl border bg-white p-4 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <label className="relative block">
              <Search size={17} className="absolute left-3 top-3 text-zinc-400"/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search product name, SKU or barcode..." autoComplete="off" className="w-full rounded-xl border border-zinc-300 py-2.5 pl-9 pr-3 text-sm focus:border-[#e4002b] focus:outline-none"/>
            </label>
            {search.trim() && <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-72 overflow-y-auto rounded-xl border border-zinc-200 bg-white shadow-xl">
              {menuItems.filter(item => item.isAvailable !== false && (item.name.toLowerCase().includes(search.trim().toLowerCase()) || String(item.description || '').toLowerCase().includes(search.trim().toLowerCase()) || String(item.categoryId).toLowerCase().includes(search.trim().toLowerCase()) || String(item.sku || '').toLowerCase().includes(search.trim().toLowerCase()) || String(item.barcode || '').toLowerCase().includes(search.trim().toLowerCase()))).slice(0,8).map(item=><button type="button" key={item.id} onClick={()=>{setCategory('all');add(item);setSearch('');}} className="flex w-full items-center gap-3 border-b border-zinc-100 px-3 py-2 text-left hover:bg-red-50">
                {item.image && <img src={item.image} alt="" className="h-9 w-9 rounded-md object-cover"/>}<span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold text-zinc-900">{item.name}</span><span className="block text-[10px] text-zinc-500">{String(item.categoryId).replace(/-/g,' ')}</span></span><span className="text-xs font-black text-red-600">{formatPKR(Number(calculatePrice(item.baseKfcPrice,item.sellingPrice)||item.baseKfcPrice||0))}</span>
              </button>)}
              {!menuItems.some(item=>item.isAvailable !== false && (item.name.toLowerCase().includes(search.trim().toLowerCase()) || String(item.description || '').toLowerCase().includes(search.trim().toLowerCase()) || String(item.categoryId).toLowerCase().includes(search.trim().toLowerCase()))) && <p className="p-3 text-xs text-zinc-500">No matching products.</p>}
            </div>}
          </div>
          <div className="flex flex-wrap gap-1.5 items-center">
            <button
              type="button"
              onClick={() => setCategory('all')}
              className={`px-3 py-2 rounded-xl text-xs font-black transition ${
                category === 'all'
                  ? 'bg-[#e4002b] text-white shadow-sm ring-2 ring-[#e4002b]/30'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200'
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition capitalize ${
                  category === c
                    ? 'bg-[#e4002b] text-white shadow-sm ring-2 ring-[#e4002b]/30'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200'
                }`}
              >
                {String(c).replace(/-/g, ' ')}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 pt-2">
          {visibleItems.map(item=><button key={item.id} onClick={()=>add(item)} className="flex min-h-32 flex-col rounded-xl border border-zinc-200 p-3 text-left transition hover:border-[#e4002b] hover:shadow-sm active:scale-[.99] bg-white">
            {item.image && <img loading="lazy" src={item.image} alt="" className="mb-2 h-20 w-full rounded-lg object-contain bg-zinc-50 p-1"/>}
            <span className="line-clamp-2 text-xs font-bold text-zinc-900">{item.name}</span>
            <span className="mt-auto pt-2 text-sm font-black text-[#e4002b]">{formatPKR(Number(calculatePrice(item.baseKfcPrice, item.sellingPrice) || item.baseKfcPrice || 0))}</span>
            <span className="mt-1 text-[11px] font-bold text-zinc-500 bg-zinc-100 rounded px-2 py-0.5 text-center">+ Add to Bill</span>
          </button>)}
        </div>
        {!visibleItems.length && <p className="py-10 text-center text-sm text-zinc-500">Koi product nahi mila.</p>}
      </section>

      {/* POS Billing & Cart Sidebar */}
      <section className="space-y-4 rounded-2xl border bg-white p-4 shadow-sm">
        <h3 className="flex items-center gap-2 text-lg font-black text-zinc-900">
          <ShoppingCart size={19} className="text-[#e4002b]"/> Current Bill <span className="ml-auto text-xs font-bold text-zinc-500 bg-zinc-100 px-2 py-1 rounded-full">{cart.reduce((s,x)=>s+x.quantity,0)} items</span>
        </h3>
        <div className="max-h-56 space-y-2 overflow-auto pr-1">
          {cart.map(line=><div key={line.item.id} className="flex items-center gap-2 rounded-xl bg-zinc-50 p-2.5 border border-zinc-200/70">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-zinc-900">{line.item.name}</p>
              <p className="text-[11px] text-zinc-500 font-mono">{formatPKR(Number(calculatePrice(line.item.baseKfcPrice, line.item.sellingPrice) || line.item.baseKfcPrice || 0))} each</p>
            </div>
            <button aria-label="Decrease quantity" onClick={()=>changeQty(line.item.id,-1)} className="rounded-lg border border-zinc-300 bg-white p-1 hover:bg-zinc-100"><Minus size={13}/></button>
            <span className="w-5 text-center text-xs font-black">{line.quantity}</span>
            <button aria-label="Increase quantity" onClick={()=>changeQty(line.item.id,1)} className="rounded-lg border border-zinc-300 bg-white p-1 hover:bg-zinc-100"><Plus size={13}/></button>
            <button aria-label="Remove item" onClick={()=>setCart(p=>p.filter(x=>x.item.id!==line.item.id))} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14}/></button>
          </div>)}
          {!cart.length && <p className="text-center py-6 text-xs text-zinc-400">Cart khali hai. Click items on the left to add.</p>}
        </div>

        {/* Order Type & Payment Method Pill Selectors with High Contrast Color Change */}
        <div className="space-y-3 pt-2 border-t border-zinc-200">
          <div>
            <label className="block text-[11px] font-black uppercase text-zinc-600 tracking-wider mb-1.5">Order Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOrderType('delivery')}
                className={`py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  orderType === 'delivery'
                    ? 'bg-[#e4002b] text-white border-2 border-[#e4002b] shadow-sm ring-2 ring-[#e4002b]/30'
                    : 'bg-zinc-50 text-zinc-700 border border-zinc-300 hover:bg-zinc-100'
                }`}
              >
                <span>🛵 Doorstep Delivery</span>
              </button>
              <button
                type="button"
                onClick={() => setOrderType('self_pickup')}
                className={`py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  orderType === 'self_pickup'
                    ? 'bg-[#e4002b] text-white border-2 border-[#e4002b] shadow-sm ring-2 ring-[#e4002b]/30'
                    : 'bg-zinc-50 text-zinc-700 border border-zinc-300 hover:bg-zinc-100'
                }`}
              >
                <span>🛍️ Takeaway / Pickup</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase text-zinc-600 tracking-wider mb-1.5">Payment Method</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {([
                { id: 'cod', label: 'Cash (COD)' },
                { id: 'jazzcash', label: 'JazzCash' },
                { id: 'easypaisa', label: 'EasyPaisa' },
                { id: 'bank_transfer', label: 'Bank' },
              ] as const).map((pm) => (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => setPayment(pm.id)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition text-center cursor-pointer ${
                    payment === pm.id
                      ? 'bg-[#e4002b] text-white border-2 border-[#e4002b] shadow-xs ring-2 ring-[#e4002b]/30'
                      : 'bg-zinc-50 text-zinc-700 border border-zinc-300 hover:bg-zinc-100'
                  }`}
                >
                  {pm.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Customer Details Container */}
        <div className="space-y-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
          <p className="text-xs font-black text-zinc-800">Customer details {orderType === 'delivery' ? '(required for delivery)' : '(optional for pickup)'}</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <input value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder="Customer name" required={orderType === 'delivery'} className="w-full rounded-lg border border-zinc-300 bg-white p-2 text-xs focus:border-[#e4002b] focus:outline-none"/>
            <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="03xx xxxxxxx" inputMode="tel" required={orderType === 'delivery'} className="w-full rounded-lg border border-zinc-300 bg-white p-2 text-xs focus:border-[#e4002b] focus:outline-none font-mono"/>
          </div>
          <input value={address} onChange={e=>setAddress(e.target.value)} placeholder={orderType === 'delivery' ? 'Delivery address in Chakwal' : 'Pickup note (optional)'} required={orderType === 'delivery'} className="w-full rounded-lg border border-zinc-300 bg-white p-2 text-xs focus:border-[#e4002b] focus:outline-none"/>
        </div>

        {/* Kitchen Notes */}
        <div>
          <label className="block text-[11px] font-bold text-zinc-700 mb-1">Kitchen / Cooking Notes</label>
          <input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="e.g. Extra crispy, 2 extra ketchup, no mayo..." className="w-full rounded-lg border border-zinc-300 bg-white p-2 text-xs focus:border-[#e4002b] focus:outline-none"/>
        </div>

        {/* Discounts & Taxes */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-zinc-700 mb-1">Discount</label>
            <div className="flex gap-1">
              <input type="number" min="0" value={discount} onChange={e=>setDiscount(Math.max(0,Number(e.target.value)||0))} className="w-full rounded-lg border border-zinc-300 p-2 text-xs"/>
              <select value={discountType} onChange={e=>setDiscountType(e.target.value as any)} className="rounded-lg border border-zinc-300 p-1 text-[11px]">
                <option value="fixed">Rs</option>
                <option value="percent">%</option>
              </select>
            </div>
          </div>
          {orderType === 'delivery' ? (
            <div>
              <label className="block text-[11px] font-bold text-zinc-700 mb-1">Delivery Fee (Rs)</label>
              <input type="number" min="0" value={deliveryFee} onChange={e=>setDeliveryFee(Math.max(0,Number(e.target.value)||0))} className="w-full rounded-lg border border-zinc-300 p-2 text-xs"/>
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-bold text-zinc-700 mb-1">Tax (%)</label>
              <input type="number" min="0" max="100" value={taxPercentage} onChange={e=>setTaxPercentage(Math.min(100,Math.max(0,Number(e.target.value)||0)))} className="w-full rounded-lg border border-zinc-300 p-2 text-xs"/>
            </div>
          )}
        </div>

        {/* Extra Amount Option with Reason / Detail (Requested feature) */}
        <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-900 flex items-center gap-1">
              <span>➕ Extra Charges / Custom Surcharge</span>
            </span>
            <span className="text-[10px] text-amber-700 font-bold uppercase">Optional</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] gap-2">
            <div>
              <label className="block text-[10px] font-bold text-amber-800 mb-0.5">Amount (PKR)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={extraAmount || ''}
                onChange={(e) => setExtraAmount(Math.max(0, Number(e.target.value) || 0))}
                placeholder="0"
                className="w-full rounded-lg border border-amber-300 bg-white p-2 text-xs font-bold text-amber-950 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-amber-800 mb-0.5">Reason / Detail</label>
              <input
                type="text"
                value={extraAmountReason}
                onChange={(e) => setExtraAmountReason(e.target.value)}
                placeholder="e.g. Packing box, special dips, late night fee..."
                className="w-full rounded-lg border border-amber-300 bg-white p-2 text-xs text-amber-950 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[
              { label: '+50 Box Packing', amt: 50, r: 'Box Packing' },
              { label: '+100 Urgent Express', amt: 100, r: 'Express Fast Service' },
              { label: '+150 Custom Item', amt: 150, r: 'Custom Food Addon' },
              { label: '+200 Special Packing', amt: 200, r: 'Heavy Duty Thermal Bag' },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setExtraAmount(preset.amt);
                  setExtraAmountReason(preset.r);
                }}
                className="text-[10px] font-bold bg-white hover:bg-amber-100 border border-amber-300 text-amber-900 px-2 py-1 rounded-md cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
            {extraAmount > 0 && (
              <button
                type="button"
                onClick={() => { setExtraAmount(0); setExtraAmountReason(''); }}
                className="text-[10px] font-bold text-red-600 hover:underline px-1"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Bill Calculations breakdown */}
        <div className="space-y-1.5 border-t border-zinc-200 pt-3 text-xs">
          <div className="flex justify-between text-zinc-600"><span>Subtotal:</span><span className="font-mono">{formatPKR(subtotal)}</span></div>
          {discountAmount > 0 && <div className="flex justify-between text-emerald-600 font-bold"><span>Discount:</span><span className="font-mono">-{formatPKR(discountAmount)}</span></div>}
          {orderType === 'delivery' && <div className="flex justify-between text-zinc-600"><span>Delivery Fee:</span><span className="font-mono">{formatPKR(deliveryFee)}</span></div>}
          {validExtraAmount > 0 && (
            <div className="flex justify-between text-amber-700 font-bold">
              <span>Extra ({extraAmountReason || 'Additional Charge'}):</span>
              <span className="font-mono">+{formatPKR(validExtraAmount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-zinc-200 pt-2 text-lg font-black text-zinc-950">
            <span>Total Payable:</span>
            <span className="text-[#e4002b] font-mono">{formatPKR(total)}</span>
          </div>
        </div>

        {/* Cash Tendered & Change Return Calculator */}
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-zinc-700">Cash Received from Customer:</span>
            {Number(cashTendered) > total && (
              <span className="text-emerald-700 font-black">
                Change Return: {formatPKR(Number(cashTendered) - total)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              value={cashTendered}
              onChange={(e) => setCashTendered(e.target.value ? Number(e.target.value) : '')}
              placeholder={`Rs ${total}`}
              className="w-full rounded-lg border border-zinc-300 bg-white p-2 text-xs font-mono font-bold"
            />
            <button
              type="button"
              onClick={() => setCashTendered(total)}
              className="shrink-0 text-[11px] font-bold bg-zinc-200 hover:bg-zinc-300 px-2.5 py-2 rounded-lg"
            >
              Exact
            </button>
            <button
              type="button"
              onClick={() => setCashTendered(Math.ceil(total / 500) * 500 || 500)}
              className="shrink-0 text-[11px] font-bold bg-zinc-200 hover:bg-zinc-300 px-2.5 py-2 rounded-lg"
            >
              Next 500
            </button>
            <button
              type="button"
              onClick={() => setCashTendered(Math.ceil(total / 1000) * 1000 || 1000)}
              className="shrink-0 text-[11px] font-bold bg-zinc-200 hover:bg-zinc-300 px-2.5 py-2 rounded-lg"
            >
              Next 1000
            </button>
          </div>
        </div>

        <button onClick={createOrder} disabled={busy || !cart.length} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#e4002b] hover:bg-[#c30025] px-4 py-3.5 font-black text-white text-sm shadow-md cursor-pointer transition disabled:opacity-50">
          {busy ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              <span>Saving Order in System...</span>
            </span>
          ) : (
            <><CheckCircle2 size={18}/> Save Order & Generate Bill</>
          )}
        </button>
      </section>
    </div>

    {/* POS Print Voucher / Receipt (Supports both Bill and KOT Kitchen Ticket) */}
    <section id="kfc-pos-receipt" className="a4 mx-auto max-w-3xl rounded-2xl border bg-white p-6 text-zinc-950 print:border-0 print:shadow-none">
      {receiptOrder ? (
        printMode === 'kot' ? (
          /* ============================================================== */
          /* KITCHEN ORDER TICKET (KOT) — ZERO PRICES, FOCUSED ON COOKING  */
          /* ============================================================== */
          <div className="space-y-4">
            <div className="text-center border-b-2 border-black pb-3">
              <span className="inline-block bg-black text-white px-3 py-1 text-sm font-black uppercase rounded">KITCHEN ORDER TICKET (KOT)</span>
              <h2 className="text-xl font-black uppercase mt-1">{settings.storeName || 'KFC Chakwal Delivery'}</h2>
              <p className="text-xs font-mono font-bold mt-1">Ticket #{receiptOrder.id} · {new Date(receiptOrder.date).toLocaleTimeString('en-PK')}</p>
              <p className="text-xs font-black uppercase mt-0.5 text-[#e4002b]">
                {receiptOrder.orderType === 'self_pickup' ? '🛍️ TAKEAWAY / PICKUP' : '🛵 DOORSTEP DELIVERY'}
              </p>
            </div>

            <div className="bg-zinc-100 p-2.5 rounded-lg text-xs font-bold space-y-1">
              <div>Customer: <strong>{receiptOrder.customer.fullName}</strong> ({receiptOrder.customer.phone || 'No phone'})</div>
              {receiptOrder.specialInstructions && (
                <div className="text-red-700 bg-red-100 p-1.5 rounded font-black">
                  ⚠️ Kitchen Instructions: {receiptOrder.specialInstructions}
                </div>
              )}
            </div>

            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="py-2 text-center w-12">QTY</th>
                  <th className="py-2">ITEM & COOKING PREFERENCES</th>
                </tr>
              </thead>
              <tbody>
                {receiptOrder.items.map((i, idx) => (
                  <tr key={idx} className="border-b border-dashed border-zinc-400">
                    <td className="py-2 text-center font-black text-lg">{i.quantity}x</td>
                    <td className="py-2 font-bold">
                      <div>{i.menuItem.name}</div>
                      {i.options?.spiceLevel && <div className="text-xs text-red-600 font-semibold">• Flavor: {i.options.spiceLevel}</div>}
                      {i.options?.drink && <div className="text-xs text-zinc-600">• Drink: {i.options.drink}</div>}
                      {i.options?.specialInstructions && <div className="text-xs text-amber-700">• Note: {i.options.specialInstructions}</div>}
                      {i.options?.addons && i.options.addons.length > 0 && (
                        <div className="text-xs text-zinc-600">• Add-ons: {i.options.addons.map(a => a.name).join(', ')}</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-center text-xs font-bold pt-2 border-t border-zinc-300">Ready in kitchen · Pack fresh & crispy!</p>
          </div>
        ) : (
          /* ============================================================== */
          /* STANDARD SALES BILL / TAX INVOICE                             */
          /* ============================================================== */
          <>
            <div className="mb-5 border-b-2 border-dashed pb-4 text-center">
              <h1 className="text-2xl font-black uppercase text-[#e4002b]">{settings.storeName || 'KFC Chakwal Delivery'}</h1>
              <p className="text-sm">{settings.storeAddress}</p>
              <p className="text-sm">Helpline: {settings.phone}</p>
              <h2 className="mt-3 text-lg font-black uppercase tracking-wider">SALES BILL / RECEIPT</h2>
              <p className="text-sm font-mono">Order #{receiptOrder.id} · {new Date(receiptOrder.date).toLocaleString()}</p>
            </div>
            <div className="mb-4 text-sm space-y-1 bg-zinc-50 p-3 rounded-xl border border-zinc-200">
              <p><b>Customer:</b> {receiptOrder.customer.fullName}</p>
              <p><b>Phone:</b> {receiptOrder.customer.phone}</p>
              <p><b>Address:</b> {receiptOrder.customer.address || 'Self Pickup'}</p>
              <p><b>Payment:</b> {receiptOrder.paymentMethod.toUpperCase()}</p>
              {receiptOrder.specialInstructions && <p><b>Instructions:</b> {receiptOrder.specialInstructions}</p>}
            </div>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b"><th className="py-2">Item</th><th>Qty</th><th>Price</th><th className="text-right">Amount</th></tr>
              </thead>
              <tbody>
                {receiptOrder.items.map(i=><tr key={i.cartItemId} className="border-b border-dashed"><td className="py-2 font-medium">{i.menuItem.name}</td><td>{i.quantity}</td><td>{money(i.unitPrice)}</td><td className="text-right font-mono">{money(i.unitPrice*i.quantity)}</td></tr>)}
              </tbody>
            </table>
            <div className="ml-auto mt-4 max-w-xs space-y-1.5 text-sm">
              <p className="flex justify-between"><span>Subtotal:</span><b>{money(receiptOrder.subtotal)}</b></p>
              {receiptOrder.discount > 0 && <p className="flex justify-between text-emerald-600"><span>Discount:</span><b>-{money(receiptOrder.discount)}</b></p>}
              {receiptOrder.extraAmount && receiptOrder.extraAmount > 0 && (
                <p className="flex justify-between text-amber-700 font-bold">
                  <span>Extra ({receiptOrder.extraAmountReason || 'Extra'}):</span>
                  <b>+{money(receiptOrder.extraAmount)}</b>
                </p>
              )}
              <p className="flex justify-between"><span>Delivery:</span><b>{money(receiptOrder.deliveryFee)}</b></p>
              <p className="flex justify-between border-t-2 pt-2 text-lg font-black text-[#e4002b]"><span>Total:</span><b>{money(receiptOrder.total)}</b></p>
              <p className="flex justify-between"><span>Received:</span><b>{money(receiptOrder.paymentReceived || 0)}</b></p>
              <p className="flex justify-between"><span>Balance:</span><b>{money(Math.max(0, receiptOrder.total - (receiptOrder.paymentReceived || 0)))}</b></p>
            </div>
            <p className="mt-6 border-t border-dashed pt-4 text-center text-xs text-zinc-500">
              Shukriya for choosing KFC Chakwal Delivery · Hot, fresh & crispy!
            </p>
          </>
        )
      ) : (
        <div className="py-10 text-center text-zinc-400">
          <Receipt className="mx-auto mb-2" size={28}/>
          <p>Saved order ki receipt ya KOT yahan nazar aaye gi.</p>
        </div>
      )}
      <div className="pos-no-print mt-4 flex flex-wrap justify-center gap-2">
        <button onClick={()=>{const el=document.getElementById('kfc-pos-receipt');el?.classList.remove('a4');el?.classList.add('thermal');window.print();}} className="rounded-xl border border-zinc-300 bg-white hover:bg-zinc-100 px-4 py-2 text-sm font-bold cursor-pointer">
          <Printer size={15} className="mr-2 inline"/>Thermal 58/80mm
        </button>
        <button onClick={()=>{const el=document.getElementById('kfc-pos-receipt');el?.classList.remove('thermal');el?.classList.add('a4');window.print();}} className="rounded-xl border border-zinc-300 bg-white hover:bg-zinc-100 px-4 py-2 text-sm font-bold cursor-pointer">
          <Printer size={15} className="mr-2 inline"/>A4 Full Page
        </button>
      </div>
    </section>
  </div>;
};
