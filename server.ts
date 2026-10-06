import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import dns from 'dns/promises';
import { createServer as createViteServer } from 'vite';
import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { FieldValue, getFirestore, type Firestore } from 'firebase-admin/firestore';

// Load Firebase configuration
const firebaseConfigPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
let firebaseConfig: any = {};
if (fs.existsSync(firebaseConfigPath)) {
  try {
    firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf-8'));
  } catch (e) {
    console.warn('Failed to parse firebase-applet-config.json:', e);
  }
}

// Initialize Firebase Admin if not already initialized
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId || 'gen-lang-client-0313861453';
const FIRESTORE_DATABASE_ID = process.env.FIRESTORE_DATABASE_ID || firebaseConfig.firestoreDatabaseId || '(default)';

let firestoreDb: Firestore | null = null;
let firebaseAuth: Auth | null = null;

try {
  if (!getApps().length) {
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const credential = clientEmail && privateKey
      ? cert({ projectId: PROJECT_ID, clientEmail, privateKey })
      : applicationDefault();
    initializeApp({ projectId: PROJECT_ID, credential });
  }
  firestoreDb = FIRESTORE_DATABASE_ID && FIRESTORE_DATABASE_ID !== '(default)'
    ? getFirestore(FIRESTORE_DATABASE_ID)
    : getFirestore();
  firebaseAuth = getAuth();
  console.log(`[Firebase Admin] Initialized for project "${PROJECT_ID}", database "${FIRESTORE_DATABASE_ID}"`);
} catch (err) {
  console.warn('[Firebase Admin] Initialization warning (running in hybrid mode):', err);
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Static files from public directory with proper PWA headers
app.use(express.static(path.resolve(process.cwd(), 'public'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('manifest.json')) {
      res.setHeader('Content-Type', 'application/manifest+json');
    } else if (filePath.endsWith('sw.js')) {
      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Service-Worker-Allowed', '/');
    }
  }
}));

// Fallback JSON stores for local caching / initial bootstrap
// =========================================================================
// AUTHENTICATION MIDDLEWARE: Verify Admin Token
// =========================================================================
async function verifyAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid Authorization header' });
  }

  const token = authHeader.split('Bearer ')[1]?.trim();
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Empty token' });
  }

  if (!firebaseAuth) {
    // If Firebase Auth is not ready on server, reject client-side bypass attempts
    return res.status(503).json({ error: 'Auth service unavailable on server' });
  }

  try {
    const decodedToken = await firebaseAuth.verifyIdToken(token);
    const uid = decodedToken.uid;
    let isAuthorizedAdmin = decodedToken.admin === true;
    if (!isAuthorizedAdmin && firestoreDb) {
      const adminDoc = await firestoreDb.collection('adminUsers').doc(uid).get();
      isAuthorizedAdmin = adminDoc.exists && adminDoc.data()?.role === 'admin' && adminDoc.data()?.active !== false;
    }

    if (!isAuthorizedAdmin) {
      return res.status(403).json({ error: 'Forbidden: User is not authorized as administrator' });
    }

    (req as any).adminUser = decodedToken;
    next();
  } catch (error: any) {
    console.error('[Auth Error] verifyIdToken failed:', error.message);
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
}

// Optional customer auth verifier
async function getOptionalCustomerAuth(req: Request): Promise<{ uid: string; phone?: string; admin?: boolean } | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ') || !firebaseAuth) return null;
  const token = authHeader.split('Bearer ')[1]?.trim();
  if (!token) return null;
  try {
    const decoded = await firebaseAuth.verifyIdToken(token);
    return { uid: decoded.uid, phone: decoded.phone_number, admin: decoded.admin === true };
  } catch {
    return null;
  }
}

// =========================================================================
// API ENDPOINTS
// =========================================================================

// GET /api/store-data (Public Storefront settings & catalogue)
app.get('/api/store-data', async (req, res) => {
  try {
    if (firestoreDb) {
      const docRef = await firestoreDb.collection('storeSettings').doc('global').get();
      if (docRef.exists) {
        const data: any = docRef.data() || {};
        const auth = await getOptionalCustomerAuth(req);
        let isAdminRequest = Boolean(auth?.admin);
        if (!isAdminRequest && auth?.uid && firestoreDb) {
          const adminDoc = await firestoreDb.collection('adminUsers').doc(auth.uid).get();
          isAdminRequest = adminDoc.exists && adminDoc.data()?.role === 'admin' && adminDoc.data()?.active !== false;
        }
        const safe = { ...data };
        const sanitizeSettings = (settings: any) => {
          if (!settings || typeof settings !== 'object') return settings;
          const clean = { ...settings };
          delete clean.adminUsers;
          if (clean.metaCommerce) {
            clean.metaCommerce = { ...clean.metaCommerce };
            delete clean.metaCommerce.conversionsApiToken;
          }
          return clean;
        };
        if (!isAdminRequest) {
          delete safe.adminUsers;
          safe.settings = sanitizeSettings(safe.settings);
        }
        if (safe.metaCommerce) {
          safe.metaCommerce = sanitizeSettings(safe.metaCommerce);
        }
        return res.json(safe);
      }
    }
    return res.status(503).json({ error: 'Firestore is unavailable' });
  } catch (err: any) {
    console.error('Error reading store data:', err);
    res.status(500).json({ error: 'Failed to read store data' });
  }
});

