import { Order } from '../types';

export type PrintFormat = 'thermal-58' | 'thermal-80' | 'a4';

export const ORDER_STATUS_CONFIG: Record<
  Order['status'],
  {
    id: Order['status'];
    label: string;
    shortLabel: string;
    icon: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    activeBtnBg: string;
    activeBtnText: string;
    cardBorder: string;
  }
> = {
  confirmed: {
    id: 'confirmed',
    label: 'Confirmed / New',
    shortLabel: 'Confirmed',
    icon: '🕒',
    badgeBg: 'bg-amber-100 dark:bg-amber-950/60',
    badgeText: 'text-amber-800 dark:text-amber-300',
    badgeBorder: 'border-amber-300 dark:border-amber-700',
    activeBtnBg: 'bg-amber-500 hover:bg-amber-600 border-amber-500',
    activeBtnText: 'text-white',
    cardBorder: 'border-l-amber-500',
  },
  kitchen: {
    id: 'kitchen',
    label: 'Kitchen / Preparing',
    shortLabel: 'Kitchen',
    icon: '🍳',
    badgeBg: 'bg-purple-100 dark:bg-purple-950/60',
    badgeText: 'text-purple-800 dark:text-purple-300',
    badgeBorder: 'border-purple-300 dark:border-purple-700',
    activeBtnBg: 'bg-purple-600 hover:bg-purple-700 border-purple-600',
    activeBtnText: 'text-white',
    cardBorder: 'border-l-purple-600',
  },
  dispatched: {
    id: 'dispatched',
    label: 'On Bike / Out for Delivery',
    shortLabel: 'On Bike',
    icon: '🏍️',
    badgeBg: 'bg-blue-100 dark:bg-blue-950/60',
    badgeText: 'text-blue-800 dark:text-blue-300',
    badgeBorder: 'border-blue-300 dark:border-blue-700',
    activeBtnBg: 'bg-blue-600 hover:bg-blue-700 border-blue-600',
    activeBtnText: 'text-white',
    cardBorder: 'border-l-blue-600',
  },
  delivered: {
    id: 'delivered',
    label: 'Delivered',
    shortLabel: 'Delivered',
    icon: '✅',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60',
    badgeText: 'text-emerald-800 dark:text-emerald-300',
    badgeBorder: 'border-emerald-300 dark:border-emerald-700',
    activeBtnBg: 'bg-emerald-600 hover:bg-emerald-700 border-emerald-600',
    activeBtnText: 'text-white',
    cardBorder: 'border-l-emerald-600',
  },
  cancelled: {
    id: 'cancelled',
    label: 'Cancelled',
    shortLabel: 'Cancelled',
    icon: '❌',
    badgeBg: 'bg-rose-100 dark:bg-rose-950/60',
    badgeText: 'text-rose-800 dark:text-rose-300',
    badgeBorder: 'border-rose-300 dark:border-rose-700',
    activeBtnBg: 'bg-rose-600 hover:bg-rose-700 border-rose-600',
    activeBtnText: 'text-white',
    cardBorder: 'border-l-rose-600',
  },
};

/**
 * Format currency in Pakistani Rupees (PKR)
 */
export function formatPKR(val: number): string {
  const rounded = Math.round(Number(val) || 0);
  return `Rs. ${rounded.toLocaleString('en-PK')}`;
}

/**
 * Generates clean, professional, text-only WhatsApp message without image URLs or file paths
 */
