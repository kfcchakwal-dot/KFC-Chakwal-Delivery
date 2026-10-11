import React, { useEffect, useMemo, useState } from 'react';
import { Boxes, Plus, Truck, Wallet, Clock, CheckCircle2 } from 'lucide-react';
import { collection, deleteDoc, doc, onSnapshot, runTransaction, setDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { useStore } from '../../context/StoreContext';
import type { MenuItem } from '../../types';

type Vendor = { id: string; name: string; phone?: string; notes?: string; createdAt: string };
type PurchaseLine = { productId: string; quantity: number; unitCost: number };
type Purchase = { id: string; vendorId?: string | null; vendorName?: string; items: PurchaseLine[]; total: number; date: string; notes?: string };
type Shift = { id: string; openedAt: string; closedAt?: string; openingCash: number; closingCash?: number; expectedCash?: number; notes?: string; status: 'open' | 'closed' };

const money = (value: number) => 'Rs ' + Math.round(value).toLocaleString('en-PK');

export const InventoryOperations: React.FC = () => {
  const { isAdmin, menuItems, updateMenuItem, formatPKR, allOrders } = useStore();
  const [tab, setTab] = useState<'vendors' | 'purchases' | 'shifts'>('vendors');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [vendorName, setVendorName] = useState('');
  const [vendorPhone, setVendorPhone] = useState('');
  const [vendorNotes, setVendorNotes] = useState('');
  const [editingVendorId, setEditingVendorId] = useState<string | null>(null);
  const [purchaseVendor, setPurchaseVendor] = useState('');
  const [purchaseLines, setPurchaseLines] = useState<PurchaseLine[]>([{ productId: '', quantity: 1, unitCost: 0 }]);
  const [purchaseNotes, setPurchaseNotes] = useState('');
  const [openingCash, setOpeningCash] = useState('0');
  const [closingCash, setClosingCash] = useState('');
  const [shiftNotes, setShiftNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const trackedProducts = useMemo(() => menuItems.filter((item) => item.trackInventory), [menuItems]);

  useEffect(() => {
    if (!isAdmin || !auth.currentUser) return;
    const unsubs = [
      onSnapshot(query(collection(db, 'vendors'), orderBy('createdAt', 'desc')), (snap) => setVendors(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Vendor))), (error) => setNotice(error.message)),
      onSnapshot(query(collection(db, 'purchases'), orderBy('date', 'desc')), (snap) => setPurchases(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Purchase))), (error) => setNotice(error.message)),
      onSnapshot(query(collection(db, 'cashShifts'), orderBy('openedAt', 'desc')), (snap) => setShifts(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Shift))), (error) => setNotice(error.message)),
    ];
    return () => unsubs.forEach((unsubscribe) => unsubscribe());
  }, [isAdmin]);

  const addVendor = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!auth.currentUser || !isAdmin || !vendorName.trim()) return;
    setBusy(true);
    try {
      if (editingVendorId) {
        await updateDoc(doc(db, 'vendors', editingVendorId), { name: vendorName.trim(), phone: vendorPhone.trim(), notes: vendorNotes.trim(), updatedAt: new Date().toISOString() });
        setNotice('Vendor update ho gaya.');
      } else {
        const id = 'vendor-' + Date.now();
        await setDoc(doc(db, 'vendors', id), { id, name: vendorName.trim(), phone: vendorPhone.trim(), notes: vendorNotes.trim(), createdAt: new Date().toISOString(), createdBy: auth.currentUser.uid });
        setNotice('Vendor save ho gaya.');
      }
      setVendorName(''); setVendorPhone(''); setVendorNotes(''); setEditingVendorId(null);
    } catch (error: any) { setNotice(error?.message || 'Vendor save nahi hua.'); }
    finally { setBusy(false); }
  };

  const addPurchase = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!auth.currentUser || !isAdmin) return;
    const lines = purchaseLines.filter((line) => line.productId && line.quantity > 0 && line.unitCost >= 0);
    if (!lines.length) { setNotice('Purchase bill mein kam az kam ek product add karein.'); return; }
    const products = lines.map((line) => menuItems.find((item) => item.id === line.productId)).filter((item): item is MenuItem => Boolean(item));
    if (products.length !== lines.length) { setNotice('Koi product catalog mein nahi mila.'); return; }
    const id = 'purchase-' + Date.now();
    const total = lines.reduce((sum, line) => sum + line.quantity * line.unitCost, 0);
    const vendor = vendors.find((item) => item.id === purchaseVendor);
    setBusy(true);
    try {
      await runTransaction(db, async (transaction) => {
        const refs = lines.map((line) => doc(db, 'products', line.productId));
        const snapshots = [];
        for (const ref of refs) snapshots.push(await transaction.get(ref));
        snapshots.forEach((snapshot, index) => {
          const line = lines[index];
          const product = snapshot.exists() ? snapshot.data() : (products[index] as any);
          if (product.trackInventory === true) {
            const nextStock = Math.max(0, Number(product.stockQuantity || 0)) + line.quantity;
            if (snapshot.exists()) transaction.update(refs[index], { stockQuantity: nextStock, updatedAt: new Date().toISOString() });
            else transaction.set(refs[index], { ...products[index], stockQuantity: nextStock, updatedAt: new Date().toISOString() }, { merge: true });
          }
        });
        transaction.set(doc(db, 'purchases', id), { id, vendorId: purchaseVendor || null, vendorName: vendor?.name || 'Walk-in / no vendor', items: lines, total, date: new Date().toISOString(), notes: purchaseNotes.trim(), createdBy: auth.currentUser?.uid });
      });
      for (let index = 0; index < lines.length; index += 1) {
        const item = products[index];
        if (item.trackInventory) await updateMenuItem({ ...item, stockQuantity: Math.max(0, Number(item.stockQuantity || 0)) + lines[index].quantity });
      }
      setPurchaseLines([{ productId: '', quantity: 1, unitCost: 0 }]); setPurchaseVendor(''); setPurchaseNotes(''); setNotice('Purchase bill save ho gaya aur tracked inventory update ho gayi.');
    } catch (error: any) { setNotice(error?.message || 'Purchase save nahi hui.'); }
    finally { setBusy(false); }
  };

  const openShift = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!auth.currentUser || !isAdmin) return;
    if (shifts.some((shift) => shift.status === 'open')) { setNotice('Pehle current shift close karein.'); return; }
    setBusy(true);
    try {
      const id = 'shift-' + Date.now();
      await setDoc(doc(db, 'cashShifts', id), { id, openedAt: new Date().toISOString(), openingCash: Math.max(0, Number(openingCash || 0)), status: 'open', notes: shiftNotes.trim(), openedBy: auth.currentUser.uid });
      setNotice('Cash shift open ho gayi.');
    } catch (error: any) { setNotice(error?.message || 'Shift open nahi hui.'); }
    finally { setBusy(false); }
  };

  const closeShift = async (shift: Shift) => {
    if (!auth.currentUser || !isAdmin) return;
    const closing = Number(closingCash);
    if (!Number.isFinite(closing) || closing < 0) { setNotice('Closing cash sahi enter karein.'); return; }
    setBusy(true);
    try {
      const closedAt = new Date().toISOString();
      const cashSales = allOrders.filter((order) => (order as any).source === 'admin-pos' && order.paymentMethod === 'cod' && new Date(order.date).getTime() >= new Date(shift.openedAt).getTime() && new Date(order.date).getTime() <= new Date(closedAt).getTime()).reduce((sum, order) => sum + Number(order.total || 0), 0);
      const expected = Math.max(0, Number(shift.openingCash || 0) + cashSales);
      await updateDoc(doc(db, 'cashShifts', shift.id), { closedAt, closingCash: closing, cashSales, expectedCash: expected, cashVariance: closing - expected, status: 'closed', closedBy: auth.currentUser.uid, closingNotes: shiftNotes.trim() });
      setClosingCash(''); setShiftNotes(''); setNotice('Shift close ho gayi.');
    } catch (error: any) { setNotice(error?.message || 'Shift close nahi hui.'); }
    finally { setBusy(false); }
  };

  if (!isAdmin) return <div className="rounded-2xl border bg-white p-6 text-sm text-zinc-600">Authorized admin login required.</div>;
  return <section className="space-y-5">
    <header><h2 className="text-2xl font-black uppercase text-zinc-900">Vendors, Purchases & Shifts</h2><p className="mt-1 text-xs text-zinc-500">Vendor records, purchase bills, tracked stock receiving, and cash shift logs.</p></header>
    {notice && <div role="status" className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900">{notice}</div>}
    <div className="flex flex-wrap gap-2">{([{id:'vendors',label:'Vendors',icon:Truck},{id:'purchases',label:'Purchases',icon:Boxes},{id:'shifts',label:'Cash Shifts',icon:Clock}] as const).map((item) => <button key={item.id} type="button" aria-pressed={tab===item.id} onClick={() => setTab(item.id)} className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-black transition ${tab===item.id?'border-[#e4002b] bg-[#e4002b] text-white':'border-zinc-200 bg-white text-zinc-700 hover:border-[#e4002b]'}`}><item.icon size={15}/>{item.label}</button>)}</div>
    {tab==='vendors' && <div className="grid gap-4 lg:grid-cols-2"><form onSubmit={addVendor} className="space-y-3 rounded-2xl border bg-white p-4"><h3 className="font-black">{editingVendorId ? 'Edit Vendor' : 'Add Vendor'}</h3><input required value={vendorName} onChange={(e)=>setVendorName(e.target.value)} placeholder="Vendor / supplier name" className="w-full rounded-xl border p-3 text-sm"/><input value={vendorPhone} onChange={(e)=>setVendorPhone(e.target.value)} placeholder="Phone (optional)" className="w-full rounded-xl border p-3 text-sm"/><textarea value={vendorNotes} onChange={(e)=>setVendorNotes(e.target.value)} placeholder="Address / notes (optional)" className="w-full rounded-xl border p-3 text-sm"/><div className="flex flex-wrap gap-2"><button disabled={busy} className="rounded-xl bg-[#e4002b] px-4 py-2.5 text-sm font-black text-white disabled:opacity-50"><Plus className="mr-1 inline" size={15}/>{editingVendorId ? 'Update Vendor' : 'Save Vendor'}</button>{editingVendorId && <button type="button" onClick={()=>{setEditingVendorId(null);setVendorName('');setVendorPhone('');setVendorNotes('');}} className="rounded-xl border px-4 py-2.5 text-sm font-bold">Cancel</button>}</div></form><div className="space-y-2 rounded-2xl border bg-white p-4"><h3 className="font-black">Vendors ({vendors.length})</h3>{vendors.length===0?<p className="text-xs text-zinc-500">No vendors added yet.</p>:vendors.map((vendor)=><div key={vendor.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3"><div><p className="text-sm font-bold">{vendor.name}</p><p className="text-xs text-zinc-500">{vendor.phone||'No phone'} {vendor.notes? ' · '+vendor.notes:''}</p></div><div className="flex gap-2"><button type="button" onClick={()=>{setEditingVendorId(vendor.id);setVendorName(vendor.name);setVendorPhone(vendor.phone||'');setVendorNotes(vendor.notes||'');}} className="rounded-lg border px-2.5 py-1.5 text-[11px] font-bold">Edit</button><button type="button" onClick={async()=>{if(!window.confirm('Delete vendor '+vendor.name+'? Purchase history will be retained.'))return;try{await deleteDoc(doc(db,'vendors',vendor.id));setNotice('Vendor delete ho gaya. Existing purchase history retained hai.');}catch(error:any){setNotice(error?.message||'Vendor delete nahi hua.');}}} className="rounded-lg border border-red-200 px-2.5 py-1.5 text-[11px] font-bold text-red-600">Delete</button></div></div>)}</div></div>}
    {tab==='purchases' && <div className="space-y-4"><form onSubmit={addPurchase} className="space-y-4 rounded-2xl border bg-white p-4"><h3 className="font-black">Add Purchase Bill</h3><label className="block text-xs font-bold">Vendor (optional)<select value={purchaseVendor} onChange={(e)=>setPurchaseVendor(e.target.value)} className="mt-1 w-full rounded-xl border p-3 text-sm"><option value="">No vendor / walk-in purchase</option>{vendors.map((vendor)=><option key={vendor.id} value={vendor.id}>{vendor.name}</option>)}</select></label>{purchaseLines.map((line,index)=><div key={index} className="grid gap-2 rounded-xl border p-3 sm:grid-cols-4"><select value={line.productId} onChange={(e)=>setPurchaseLines((previous)=>previous.map((row,i)=>i===index?{...row,productId:e.target.value}:row))} className="rounded-lg border p-2 text-xs sm:col-span-2"><option value="">Select product</option>{menuItems.map((item)=><option key={item.id} value={item.id}>{item.name}{item.trackInventory?' · stock tracked':''}</option>)}</select><input aria-label="Purchase quantity" type="number" min="1" step="1" value={line.quantity} onChange={(e)=>setPurchaseLines((previous)=>previous.map((row,i)=>i===index?{...row,quantity:Math.max(1,Number(e.target.value)||1)}:row))} className="rounded-lg border p-2 text-xs"/><input aria-label="Unit purchase cost" type="number" min="0" step="0.01" value={line.unitCost} onChange={(e)=>setPurchaseLines((previous)=>previous.map((row,i)=>i===index?{...row,unitCost:Math.max(0,Number(e.target.value)||0)}:row))} className="rounded-lg border p-2 text-xs"/></div>)}<div className="flex flex-wrap gap-2"><button type="button" onClick={()=>setPurchaseLines((previous)=>[...previous,{productId:'',quantity:1,unitCost:0}])} className="rounded-lg border px-3 py-2 text-xs font-bold">+ Add product line</button><button type="button" disabled={purchaseLines.length===1} onClick={()=>setPurchaseLines((previous)=>previous.slice(0,-1))} className="rounded-lg border px-3 py-2 text-xs font-bold disabled:opacity-40">Remove last line</button></div><textarea value={purchaseNotes} onChange={(e)=>setPurchaseNotes(e.target.value)} placeholder="Bill number / notes" className="w-full rounded-xl border p-3 text-sm"/><div className="flex items-center justify-between border-t pt-3"><span className="text-sm font-bold">Total: {money(purchaseLines.reduce((sum,line)=>sum+line.quantity*line.unitCost,0))}</span><button disabled={busy} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-black text-white disabled:opacity-50">Save Purchase Bill</button></div><p className="text-[11px] text-zinc-500">Purchase quantities only increase stock for products with inventory tracking enabled. Non-tracked products keep stock unchanged.</p></form><div className="rounded-2xl border bg-white p-4"><h3 className="mb-3 font-black">Purchase History ({purchases.length})</h3>{purchases.slice(0,30).map((purchase)=><div key={purchase.id} className="flex flex-wrap items-center justify-between gap-2 border-b py-3 last:border-0"><div><p className="text-sm font-bold">{purchase.id}</p><p className="text-xs text-zinc-500">{purchase.vendorName||'No vendor'} · {new Date(purchase.date).toLocaleString()} · {purchase.items.length} lines</p></div><strong className="text-sm">{formatPKR(purchase.total)}</strong></div>)}</div></div>}
    {tab==='shifts' && <div className="space-y-4"><form onSubmit={openShift} className="flex flex-wrap items-end gap-3 rounded-2xl border bg-white p-4"><div><label className="block text-xs font-bold">Opening Cash (Rs)</label><input type="number" min="0" value={openingCash} onChange={(e)=>setOpeningCash(e.target.value)} className="mt-1 rounded-xl border p-3 text-sm"/></div><div className="min-w-48 flex-1"><label className="block text-xs font-bold">Shift notes</label><input value={shiftNotes} onChange={(e)=>setShiftNotes(e.target.value)} className="mt-1 w-full rounded-xl border p-3 text-sm" placeholder="Cashier / counter notes"/></div><button disabled={busy||shifts.some((shift)=>shift.status==='open')} className="rounded-xl bg-[#e4002b] px-4 py-3 text-xs font-black text-white disabled:opacity-40"><Wallet className="mr-1 inline" size={15}/> Open Shift</button></form><div className="space-y-2 rounded-2xl border bg-white p-4"><h3 className="font-black">Shift History</h3>{shifts.map((shift)=><div key={shift.id} className="flex flex-wrap items-center justify-between gap-3 border-b py-3 last:border-0"><div><p className="text-sm font-bold">{shift.id} <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] uppercase ${shift.status==='open'?'bg-emerald-100 text-emerald-700':'bg-zinc-100 text-zinc-600'}`}>{shift.status}</span></p><p className="text-xs text-zinc-500">Opened {new Date(shift.openedAt).toLocaleString()} · Opening cash {formatPKR(shift.openingCash)}</p>{shift.closedAt&&<p className="text-xs text-zinc-500">Closed {new Date(shift.closedAt).toLocaleString()} · Counted cash {formatPKR(shift.closingCash||0)} · Expected {formatPKR(shift.expectedCash||0)} · Variance {formatPKR((shift.closingCash||0)-(shift.expectedCash||0))}</p>}</div>{shift.status==='open'&&<div className="flex flex-wrap gap-2"><input type="number" min="0" value={closingCash} onChange={(e)=>setClosingCash(e.target.value)} placeholder="Closing cash Rs" className="w-36 rounded-lg border p-2 text-xs"/><button type="button" disabled={busy} onClick={()=>void closeShift(shift)} className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"><CheckCircle2 className="mr-1 inline" size={14}/> Close shift</button></div>}</div>)}</div></div>}
  </section>;
};