// POST /api/store-data (Admin Only)
app.post('/api/store-data', verifyAdminAuth, async (req, res) => {
  try {
    const payload = req.body || {};
    const updated = {
      ...payload,
      lastUpdated: new Date().toISOString(),
    };

    if (!firestoreDb) return res.status(503).json({ error: 'Firestore is unavailable' });
    await firestoreDb.collection('storeSettings').doc('global').set(updated, { merge: true });
    if (Array.isArray(payload.menuItems)) {
      const batch = firestoreDb.batch();
      for (const product of payload.menuItems) {
        if (!product?.id || !product?.name) continue;
        batch.set(firestoreDb.collection('products').doc(String(product.id)), { ...product, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
      }
      await batch.commit();
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update store data' });
  }
});

// GET /api/orders (Admin gets all, Customer with token gets only own orders)
app.get('/api/orders', async (req, res) => {
  try {
    const customer = await getOptionalCustomerAuth(req);
    const authHeader = req.headers.authorization;
    let isAdminUser = false;

    if (authHeader && firebaseAuth) {
      try {
        const token = authHeader.split('Bearer ')[1]?.trim();
        const decoded = await firebaseAuth.verifyIdToken(token);
        if (decoded.admin === true) {
          isAdminUser = true;
        } else if (firestoreDb) {
          const docSnap = await firestoreDb.collection('adminUsers').doc(decoded.uid).get();
          isAdminUser = docSnap.exists && docSnap.data()?.role === 'admin' && docSnap.data()?.active !== false;
        }
      } catch {}
    }

    if (firestoreDb) {
      if (isAdminUser) {
        const snap = await firestoreDb.collection('orders').orderBy('date', 'desc').limit(200).get();
        const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        return res.json(orders);
      } else if (customer) {
        const snap = await firestoreDb.collection('orders')
          .where('customer.uid', '==', customer.uid)
          .orderBy('date', 'desc')
          .limit(50)
          .get();
        const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        return res.json(orders);
      }
    }

    return res.status(503).json({ error: 'Firestore is unavailable' });
  } catch (err: any) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Failed to read orders' });
  }
});

// POST /api/orders — authenticated customer and server-side product/pricing/discount validation
app.post('/api/orders', async (req, res) => {
  try {
    if (!firestoreDb || !firebaseAuth) return res.status(503).json({ error: 'Order service is not configured' });

    const customerAuth = await getOptionalCustomerAuth(req);
    if (!customerAuth?.uid || !customerAuth.phone) {
      return res.status(401).json({ error: 'Customer phone authentication required' });
    }

    const input = req.body || {};
    if (!Array.isArray(input.items) || input.items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }
    if (!input.customer?.fullName || !input.customer?.phone || !input.customer?.address) {
      return res.status(400).json({ error: 'Customer name, phone and address are required' });
    }
    if (String(input.customer.phone) !== String(customerAuth.phone)) {
      return res.status(403).json({ error: 'Customer phone does not match authenticated account' });
    }
    if (input.paymentMethod !== 'cod') {
      return res.status(400).json({ error: 'Online payment gateway is not configured. Cash on Delivery is currently available.' });
    }

    const settingsSnap = await firestoreDb.collection('storeSettings').doc('global').get();
    const storeSettings: any = settingsSnap.exists ? settingsSnap.data() : {};
    const productsRef = firestoreDb.collection('products');
    const customerRef = firestoreDb.collection('customers').doc(customerAuth.uid);
    const customerSnap = await customerRef.get();
    const customerData: any = customerSnap.exists ? customerSnap.data() : {};

    let subtotal = 0;
    const items: any[] = [];

    for (let i = 0; i < input.items.length; i++) {
      const item = input.items[i];
      const productId = String(item?.menuItem?.id || '');
      if (!productId) return res.status(400).json({ error: 'Invalid product ID' });

      const snap = await productsRef.doc(productId).get();
      if (!snap.exists) return res.status(400).json({ error: 'Product is unavailable' });

      const product: any = snap.data();
      if (product.isAvailable === false) return res.status(400).json({ error: `Product "${product.name || productId}" is unavailable` });

      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
        return res.status(400).json({ error: 'Invalid product quantity' });
      }

      const basePrice = Number(product.sellingPrice ?? product.baseKfcPrice ?? product.basePrice ?? 0);
      if (!Number.isFinite(basePrice) || basePrice < 0) return res.status(400).json({ error: 'Invalid product price configuration' });

      const variantId = String(item?.options?.variantId || item?.menuItem?.selectedVariantId || '');
      const variant = Array.isArray(product.variants) ? product.variants.find((v: any) => String(v.id) === variantId) : null;
      const unitBase = variant ? Number(variant.price) : basePrice;
      if (!Number.isFinite(unitBase) || unitBase < 0) return res.status(400).json({ error: 'Invalid product variant price' });

      const requestedAddonIds = Array.isArray(item?.options?.addons)
        ? item.options.addons.map((addon: any) => String(addon.id)).filter(Boolean)
        : [];
      const availableAddons = Array.isArray(product.customizableOptions?.availableAddons)
        ? product.customizableOptions.availableAddons
        : [];
      const addonMap = new Map(availableAddons.map((addon: any) => [String(addon.id), addon]));
      let addonTotal = 0;
      for (const addonId of requestedAddonIds) {
        const addon = addonMap.get(addonId);
        if (!addon) return res.status(400).json({ error: 'Invalid product add-on selected' });
        addonTotal += Number(addon.price || 0);
      }

      const unitPrice = unitBase + addonTotal;
      subtotal += unitPrice * quantity;

      items.push({
        cartItemId: String(item.cartItemId || `item-${Date.now()}-${i}`),
        menuItem: {
          id: productId,
          name: String(product.name || ''),
          description: String(product.description || ''),
          image: String(product.image || ''),
          categoryId: product.categoryId,
        },
        quantity,
        unitPrice,
        options: {
          ...(item.options || {}),
          addons: availableAddons.filter((addon: any) => requestedAddonIds.includes(String(addon.id))),
        },
      });
    }

    const deliveryMethods = Array.isArray(storeSettings.deliveryMethods) ? storeSettings.deliveryMethods : [];
    const requestedDeliveryMethodId = String(input.deliveryMethodId || '');
    const deliveryMethod =
      deliveryMethods.find((method: any) => method.id === requestedDeliveryMethodId && method.enabled !== false) ||
      deliveryMethods.find((method: any) => method.isDefault && method.enabled !== false) ||
      deliveryMethods.find((method: any) => method.enabled !== false);

    if (!deliveryMethod) return res.status(400).json({ error: 'No active delivery method is configured' });

    let deliveryFee = Number(deliveryMethod.price || 0);
    if (deliveryMethod.minOrderAmount && subtotal >= Number(deliveryMethod.minOrderAmount)) {
      deliveryFee = 0;
    }

    const discounts = Array.isArray(storeSettings.discounts) ? storeSettings.discounts : [];
    const now = new Date();
    const validDiscounts = discounts.filter((discount: any) => {
      if (!discount || discount.status !== 'active') return false;
      if (discount.startDate && new Date(discount.startDate) > now) return false;
      if (discount.endDate && new Date(discount.endDate) < now) return false;
      if (discount.usageLimit && Number(discount.usedCount || 0) >= Number(discount.usageLimit)) return false;
      if (discount.minOrderAmount && subtotal < Number(discount.minOrderAmount)) return false;
      return true;
    });

    const requestedCode = String(input.discountCode || '').trim().toUpperCase();
    let appliedDiscount: any = null;
    if (requestedCode) {
      appliedDiscount = validDiscounts.find((discount: any) => String(discount.code || '').toUpperCase() === requestedCode);
      if (!appliedDiscount) return res.status(400).json({ error: 'Discount code is invalid, expired, inactive, or unavailable for this order' });
    } else {
      appliedDiscount = validDiscounts.find((discount: any) => discount.isAutomatic === true);
    }

    let discountAmount = 0;
    let freeShipping = false;
    if (appliedDiscount) {
      if (appliedDiscount.type === 'percentage') {
        discountAmount = Math.round(subtotal * Number(appliedDiscount.value || 0) / 100);
      } else if (appliedDiscount.type === 'fixed_amount') {
        discountAmount = Math.min(subtotal, Number(appliedDiscount.value || 0));
      } else if (appliedDiscount.type === 'free_shipping') {
        freeShipping = true;
      }
    }

    if (freeShipping) deliveryFee = 0;

    // Loyalty points and coupon discounts are mutually exclusive.
    const customerPoints = Math.max(0, Number(customerData.loyaltyPoints || 0));
    const wantsPoints = Boolean(input.redeemLoyaltyPoints);
    if (wantsPoints && appliedDiscount && discountAmount > 0) {
      return res.status(400).json({ error: 'Loyalty points cannot be combined with a discount coupon' });
    }

    const loyaltyDiscount = wantsPoints
      ? Math.min(customerPoints, subtotal >= 500 ? Math.max(0, subtotal) : 0)
      : 0;

    if (wantsPoints && subtotal < 500) {
      return res.status(400).json({ error: 'Minimum order of Rs. 500 is required to redeem loyalty points' });
    }

    const vipTiers: Record<string, number> = { silver: 3, gold: 6, platinum: 8 };
    const vipTier = String(customerData.vipTier || '');
    const vipActive = customerData.vipStatus === 'active' && vipTiers[vipTier] !== undefined;
    const vipDiscount = vipActive ? Math.round(subtotal * vipTiers[vipTier] / 100) : 0;

    const netFoodPaid = Math.max(0, subtotal - discountAmount - loyaltyDiscount - vipDiscount);
    const pointsEarned = Math.floor(netFoodPaid / 300) * 10;
    const total = Math.max(0, netFoodPaid + deliveryFee);

    const orderId = `CKW-${Date.now().toString().slice(-8)}`;
    const nowIso = new Date().toISOString();
    const order = {
      id: orderId,
      date: nowIso,
      orderType: 'delivery',
      items,
      subtotal,
      markupAmount: 0,
      deliveryFee,
      discount: discountAmount,
      loyaltyPointsEarned: pointsEarned,
      loyaltyPointsRedeemed: loyaltyDiscount,
      loyaltyDiscount,
      vipDiscount,
      vipTierApplied: vipActive ? vipTier : undefined,
      total,
      customer: {
        fullName: String(input.customer.fullName).trim().slice(0, 100),
        phone: customerAuth.phone,
        address: String(input.customer.address).trim().slice(0, 500),
        uid: customerAuth.uid,
      },
      specialInstructions: String(input.specialInstructions || '').slice(0, 500),
      paymentMethod: 'cod',
      status: 'confirmed',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const batch = firestoreDb.batch();
    batch.set(firestoreDb.collection('orders').doc(orderId), order);

    const nextPoints = Math.max(0, customerPoints - loyaltyDiscount + pointsEarned);
    batch.set(customerRef, {
      phone: customerAuth.phone,
      fullName: order.customer.fullName,
      defaultAddress: order.customer.address,
      loyaltyPoints: nextPoints,
      totalOrdersCount: Number(customerData.totalOrdersCount || 0) + 1,
      totalSpent: Number(customerData.totalSpent || 0) + total,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    if (appliedDiscount?.id) {
      const updatedDiscounts = discounts.map((discount: any) =>
        discount.id === appliedDiscount.id
          ? { ...discount, usedCount: Number(discount.usedCount || 0) + 1 }
          : discount
      );
      batch.set(firestoreDb.collection('storeSettings').doc('global'), {
        discounts: updatedDiscounts,
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
    }

    await batch.commit();

    return res.status(201).json({
      ...order,
      createdAt: nowIso,
      updatedAt: nowIso,
    });
  } catch (err: any) {
    console.error('Error processing order submission:', err);
    return res.status(500).json({ error: 'Failed to save and validate order' });
  }
});

// PATCH /api/orders/:id/status (Admin Only)
app.patch('/api/orders/:id/status', verifyAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['confirmed', 'kitchen', 'dispatched', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const updates: any = {
      status,
      updatedAt: new Date().toISOString(),
    };

    if (status === 'delivered') {
      updates.deliveredAt = new Date().toISOString();
    }

    if (!firestoreDb) return res.status(503).json({ error: 'Firestore is unavailable' });
    await firestoreDb.collection('orders').doc(id).update(updates);
    res.json({ id, ...updates });
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// GET /api/customers (Admin Only)
app.get('/api/customers', verifyAdminAuth, async (_req, res) => {
  try {
    if (!firestoreDb) return res.status(503).json({ error: 'Firestore is unavailable' });
    const snap = await firestoreDb.collection('customers').limit(300).get();
    return res.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to read customer records' });
  }
});

// POST /api/customers (Admin Only: create/update customer records)
app.post('/api/customers', verifyAdminAuth, async (req, res) => {
  try {
    if (!firestoreDb) return res.status(503).json({ error: 'Firestore is unavailable' });
    const input = req.body || {};
    const phone = String(input.phone || '').trim();
    const fullName = String(input.fullName || '').trim();
    if (!phone) return res.status(400).json({ error: 'Customer phone is required' });

    let docRef = input.id ? firestoreDb.collection('customers').doc(String(input.id)) : null;
    if (!docRef || String(input.id).startsWith('cust-')) {
      const existing = await firestoreDb.collection('customers').where('phone', '==', phone).limit(1).get();
      docRef = existing.empty
        ? firestoreDb.collection('customers').doc()
        : existing.docs[0].ref;
    }

    const existingSnap = await docRef.get();
    const existing: any = existingSnap.exists ? existingSnap.data() : {};
    const data: any = {
      phone,
      fullName: fullName || existing.fullName || 'Customer',
      email: String(input.email ?? existing.email ?? ''),
      defaultAddress: String(input.address ?? input.defaultAddress ?? existing.defaultAddress ?? ''),
      loyaltyPoints: Math.max(0, Number(input.loyaltyPoints ?? existing.loyaltyPoints ?? 0)),
      vipTier: input.vipTier ?? existing.vipTier ?? null,
      totalOrdersCount: Math.max(0, Number(input.totalOrdersCount ?? existing.totalOrdersCount ?? 0)),
      totalSpent: Math.max(0, Number(input.totalSpent ?? existing.totalSpent ?? 0)),
      createdAt: existing.createdAt || new Date().toISOString(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await docRef.set(data, { merge: true });
    const saved = await docRef.get();
    return res.json({ id: docRef.id, ...saved.data() });
  } catch (err) {
    console.error('Error saving customer:', err);
    return res.status(500).json({ error: 'Failed to save customer record' });
  }
});

// DELETE /api/customers/:id (Admin Only)
app.delete('/api/customers/:id', verifyAdminAuth, async (req, res) => {
  try {
    if (!firestoreDb) return res.status(503).json({ error: 'Firestore is unavailable' });
    const id = String(req.params.id);
    const docRef = firestoreDb.collection('customers').doc(id);
    if ((await docRef.get()).exists) {
      await docRef.delete();
      return res.json({ success: true, id });
    }
    const snap = await firestoreDb.collection('customers').where('phone', '==', id).limit(1).get();
    if (snap.empty) return res.status(404).json({ error: 'Customer not found' });
    await snap.docs[0].ref.delete();
    return res.json({ success: true, id: snap.docs[0].id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete customer record' });
  }
});

// PATCH /api/customer/profile (Authenticated customer: own profile only)
app.patch('/api/customer/profile', async (req, res) => {
  try {
    if (!firestoreDb || !firebaseAuth) return res.status(503).json({ error: 'Customer service is not configured' });
    const customer = await getOptionalCustomerAuth(req);
    if (!customer?.uid || !customer.phone) return res.status(401).json({ error: 'Customer authentication required' });

    const input = req.body || {};
    const updates: any = {};
    if (typeof input.fullName === 'string') updates.fullName = input.fullName.trim().slice(0, 100);
    if (typeof input.email === 'string') updates.email = input.email.trim().slice(0, 200);
    if (typeof input.defaultAddress === 'string') updates.defaultAddress = input.defaultAddress.trim().slice(0, 500);
    if (Array.isArray(input.savedAddresses)) {
      if (input.savedAddresses.length > 20) return res.status(400).json({ error: 'Too many saved addresses' });
      updates.savedAddresses = input.savedAddresses.slice(0, 20).map((a: any) => ({
        id: String(a?.id || '').slice(0, 80),
        label: String(a?.label || 'Address').trim().slice(0, 40),
        address: String(a?.address || '').trim().slice(0, 500),
        isDefault: Boolean(a?.isDefault),
      })).filter((a: any) => a.id && a.address);
    }
    if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No valid profile changes supplied' });

    updates.updatedAt = FieldValue.serverTimestamp();
    await firestoreDb.collection('customers').doc(customer.uid).set(updates, { merge: true });
    const saved = await firestoreDb.collection('customers').doc(customer.uid).get();
    return res.json({ id: saved.id, ...saved.data() });
  } catch (err) {
    console.error('Customer profile update error:', err);
    return res.status(500).json({ error: 'Failed to update customer profile' });
  }
});

// GET /api/vip (Admin ledger)
app.get('/api/vip', verifyAdminAuth, async (_req, res) => {
  try {
    if (!firestoreDb) return res.status(503).json({ error: 'Firestore is unavailable' });
    const snap = await firestoreDb.collection('vipMembers').limit(500).get();
    return res.json(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  } catch {
    return res.status(500).json({ error: 'Failed to load VIP records' });
  }
});

// POST /api/vip/request (Authenticated customer)
app.post('/api/vip/request', async (req, res) => {
  try {
    if (!firestoreDb || !firebaseAuth) return res.status(503).json({ error: 'VIP service is not configured' });
    const authUser = await getOptionalCustomerAuth(req);
    if (!authUser?.uid || !authUser.phone) return res.status(401).json({ error: 'Customer authentication required' });

    const tierId = String(req.body?.tierId || '');
    const tierMap: Record<string, { price: number; discountPercentage: number }> = {
      silver: { price: 499, discountPercentage: 3 },
      gold: { price: 899, discountPercentage: 6 },
      platinum: { price: 999, discountPercentage: 8 },
    };
    const tier = tierMap[tierId];
    if (!tier) return res.status(400).json({ error: 'Invalid VIP tier' });

    const customerSnap = await firestoreDb.collection('customers').doc(authUser.uid).get();
    const customerData: any = customerSnap.exists ? customerSnap.data() : {};
    const id = authUser.uid;
    const request = {
      id,
      customerId: authUser.uid,
      customerName: String(customerData.fullName || req.body?.customerName || 'Customer').slice(0, 100),
      phone: authUser.phone,
      email: String(customerData.email || req.body?.email || ''),
      tierId,
      amount: tier.price,
      paymentMethod: String(req.body?.paymentMethod || 'whatsapp'),
      transactionId: String(req.body?.transactionId || '').slice(0, 100),
      requestedAt: new Date().toISOString(),
      status: 'pending',
      discountPercentage: tier.discountPercentage,
    };
    await firestoreDb.collection('vipMembers').doc(id).set(request, { merge: true });
    return res.status(201).json(request);
  } catch (err) {
    console.error('VIP request error:', err);
    return res.status(500).json({ error: 'Failed to create VIP request' });
  }
});

// PATCH /api/vip/:id/status (Admin approval/rejection)
app.patch('/api/vip/:id/status', verifyAdminAuth, async (req, res) => {
  try {
    if (!firestoreDb) return res.status(503).json({ error: 'Firestore is unavailable' });
    const id = String(req.params.id);
    const status = String(req.body?.status || '');
    if (!['approved', 'rejected', 'pending'].includes(status)) return res.status(400).json({ error: 'Invalid VIP status' });

    const ref = firestoreDb.collection('vipMembers').doc(id);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: 'VIP request not found' });
    const data: any = snap.data();
    const tierId = String(data?.tierId || '');

    await ref.set({
      status,
      approvedAt: status === 'approved' ? new Date().toISOString() : null,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    if (data.customerId) {
      await firestoreDb.collection('customers').doc(String(data.customerId)).set({
        vipTier: status === 'approved' ? tierId : null,
        vipStatus: status === 'approved' ? 'active' : status === 'rejected' ? 'rejected' : 'pending',
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
    }

    const saved = await ref.get();
    return res.json({ id: saved.id, ...saved.data() });
  } catch (err) {
    console.error('VIP status update error:', err);
    return res.status(500).json({ error: 'Failed to update VIP status' });
  }
});

// GET /api/reviews (Public storefront reviews)
app.get('/api/reviews', async (req, res) => {
  try {
    if (!firestoreDb) return res.status(503).json({ error: 'Firestore is unavailable' });
    const productId = String(req.query.productId || '').trim();
    const snap = await firestoreDb.collection('reviews').limit(200).get();
    const reviews = snap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as any)
      .filter((review: any) => !productId || String(review.productId) === productId)
      .sort((a: any, b: any) => String(b.date || '').localeCompare(String(a.date || '')));
    return res.json(reviews);
  } catch (err) {
    console.error('Error reading reviews:', err);
    return res.status(500).json({ error: 'Failed to read reviews' });
  }
});

// POST /api/reviews (Authenticated customer; delivered-order verification)
app.post('/api/reviews', async (req, res) => {
  try {
    if (!firestoreDb || !firebaseAuth) return res.status(503).json({ error: 'Review service is not configured' });
    const customer = await getOptionalCustomerAuth(req);
    if (!customer?.uid || !customer.phone) return res.status(401).json({ error: 'Customer authentication required' });

    const productId = String(req.body?.productId || '').trim();
    const rating = Number(req.body?.rating);
    const comment = String(req.body?.comment || '').trim();
    if (!productId || !Number.isInteger(rating) || rating < 1 || rating > 5 || !comment || comment.length > 1000) {
      return res.status(400).json({ error: 'Valid product, rating and review comment are required' });
    }

    const customerOrders = await firestoreDb.collection('orders')
      .where('customer.uid', '==', customer.uid)
      .limit(100)
      .get();

    const hasPurchased = customerOrders.docs.some((orderDoc) => {
      const order: any = orderDoc.data();
      return order.status === 'delivered' &&
        Array.isArray(order.items) &&
        order.items.some((item: any) => String(item?.menuItem?.id) === productId);
    });
    if (!hasPurchased) {
      return res.status(403).json({ error: 'Review sirf delivered order ke product par submit kiya ja sakta hai.' });
    }

    const customerSnap = await firestoreDb.collection('customers').doc(customer.uid).get();
    const customerData: any = customerSnap.exists ? customerSnap.data() : {};
    const reviewId = `rev-${Date.now()}-${customer.uid.slice(0, 8)}`;
    const review = {
      id: reviewId,
      productId,
      customerUid: customer.uid,
      customerName: String(customerData.fullName || 'Verified Customer').slice(0, 100),
      rating,
      comment,
      date: new Date().toISOString(),
      createdAt: FieldValue.serverTimestamp(),
    };

    await firestoreDb.collection('reviews').doc(reviewId).set(review);
    return res.status(201).json({ ...review, createdAt: new Date().toISOString() });
  } catch (err: any) {
    console.error('Error creating review:', err);
    return res.status(500).json({ error: 'Failed to submit review' });
  }
});

// POST /api/admin/verify-domain (Real DNS Verification using Node.js dns resolver)
app.post('/api/admin/verify-domain', verifyAdminAuth, async (req, res) => {
  const { domain } = req.body;
  if (!domain || typeof domain !== 'string') {
    return res.status(400).json({ error: 'Domain name is required' });
  }

  const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');

  try {
    const addresses = await dns.resolve4(cleanDomain).catch(() => []);
    const cnameRecords = await dns.resolveCname(cleanDomain).catch(() => []);
    let txtRecords: string[] = [];
    try {
      const rawTxt = await dns.resolveTxt(cleanDomain);
      txtRecords = rawTxt.flat();
    } catch {}

    const dnsResolved = addresses.length > 0 || cnameRecords.length > 0;
    const expectedTarget = String(process.env.CUSTOM_DOMAIN_CNAME_TARGET || '').trim().toLowerCase().replace(/\.$/, '');
    const connected = Boolean(
      expectedTarget &&
      cnameRecords.some((record) => record.toLowerCase().replace(/\.$/, '') === expectedTarget)
    );

    let message = '';
    if (!dnsResolved) {
      message = `DNS verification failed. No A/CNAME record found for "${cleanDomain}".`;
    } else if (!expectedTarget) {
      message = `DNS resolves for "${cleanDomain}", but the hosting target is not configured on the server yet. SSL is not being claimed.`;
    } else if (!connected) {
      message = `DNS resolves, but "${cleanDomain}" is not pointing to the configured hosting target yet.`;
    } else {
      message = `DNS target verified for "${cleanDomain}". SSL status will only be reported active by the actual hosting platform.`;
    }

    res.json({
      domain: cleanDomain,
      resolvedIps: addresses,
      cnameRecords,
      txtRecords,
      dnsResolved,
      connected,
      sslActive: false,
      verifiedAt: connected ? new Date().toISOString() : null,
      message,
    });
  } catch (err: any) {
    res.json({
      domain: cleanDomain,
      resolvedIps: [],
      cnameRecords: [],
      connected: false,
      sslActive: false,
      error: err.code || err.message,
      message: `DNS lookup failed for "${cleanDomain}". Ensure domain is registered and nameservers are active.`
    });
  }
});

// GET /api/facebook-catalog.xml (Meta Commerce Manager & Google Merchant Center XML Catalog Feed)
app.get('/api/facebook-catalog.xml', async (_req, res) => {
  try {
    const baseUrl = (process.env.APP_URL || 'https://kfcchk.kintrends.com').replace(/\/$/, '');
    if (!firestoreDb) return res.status(503).send('<error>Firestore unavailable</error>');
    const productSnap = await firestoreDb.collection('products').limit(1000).get();
    const products: any[] = productSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    let itemsXml = '';
    products.forEach((p) => {
      const price = `${p.sellingPrice || p.basePrice || 400}.00 PKR`;
      const img = p.image?.startsWith('http') ? p.image : `${baseUrl}${p.image}`;
      itemsXml += `
      <item>
        <g:id>${p.id}</g:id>
        <g:title><![CDATA[${p.name}]]></g:title>
        <g:description><![CDATA[${p.description || 'Fresh KFC meal delivered in Chakwal'}]]></g:description>
        <g:link>${baseUrl}/?product=${p.id}</g:link>
        <g:image_link>${img}</g:image_link>
        <g:brand>KFC</g:brand>
        <g:condition>new</g:condition>
        <g:availability>${p.isAvailable !== false ? 'in stock' : 'out of stock'}</g:availability>
        <g:price>${price}</g:price>
        <g:google_product_category>Food &amp; Beverages</g:google_product_category>
      </item>`;
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>KFC Chakwal Delivery Product Catalog</title>
    <link>${baseUrl}</link>
    <description>Fresh &amp; Hot KFC Pakistan Meals Delivered in Chakwal</description>
    ${itemsXml}
  </channel>
</rss>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.send(xml);
  } catch (err) {
    res.status(500).send('<error>Failed to generate catalog feed</error>');
  }
});

// GET /api/meta-feed.json (Meta Commerce JSON Product Feed)
app.get('/api/meta-feed.json', async (_req, res) => {
  try {
    const baseUrl = process.env.APP_URL || 'https://kfcchakwaldelivery.app';
    if (!firestoreDb) return res.status(503).json({ error: 'Firestore unavailable' });
    const productSnap = await firestoreDb.collection('products').limit(1000).get();
    const products: any[] = productSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const items = products.map((p) => ({
      id: p.id,
      title: p.name,
      description: p.description,
      availability: p.isAvailable !== false ? 'in stock' : 'out of stock',
      condition: 'new',
      price: `${p.sellingPrice || p.basePrice || 400} PKR`,
      link: `${baseUrl}/?product=${p.id}`,
      image_link: p.image?.startsWith('http') ? p.image : `${baseUrl}${p.image}`,
      brand: 'KFC',
      category: p.categoryId,
    }));

    res.json({
      title: 'KFC Chakwal Delivery Catalog Feed',
      updatedAt: new Date().toISOString(),
      itemCount: items.length,
      items
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate Meta feed' });
  }
});

// POST /api/abandoned-checkouts (Log or sync abandoned cart session)
app.post('/api/abandoned-checkouts', async (req, res) => {
  try {
    if (!firestoreDb) return res.status(503).json({ error: 'Firestore is unavailable' });
    const customer = await getOptionalCustomerAuth(req);
    if (!customer?.uid || !customer.phone) return res.status(401).json({ error: 'Customer authentication required' });

    const session = req.body || {};
    if (!session.phone || !session.items) {
      return res.status(400).json({ error: 'Cart session phone and items required' });
    }
    if (String(session.phone) !== String(customer.phone)) {
      return res.status(403).json({ error: 'Phone does not match authenticated account' });
    }

    const checkoutId = session.id || `ab-${customer.uid}-${Date.now()}`;
    const record = {
      id: checkoutId,
      uid: customer.uid,
      customerName: String(session.customerName || 'Customer').slice(0, 100),
      phone: customer.phone,
      items: Array.isArray(session.items) ? session.items.slice(0, 50) : [],
      cartTotal: Math.max(0, Number(session.cartTotal || 0)),
      createdAt: session.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      recoveryStatus: 'pending'
    };

    await firestoreDb.collection('abandonedCheckouts').doc(checkoutId).set(record, { merge: true });
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: 'Failed to record checkout session' });
  }
});

// GET /api/abandoned-checkouts (Admin Only: filter >= 10 mins inactive)
app.get('/api/abandoned-checkouts', verifyAdminAuth, async (_req, res) => {
  try {
    if (firestoreDb) {
      const snap = await firestoreDb.collection('abandonedCheckouts')
        .orderBy('updatedAt', 'desc')
        .limit(100)
        .get();
      const records = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return res.json(records);
    }
    res.json([]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch abandoned checkouts' });
  }
});

// POST /api/marketing/send-whatsapp (Admin Only)
app.post('/api/marketing/send-whatsapp', verifyAdminAuth, async (req, res) => {
  const { recipientPhone, messageText } = req.body;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    return res.status(503).json({
      configured: false,
      message: 'WhatsApp Business Cloud API is not configured. Please set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID in environment variables.',
      fallbackDeepLink: `https://wa.me/${(recipientPhone || '').replace(/\D/g, '')}?text=${encodeURIComponent(messageText || '')}`
    });
  }

  // Real WhatsApp Cloud API invocation
  try {
    const cleanPhone = (recipientPhone || '').replace(/\D/g, '');
    const response = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'text',
        text: { body: messageText }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({
        configured: true,
        success: false,
        error: data.error?.message || 'Failed to dispatch WhatsApp message via Meta Cloud API'
      });
    }

    res.json({ configured: true, success: true, metaResponse: data });
  } catch (err: any) {
    res.status(500).json({ configured: true, success: false, error: err.message });
  }
});

// Vite middlewares & Single Page App Fallback
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const hasDist = fs.existsSync(path.resolve(process.cwd(), 'dist/index.html'));

  if (!isProd || !hasDist) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Serve transformed index.html for all non-API GET requests
    app.use('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api/')) {
        return next();
      }
      try {
        const indexPath = path.resolve(process.cwd(), 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist/index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });

  server.on('error', (err) => {
    console.error('Server listen error:', err);
  });
}

startServer();
