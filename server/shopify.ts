import { FieldValue, type Firestore } from 'firebase-admin/firestore';

const SHOPIFY_SHOP = String(process.env.SHOPIFY_SHOP || 'it6mv9-a2').trim().replace(/^https?:\/\//, '').replace(/\.myshopify\.com\/?$/, '');
const SHOPIFY_CLIENT_ID = String(process.env.SHOPIFY_CLIENT_ID || '').trim();
const SHOPIFY_CLIENT_SECRET = String(process.env.SHOPIFY_CLIENT_SECRET || '').trim();
const SHOPIFY_API_VERSION = String(process.env.SHOPIFY_API_VERSION || '2026-10').trim();

let cachedAccessToken: string | null = null;
let cachedTokenExpiresAt = 0;

export interface ShopifyNormalizedProduct {
  id: string;
  shopifyProductId: string;
  shopifyHandle: string;
  name: string;
  description: string;
  vendor: string;
  productType: string;
  image: string;
  images: string[];
  baseKfcPrice: number;
  sellingPrice: number;
  compareAtPrice?: number;
  isAvailable: boolean;
  shopifyInventory: number;
  variants: Array<{
    id: string;
    title: string;
    price: number;
    compareAtPrice?: number;
    availableForSale: boolean;
    inventoryQuantity: number;
    selectedOptions: Array<{ name: string; value: string }>;
    image?: string;
  }>;
  updatedAt: string;
}

function isConfigured() {
  return Boolean(SHOPIFY_SHOP && SHOPIFY_CLIENT_ID && SHOPIFY_CLIENT_SECRET);
}

export function getShopifyConfigStatus() {
  return {
    configured: isConfigured(),
    shop: SHOPIFY_SHOP ? `${SHOPIFY_SHOP}.myshopify.com` : null,
    apiVersion: SHOPIFY_API_VERSION,
  };
}

async function getAdminAccessToken(): Promise<string> {
  if (!isConfigured()) {
    throw new Error('Shopify integration is not configured. Set SHOPIFY_SHOP, SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET.');
  }

  const now = Date.now();
  if (cachedAccessToken && cachedTokenExpiresAt > now + 60_000) {
    return cachedAccessToken;
  }

  const response = await fetch(`https://${SHOPIFY_SHOP}.myshopify.com/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: SHOPIFY_CLIENT_ID,
      client_secret: SHOPIFY_CLIENT_SECRET,
    }),
  });

  const data: any = await response.json().catch(() => ({}));
  if (!response.ok || !data.access_token) {
    throw new Error(data?.error_description || data?.error || `Shopify authentication failed (${response.status})`);
  }

  cachedAccessToken = String(data.access_token);
  cachedTokenExpiresAt = now + Math.max(60, Number(data.expires_in || 86400)) * 1000;
  return cachedAccessToken;
}

async function shopifyAdminGraphQL<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const token = await getAdminAccessToken();
  const response = await fetch(`https://${SHOPIFY_SHOP}.myshopify.com/admin/api/${SHOPIFY_API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
  });

  const payload: any = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.errors?.[0]?.message || `Shopify API request failed (${response.status})`);
  }
  if (Array.isArray(payload.errors) && payload.errors.length) {
    throw new Error(payload.errors.map((e: any) => e.message).join('; '));
  }
  return payload.data as T;
}

const PRODUCTS_QUERY = `
query Products(\$after: String) {
  products(first: 100, after: \$after, sortKey: TITLE, reverse: false) {
    nodes {
      id
      title
      handle
      description
      vendor
      productType
      status
      totalInventory
      updatedAt
      featuredImage { url altText }
      images(first: 20) { nodes { url altText } }
      variants(first: 100) {
        nodes {
          id
          title
          price
          compareAtPrice
          availableForSale
          inventoryQuantity
          selectedOptions { name value }
          image { url altText }
        }
      }
    }
    pageInfo { hasNextPage endCursor }
  }
}
`;

