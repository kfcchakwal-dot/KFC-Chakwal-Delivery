const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { onRequest } = require('firebase-functions/v2/https');
const logger = require('firebase-functions/logger');


initializeApp();

const DATABASE_ID = 'ai-studio-kfcchakwaldelive-c794408e-894c-4201-b835-4e01c97c705e';
const APP_ORIGIN = process.env.APP_ORIGIN || 'https://kfc-chakwal-delivery.kfcchakwal.workers.dev';
const db = getFirestore(undefined, DATABASE_ID);

exports.notifyAdminsOnNewOrder = onDocumentCreated(
  {
    document: 'orders/{orderId}',
    database: DATABASE_ID,
    region: 'us-central1',
    retry: true,
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;
    const order = snapshot.data() || {};
    const orderId = String(order.id || event.params.orderId || 'New order');
    const total = Number(order.total || 0);
    const customerName = String(order.customer?.fullName || 'Customer').slice(0, 80);
    const tokensSnapshot = await db.collection('adminPushTokens').where('active', '==', true).get();
    const tokens = [...new Set(tokensSnapshot.docs
      .map((doc) => String(doc.data().token || ''))
      .filter((token) => token.length > 0))];

    if (!tokens.length) {
      logger.info('Order saved, but no admin push tokens are registered.', { orderId });
      return;
    }

    const response = await getMessaging().sendEachForMulticast({
      tokens,
      notification: {
        title: '🍗 New KFC Chakwal Order',
        body: '#' + orderId + ' · ' + customerName + ' · Rs. ' + total.toLocaleString('en-PK'),
      },
      data: {
        url: APP_ORIGIN + '/seller',
        orderId,
      },
      webpush: {
        fcmOptions: { link: APP_ORIGIN + '/seller' },
        notification: {
          icon: APP_ORIGIN + '/pwa-192.png',
          badge: APP_ORIGIN + '/pwa-192.png',
          tag: 'kfc-order-' + orderId,
          requireInteraction: true,
        },
      },
    });

    const staleTokens = [];
    response.responses.forEach((result, index) => {
      if (!result.success && (
        result.error?.code === 'messaging/registration-token-not-registered' ||
        result.error?.code === 'messaging/invalid-registration-token'
      )) {
        staleTokens.push(tokens[index]);
      }
    });
    await Promise.all(staleTokens.map((token) => db.collection('adminPushTokens').doc(token).delete().catch(() => {})));
    logger.info('Admin order push sent.', {
      orderId,
      successCount: response.successCount,
      failureCount: response.failureCount,
      removedStaleTokens: staleTokens.length,
    });
  }
);

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
}

function absoluteImageUrl(value) {
  const image = String(value || '').trim();
  if (!image) return APP_ORIGIN + '/pwa-512.png';
  try { return new URL(image, APP_ORIGIN).href; } catch { return APP_ORIGIN + '/pwa-512.png'; }
}

