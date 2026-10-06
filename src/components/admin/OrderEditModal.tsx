import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  X, 
  Plus, 
  Trash2, 
  ShoppingBag, 
  Percent, 
  Truck, 
  User, 
  Phone, 
  MapPin, 
  Save, 
  Check, 
  ArrowLeft
} from 'lucide-react';
import { Order, MenuItem } from '../../types';

interface OrderEditModalProps {
  order: Order;
  onClose: () => void;
}

export const OrderEditModal: React.FC<OrderEditModalProps> = ({ order, onClose }) => {
  const { menuItems, editOrder, formatPKR } = useStore();

  const [customerName, setCustomerName] = useState(order.customer.fullName);
  const [customerPhone, setCustomerPhone] = useState(order.customer.phone);
  const [customerAddress, setCustomerAddress] = useState(order.customer.address);
  const [deliveryFee, setDeliveryFee] = useState<number>(order.deliveryFee ?? 399);
  const [discountAmount, setDiscountAmount] = useState<number>(order.discount ?? 0);
  const [specialInstructions, setSpecialInstructions] = useState(order.specialInstructions ?? '');

  // Workable items list
  const [items, setItems] = useState(
    order.items.map((it) => ({
      cartItemId: it.cartItemId,
      menuItem: it.menuItem,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      options: it.options || { addons: [] }
    }))
  );

  // Selected product to add
  const [selectedProductId, setSelectedProductId] = useState<string>(menuItems[0]?.id || '');
  const [addQuantity, setAddQuantity] = useState<number>(1);
  const [isSaved, setIsSaved] = useState(false);

  // Calculate Subtotal & Total
  const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const calculatedTotal = Math.max(0, subtotal + Number(deliveryFee || 0) - Number(discountAmount || 0));

  const handleQuantityChange = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(index);
      return;
    }
    const updated = [...items];
    updated[index].quantity = newQty;
    setItems(updated);
  };

  const handlePriceChange = (index: number, newPrice: number) => {
    const updated = [...items];
    updated[index].unitPrice = Math.max(0, newPrice);
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleAddNewItem = () => {
    const foundProduct = menuItems.find((m) => m.id === selectedProductId);
    if (!foundProduct) return;

    const effectivePrice = foundProduct.sellingPrice || foundProduct.baseKfcPrice;
    const newItem = {
      cartItemId: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      menuItem: foundProduct,
      quantity: Math.max(1, addQuantity),
      unitPrice: effectivePrice,
      options: { addons: [] }
    };

    setItems([...items, newItem]);
    setAddQuantity(1);
  };

  const handleSaveOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert('Order must contain at least one item.');
      return;
    }

    editOrder(order.id, {
      items,
      subtotal,
      deliveryFee: Number(deliveryFee),
      discount: Number(discountAmount),
      total: calculatedTotal,
      specialInstructions,
      customer: {
        ...order.customer,
        fullName: customerName,
        phone: customerPhone,
        address: customerAddress
      }
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-white rounded-3xl border border-zinc-200 shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-zinc-900 text-white p-5 flex items-center justify-between border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-kfc text-xl font-black uppercase tracking-tight text-white">
                Shopify Order Editor
              </span>
              <span className="font-mono text-xs font-bold bg-[#e4002b] px-2 py-0.5 rounded-full">
                #{order.id}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Add or remove products, edit quantities, customer shipping address, discounts & fees.
            </p>
          </div>

          <button 
            onClick={onClose} 
            className="text-zinc-400 hover:text-white p-1.5 rounded-full hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSaveOrder} className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Customer Details Box */}
          <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-800 flex items-center gap-2">
              <User className="w-4 h-4 text-[#e4002b]" />
              <span>Customer & Delivery Details</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-zinc-600 font-bold mb-1">Customer Full Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 font-medium"
                />
              </div>

              <div>
                <label className="block text-zinc-600 font-bold mb-1">Phone Number (WhatsApp)</label>
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-zinc-600 font-bold mb-1">Delivery Address (Chakwal / Tehsil Chowk)</label>
                <input
                  type="text"
                  required
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Ordered Products Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-800 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#e4002b]" />
                <span>Line Items in Order ({items.length})</span>
              </h4>
            </div>

            <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-white shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-100 text-zinc-700 font-bold uppercase text-[10px] tracking-wider border-b border-zinc-200">
                  <tr>
                    <th className="p-3">Product Name</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Price (PKR)</th>
                    <th className="p-3 text-right">Item Total</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {items.map((item, idx) => (
                    <tr key={item.cartItemId || idx} className="hover:bg-zinc-50">
                      <td className="p-3 font-bold text-zinc-900">
                        {item.menuItem.name}
                        {item.options.addons && item.options.addons.length > 0 && (
                          <span className="block text-[11px] text-zinc-500 font-normal">
                            + {item.options.addons.map((a) => a.name).join(', ')}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <div className="inline-flex items-center border border-zinc-300 rounded-lg overflow-hidden bg-white">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(idx, item.quantity - 1)}
                            className="px-2 py-1 text-zinc-600 hover:bg-zinc-100 font-bold"
                          >
                            -
                          </button>
                          <span className="px-2 font-mono font-bold">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(idx, item.quantity + 1)}
                            className="px-2 py-1 text-zinc-600 hover:bg-zinc-100 font-bold"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handlePriceChange(idx, Number(e.target.value))}
                          className="w-20 bg-zinc-50 border border-zinc-300 rounded-lg px-2 py-1 text-right font-mono font-bold"
                        />
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-zinc-900">
                        {formatPKR(item.unitPrice * item.quantity)}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition"
                          title="Remove item from order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add New Item to this Order */}
            <div className="p-3 bg-zinc-50 border border-dashed border-zinc-300 rounded-2xl flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-zinc-700">Add Item:</span>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="bg-white border border-zinc-300 rounded-xl px-3 py-1.5 text-xs font-medium flex-1 min-w-[200px]"
              >
                {menuItems.map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    {prod.name} ({formatPKR(prod.sellingPrice || prod.baseKfcPrice)})
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <label className="text-xs text-zinc-500 font-bold">Qty:</label>
                <input
                  type="number"
                  min="1"
                  value={addQuantity}
                  onChange={(e) => setAddQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-16 bg-white border border-zinc-300 rounded-xl px-2 py-1.5 text-xs text-center font-mono font-bold"
                />
              </div>

              <button
                type="button"
                onClick={handleAddNewItem}
                className="bg-zinc-800 hover:bg-zinc-900 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add To Order</span>
              </button>
            </div>
          </div>

          {/* Discounts, Delivery Fee & Calculations */}
          <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-800 flex items-center gap-2">
              <Percent className="w-4 h-4 text-[#e4002b]" />
              <span>Fees, Discounts & Order Instructions</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-zinc-600 font-bold mb-1">Delivery Fee (PKR)</label>
                <input
                  type="number"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(Number(e.target.value))}
                  className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-zinc-600 font-bold mb-1">Manual Discount (PKR)</label>
                <input
                  type="number"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  placeholder="0"
                  className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 font-mono font-bold text-emerald-700"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-zinc-600 font-bold mb-1">Rider / Kitchen Special Notes</label>
                <input
                  type="text"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. Ring bell, extra ketchup..."
                  className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2"
                />
              </div>
            </div>

            {/* Calculations Summary */}
            <div className="pt-3 border-t border-zinc-200 flex flex-wrap justify-between items-center text-xs">
              <div className="space-y-0.5 text-zinc-500">
                <p>Items Subtotal: <strong>{formatPKR(subtotal)}</strong></p>
                <p>Delivery: <strong>{formatPKR(deliveryFee)}</strong> · Discount: <strong>-{formatPKR(discountAmount)}</strong></p>
              </div>

              <div className="text-right">
                <span className="text-xs text-zinc-500 font-bold uppercase block">New Order Total</span>
                <span className="font-mono text-xl font-black text-emerald-600">
                  {formatPKR(calculatedTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-zinc-700 bg-zinc-100 hover:bg-zinc-200 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#e4002b] hover:bg-[#c30025] text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg cursor-pointer"
            >
              {isSaved ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
              <span>{isSaved ? 'Order Saved!' : 'Save Order Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