export async function getShopifyProducts(): Promise<ShopifyNormalizedProduct[]> {
  const products: ShopifyNormalizedProduct[] = [];
  let after: string | null = null;

  do {
    const data = await shopifyAdminGraphQL<any>(PRODUCTS_QUERY, { after });
    const connection = data?.products;
    if (!connection) throw new Error('Shopify products response was empty.');

    for (const product of connection.nodes || []) {
      const variants = (product.variants?.nodes || []).map((variant: any) => ({
        id: String(variant.id),
        title: String(variant.title || ''),
        price: Number(variant.price || 0),
        ...(variant.compareAtPrice != null ? { compareAtPrice: Number(variant.compareAtPrice) } : {}),
        availableForSale: Boolean(variant.availableForSale),
        inventoryQuantity: Number(variant.inventoryQuantity || 0),
        selectedOptions: Array.isArray(variant.selectedOptions)
          ? variant.selectedOptions.map((o: any) => ({ name: String(o.name), value: String(o.value) }))
          : [],
        ...(variant.image?.url ? { image: String(variant.image.url) } : {}),
      }));

      const images = Array.from(new Set([
        product.featuredImage?.url,
        ...(product.images?.nodes || []).map((image: any) => image?.url),
      ].filter(Boolean).map(String)));

      const firstVariant = variants[0];
      const price = firstVariant?.price ?? 0;
      const compareAtPrice = firstVariant?.compareAtPrice;
      const productId = `shopify-${String(product.id).split('/').pop()}`;

      products.push({
        id: productId,
        shopifyProductId: String(product.id),
        shopifyHandle: String(product.handle || ''),
        name: String(product.title || ''),
        description: String(product.description || ''),
        vendor: String(product.vendor || ''),
        productType: String(product.productType || ''),
        image: images[0] || '',
        images,
        baseKfcPrice: price,
        sellingPrice: price,
        ...(compareAtPrice != null ? { compareAtPrice } : {}),
        isAvailable: String(product.status) === 'ACTIVE' && variants.some((v: any) => v.availableForSale),
        shopifyInventory: Number(product.totalInventory || 0),
        variants,
        updatedAt: String(product.updatedAt || new Date().toISOString()),
      });
    }

    after = connection.pageInfo?.hasNextPage ? String(connection.pageInfo.endCursor) : null;
  } while (after);

  return products;
}

export async function syncShopifyProductsToFirestore(firestoreDb: Firestore) {
  const shopifyProducts = await getShopifyProducts();
  const batch = firestoreDb.batch();
  const productsCollection = firestoreDb.collection('products');
  const settingsRef = firestoreDb.collection('storeSettings').doc('global');

  const settingsSnap = await settingsRef.get();
  const settings: any = settingsSnap.exists ? settingsSnap.data() || {} : {};
  const existingMenuItems = Array.isArray(settings.menuItems) ? settings.menuItems : [];

  const syncedMenuItems = [...existingMenuItems];

  for (const product of shopifyProducts) {
    const categoryId = String(
      existingMenuItems.find((item: any) => item?.shopifyHandle === product.shopifyHandle)?.categoryId ||
      'everyday-value'
    );

    const menuItem = {
      id: product.id,
      name: product.name,
      categoryId,
      description: product.description,
      baseKfcPrice: product.baseKfcPrice,
      sellingPrice: product.sellingPrice,
      ...(product.compareAtPrice != null ? { compareAtPrice: product.compareAtPrice } : {}),
      image: product.image,
      images: product.images,
      isAvailable: product.isAvailable,
      isSpicy: false,
      isPopular: false,
      shopifyProductId: product.shopifyProductId,
      shopifyHandle: product.shopifyHandle,
      shopifyInventory: product.shopifyInventory,
      variants: product.variants.map((variant) => ({
        id: variant.id,
        name: variant.title,
        price: variant.price,
        compareAtPrice: variant.compareAtPrice,
        isAvailable: variant.availableForSale,
        selectedOptions: variant.selectedOptions,
        image: variant.image,
      })),
      updatedAt: FieldValue.serverTimestamp(),
    };

    batch.set(productsCollection.doc(product.id), menuItem, { merge: true });

    const index = syncedMenuItems.findIndex((item: any) =>
      item?.id === product.id || item?.shopifyProductId === product.shopifyProductId || item?.shopifyHandle === product.shopifyHandle
    );
    if (index >= 0) syncedMenuItems[index] = { ...syncedMenuItems[index], ...menuItem };
    else syncedMenuItems.push(menuItem);
  }

  batch.set(settingsRef, {
    menuItems: syncedMenuItems,
    shopify: {
      connected: true,
      shop: `${SHOPIFY_SHOP}.myshopify.com`,
      lastSyncAt: new Date().toISOString(),
      productCount: shopifyProducts.length,
    },
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });

  await batch.commit();

  return {
    connected: true,
    productCount: shopifyProducts.length,
    lastSyncAt: new Date().toISOString(),
  };
}