// Social crawlers need server-rendered Open Graph tags; a client-side SPA cannot
// reliably supply product-specific image/title previews to WhatsApp or Facebook.
exports.productShare = onRequest({ region: 'us-central1', cors: true }, async (req, res) => {
  const productId = String(req.query.product || '').slice(0, 160);
  const destination = APP_ORIGIN + (productId ? '/?product=' + encodeURIComponent(productId) : '/');
  const previewUrl = 'https://' + String(req.get('host') || '').replace(/[^a-zA-Z0-9.:-]/g, '') + req.originalUrl;
  try {
    const publicSnapshot = await db.collection('storePublic').doc('global').get();
    let publicData = publicSnapshot.exists ? publicSnapshot.data() || {} : {};
    if (!Array.isArray(publicData.menuItems) || publicData.menuItems.length === 0) {
      const legacySnapshot = await db.collection('storeSettings').doc('global').get();
      if (legacySnapshot.exists) publicData = { ...legacySnapshot.data(), ...publicData };
    }
    const products = Array.isArray(publicData.menuItems) ? publicData.menuItems : [];
    const item = products.find((product) => String(product.id) === productId);
    if (!item) {
      const fallbackTitle = 'KFC Chakwal Delivery';
      const fallbackDescription = 'View menu items and order from KFC Chakwal Delivery.';
      const fallbackImage = APP_ORIGIN + '/pwa-512.png';
      res.set({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }).status(200).send(
        '<!doctype html><html><head><meta charset="utf-8">' +
        '<meta property="og:type" content="website">' +
        '<meta property="og:title" content="' + escapeHtml(fallbackTitle) + '">' +
        '<meta property="og:description" content="' + escapeHtml(fallbackDescription) + '">' +
        '<meta property="og:image" content="' + escapeHtml(fallbackImage) + '">' +
        '<meta http-equiv="refresh" content="1;url=' + escapeHtml(destination) + '">' +
        '<title>' + escapeHtml(fallbackTitle) + '</title></head><body><a href="' + escapeHtml(destination) + '">Open KFC Chakwal Delivery</a></body></html>'
      );
      return;
    }

    const settings = publicData.settings || {};
    const name = String(item.name || 'KFC Chakwal Delivery').slice(0, 160);
    const description = String(item.description || 'Order your favourite meal from KFC Chakwal Delivery.').replace(/\\s+/g, ' ').slice(0, 260);
    const rawPrice = Number(item.sellingPrice > 0 ? item.sellingPrice : Number(item.baseKfcPrice || 0) * (1 + Number(settings.markupPercentage ?? 12) / 100));
    const price = 'Rs. ' + Math.round(rawPrice).toLocaleString('en-PK');
    const socialDescription = (description + ' · Selling Price: ' + price).slice(0, 300);
    const image = absoluteImageUrl(item.image || item.galleryImages?.[0]);
    const title = name + ' | KFC Chakwal Delivery';
    const html = '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>' + escapeHtml(title) + '</title>' +
      '<meta name="description" content="' + escapeHtml(socialDescription) + '">' +
      '<meta property="og:type" content="product">' +
      '<meta property="og:site_name" content="KFC Chakwal Delivery">' +
      '<meta property="og:title" content="' + escapeHtml(title) + '">' +
      '<meta property="og:description" content="' + escapeHtml(socialDescription) + '">' +
      '<meta property="og:image" content="' + escapeHtml(image) + '">' +
      '<meta property="og:image:secure_url" content="' + escapeHtml(image) + '">' +
      '<meta property="og:image:alt" content="' + escapeHtml(name) + '">' +
      '<meta property="og:url" content="' + escapeHtml(previewUrl) + '">' +
      '<meta name="twitter:card" content="summary_large_image">' +
      '<meta name="twitter:title" content="' + escapeHtml(title) + '">' +
      '<meta name="twitter:description" content="' + escapeHtml(socialDescription) + '">' +
      '<meta name="twitter:image" content="' + escapeHtml(image) + '">' +
      '<meta http-equiv="refresh" content="1;url=' + escapeHtml(destination) + '">' +
      '</head><body><h1>' + escapeHtml(name) + '</h1><p>' + escapeHtml(socialDescription) +
      '</p><img src="' + escapeHtml(image) + '" alt="' + escapeHtml(name) + '" style="max-width:320px;width:100%">' +
      '<p><a href="' + escapeHtml(destination) + '">Open product and order</a></p>' +
      '<script>setTimeout(function(){location.replace(' + JSON.stringify(destination) + ')},1200)</script>' +
      '</body></html>';
    res.set({
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
      'X-Content-Type-Options': 'nosniff',
    }).status(200).send(html);
  } catch (error) {
    logger.error('Product share preview failed', { productId, error: String(error) });
    res.redirect(302, destination);
  }
});

