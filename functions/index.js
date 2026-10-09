const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
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
