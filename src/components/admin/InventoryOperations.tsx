import React, { useEffect, useMemo, useState } from 'react';
import { Boxes, Plus, Truck, Wallet, Clock, CheckCircle2, Search, X, Printer, FileText } from 'lucide-react';
import { collection, deleteDoc, doc, onSnapshot, runTransaction, setDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { useStore } from '../../context/StoreContext';
import type { CategoryId, MenuItem } from '../../types';

type Vendor = { id: string; name: string; phone?: string; notes?: string; createdAt: string };
type PurchaseLine = { productId: string; quantity: number; unitCost: number };
type Purchase = {
  id: string;
  billNumber?: string;
  vendorId?: string | null;
  vendorName?: string;
  items: PurchaseLine[];
  subtotal?: number;
  freightCharges?: number;
  discount?: number;
  total: number;
  paidAmount?: number;
  balanceDue?: number;
  paymentStatus?: 'paid' | 'partial' | 'unpaid';
  paymentMethod?: 'cash' | 'bank_transfer' | 'jazzcash' | 'easypaisa' | 'credit';
  date: string;
  notes?: string;
};
type Shift = { id: string; openedAt: string; closedAt?: string; openingCash: number; closingCash?: number; expectedCash?: number; notes?: string; status: 'open' | 'closed' };

export const InventoryOperations: React.FC = () => {
  const { isAdmin, menuItems, addMenuItem, updateMenuItem, categories, formatPKR, allOrders } = useStore();
  const [tab, setTab] = useState<'vendors' | 'purchases' | 'shifts'>('vendors');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  
  // Vendor form
  const [vendorName, setVendorName] = useState('');
  const [vendorPhone, setVendorPhone] = useState('');
  const [vendorNotes, setVendorNotes] = useState('');
  const [editingVendorId, setEditingVendorId] = useState<string | null>(null);

  // Enhanced Purchase Bill state
  const [billNumber, setBillNumber] = useState(`PUR-${Date.now().toString().slice(-6)}`);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
  const [purchaseVendor, setPurchaseVendor] = useState('');
  const [vendorSearch, setVendorSearch] = useState('');
  const [isVendorDropdownOpen, setIsVendorDropdownOpen] = useState(false);
  const [purchaseLines, setPurchaseLines] = useState<PurchaseLine[]>([{ productId: '', quantity: 1, unitCost: 0 }]);
  const [lineSearchQueries, setLineSearchQueries] = useState<string[]>(['']);
  const [activeLineDropdown, setActiveLineDropdown] = useState<number | null>(null);
  const [purchasePaymentStatus, setPurchasePaymentStatus] = useState<'paid' | 'partial' | 'unpaid'>('paid');
  const [purchasePaymentMethod, setPurchasePaymentMethod] = useState<'cash' | 'bank_transfer' | 'jazzcash' | 'easypaisa' | 'credit'>('cash');
  const [purchasePaidAmount, setPurchasePaidAmount] = useState<number | ''>('');
  const [purchaseFreight, setPurchaseFreight] = useState<number | ''>('');
  const [purchaseDiscount, setPurchaseDiscount] = useState<number | ''>('');
  const [purchaseNotes, setPurchaseNotes] = useState('');
  
  // Modals for inline creation
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [newProductTargetLineIndex, setNewProductTargetLineIndex] = useState<number | null>(null);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCat, setNewProdCat] = useState<CategoryId>('everyday-value');
  const [newProdBasePrice, setNewProdBasePrice] = useState<number | ''>(300);
  const [newProdSellingPrice, setNewProdSellingPrice] = useState<number | ''>('');
  const [newProdCostPrice, setNewProdCostPrice] = useState<number | ''>('');
  const [newProdTrackInventory, setNewProdTrackInventory] = useState(true);
  const [newProdStockQty, setNewProdStockQty] = useState<number | ''>(50);

  const [isNewVendorModalOpen, setIsNewVendorModalOpen] = useState(false);
  const [quickVendorName, setQuickVendorName] = useState('');
  const [quickVendorPhone, setQuickVendorPhone] = useState('');
  const [quickVendorNotes, setQuickVendorNotes] = useState('');

  // Print purchase receipt preview
  const [selectedPurchaseForPrint, setSelectedPurchaseForPrint] = useState<Purchase | null>(null);

  // Shifts state
  const [openingCash, setOpeningCash] = useState('0');
  const [closingCash, setClosingCash] = useState('');
  const [shiftNotes, setShiftNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  useEffect(() => {
    if (!isAdmin || !auth.currentUser) return;
    const unsubs = [
      onSnapshot(query(collection(db, 'vendors'), orderBy('createdAt', 'desc')), (snap) => setVendors(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Vendor))), (error) => setNotice({ type: 'error', message: error.message })),
      onSnapshot(query(collection(db, 'purchases'), orderBy('date', 'desc')), (snap) => setPurchases(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Purchase))), (error) => setNotice({ type: 'error', message: error.message })),
      onSnapshot(query(collection(db, 'cashShifts'), orderBy('openedAt', 'desc')), (snap) => setShifts(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Shift))), (error) => setNotice({ type: 'error', message: error.message })),
    ];
    return () => unsubs.forEach((unsubscribe) => unsubscribe());
  }, [isAdmin]);

  // Calculations for purchase bill
  const linesSubtotal = purchaseLines.reduce((sum, line) => sum + (line.quantity * (line.unitCost || 0)), 0);
  const freight = Number(purchaseFreight) || 0;
  const discount = Number(purchaseDiscount) || 0;
  const grandTotal = Math.max(0, linesSubtotal + freight - discount);
  const effectivePaid = purchasePaymentStatus === 'paid' ? grandTotal : purchasePaymentStatus === 'unpaid' ? 0 : Number(purchasePaidAmount) || 0;
  const balanceDue = Math.max(0, grandTotal - effectivePaid);

  const addVendor = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!auth.currentUser || !isAdmin || !vendorName.trim()) return;
    setBusy(true);
    try {
      if (editingVendorId) {
        await updateDoc(doc(db, 'vendors', editingVendorId), { name: vendorName.trim(), phone: vendorPhone.trim(), notes: vendorNotes.trim(), updatedAt: new Date().toISOString() });
        setNotice({ type: 'success', message: 'Vendor update ho gaya successfully.' });
      } else {
        const id = 'vendor-' + Date.now();
        await setDoc(doc(db, 'vendors', id), { id, name: vendorName.trim(), phone: vendorPhone.trim(), notes: vendorNotes.trim(), createdAt: new Date().toISOString(), createdBy: auth.currentUser.uid });
        setNotice({ type: 'success', message: 'Naya vendor save ho gaya.' });
      }
      setVendorName(''); setVendorPhone(''); setVendorNotes(''); setEditingVendorId(null);
    } catch (error: any) { setNotice({ type: 'error', message: error?.message || 'Vendor save nahi hua.' }); }
    finally { setBusy(false); }
  };

  const handleQuickAddVendorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !isAdmin || !quickVendorName.trim()) return;
    setBusy(true);
    try {
      const id = 'vendor-' + Date.now();
      const newVendor: Vendor = {
        id,
        name: quickVendorName.trim(),
        phone: quickVendorPhone.trim(),
        notes: quickVendorNotes.trim(),
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'vendors', id), { ...newVendor, createdBy: auth.currentUser.uid });
      setVendors((prev) => [newVendor, ...prev]);
      setPurchaseVendor(id);
      setVendorSearch(newVendor.name);
      setIsVendorDropdownOpen(false);
      setIsNewVendorModalOpen(false);
      setQuickVendorName('');
      setQuickVendorPhone('');
      setQuickVendorNotes('');
      setNotice({ type: 'success', message: `Vendor "${newVendor.name}" add ho gaya aur bill mein select kar liya gaya.` });
    } catch (error: any) {
      setNotice({ type: 'error', message: error?.message || 'Vendor create nahi ho saka.' });
    } finally {
      setBusy(false);
    }
  };

  const handleQuickAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    const newId = `kfc-${Date.now()}`;
    const newProduct: MenuItem = {
      id: newId,
      name: newProdName.trim(),
      categoryId: newProdCat,
      description: 'Authentic KFC Chakwal recipe item.',
      baseKfcPrice: Number(newProdBasePrice) || 300,
      sellingPrice: newProdSellingPrice ? Number(newProdSellingPrice) : undefined,
      costPrice: newProdCostPrice ? Number(newProdCostPrice) : (newProductTargetLineIndex !== null && purchaseLines[newProductTargetLineIndex]?.unitCost ? purchaseLines[newProductTargetLineIndex].unitCost : undefined),
      image: 'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
      trackInventory: newProdTrackInventory,
      stockQuantity: newProdTrackInventory ? (Number(newProdStockQty) || 0) : undefined,
    };

    addMenuItem(newProduct);

    // If triggered from a purchase line, assign it to that line
    if (newProductTargetLineIndex !== null && newProductTargetLineIndex < purchaseLines.length) {
      setPurchaseLines((prev) => prev.map((row, i) => i === newProductTargetLineIndex ? { ...row, productId: newId, unitCost: Number(newProdCostPrice) || row.unitCost } : row));
      setLineSearchQueries((prev) => prev.map((q, i) => i === newProductTargetLineIndex ? newProduct.name : q));
    }

    setIsNewProductModalOpen(false);
    setNewProductTargetLineIndex(null);
    setNewProdName('');
    setNewProdBasePrice(300);
    setNewProdSellingPrice('');
    setNewProdCostPrice('');
    setNotice({ type: 'success', message: `Naya product "${newProduct.name}" catalog mein add ho gaya aur purchase line mein select ho gaya!` });
  };

  const addPurchase = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!auth.currentUser || !isAdmin) return;
    const lines = purchaseLines.filter((line) => line.productId && line.quantity > 0 && line.unitCost >= 0);
    if (!lines.length) {
      setNotice({ type: 'error', message: 'Purchase bill mein kam az kam ek product add karein.' });
      return;
    }
    const products = lines.map((line) => menuItems.find((item) => item.id === line.productId)).filter((item): item is MenuItem => Boolean(item));
    if (products.length !== lines.length) {
      setNotice({ type: 'error', message: 'Koi product catalog mein nahi mila.' });
      return;
    }
    const id = 'purchase-' + Date.now();
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
          const updates: Record<string, any> = { updatedAt: new Date().toISOString() };
          
          if (product.trackInventory === true) {
            updates.stockQuantity = Math.max(0, Number(product.stockQuantity || 0)) + line.quantity;
          }
          // Auto-fill cost price on product backend!
          if (line.unitCost > 0) {
            updates.costPrice = line.unitCost;
          }
          if (snapshot.exists()) {
            transaction.update(refs[index], updates);
          } else {
            transaction.set(refs[index], { ...products[index], ...updates }, { merge: true });
          }
        });

        const purchaseRecord: Purchase = {
          id,
          billNumber: billNumber.trim() || id,
          vendorId: purchaseVendor || null,
          vendorName: vendor?.name || 'Walk-in / no vendor',
          items: lines,
          subtotal: linesSubtotal,
          freightCharges: freight,
          discount: discount,
          total: grandTotal,
          paidAmount: effectivePaid,
          balanceDue: balanceDue,
          paymentStatus: purchasePaymentStatus,
          paymentMethod: purchasePaymentMethod,
          date: purchaseDate || new Date().toISOString(),
          notes: purchaseNotes.trim(),
        };

        transaction.set(doc(db, 'purchases', id), { ...purchaseRecord, createdBy: auth.currentUser?.uid });
      });

      // Update in local client state and context so product cost updates immediately across the app
      for (let index = 0; index < lines.length; index += 1) {
        const item = products[index];
        const updatedItem: MenuItem = {
          ...item,
          costPrice: lines[index].unitCost > 0 ? lines[index].unitCost : item.costPrice,
          stockQuantity: item.trackInventory ? Math.max(0, Number(item.stockQuantity || 0)) + lines[index].quantity : item.stockQuantity,
        };
        await updateMenuItem(updatedItem);
      }

      setNotice({
        type: 'success',
        message: `Purchase Bill "${billNumber}" save ho gaya! Tracked stock barh gaya aur relevant products ki Cost Price auto-fill ho gayi.`,
      });

      // Reset form
      setBillNumber(`PUR-${Date.now().toString().slice(-6)}`);
      setPurchaseLines([{ productId: '', quantity: 1, unitCost: 0 }]);
      setLineSearchQueries(['']);
      setPurchaseVendor('');
      setVendorSearch('');
      setPurchaseNotes('');
      setPurchasePaidAmount('');
      setPurchaseFreight('');
      setPurchaseDiscount('');
    } catch (error: any) {
      setNotice({ type: 'error', message: error?.message || 'Purchase save nahi hui.' });
    } finally {
      setBusy(false);
    }
  };

  const openShift = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!auth.currentUser || !isAdmin) return;
    if (shifts.some((shift) => shift.status === 'open')) { setNotice({ type: 'error', message: 'Pehle current shift close karein.' }); return; }
    setBusy(true);
    try {
      const id = 'shift-' + Date.now();
      await setDoc(doc(db, 'cashShifts', id), { id, openedAt: new Date().toISOString(), openingCash: Math.max(0, Number(openingCash || 0)), status: 'open', notes: shiftNotes.trim(), openedBy: auth.currentUser.uid });
      setNotice({ type: 'success', message: 'Cash shift open ho gayi.' });
    } catch (error: any) { setNotice({ type: 'error', message: error?.message || 'Shift open nahi hui.' }); }
    finally { setBusy(false); }
  };

  const closeShift = async (shift: Shift) => {
    if (!auth.currentUser || !isAdmin) return;
    const closing = Number(closingCash);
    if (!Number.isFinite(closing) || closing < 0) { setNotice({ type: 'error', message: 'Closing cash sahi enter karein.' }); return; }
    setBusy(true);
    try {
      const closedAt = new Date().toISOString();
      const cashSales = allOrders.filter((order) => (order as any).source === 'admin-pos' && order.paymentMethod === 'cod' && new Date(order.date).getTime() >= new Date(shift.openedAt).getTime() && new Date(order.date).getTime() <= new Date(closedAt).getTime()).reduce((sum, order) => sum + Number(order.total || 0), 0);
      const expected = Math.max(0, Number(shift.openingCash || 0) + cashSales);
      await updateDoc(doc(db, 'cashShifts', shift.id), { closedAt, closingCash: closing, cashSales, expectedCash: expected, cashVariance: closing - expected, status: 'closed', closedBy: auth.currentUser.uid, closingNotes: shiftNotes.trim() });
      setClosingCash(''); setShiftNotes(''); setNotice({ type: 'success', message: 'Shift close ho gayi.' });
    } catch (error: any) { setNotice({ type: 'error', message: error?.message || 'Shift close nahi hui.' }); }
    finally { setBusy(false); }
  };

  if (!isAdmin) return <div className="rounded-2xl border bg-white p-6 text-sm text-zinc-600">Authorized admin login required.</div>;

  return (
    <section className="space-y-5">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black uppercase text-zinc-900 tracking-tight">Vendors, Purchases & Shifts</h2>
          <p className="mt-1 text-xs text-zinc-500">Comprehensive Purchase Bills, Product Cost auto-fill, Vendor Records & Cash Register.</p>
        </div>
      </header>

      {notice && (
        <div role="status" className={`rounded-xl border p-3 text-xs font-bold flex items-center justify-between ${
          notice.type === 'success' ? 'border-emerald-300 bg-emerald-50 text-emerald-900' :
          notice.type === 'error' ? 'border-red-300 bg-red-50 text-red-900' :
          'border-blue-300 bg-blue-50 text-blue-900'
        }`}>
          <span>{notice.message}</span>
          <button type="button" onClick={() => setNotice(null)} className="p-1 hover:opacity-75"><X size={14}/></button>
        </div>
      )}

      {/* Navigation Tabs with High-Contrast Color Selection */}
      <div className="flex flex-wrap gap-2">
        {([
          { id: 'purchases', label: 'Purchases & Stock In', icon: Boxes },
          { id: 'vendors', label: 'Vendors / Suppliers', icon: Truck },
          { id: 'shifts', label: 'Cash Shift Logs', icon: Clock },
        ] as const).map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={tab === item.id}
            onClick={() => setTab(item.id)}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-black transition cursor-pointer ${
              tab === item.id
                ? 'border-[#e4002b] bg-[#e4002b] text-white shadow-md ring-2 ring-[#e4002b]/30'
                : 'border-zinc-200 bg-white text-zinc-700 hover:border-[#e4002b]'
            }`}
          >
            <item.icon size={15}/>{item.label}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TAB: ENHANCED PURCHASES & STOCK IN                                       */}
      {/* ========================================================================= */}
      {tab === 'purchases' && (
        <div className="space-y-5">
          <form onSubmit={addPurchase} className="space-y-5 rounded-3xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm">
            <div className="border-b border-zinc-200 pb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-lg text-zinc-900 uppercase">New Purchase Bill / Stock Entry</h3>
                <p className="text-xs text-zinc-500">Items khareedny par stock aur product cost automatically sync honge.</p>
              </div>
              <span className="text-xs font-mono font-bold bg-zinc-100 text-zinc-800 px-3 py-1.5 rounded-xl border">
                Bill #: {billNumber}
              </span>
            </div>

            {/* Bill Header Grid: Invoice No, Date, Vendor */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Invoice / Bill Number *</label>
                <input
                  type="text"
                  value={billNumber}
                  onChange={(e) => setBillNumber(e.target.value)}
                  required
                  placeholder="e.g. PUR-00123"
                  className="w-full rounded-xl border border-zinc-300 p-2.5 text-xs font-mono font-bold bg-zinc-50 focus:bg-white focus:border-[#e4002b] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Purchase Date *</label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  required
                  className="w-full rounded-xl border border-zinc-300 p-2.5 text-xs bg-zinc-50 focus:bg-white focus:border-[#e4002b] focus:outline-none"
                />
              </div>

              {/* Searchable Vendor with "+ Add New Vendor" popup */}
              <div className="relative">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-zinc-700">Vendor / Supplier</label>
                  <button
                    type="button"
                    onClick={() => setIsNewVendorModalOpen(true)}
                    className="text-[11px] font-black text-[#e4002b] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12}/> New Vendor
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={vendorSearch || (vendors.find(v => v.id === purchaseVendor)?.name || '')}
                    onChange={(e) => {
                      setVendorSearch(e.target.value);
                      setIsVendorDropdownOpen(true);
                      if (!e.target.value) setPurchaseVendor('');
                    }}
                    onFocus={() => setIsVendorDropdownOpen(true)}
                    placeholder="Search or select vendor..."
                    className="w-full rounded-xl border border-zinc-300 p-2.5 text-xs bg-zinc-50 focus:bg-white focus:border-[#e4002b] focus:outline-none"
                  />
                  {purchaseVendor && (
                    <button
                      type="button"
                      onClick={() => { setPurchaseVendor(''); setVendorSearch(''); }}
                      className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-700"
                    >
                      <X size={14}/>
                    </button>
                  )}
                </div>

                {isVendorDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full z-40 mt-1 max-h-56 overflow-y-auto rounded-xl border border-zinc-200 bg-white shadow-xl">
                    <button
                      type="button"
                      onClick={() => { setPurchaseVendor(''); setVendorSearch('Walk-in / No vendor'); setIsVendorDropdownOpen(false); }}
                      className="w-full p-2.5 text-left text-xs font-bold hover:bg-zinc-100 border-b border-zinc-100 text-zinc-600"
                    >
                      Walk-in / No vendor
                    </button>
                    {vendors
                      .filter((v) => !vendorSearch || v.name.toLowerCase().includes(vendorSearch.toLowerCase()) || (v.phone && v.phone.includes(vendorSearch)))
                      .map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => { setPurchaseVendor(v.id); setVendorSearch(v.name); setIsVendorDropdownOpen(false); }}
                          className="flex w-full items-center justify-between p-2.5 text-left text-xs hover:bg-red-50 border-b border-zinc-100 last:border-0"
                        >
                          <span className="font-bold text-zinc-900">{v.name}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">{v.phone || ''}</span>
                        </button>
                      ))}
                    <div className="p-2 border-t border-zinc-100 bg-zinc-50">
                      <button
                        type="button"
                        onClick={() => { setIsVendorDropdownOpen(false); setIsNewVendorModalOpen(true); }}
                        className="w-full rounded-lg bg-[#e4002b]/10 hover:bg-[#e4002b]/20 text-[#e4002b] py-2 text-xs font-black text-center"
                      >
                        + Add New Vendor Popup
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Line Items List with Product Autocomplete & Inline "+ Add New Product" */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-700">
                  Bill Items ({purchaseLines.length})
                </h4>
                <span className="text-[11px] text-zinc-500">Type product name to search or click + Add New Product</span>
              </div>

              <div className="space-y-2.5">
                {purchaseLines.map((line, index) => {
                  const selectedProduct = menuItems.find((item) => item.id === line.productId);
                  const searchVal = lineSearchQueries[index] ?? (selectedProduct?.name || '');
                  const isDropdownActive = activeLineDropdown === index;
                  const lineTotal = (line.quantity || 0) * (line.unitCost || 0);

                  const filteredProducts = menuItems.filter((item) =>
                    !searchVal ||
                    item.name.toLowerCase().includes(searchVal.toLowerCase()) ||
                    String(item.categoryId).toLowerCase().includes(searchVal.toLowerCase()) ||
                    (item.sku && item.sku.toLowerCase().includes(searchVal.toLowerCase()))
                  );

                  return (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-[1fr_100px_130px_110px_auto] gap-2 rounded-2xl border border-zinc-200 bg-zinc-50/70 p-3 items-center">
                      {/* Searchable Product Input */}
                      <div className="relative">
                        <label className="block sm:hidden text-[10px] font-bold text-zinc-600 mb-0.5">Product</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={searchVal}
                            onChange={(e) => {
                              const val = e.target.value;
                              setLineSearchQueries((prev) => prev.map((q, i) => i === index ? val : q));
                              setActiveLineDropdown(index);
                              if (!val) {
                                setPurchaseLines((prev) => prev.map((row, i) => i === index ? { ...row, productId: '' } : row));
                              }
                            }}
                            onFocus={() => setActiveLineDropdown(index)}
                            placeholder="Type to search product..."
                            className="w-full rounded-xl border border-zinc-300 bg-white p-2.5 text-xs font-bold text-zinc-900 focus:border-[#e4002b] focus:outline-none"
                          />
                          {line.productId && (
                            <button
                              type="button"
                              onClick={() => {
                                setPurchaseLines((prev) => prev.map((row, i) => i === index ? { ...row, productId: '', unitCost: 0 } : row));
                                setLineSearchQueries((prev) => prev.map((q, i) => i === index ? '' : q));
                              }}
                              className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-700"
                            >
                              <X size={13}/>
                            </button>
                          )}
                        </div>

                        {/* Autocomplete Dropdown with "+ Add New Product" */}
                        {isDropdownActive && (
                          <div className="absolute left-0 right-0 top-full z-40 mt-1 max-h-60 overflow-y-auto rounded-xl border border-zinc-200 bg-white shadow-xl">
                            {filteredProducts.slice(0, 15).map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                  setPurchaseLines((prev) => prev.map((row, i) => i === index ? {
                                    ...row,
                                    productId: item.id,
                                    unitCost: row.unitCost > 0 ? row.unitCost : (item.costPrice || 0),
                                  } : row));
                                  setLineSearchQueries((prev) => prev.map((q, i) => i === index ? item.name : q));
                                  setActiveLineDropdown(null);
                                }}
                                className="flex w-full items-center justify-between p-2.5 text-left text-xs border-b border-zinc-100 hover:bg-red-50"
                              >
                                <div>
                                  <span className="font-bold text-zinc-900 block">{item.name}</span>
                                  <span className="text-[10px] text-zinc-500">
                                    Current Cost: {item.costPrice ? formatPKR(item.costPrice) : 'Not set'} · Stock: {item.stockQuantity ?? 'Untracked'}
                                  </span>
                                </div>
                                <span className="text-xs font-black text-[#e4002b]">{formatPKR(item.baseKfcPrice)}</span>
                              </button>
                            ))}
                            {filteredProducts.length === 0 && (
                              <p className="p-3 text-xs text-zinc-500 italic">No matching product found.</p>
                            )}
                            <div className="p-2 border-t border-zinc-100 bg-zinc-50 sticky bottom-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveLineDropdown(null);
                                  setNewProductTargetLineIndex(index);
                                  setNewProdName(searchVal);
                                  setNewProdCostPrice(line.unitCost || '');
                                  setIsNewProductModalOpen(true);
                                }}
                                className="w-full rounded-lg bg-[#e4002b] text-white py-2 text-xs font-black text-center flex items-center justify-center gap-1 shadow-sm"
                              >
                                <Plus size={13}/> Add New Product Popup
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Quantity */}
                      <div>
                        <label className="block sm:hidden text-[10px] font-bold text-zinc-600 mb-0.5">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={line.quantity}
                          onChange={(e) => setPurchaseLines((prev) => prev.map((row, i) => i === index ? { ...row, quantity: Math.max(1, Number(e.target.value) || 1) } : row))}
                          placeholder="Qty"
                          className="w-full rounded-xl border border-zinc-300 bg-white p-2.5 text-xs text-center font-bold"
                        />
                      </div>

                      {/* Purchase Unit Cost (PKR) */}
                      <div>
                        <label className="block sm:hidden text-[10px] font-bold text-zinc-600 mb-0.5">Cost/Unit</label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={line.unitCost}
                          onChange={(e) => setPurchaseLines((prev) => prev.map((row, i) => i === index ? { ...row, unitCost: Math.max(0, Number(e.target.value) || 0) } : row))}
                          placeholder="Cost Rs"
                          className="w-full rounded-xl border border-zinc-300 bg-white p-2.5 text-xs font-mono font-bold text-zinc-800"
                        />
                      </div>

                      {/* Line Total */}
                      <div className="text-right sm:text-left">
                        <label className="block sm:hidden text-[10px] font-bold text-zinc-600 mb-0.5">Line Total</label>
                        <span className="text-xs font-mono font-black text-zinc-900 block pt-1">
                          {formatPKR(lineTotal)}
                        </span>
                      </div>

                      {/* Remove Line */}
                      <div>
                        <button
                          type="button"
                          disabled={purchaseLines.length === 1}
                          onClick={() => {
                            setPurchaseLines((prev) => prev.filter((_, i) => i !== index));
                            setLineSearchQueries((prev) => prev.filter((_, i) => i !== index));
                          }}
                          className="p-2 text-red-500 hover:text-red-700 disabled:opacity-30 rounded-lg hover:bg-red-50"
                          title="Remove line"
                        >
                          <X size={15}/>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setPurchaseLines((prev) => [...prev, { productId: '', quantity: 1, unitCost: 0 }]);
                    setLineSearchQueries((prev) => [...prev, '']);
                  }}
                  className="rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs font-bold text-zinc-800 hover:bg-zinc-50 cursor-pointer shadow-2xs"
                >
                  + Add Product Line
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewProductTargetLineIndex(purchaseLines.length - 1);
                    setIsNewProductModalOpen(true);
                  }}
                  className="rounded-xl border border-[#e4002b] bg-red-50 px-3.5 py-2 text-xs font-bold text-[#e4002b] hover:bg-red-100 cursor-pointer"
                >
                  + Create New Product
                </button>
              </div>
            </div>

            {/* Additional Purchase Charges & Payment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-zinc-200 pt-4">
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-zinc-700">Payment & Accounting Details</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 mb-1">Payment Status</label>
                    <select
                      value={purchasePaymentStatus}
                      onChange={(e) => setPurchasePaymentStatus(e.target.value as any)}
                      className="w-full rounded-xl border border-zinc-300 p-2 text-xs font-bold bg-white"
                    >
                      <option value="paid">Fully Paid</option>
                      <option value="partial">Partially Paid</option>
                      <option value="unpaid">Unpaid / On Credit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 mb-1">Payment Method</label>
                    <select
                      value={purchasePaymentMethod}
                      onChange={(e) => setPurchasePaymentMethod(e.target.value as any)}
                      className="w-full rounded-xl border border-zinc-300 p-2 text-xs bg-white"
                    >
                      <option value="cash">Cash in Hand</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="jazzcash">JazzCash</option>
                      <option value="easypaisa">EasyPaisa</option>
                      <option value="credit">Vendor Credit Account</option>
                    </select>
                  </div>
                </div>

                {purchasePaymentStatus === 'partial' && (
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 mb-1">Paid Amount (Rs)</label>
                    <input
                      type="number"
                      min="0"
                      value={purchasePaidAmount}
                      onChange={(e) => setPurchasePaidAmount(e.target.value ? Number(e.target.value) : '')}
                      placeholder={`Max ${grandTotal}`}
                      className="w-full rounded-xl border border-zinc-300 p-2 text-xs font-bold font-mono"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 mb-1">Bill Reference / Notes</label>
                  <textarea
                    rows={2}
                    value={purchaseNotes}
                    onChange={(e) => setPurchaseNotes(e.target.value)}
                    placeholder="Supplier receipt number, vehicle number, delivery notes..."
                    className="w-full rounded-xl border border-zinc-300 p-2.5 text-xs"
                  />
                </div>
              </div>

              {/* Totals Summary Card */}
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 space-y-2 text-xs">
                <div className="flex justify-between text-zinc-600">
                  <span>Lines Subtotal:</span>
                  <span className="font-mono font-bold">{formatPKR(linesSubtotal)}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-zinc-600">Freight / Loading (PKR):</span>
                  <input
                    type="number"
                    min="0"
                    value={purchaseFreight}
                    onChange={(e) => setPurchaseFreight(e.target.value ? Number(e.target.value) : '')}
                    placeholder="0"
                    className="w-28 rounded-lg border border-zinc-300 bg-white p-1.5 text-right font-mono"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-zinc-600">Vendor Discount (PKR):</span>
                  <input
                    type="number"
                    min="0"
                    value={purchaseDiscount}
                    onChange={(e) => setPurchaseDiscount(e.target.value ? Number(e.target.value) : '')}
                    placeholder="0"
                    className="w-28 rounded-lg border border-zinc-300 bg-white p-1.5 text-right font-mono text-emerald-600 font-bold"
                  />
                </div>
                <div className="border-t border-zinc-200 pt-2 flex justify-between text-sm font-black text-zinc-950">
                  <span>Grand Total:</span>
                  <span className="text-base text-[#e4002b] font-mono">{formatPKR(grandTotal)}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Paid Amount:</span>
                  <span className="font-mono text-emerald-700 font-bold">{formatPKR(effectivePaid)}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Remaining Balance Due:</span>
                  <span className="font-mono text-amber-700 font-bold">{formatPKR(balanceDue)}</span>
                </div>

                <p className="text-[10px] text-zinc-500 pt-1 italic">
                  💡 Is bill ko save karne par tamam products ke andar Cost Price ka option backend par auto-fill ho jaye ga.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end border-t border-zinc-200 pt-4">
              <button
                type="submit"
                disabled={busy}
                className="rounded-xl bg-[#e4002b] hover:bg-[#c30025] px-6 py-3 text-sm font-black text-white shadow-md cursor-pointer transition disabled:opacity-50"
              >
                {busy ? 'Saving Purchase...' : 'Save Purchase Bill & Update Costs'}
              </button>
            </div>
          </form>

          {/* Purchase Bills History */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-zinc-900 text-sm uppercase">Purchase History ({purchases.length})</h3>
              <span className="text-xs text-zinc-500">Recent purchase bills</span>
            </div>
            {purchases.length === 0 ? (
              <p className="text-xs text-zinc-400 py-6 text-center">No purchases logged yet.</p>
            ) : (
              <div className="divide-y divide-zinc-100">
                {purchases.slice(0, 30).map((purchase) => (
                  <div key={purchase.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-zinc-900">{purchase.billNumber || purchase.id}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          purchase.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                          purchase.paymentStatus === 'partial' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {purchase.paymentStatus || 'paid'}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {purchase.vendorName || 'Walk-in'} · {new Date(purchase.date).toLocaleDateString('en-PK')} · {purchase.items?.length || 0} line items
                        {purchase.notes ? ` · Note: "${purchase.notes}"` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <strong className="text-sm font-mono text-zinc-900">{formatPKR(purchase.total)}</strong>
                      <button
                        type="button"
                        onClick={() => setSelectedPurchaseForPrint(purchase)}
                        className="p-2 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-600"
                        title="Print Voucher"
                      >
                        <Printer size={15}/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: VENDORS                                                              */}
      {/* ========================================================================= */}
      {tab === 'vendors' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <form onSubmit={addVendor} className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h3 className="font-black text-sm uppercase text-zinc-900">{editingVendorId ? 'Edit Vendor' : 'Add New Vendor'}</h3>
            <input required value={vendorName} onChange={(e)=>setVendorName(e.target.value)} placeholder="Vendor / supplier name *" className="w-full rounded-xl border border-zinc-300 p-2.5 text-xs"/>
            <input value={vendorPhone} onChange={(e)=>setVendorPhone(e.target.value)} placeholder="Phone number (optional)" className="w-full rounded-xl border border-zinc-300 p-2.5 text-xs font-mono"/>
            <textarea value={vendorNotes} onChange={(e)=>setVendorNotes(e.target.value)} placeholder="Address / notes (optional)" className="w-full rounded-xl border border-zinc-300 p-2.5 text-xs" rows={2}/>
            <div className="flex flex-wrap gap-2 pt-1">
              <button disabled={busy} className="rounded-xl bg-[#e4002b] px-4 py-2 text-xs font-black text-white disabled:opacity-50 cursor-pointer">
                <Plus className="mr-1 inline" size={13}/>{editingVendorId ? 'Update Vendor' : 'Save Vendor'}
              </button>
              {editingVendorId && (
                <button type="button" onClick={()=>{setEditingVendorId(null);setVendorName('');setVendorPhone('');setVendorNotes('');}} className="rounded-xl border px-4 py-2 text-xs font-bold">
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="space-y-2 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h3 className="font-black text-sm uppercase text-zinc-900">Vendors Directory ({vendors.length})</h3>
            {vendors.length === 0 ? (
              <p className="text-xs text-zinc-400 py-4">No vendors added yet.</p>
            ) : (
              vendors.map((vendor) => (
                <div key={vendor.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-100 bg-zinc-50 p-3">
                  <div>
                    <p className="text-xs font-bold text-zinc-900">{vendor.name}</p>
                    <p className="text-[11px] text-zinc-500 font-mono">{vendor.phone || 'No phone'} {vendor.notes ? ' · ' + vendor.notes : ''}</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={()=>{setEditingVendorId(vendor.id);setVendorName(vendor.name);setVendorPhone(vendor.phone||'');setVendorNotes(vendor.notes||'');}} className="rounded-lg border px-2.5 py-1 text-[11px] font-bold bg-white">Edit</button>
                    <button type="button" onClick={async()=>{if(!window.confirm(`Delete vendor "${vendor.name}"?`))return;try{await deleteDoc(doc(db,'vendors',vendor.id));setNotice({ type: 'success', message: 'Vendor delete ho gaya.' });}catch(error:any){setNotice({ type: 'error', message: error?.message || 'Delete error' });}}} className="rounded-lg border border-red-200 px-2.5 py-1 text-[11px] font-bold text-red-600 bg-white">Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: CASH SHIFTS                                                          */}
      {/* ========================================================================= */}
      {tab === 'shifts' && (
        <div className="space-y-4">
          <form onSubmit={openShift} className="flex flex-wrap items-end gap-3 rounded-2xl border bg-white p-4">
            <div>
              <label className="block text-xs font-bold">Opening Cash (Rs)</label>
              <input type="number" min="0" value={openingCash} onChange={(e)=>setOpeningCash(e.target.value)} className="mt-1 rounded-xl border p-2.5 text-xs font-bold font-mono"/>
            </div>
            <div className="min-w-48 flex-1">
              <label className="block text-xs font-bold">Shift notes</label>
              <input value={shiftNotes} onChange={(e)=>setShiftNotes(e.target.value)} className="mt-1 w-full rounded-xl border p-2.5 text-xs" placeholder="Cashier / counter notes"/>
            </div>
            <button disabled={busy||shifts.some((shift)=>shift.status==='open')} className="rounded-xl bg-[#e4002b] px-4 py-2.5 text-xs font-black text-white disabled:opacity-40">
              <Wallet className="mr-1 inline" size={14}/> Open Shift
            </button>
          </form>
          <div className="space-y-2 rounded-2xl border bg-white p-4">
            <h3 className="font-black text-sm uppercase">Shift History</h3>
            {shifts.map((shift) => (
              <div key={shift.id} className="flex flex-wrap items-center justify-between gap-3 border-b py-3 last:border-0 text-xs">
                <div>
                  <p className="font-bold">{shift.id} <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] uppercase ${shift.status==='open'?'bg-emerald-100 text-emerald-700':'bg-zinc-100 text-zinc-600'}`}>{shift.status}</span></p>
                  <p className="text-zinc-500">Opened {new Date(shift.openedAt).toLocaleString()} · Opening cash {formatPKR(shift.openingCash)}</p>
                  {shift.closedAt && <p className="text-zinc-500">Closed {new Date(shift.closedAt).toLocaleString()} · Counted {formatPKR(shift.closingCash||0)} · Expected {formatPKR(shift.expectedCash||0)} · Variance {formatPKR((shift.closingCash||0)-(shift.expectedCash||0))}</p>}
                </div>
                {shift.status==='open' && (
                  <div className="flex flex-wrap gap-2">
                    <input type="number" min="0" value={closingCash} onChange={(e)=>setClosingCash(e.target.value)} placeholder="Closing cash Rs" className="w-32 rounded-lg border p-1.5 text-xs font-mono"/>
                    <button type="button" disabled={busy} onClick={()=>void closeShift(shift)} className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50">
                      <CheckCircle2 className="mr-1 inline" size={13}/> Close shift
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INLINE POPUP: ADD NEW PRODUCT RIGHT FROM PURCHASE FORM                    */}
      {/* ========================================================================= */}
      {isNewProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-zinc-200 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
              <h3 className="font-black text-sm uppercase text-zinc-900 flex items-center gap-1.5">
                <Plus size={16} className="text-[#e4002b]"/> Add New Product to Catalog
              </h3>
              <button type="button" onClick={() => setIsNewProductModalOpen(false)} className="p-1 text-zinc-500 hover:text-zinc-900">
                <X size={16}/>
              </button>
            </div>
            <form onSubmit={handleQuickAddProductSubmit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="e.g. Crispy Chicken Box"
                  className="w-full rounded-xl border border-zinc-300 p-2.5 font-bold focus:border-[#e4002b] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Category *</label>
                  <select
                    value={newProdCat}
                    onChange={(e) => setNewProdCat(e.target.value as CategoryId)}
                    className="w-full rounded-xl border border-zinc-300 p-2.5 font-bold bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Base KFC Price (PKR) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newProdBasePrice}
                    onChange={(e) => setNewProdBasePrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-full rounded-xl border border-zinc-300 p-2.5 font-bold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">
                    Cost Price (PKR) <span className="font-normal text-zinc-400">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newProdCostPrice}
                    onChange={(e) => setNewProdCostPrice(e.target.value ? Number(e.target.value) : '')}
                    placeholder="e.g. 280"
                    className="w-full rounded-xl border border-zinc-300 p-2.5 font-mono text-zinc-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">
                    Direct Selling Price <span className="font-normal text-zinc-400">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newProdSellingPrice}
                    onChange={(e) => setNewProdSellingPrice(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Auto markup if empty"
                    className="w-full rounded-xl border border-zinc-300 p-2.5 font-mono text-emerald-700 font-bold"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 space-y-2">
                <label className="flex items-center gap-2 font-bold text-zinc-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newProdTrackInventory}
                    onChange={(e) => setNewProdTrackInventory(e.target.checked)}
                    className="h-4 w-4 accent-red-600"
                  />
                  <span>Track stock / inventory for this product</span>
                </label>
                {newProdTrackInventory && (
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 mb-1">Initial Stock Quantity</label>
                    <input
                      type="number"
                      min="0"
                      value={newProdStockQty}
                      onChange={(e) => setNewProdStockQty(e.target.value ? Number(e.target.value) : '')}
                      className="w-full rounded-lg border border-zinc-300 bg-white p-2 font-mono font-bold"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setIsNewProductModalOpen(false)}
                  className="rounded-xl border px-4 py-2 text-zinc-700 font-bold hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#e4002b] text-white px-5 py-2 font-black shadow-sm"
                >
                  Save & Select Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INLINE POPUP: ADD NEW VENDOR RIGHT FROM PURCHASE FORM                     */}
      {/* ========================================================================= */}
      {isNewVendorModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-zinc-200 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
              <h3 className="font-black text-sm uppercase text-zinc-900 flex items-center gap-1.5">
                <Truck size={16} className="text-[#e4002b]"/> Add New Vendor / Supplier
              </h3>
              <button type="button" onClick={() => setIsNewVendorModalOpen(false)} className="p-1 text-zinc-500 hover:text-zinc-900">
                <X size={16}/>
              </button>
            </div>
            <form onSubmit={handleQuickAddVendorSubmit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Vendor / Supplier Name *</label>
                <input
                  type="text"
                  required
                  value={quickVendorName}
                  onChange={(e) => setQuickVendorName(e.target.value)}
                  placeholder="e.g. Chakwal Poultry Traders"
                  className="w-full rounded-xl border border-zinc-300 p-2.5 font-bold focus:border-[#e4002b] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Phone Number (Optional)</label>
                <input
                  type="text"
                  value={quickVendorPhone}
                  onChange={(e) => setQuickVendorPhone(e.target.value)}
                  placeholder="03xx xxxxxxx"
                  className="w-full rounded-xl border border-zinc-300 p-2.5 font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Address / Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={quickVendorNotes}
                  onChange={(e) => setQuickVendorNotes(e.target.value)}
                  placeholder="Location or credit terms..."
                  className="w-full rounded-xl border border-zinc-300 p-2.5"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setIsNewVendorModalOpen(false)}
                  className="rounded-xl border px-4 py-2 text-zinc-700 font-bold hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-xl bg-[#e4002b] text-white px-5 py-2 font-black shadow-sm disabled:opacity-50"
                >
                  Save & Select Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRINTABLE PURCHASE VOUCHER MODAL                                          */}
      {/* ========================================================================= */}
      {selectedPurchaseForPrint && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white border border-zinc-200 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-black text-lg text-zinc-900 uppercase">Purchase Voucher / Receipt</h3>
                <p className="text-xs text-zinc-500 font-mono">Invoice #{selectedPurchaseForPrint.billNumber || selectedPurchaseForPrint.id}</p>
              </div>
              <button type="button" onClick={() => setSelectedPurchaseForPrint(null)} className="p-1 text-zinc-500 hover:text-zinc-900">
                <X size={18}/>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs bg-zinc-50 p-3 rounded-xl border">
              <div>
                <p><b>Vendor:</b> {selectedPurchaseForPrint.vendorName || 'No Vendor'}</p>
                <p><b>Date:</b> {new Date(selectedPurchaseForPrint.date).toLocaleString('en-PK')}</p>
              </div>
              <div>
                <p><b>Payment Status:</b> <span className="uppercase font-bold">{selectedPurchaseForPrint.paymentStatus || 'paid'}</span></p>
                <p><b>Payment Method:</b> <span className="uppercase font-bold">{selectedPurchaseForPrint.paymentMethod || 'cash'}</span></p>
              </div>
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b font-black">
                  <th className="py-2">Item</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Cost/Unit</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {selectedPurchaseForPrint.items?.map((item, i) => {
                  const prod = menuItems.find(m => m.id === item.productId);
                  return (
                    <tr key={i} className="border-b border-zinc-100">
                      <td className="py-2 font-bold">{prod?.name || item.productId}</td>
                      <td className="py-2 text-center">{item.quantity}</td>
                      <td className="py-2 text-right font-mono">{formatPKR(item.unitCost)}</td>
                      <td className="py-2 text-right font-mono font-bold">{formatPKR(item.quantity * item.unitCost)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="space-y-1 text-xs border-t pt-2 ml-auto max-w-xs">
              <div className="flex justify-between"><span>Lines Total:</span><span className="font-mono">{formatPKR(selectedPurchaseForPrint.subtotal || selectedPurchaseForPrint.total)}</span></div>
              {selectedPurchaseForPrint.freightCharges ? <div className="flex justify-between"><span>Freight:</span><span className="font-mono">+{formatPKR(selectedPurchaseForPrint.freightCharges)}</span></div> : null}
              {selectedPurchaseForPrint.discount ? <div className="flex justify-between text-emerald-600"><span>Discount:</span><span className="font-mono">-{formatPKR(selectedPurchaseForPrint.discount)}</span></div> : null}
              <div className="flex justify-between font-black text-sm border-t pt-1"><span>Grand Total:</span><span className="font-mono text-[#e4002b]">{formatPKR(selectedPurchaseForPrint.total)}</span></div>
            </div>
            <div className="flex justify-end gap-2 border-t pt-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-xl bg-zinc-900 text-white px-4 py-2 text-xs font-bold flex items-center gap-2"
              >
                <Printer size={14}/> Print Voucher
              </button>
              <button
                type="button"
                onClick={() => setSelectedPurchaseForPrint(null)}
                className="rounded-xl border px-4 py-2 text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
