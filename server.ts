import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import dns from 'dns/promises';
import { createServer as createViteServer } from 'vite';
import admin from 'firebase-admin';

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

let firestoreDb: admin.firestore.Firestore | null = null;
let firebaseAuth: admin.auth.Auth | null = null;

try {
  if (!admin.apps.length) {
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const credential = clientEmail && privateKey
      ? admin.credential.cert({ projectId: PROJECT_ID, clientEmail, privateKey })
      : admin.credential.applicationDefault();
    admin.initializeApp({ projectId: PROJECT_ID, credential });
  }
  firestoreDb = FIRESTORE_DATABASE_ID && FIRESTORE_DATABASE_ID !== '(default)'
    ? admin.firestore().database(FIRESTORE_DATABASE_ID)
    : admin.firestore();
  firebaseAuth = admin.auth();
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
async function getOptionalCustomerAuth(req: Request): Promise<{ uid: string; phone?: string } | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ') || !firebaseAuth) return null;
  const token = authHeader.split('Bearer ')[1]?.trim();
  if (!token) return null;
  try {
    const decoded = await firebaseAuth.verifyIdToken(token);
    return { uid: decoded.uid, phone: decoded.phone_number };
  } catch {
    return null;
  }
}

// =========================================================================
// API ENDPOINTS
// =========================================================================

// GET /api/store-data (Public Storefront settings & catalogue)
app.get('/api/store-data', async (_req, res) => {
  try {
    if (firestoreDb) {
      const docRef = await firestoreDb.collection('storeSettings').doc('global').get();
      if (docRef.exists) {
        return res.json(docRef.data());
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
        batch.set(firestoreDb.collection('products').doc(String(product.id)), { ...product, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
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

// POST /api/orders — authenticated customer and server-side product pricing
app.post('/api/orders', async (req, res) => {
  try {
    if (!firestoreDb || !firebaseAuth) return res.status(503).json({ error: 'Order service is not configured' });
    const customerAuth = await getOptionalCustomerAuth(req);
    if (!customerAuth) return res.status(401).json({ error: 'Customer authentication required' });
    const input = req.body;
    if (!input || !Array.isArray(input.items) || input.items.length === 0) return res.status(400).json({ error: 'Order must contain at least one item' });
    if (!input.customer?.fullName || !input.customer?.phone) return res.status(400).json({ error: 'Customer full name and phone are required' });
    if (input.customer.uid && input.customer.uid !== customerAuth.uid) return res.status(403).json({ error: 'Customer identity mismatch' });
    if (customerAuth.phone && input.customer.phone !== customerAuth.phone) return res.status(403).json({ error: 'Customer phone does not match authenticated account' });
    let subtotal = 0; const items:any[] = [];
    for (let i=0;i<input.items.length;i++) {
      const item=input.items[i]; const productId=String(item?.menuItem?.id || '');
      const snap=await firestoreDb.collection('products').doc(productId).get();
      if(!snap.exists) return res.status(400).json({error:'Product is unavailable'});
      const p:any=snap.data(); if(p.isAvailable===false) return res.status(400).json({error:'Product is unavailable'});
      const qty=Math.max(1,Math.min(50,Number(item.quantity)||1));
      const base=Number(p.sellingPrice ?? p.baseKfcPrice ?? p.basePrice ?? 0);
      const variantId=item?.menuItem?.selectedVariantId || item?.options?.variantId;
      const variant=Array.isArray(p.variants)?p.variants.find((v:any)=>v.id===variantId):null;
      const price=variant?Number(variant.price):base;
      const addonIds=Array.isArray(item?.options?.addons)?item.options.addons.map((x:any)=>String(x.id)):[];
      const addons=Array.isArray(p.customizableOptions?.availableAddons)?p.customizableOptions.availableAddons:[];
      const addonTotal=addonIds.reduce((s:number,id:string)=>s+Number(addons.find((x:any)=>x.id===id)?.price||0),0);
      const unitPrice=price+addonTotal;
      if(!Number.isFinite(unitPrice) || Math.abs(Number(item.unitPrice)-unitPrice)>0.01) return res.status(400).json({error:'Invalid product price'});
      subtotal+=unitPrice*qty;
      items.push({cartItemId:item.cartItemId || ('item-' + Date.now() + '-' + i),menuItem:{id:productId,name:p.name,description:p.description||'',image:p.image||'',categoryId:p.categoryId},quantity:qty,unitPrice,options:{...item.options,addons:addons.filter((x:any)=>addonIds.includes(String(x.id)))}});
    }
    const deliveryFee=Number(input.deliveryFee)>=0 && Number(input.deliveryFee)<=2000 ? Number(input.deliveryFee) : 399;
    const total=subtotal+deliveryFee; const orderId='KFC-'+Date.now().toString().slice(-8); const now=admin.firestore.FieldValue.serverTimestamp();
    const order={id:orderId,date:new Date().toISOString(),orderType:input.orderType||'delivery',items,subtotal,markupAmount:0,deliveryFee,discount:0,loyaltyDiscount:0,total,customer:{fullName:String(input.customer.fullName).slice(0,100),phone:customerAuth.phone||input.customer.phone,address:String(input.customer.address||'').slice(0,500),uid:customerAuth.uid},specialInstructions:String(input.specialInstructions||'').slice(0,500),paymentMethod:'cod',status:'confirmed',createdAt:now,updatedAt:now};
    await firestoreDb.collection('orders').doc(orderId).set(order);
    await firestoreDb.collection('customers').doc(customerAuth.uid).set({phone:order.customer.phone,fullName:order.customer.fullName,updatedAt:now},{merge:true});
    return res.status(201).json({...order,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});
  } catch(err) { console.error('Error processing order submission:',err); return res.status(500).json({error:'Failed to save and validate order'}); }
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

// POST /api/admin/verify-domain (Real DNS Verification using Node.js dns resolver)
app.post('/api/admin/verify-domain', verifyAdminAuth, async (req, res) => {
  const { domain } = req.body;
  if (!domain || typeof domain !== 'string') {
    return res.status(400).json({ error: 'Domain name is required' });
  }

  const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');

  try {
    const addresses = await dns.resolve4(cleanDomain).catch(() => []);
    let txtRecords: string[] = [];
    try {
      const rawTxt = await dns.resolveTxt(cleanDomain);
      txtRecords = rawTxt.flat();
    } catch {}

    const isConnected = addresses.length > 0;

    res.json({
      domain: cleanDomain,
      resolvedIps: addresses,
      txtRecords,
      connected: isConnected,
      sslActive: false,
      verifiedAt: isConnected ? new Date().toISOString() : null,
      message: isConnected
        ? `DNS successfully verified! "${cleanDomain}" resolved to ${addresses.join(', ')}`
        : `DNS verification failed. No A record found for "${cleanDomain}". Please add DNS records with your registrar.`
    });
  } catch (err: any) {
    res.json({
      domain: cleanDomain,
      resolvedIps: [],
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
    const session = req.body;
    if (!session || !session.phone || !session.items) {
      return res.status(400).json({ error: 'Cart session phone and items required' });
    }

    const checkoutId = session.id || `ab-${Date.now()}`;
    const record = {
      id: checkoutId,
      customerName: session.customerName || 'Customer',
      phone: session.phone,
      items: session.items,
      cartTotal: session.cartTotal || 0,
      createdAt: session.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      recoveryStatus: 'pending'
    };

    if (firestoreDb) {
      await firestoreDb.collection('abandonedCheckouts').doc(checkoutId).set(record, { merge: true });
    }

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
