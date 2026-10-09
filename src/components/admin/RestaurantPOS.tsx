import React, { useMemo, useState } from 'react';
import { Search, Plus, Minus, Trash2, Printer, Receipt, ShoppingCart, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { auth, db } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
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
  const [address, setAddress] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [payment, setPayment] = useState<'cod' | 'jazzcash' | 'easypaisa' | 'bank_transfer'>('cod');
  const [deliveryFee, setDeliveryFee] = useState(Number(settings.deliveryFee || 0));
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('fixed');
  const [taxPercentage, setTaxPercentage] = useState(0);
  const [serviceChargePercentage, setServiceChargePercentage] = useState(0);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  const categories = useMemo(() => [...new Set(menuItems.map((i) => i.categoryId))], [menuItems]);
  const visibleItems = useMemo(() => menuItems.filter((item) =>
    (category === 'all' || item.categoryId === category) &&
    (!search.trim() || item.name.toLowerCase().includes(search.trim().toLowerCase())) &&
    item.isAvailable !== false
  ), [menuItems, category, search]);

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
  const total = Math.max(0, taxableSubtotal + taxAmount + serviceChargeAmount + (orderType === 'delivery' ? Math.max(0, deliveryFee) : 0));

  const printReceipt = () => window.print();
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
        discount: discountAmount, taxPercentage, taxAmount, serviceChargePercentage, serviceChargeAmount, total,
        customer: { fullName: orderType === 'delivery' ? customerName.trim() : (customerName.trim() || 'Walk-in Customer'), phone: orderType === 'delivery' ? phone.trim() : phone.trim(), address: orderType === 'delivery' ? address.trim() : '', notes: notes.trim() },
        specialInstructions: notes.trim(), paymentMethod: payment, status: 'confirmed',
        source: 'admin-pos', createdBy: auth.currentUser.uid,
      };
      await setDoc(doc(db, 'orders', id), JSON.parse(JSON.stringify(order)));
      setReceiptOrder(order);
      setNotice('Order ' + id + ' save ho gaya. Ab receipt print kar sakte hain.');
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
      <div className="flex flex-wrap gap-2"><button onClick={printReceipt} disabled={!receiptOrder} className="rounded-xl border px-4 py-2 text-sm font-bold disabled:opacity-40 flex items-center gap-2"><Printer size={16}/> Print Receipt</button><button onClick={()=>{setCart([]);setReceiptOrder(null);setNotice('New bill ready.')}} className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-bold text-white">New Bill</button></div>
    </div>
    {notice && <div role="status" className="pos-no-print rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{notice}</div>}
    <div className="pos-no-print grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
      <section className="rounded-2xl border bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1"><Search size={17} className="absolute left-3 top-3 text-zinc-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Product search..." className="w-full rounded-xl border py-2.5 pl-9 pr-3"/></label>
          <select value={category} onChange={e=>setCategory(e.target.value)} className="rounded-xl border px-3 py-2"><option value="all">All categories</option>{categories.map(c=><option key={c} value={c}>{String(c).replace(/-/g,' ')}</option>)}</select>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {visibleItems.map(item=><button key={item.id} onClick={()=>add(item)} className="flex min-h-32 flex-col rounded-xl border p-3 text-left transition hover:border-red-400 hover:shadow-sm active:scale-[.99]">
            {item.image && <img loading="lazy" src={item.image} alt="" className="mb-2 h-20 w-full rounded-lg object-contain"/>}
            <span className="line-clamp-2 text-sm font-bold">{item.name}</span><span className="mt-auto pt-2 text-sm font-black text-red-600">{formatPKR(Number(calculatePrice(item.baseKfcPrice, item.sellingPrice) || item.baseKfcPrice || 0))}</span><span className="mt-1 text-xs text-zinc-500">+ Add</span>
          </button>)}
        </div>
        {!visibleItems.length && <p className="py-10 text-center text-sm text-zinc-500">Koi product nahi mila.</p>}
      </section>
      <section className="space-y-4 rounded-2xl border bg-white p-4">
        <h3 className="flex items-center gap-2 text-lg font-black"><ShoppingCart size={19}/> Current Bill <span className="ml-auto text-sm text-zinc-500">{cart.reduce((s,x)=>s+x.quantity,0)} items</span></h3>
        <div className="max-h-64 space-y-2 overflow-auto">{cart.map(line=><div key={line.item.id} className="flex items-center gap-2 rounded-xl bg-zinc-50 p-2"><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{line.item.name}</p><p className="text-xs text-zinc-500">{formatPKR(Number(calculatePrice(line.item.baseKfcPrice, line.item.sellingPrice) || line.item.baseKfcPrice || 0))} each</p></div><button aria-label="Decrease quantity" onClick={()=>changeQty(line.item.id,-1)} className="rounded-lg border bg-white p-1.5"><Minus size={14}/></button><span className="w-5 text-center text-sm font-bold">{line.quantity}</span><button aria-label="Increase quantity" onClick={()=>changeQty(line.item.id,1)} className="rounded-lg border bg-white p-1.5"><Plus size={14}/></button><button aria-label="Remove item" onClick={()=>setCart(p=>p.filter(x=>x.item.id!==line.item.id))} className="p-1.5 text-red-600"><Trash2 size={15}/></button></div>)}</div>
        <div className="grid grid-cols-2 gap-2"><label className="text-xs font-bold">Order type<select value={orderType} onChange={e=>setOrderType(e.target.value as OrderType)} className="mt-1 w-full rounded-lg border p-2 text-sm"><option value="delivery">Delivery</option><option value="self_pickup">Takeaway / Pickup</option></select></label><label className="text-xs font-bold">Payment<select value={payment} onChange={e=>setPayment(e.target.value as any)} className="mt-1 w-full rounded-lg border p-2 text-sm"><option value="cod">Cash</option><option value="jazzcash">JazzCash</option><option value="easypaisa">Easypaisa</option><option value="bank_transfer">Bank transfer</option></select></label></div>
        {orderType === 'delivery' && <><div className="grid grid-cols-2 gap-2"><label className="text-xs font-bold">Customer name *<input value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder="Customer name" required className="mt-1 w-full rounded-lg border p-2.5 text-sm"/></label><label className="text-xs font-bold">Phone *<input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="03xx xxxxxxx" inputMode="tel" required className="mt-1 w-full rounded-lg border p-2.5 text-sm"/></label></div><label className="block text-xs font-bold">Delivery address *<input value={address} onChange={e=>setAddress(e.target.value)} placeholder="Customer delivery address" required className="mt-1 w-full rounded-lg border p-2.5 text-sm"/></label></>}
        <label className="block text-xs font-bold">Kitchen notes<textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="No onion, extra crispy..." rows={2} className="mt-1 w-full rounded-lg border p-2.5 text-sm"/></label>
        <div className="grid grid-cols-[1fr_auto] gap-2"><label className="text-xs font-bold">Discount<input type="number" min="0" value={discount} onChange={e=>setDiscount(Math.max(0,Number(e.target.value)||0))} className="mt-1 w-full rounded-lg border p-2.5 text-sm"/></label><select value={discountType} onChange={e=>setDiscountType(e.target.value as any)} aria-label="Discount type" className="mt-5 rounded-lg border p-2 text-sm"><option value="fixed">Rs off</option><option value="percent">% off</option></select></div>
        <div className="grid grid-cols-2 gap-2"><label className="text-xs font-bold">Tax (%)<input type="number" min="0" max="100" value={taxPercentage} onChange={e=>setTaxPercentage(Math.min(100,Math.max(0,Number(e.target.value)||0)))} className="mt-1 w-full rounded-lg border p-2.5 text-sm"/></label><label className="text-xs font-bold">Service charge (%)<input type="number" min="0" max="100" value={serviceChargePercentage} onChange={e=>setServiceChargePercentage(Math.min(100,Math.max(0,Number(e.target.value)||0)))} className="mt-1 w-full rounded-lg border p-2.5 text-sm"/></label></div>
        {orderType==='delivery' && <label className="block text-xs font-bold">Delivery fee (PKR)<input type="number" min="0" value={deliveryFee} onChange={e=>setDeliveryFee(Math.max(0,Number(e.target.value)||0))} className="mt-1 w-full rounded-lg border p-2.5 text-sm"/></label>}
        <div className="space-y-2 border-t pt-3 text-sm"><div className="flex justify-between"><span>Subtotal</span><span>{formatPKR(subtotal)}</span></div><div className="flex justify-between"><span>Discount</span><span>- {formatPKR(discountAmount)}</span></div><div className="flex justify-between"><span>Tax ({taxPercentage}%)</span><span>{formatPKR(taxAmount)}</span></div><div className="flex justify-between"><span>Service charge ({serviceChargePercentage}%)</span><span>{formatPKR(serviceChargeAmount)}</span></div><div className="flex justify-between"><span>Delivery</span><span>{formatPKR(orderType==='delivery'?deliveryFee:0)}</span></div><div className="flex justify-between border-t pt-2 text-xl font-black"><span>Total</span><span>{formatPKR(total)}</span></div></div>
        <button onClick={createOrder} disabled={busy || !cart.length} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#e4002b] px-4 py-3.5 font-black text-white disabled:opacity-50">{busy?'Saving order...':<><CheckCircle2 size={18}/> Save Order & Prepare Receipt</>}</button>
      </section>
    </div>
    <section id="kfc-pos-receipt" className="a4 mx-auto max-w-3xl rounded-2xl border bg-white p-6 text-zinc-950 print:border-0 print:shadow-none">
      {receiptOrder ? <><div className="mb-5 border-b-2 border-dashed pb-4 text-center"><h1 className="text-2xl font-black uppercase">{settings.storeName || 'KFC Chakwal Delivery'}</h1><p className="text-sm">{settings.storeAddress}</p><p className="text-sm">{settings.phone}</p><h2 className="mt-3 text-lg font-black">SALES RECEIPT</h2><p className="text-sm">Order: {receiptOrder.id} · {new Date(receiptOrder.date).toLocaleString()}</p></div><div className="mb-4 text-sm"><p><b>Customer:</b> {receiptOrder.customer.fullName}</p><p><b>Phone:</b> {receiptOrder.customer.phone}</p><p><b>Address:</b> {receiptOrder.customer.address || 'Pickup'}</p><p><b>Payment:</b> {receiptOrder.paymentMethod.toUpperCase()}</p></div><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-2">Item</th><th>Qty</th><th>Price</th><th className="text-right">Amount</th></tr></thead><tbody>{receiptOrder.items.map(i=><tr key={i.cartItemId} className="border-b border-dashed"><td className="py-2">{i.menuItem.name}</td><td>{i.quantity}</td><td>{money(i.unitPrice)}</td><td className="text-right">{money(i.unitPrice*i.quantity)}</td></tr>)}</tbody></table><div className="ml-auto mt-4 max-w-xs space-y-2 text-sm"><p className="flex justify-between"><span>Subtotal</span><b>{money(receiptOrder.subtotal)}</b></p><p className="flex justify-between"><span>Discount</span><b>-{money(receiptOrder.discount)}</b></p><p className="flex justify-between"><span>Tax ({receiptOrder.taxPercentage || 0}%)</span><b>{money(receiptOrder.taxAmount || 0)}</b></p><p className="flex justify-between"><span>Service charge ({receiptOrder.serviceChargePercentage || 0}%)</span><b>{money(receiptOrder.serviceChargeAmount || 0)}</b></p><p className="flex justify-between"><span>Delivery</span><b>{money(receiptOrder.deliveryFee)}</b></p><p className="flex justify-between border-t pt-2 text-lg"><span>Total</span><b>{money(receiptOrder.total)}</b></p></div><p className="mt-6 border-t border-dashed pt-4 text-center text-xs">Thank you for ordering · KFC Chakwal Delivery</p><div className="pos-no-print mt-4 flex flex-wrap justify-center gap-2"><button onClick={()=>{const el=document.getElementById('kfc-pos-receipt');el?.classList.remove('a4');el?.classList.add('thermal');window.print();}} className="rounded-xl border px-4 py-2 text-sm font-bold"><Printer size={15} className="mr-2 inline"/>Thermal 58/80mm</button><button onClick={()=>{const el=document.getElementById('kfc-pos-receipt');el?.classList.remove('thermal');el?.classList.add('a4');window.print();}} className="rounded-xl border px-4 py-2 text-sm font-bold"><Printer size={15} className="mr-2 inline"/>A4 Receipt</button></div></> : <div className="py-10 text-center text-zinc-400"><Receipt className="mx-auto mb-2" size={28}/><p>Saved order ki receipt yahan nazar aaye gi.</p></div>}
    </section>
  </div>;
};