// Server-side review workflow. It records eligible delivered orders once, and sends
// WhatsApp only when an approved template and Cloud API credentials are configured.
exports.queueReviewRequests = onSchedule(
  { schedule: 'every 15 minutes', timeZone: 'Asia/Karachi', region: 'us-central1', retryCount: 2 },
  async () => {
    const publicSnapshot = await db.collection('storePublic').doc('global').get();
    const publicData = publicSnapshot.exists ? publicSnapshot.data() || {} : {};
    const autoReview = publicData.settings?.autoReview || {};
    if (autoReview.enabled !== true || autoReview.autoSendWhatsapp !== true) {
      logger.info('Automated review requests disabled in store settings.');
      return;
    }

    const delayHours = Math.max(1, Math.min(168, Number(autoReview.delayHours || 12)));
    const cutoff = Date.now() - delayHours * 60 * 60 * 1000;
    const ordersSnapshot = await db.collection('orders').where('status', '==', 'delivered').get();
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    const templateName = process.env.WHATSAPP_REVIEW_TEMPLATE || '';
    const templateLanguage = process.env.WHATSAPP_REVIEW_TEMPLATE_LANGUAGE || 'en';

    for (const orderDoc of ordersSnapshot.docs) {
      const order = orderDoc.data() || {};
      const deliveredAt = Date.parse(order.updatedAt || order.date || '');
      if (!Number.isFinite(deliveredAt) || deliveredAt > cutoff) continue;
      const requestRef = db.collection('reviewRequests').doc(orderDoc.id);
      const existing = await requestRef.get();
      const existingStatus = String(existing.data()?.status || '');
      if (existing.exists && ['sent', 'queued'].includes(existingStatus)) continue;
      const hasWhatsAppConfig = Boolean(accessToken && phoneNumberId && templateName);
      if (existingStatus === 'pending_config' && !hasWhatsAppConfig && order.customer?.phone) continue;

      const customerName = String(order.customer?.fullName || 'Customer').slice(0, 80);
      const rawPhone = String(order.customer?.phone || '').replace(/[^0-9]/g, '');
      const phone = rawPhone.startsWith('0') ? '92' + rawPhone.slice(1) : rawPhone;
      const firstItem = Array.isArray(order.items) ? order.items[0]?.menuItem : null;
      const reviewUrl = APP_ORIGIN + (firstItem?.id ? '/?product=' + encodeURIComponent(firstItem.id) : '/');
      const baseRecord = {
        orderId: String(order.id || orderDoc.id),
        customerUid: order.customer?.uid || null,
        customerName,
        phone: String(order.customer?.phone || ''),
        reviewUrl,
        channel: 'whatsapp',
        requestedAt: new Date().toISOString(),
        automated: true,
        delayHours,
      };

      if (!accessToken || !phoneNumberId || !templateName || !phone) {
        await requestRef.set({
          ...baseRecord,
          status: 'pending_config',
          lastError: 'Configure WhatsApp Cloud API credentials and an approved review template.',
        }, { merge: true });
        continue;
      }

      try {
        const response = await fetch('https://graph.facebook.com/v22.0/' + encodeURIComponent(phoneNumberId) + '/messages', {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + accessToken, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: phone,
            type: 'template',
            template: {
              name: templateName,
              language: { code: templateLanguage },
              components: [{
                type: 'body',
                parameters: [
                  { type: 'text', text: customerName },
                  { type: 'text', text: reviewUrl },
                ],
              }],
            },
          }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error?.message || 'WhatsApp Cloud API request failed.');
        await requestRef.set({ ...baseRecord, status: 'sent', providerMessageId: payload.messages?.[0]?.id || null }, { merge: true });
      } catch (error) {
        await requestRef.set({ ...baseRecord, status: 'failed', lastError: String(error).slice(0, 500) }, { merge: true });
        logger.error('WhatsApp review request failed', { orderId: orderDoc.id, error: String(error) });
      }
    }
  }
);