export function generateWhatsAppOrderMessage(
  order: Order,
  storeSettings?: { storeName?: string; phone?: string; storeAddress?: string }
): string {
  const storeName = storeSettings?.storeName || 'KFC Chakwal Delivery';
  const dateFormatted = order.date
    ? new Date(order.date).toLocaleString('en-PK', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'Just now';

  const lines: string[] = [];

  // Customer greeting
  lines.push(`Assalam-o-Alaikum ${order.customer.fullName?.trim() || 'Valued Customer'}!`);
  lines.push('');
  lines.push(`🍗 *${storeName}*`);
  lines.push(`*Order #${order.id}*`);
  lines.push(`📅 Date & Time: ${dateFormatted}`);
  lines.push(`🛵 Order Type: ${order.orderType === 'self_pickup' ? 'Self Pickup' : 'Delivery'}`);
  lines.push('');

  // Customer & Delivery Information
  lines.push('📋 *CUSTOMER & DELIVERY DETAILS*');
  lines.push(`• Name: ${order.customer.fullName || 'Customer'}`);
  lines.push(`• Phone: ${order.customer.phone || 'N/A'}`);
  if (order.customer.address) {
    lines.push(`• Delivery Address: ${order.customer.address}`);
  }
  if (order.customer.area) {
    lines.push(`• Area: ${order.customer.area}`);
  }
  if (order.customer.landmark) {
    lines.push(`• Landmark: ${order.customer.landmark}`);
  }
  if (order.customer.notes) {
    lines.push(`• Delivery Instructions: ${order.customer.notes}`);
  }
  if (order.specialInstructions) {
    lines.push(`• Kitchen Notes: ${order.specialInstructions}`);
  }
  lines.push('');

  // Itemized Order Details
  lines.push('🍔 *ORDER ITEMS*');
  order.items.forEach((item, idx) => {
    const itemTotal = Math.round(item.unitPrice * item.quantity);
    lines.push(`${idx + 1}. *${item.quantity}x ${item.menuItem.name}*`);
    lines.push(`   Price: ${formatPKR(item.unitPrice)} each | Line Total: ${formatPKR(itemTotal)}`);

    if (item.options?.spiceLevel) {
      lines.push(`   - Recipe / Flavor: ${item.options.spiceLevel}`);
    }
    if (item.options?.drink) {
      lines.push(`   - Drink Selection: ${item.options.drink}`);
    }
    if (item.options?.specialInstructions) {
      lines.push(`   - Customization: ${item.options.specialInstructions}`);
    }
    if (item.options?.addons && item.options.addons.length > 0) {
      const addonsStr = item.options.addons
        .map((a) => `${a.name}${a.price > 0 ? ` (+${formatPKR(a.price)})` : ''}`)
        .join(', ');
      lines.push(`   - Add-ons / Extras: ${addonsStr}`);
    }
  });
  lines.push('');

  // Bill Summary
  lines.push('💰 *BILL SUMMARY*');
  lines.push(`• Subtotal: ${formatPKR(order.subtotal)}`);

  if (order.discount && order.discount > 0) {
    lines.push(`• Coupon / Discount: -${formatPKR(order.discount)}`);
  }
  if (order.vipDiscount && order.vipDiscount > 0) {
    const tier = order.vipTierApplied ? order.vipTierApplied.toUpperCase() : 'VIP';
    lines.push(`• VIP Club Discount (${tier}): -${formatPKR(order.vipDiscount)}`);
  }
  if (order.loyaltyDiscount && order.loyaltyDiscount > 0) {
    lines.push(`• Loyalty Points Discount: -${formatPKR(order.loyaltyDiscount)}`);
  }
  if (order.taxAmount && order.taxAmount > 0) {
    lines.push(`• Tax (${order.taxPercentage || 0}%): ${formatPKR(order.taxAmount)}`);
  }
  if (order.serviceChargeAmount && order.serviceChargeAmount > 0) {
    lines.push(`• Service Charge: ${formatPKR(order.serviceChargeAmount)}`);
  }

  lines.push(`• Delivery Charges: ${formatPKR(order.deliveryFee || 0)}`);
  lines.push('----------------------------------------');
  lines.push(`*TOTAL PAYABLE: ${formatPKR(order.total)}*`);

  const paymentLabels: Record<string, string> = {
    cod: 'Cash on Delivery (COD)',
    jazzcash: 'JazzCash',
    easypaisa: 'EasyPaisa',
    bank_transfer: 'Bank Transfer',
  };
  const payMethod = paymentLabels[order.paymentMethod] || String(order.paymentMethod).toUpperCase();
  lines.push(`💳 Payment Method: ${payMethod}`);

  const statusInfo = ORDER_STATUS_CONFIG[order.status] || { label: order.status };
  lines.push(`📌 Order Status: ${statusInfo.label}`);
  lines.push('');
  lines.push('Thank you for ordering with KFC Chakwal Delivery!');

  return lines.join('\n');
}

/**
 * Sanitize and format phone number for WhatsApp Click-to-Chat URL
 */
export function getWhatsAppUrl(phone: string, text: string): string {
  const cleanPhone = String(phone || '').replace(/[^0-9]/g, '');
  const internationalPhone = cleanPhone.startsWith('92')
    ? cleanPhone
    : cleanPhone.startsWith('0')
    ? '92' + cleanPhone.slice(1)
    : cleanPhone;

  return `https://wa.me/${internationalPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Generate HTML string for receipts / invoices supporting 58mm, 80mm and A4
 */
export function generateInvoiceHtml(
  orders: Order[],
  format: PrintFormat,
  storeSettings?: any
): string {
  const storeName = storeSettings?.storeName || 'KFC Chakwal Delivery';
  const phone = storeSettings?.phone || '0325 2777574';
  const address = storeSettings?.storeAddress || 'Talagang Road, Near Tehsil Chowk, Chakwal';

  const orderPages = orders.map((order) => {
    const dateFormatted = order.date
      ? new Date(order.date).toLocaleString('en-PK', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : new Date().toLocaleString();

    const paymentLabels: Record<string, string> = {
      cod: 'Cash on Delivery (COD)',
      jazzcash: 'JazzCash',
      easypaisa: 'EasyPaisa',
      bank_transfer: 'Bank Transfer',
    };
    const paymentMethodText = paymentLabels[order.paymentMethod] || String(order.paymentMethod).toUpperCase();
    const statusLabel = ORDER_STATUS_CONFIG[order.status]?.label || order.status;

    if (format === 'a4') {
      // Professional A4 Invoice Layout
      const itemsRows = order.items
        .map((item, idx) => {
          const itemTotal = item.unitPrice * item.quantity;
          const optionsDetails = [
            item.options?.spiceLevel ? `Spice: ${item.options.spiceLevel}` : '',
            item.options?.drink ? `Drink: ${item.options.drink}` : '',
            item.options?.addons?.length
              ? `Extras: ${item.options.addons.map((a) => `${a.name} (+${formatPKR(a.price)})`).join(', ')}`
              : '',
            item.options?.specialInstructions ? `Note: ${item.options.specialInstructions}` : '',
          ]
            .filter(Boolean)
            .join(' | ');

          return `
            <tr class="item-row">
              <td class="col-num">${idx + 1}</td>
              <td class="col-desc">
                <div class="item-name">${item.menuItem.name}</div>
                ${optionsDetails ? `<div class="item-meta">${optionsDetails}</div>` : ''}
              </td>
              <td class="col-qty">${item.quantity}</td>
              <td class="col-rate">${formatPKR(item.unitPrice)}</td>
              <td class="col-amount">${formatPKR(itemTotal)}</td>
            </tr>
          `;
        })
        .join('');

      return `
        <div class="invoice-page a4-page">
          <!-- Header -->
          <div class="a4-header">
            <div class="brand-left">
              <div class="kfc-tag">AUTHENTIC TASTE · SWIFT DELIVERY</div>
              <h1 class="brand-title">${storeName}</h1>
              <div class="brand-sub">${address}</div>
              <div class="brand-contact">Helpline / WhatsApp: ${phone}</div>
            </div>
            <div class="invoice-meta-right">
              <div class="invoice-badge">TAX INVOICE / DELIVERY BILL</div>
              <div class="meta-row"><strong>Order ID:</strong> #${order.id}</div>
              <div class="meta-row"><strong>Date:</strong> ${dateFormatted}</div>
              <div class="meta-row"><strong>Type:</strong> ${order.orderType === 'self_pickup' ? 'Self Pickup' : 'Home Delivery'}</div>
              <div class="meta-row"><strong>Status:</strong> <span class="status-tag status-${order.status}">${statusLabel}</span></div>
            </div>
          </div>

          <div class="divider-line"></div>

          <!-- Customer & Address Grid -->
          <div class="customer-grid">
            <div class="info-block">
              <div class="block-title">BILL TO / CUSTOMER</div>
              <div class="info-line"><strong>Name:</strong> ${order.customer.fullName || 'Valued Customer'}</div>
              <div class="info-line"><strong>Phone:</strong> ${order.customer.phone || 'N/A'}</div>
              ${order.customer.email ? `<div class="info-line"><strong>Email:</strong> ${order.customer.email}</div>` : ''}
            </div>
            <div class="info-block">
              <div class="block-title">DELIVERY DESTINATION</div>
              <div class="info-line"><strong>Address:</strong> ${order.customer.address || 'Tehsil Chowk Area'}</div>
              ${order.customer.area ? `<div class="info-line"><strong>Area:</strong> ${order.customer.area}</div>` : ''}
              ${order.customer.landmark ? `<div class="info-line"><strong>Landmark:</strong> ${order.customer.landmark}</div>` : ''}
              ${order.customer.notes ? `<div class="info-line"><strong>Instructions:</strong> ${order.customer.notes}</div>` : ''}
            </div>
          </div>

          <!-- Items Table -->
          <table class="a4-table">
            <thead>
              <tr>
                <th class="col-num">#</th>
                <th class="col-desc">ITEM & SPECIFICATIONS</th>
                <th class="col-qty">QTY</th>
                <th class="col-rate">UNIT PRICE</th>
                <th class="col-amount">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>

          <!-- Summary & Totals -->
          <div class="summary-section">
            <div class="summary-notes">
              <div class="notes-heading">PAYMENT & INSTRUCTIONS</div>
              <p><strong>Payment Method:</strong> ${paymentMethodText}</p>
              <p><strong>Payment Status:</strong> ${order.paymentMethod === 'cod' ? 'Cash on Delivery (Pay to Rider)' : 'Paid / Online'}</p>
              ${order.specialInstructions ? `<p><strong>Kitchen Instructions:</strong> ${order.specialInstructions}</p>` : ''}
              <div class="thank-you-box">
                Thank you for choosing KFC Chakwal Delivery! We serve hot, fresh and crispy food prepared to authentic recipes.
              </div>
            </div>

            <div class="totals-box">
              <div class="totals-row">
                <span>Subtotal:</span>
                <span>${formatPKR(order.subtotal)}</span>
              </div>
              ${order.discount ? `
                <div class="totals-row discount">
                  <span>Discount:</span>
                  <span>-${formatPKR(order.discount)}</span>
                </div>
              ` : ''}
              ${order.vipDiscount ? `
                <div class="totals-row discount">
                  <span>VIP Club Discount:</span>
                  <span>-${formatPKR(order.vipDiscount)}</span>
                </div>
              ` : ''}
              ${order.loyaltyDiscount ? `
                <div class="totals-row discount">
                  <span>Loyalty Points Discount:</span>
                  <span>-${formatPKR(order.loyaltyDiscount)}</span>
                </div>
              ` : ''}
              ${order.taxAmount ? `
                <div class="totals-row">
                  <span>Tax (${order.taxPercentage || 0}%):</span>
                  <span>${formatPKR(order.taxAmount)}</span>
                </div>
              ` : ''}
              ${order.serviceChargeAmount ? `
                <div class="totals-row">
                  <span>Service Charge:</span>
                  <span>${formatPKR(order.serviceChargeAmount)}</span>
                </div>
              ` : ''}
              <div class="totals-row">
                <span>Delivery Charges:</span>
                <span>${formatPKR(order.deliveryFee || 0)}</span>
              </div>
              <div class="totals-row grand-total">
                <span>TOTAL PAYABLE:</span>
                <span>${formatPKR(order.total)}</span>
              </div>
            </div>
          </div>

          <div class="a4-footer">
            <div>For assistance, rider tracking or inquiries, WhatsApp <strong>${phone}</strong></div>
            <div class="footer-copy">Generated by KFC Chakwal Delivery Billing System</div>
          </div>
        </div>
      `;
    }

    // Thermal Receipt (58mm or 80mm)
    const is58 = format === 'thermal-58';
    const itemsHtml = order.items
      .map((item) => {
        const itemTotal = item.unitPrice * item.quantity;
        return `
          <div class="thermal-item">
            <div class="thermal-item-head">
              <span class="qty-name">${item.quantity}x ${item.menuItem.name}</span>
              <span class="price">${formatPKR(itemTotal)}</span>
            </div>
            ${item.options?.spiceLevel ? `<div class="sub-detail">• ${item.options.spiceLevel}</div>` : ''}
            ${item.options?.drink ? `<div class="sub-detail">• ${item.options.drink}</div>` : ''}
            ${
              item.options?.addons?.length
                ? `<div class="sub-detail">• ${item.options.addons.map((a) => `${a.name} (+${formatPKR(a.price)})`).join(', ')}</div>`
                : ''
            }
            ${item.options?.specialInstructions ? `<div class="sub-detail">• Note: ${item.options.specialInstructions}</div>` : ''}
          </div>
        `;
      })
      .join('');

    return `
      <div class="invoice-page thermal-page ${is58 ? 'thermal-58' : 'thermal-80'}">
        <div class="center brand-title">${storeName}</div>
        <div class="center brand-sub">CHAKWAL DELIVERY</div>
        <div class="center brand-phone">Helpline: ${phone}</div>
        <div class="dashed-hr"></div>

        <div class="meta-line"><span>Order ID:</span> <strong>#${order.id}</strong></div>
        <div class="meta-line"><span>Date:</span> <span>${dateFormatted}</span></div>
        <div class="meta-line"><span>Type:</span> <span>${order.orderType === 'self_pickup' ? 'Takeaway' : 'Delivery'}</span></div>
        <div class="meta-line"><span>Status:</span> <span>${statusLabel}</span></div>
        <div class="dashed-hr"></div>

        <div class="cust-info">
          <div><b>Customer:</b> ${order.customer.fullName || 'Valued Customer'}</div>
          <div><b>Phone:</b> ${order.customer.phone || 'N/A'}</div>
          ${order.customer.area ? `<div><b>Area:</b> ${order.customer.area}</div>` : ''}
          <div><b>Address:</b> ${order.customer.address || 'Chakwal'}</div>
          ${order.customer.landmark ? `<div><b>Landmark:</b> ${order.customer.landmark}</div>` : ''}
          ${order.customer.notes ? `<div><b>Delivery Note:</b> ${order.customer.notes}</div>` : ''}
          ${order.specialInstructions ? `<div><b>Kitchen Note:</b> ${order.specialInstructions}</div>` : ''}
        </div>
        <div class="dashed-hr"></div>

        <div class="section-title">ORDER ITEMS</div>
        <div class="items-list">
          ${itemsHtml}
        </div>
        <div class="dashed-hr"></div>

        <div class="totals-table">
          <div class="t-row"><span>Subtotal:</span> <span>${formatPKR(order.subtotal)}</span></div>
          ${order.discount ? `<div class="t-row"><span>Discount:</span> <span>-${formatPKR(order.discount)}</span></div>` : ''}
          ${order.vipDiscount ? `<div class="t-row"><span>VIP Discount:</span> <span>-${formatPKR(order.vipDiscount)}</span></div>` : ''}
          ${order.loyaltyDiscount ? `<div class="t-row"><span>Loyalty Discount:</span> <span>-${formatPKR(order.loyaltyDiscount)}</span></div>` : ''}
          ${order.taxAmount ? `<div class="t-row"><span>Tax (${order.taxPercentage}%):</span> <span>${formatPKR(order.taxAmount)}</span></div>` : ''}
          ${order.serviceChargeAmount ? `<div class="t-row"><span>Service Charge:</span> <span>${formatPKR(order.serviceChargeAmount)}</span></div>` : ''}
          <div class="t-row"><span>Delivery Fee:</span> <span>${formatPKR(order.deliveryFee || 0)}</span></div>
          <div class="solid-hr"></div>
          <div class="t-row grand"><span>TOTAL BILL:</span> <span>${formatPKR(order.total)}</span></div>
        </div>

        <div class="dashed-hr"></div>
        <div class="meta-line"><span>Payment:</span> <strong>${paymentMethodText}</strong></div>

        <div class="center thank-you">
          *** THANK YOU FOR ORDERING ***<br/>
          Fresh & Hot Delivered in Chakwal
        </div>
        <div class="cut-line">--------------------------------</div>
      </div>
    `;
  });

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>KFC Chakwal Delivery — Bill</title>
      <style>
        @page {
          size: ${format === 'a4' ? 'A4 portrait' : format === 'thermal-58' ? '58mm auto' : '80mm auto'};
          margin: ${format === 'a4' ? '12mm' : '2mm'};
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: ${format === 'a4' ? '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : 'monospace, -apple-system, sans-serif'};
          background: #fff;
          color: #000;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .invoice-page {
          page-break-after: always;
          break-after: page;
          box-sizing: border-box;
        }
        .invoice-page:last-child {
          page-break-after: auto;
          break-after: auto;
        }

        /* ================= A4 INVOICE STYLES ================= */
        .a4-page {
          width: 100%;
          max-width: 210mm;
          margin: 0 auto;
          padding: 10mm;
          background: #fff;
          font-size: 12px;
          line-height: 1.45;
          color: #1f2937;
        }
        .a4-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 12px;
        }
        .kfc-tag {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.5px;
          color: #e4002b;
          text-transform: uppercase;
        }
        .brand-title {
          font-size: 24px;
          font-weight: 900;
          color: #e4002b;
          text-transform: uppercase;
          letter-spacing: -0.5px;
          line-height: 1.1;
          margin: 2px 0;
        }
        .brand-sub {
          font-size: 11px;
          color: #4b5563;
        }
        .brand-contact {
          font-size: 11px;
          font-weight: 700;
          color: #111827;
          margin-top: 3px;
        }
        .invoice-meta-right {
          text-align: right;
          min-width: 200px;
        }
        .invoice-badge {
          display: inline-block;
          background: #e4002b;
          color: #fff;
          font-weight: 900;
          font-size: 10px;
          letter-spacing: 1px;
          padding: 3px 8px;
          border-radius: 4px;
          margin-bottom: 6px;
        }
        .meta-row {
          font-size: 11px;
          margin-bottom: 2px;
        }
        .status-tag {
          display: inline-block;
          font-size: 10px;
          font-weight: 800;
          padding: 1px 6px;
          border-radius: 3px;
          text-transform: uppercase;
        }
        .status-confirmed { background: #fef3c7; color: #92400e; }
        .status-kitchen { background: #f3e8ff; color: #6b21a8; }
        .status-dispatched { background: #dbeafe; color: #1e40af; }
        .status-delivered { background: #d1fae5; color: #065f46; }
        .status-cancelled { background: #fee2e2; color: #991b1b; }

        .divider-line {
          height: 2px;
          background: #e4002b;
          margin: 10px 0 16px 0;
        }

        .customer-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 12px 14px;
        }
        .block-title {
          font-size: 10px;
          font-weight: 800;
          color: #e4002b;
          letter-spacing: 1px;
          margin-bottom: 6px;
        }
        .info-line {
          font-size: 11.5px;
          margin-bottom: 3px;
        }

        .a4-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 16px;
        }
        .a4-table th {
          background: #111827;
          color: #fff;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.5px;
          padding: 8px 10px;
          text-align: left;
        }
        .a4-table th.col-qty, .a4-table th.col-rate, .a4-table th.col-amount {
          text-align: right;
        }
        .a4-table td {
          padding: 8px 10px;
          border-bottom: 1px solid #e5e7eb;
          vertical-align: top;
          font-size: 11.5px;
        }
        .col-num { width: 30px; text-align: center; }
        .col-desc { width: auto; }
        .col-qty { width: 50px; text-align: right; font-weight: 700; }
        .col-rate { width: 100px; text-align: right; }
        .col-amount { width: 110px; text-align: right; font-weight: 700; }
        .item-name { font-weight: 800; color: #111827; }
        .item-meta { font-size: 10px; color: #6b21a8; margin-top: 2px; }

        .summary-section {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 20px;
          margin-bottom: 16px;
        }
        .summary-notes {
          font-size: 11px;
          color: #4b5563;
        }
        .notes-heading {
          font-size: 10px;
          font-weight: 800;
          color: #111827;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
        .thank-you-box {
          margin-top: 10px;
          padding: 8px 10px;
          border-left: 3px solid #e4002b;
          background: #fef2f2;
          color: #991b1b;
          font-size: 10.5px;
          font-weight: 600;
        }

        .totals-box {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 10px 14px;
        }
        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 3px 0;
          font-size: 11.5px;
        }
        .totals-row.discount {
          color: #059669;
          font-weight: 600;
        }
        .totals-row.grand-total {
          border-top: 2px solid #111827;
          margin-top: 6px;
          padding-top: 6px;
          font-size: 14px;
          font-weight: 900;
          color: #e4002b;
        }

        .a4-footer {
          border-top: 1px solid #e5e7eb;
          padding-top: 10px;
          font-size: 10px;
          color: #6b21a8;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        /* ================= THERMAL RECEIPT STYLES ================= */
        .thermal-page {
          margin: 0 auto;
          padding: 4px 6px;
          background: #fff;
          color: #000;
          line-height: 1.35;
        }
        .thermal-58 {
          width: 54mm;
          font-size: 9.5px;
        }
        .thermal-80 {
          width: 72mm;
          font-size: 11px;
        }
        .center {
          text-align: center;
        }
        .thermal-page .brand-title {
          font-size: 14px;
          font-weight: 900;
          color: #000;
          margin-bottom: 2px;
        }
        .thermal-page .brand-sub {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1px;
        }
        .thermal-page .brand-phone {
          font-size: 9px;
        }
        .dashed-hr {
          border-bottom: 1px dashed #000;
          margin: 4px 0;
        }
        .solid-hr {
          border-bottom: 1px solid #000;
          margin: 3px 0;
        }
        .meta-line {
          display: flex;
          justify-content: space-between;
          font-size: 9.5px;
          margin-bottom: 1px;
        }
        .cust-info {
          font-size: 9.5px;
          margin: 3px 0;
          line-height: 1.3;
        }
        .section-title {
          font-weight: 800;
          font-size: 9.5px;
          text-align: center;
          margin: 2px 0;
        }
        .thermal-item {
          margin-bottom: 3px;
        }
        .thermal-item-head {
          display: flex;
          justify-content: space-between;
          font-weight: 700;
        }
        .sub-detail {
          font-size: 8.5px;
          padding-left: 6px;
          color: #222;
        }
        .totals-table {
          margin: 3px 0;
        }
        .t-row {
          display: flex;
          justify-content: space-between;
          font-size: 9.5px;
          margin-bottom: 1px;
        }
        .t-row.grand {
          font-size: 12px;
          font-weight: 900;
        }
        .thank-you {
          margin: 6px 0 3px 0;
          font-size: 8.5px;
          font-weight: 700;
        }
        .cut-line {
          text-align: center;
          font-size: 8px;
          letter-spacing: -1px;
          margin-top: 4px;
        }
      </style>
    </head>
    <body>
      ${orderPages.join('')}
    </body>
    </html>
  `;
}

/**
 * Native browser print execution using an isolated hidden iframe
 */
export function printOrdersReceipt(
  orders: Order[],
  format: PrintFormat,
  storeSettings?: any
): void {
  if (!orders || orders.length === 0) return;

  const htmlContent = generateInvoiceHtml(orders, format, storeSettings);

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.visibility = 'hidden';

  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    return;
  }

  doc.open();
  doc.write(htmlContent);
  doc.close();

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.error('Print trigger error:', e);
    }
  }, 350);

  // Clean up iframe after printing dialog closes
  setTimeout(() => {
    if (document.body.contains(iframe)) {
      document.body.removeChild(iframe);
    }
  }, 45000);
}
