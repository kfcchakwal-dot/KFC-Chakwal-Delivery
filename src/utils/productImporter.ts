import { MenuItem } from '../types';

export interface ImportStats {
  totalProcessed: number;
  updatedCount: number;
  newCount: number;
  failedCount: number;
  failedProducts: string[];
}

export interface SourceProduct {
  id: number | string;
  title: string;
  handle: string;
  body_html: string | null;
  variants?: Array<{
    price: string | number;
    compare_at_price?: string | number | null;
  }>;
  images?: Array<{
    src: string;
    position?: number;
  }>;
}

/**
 * Clean HTML body to clean readable plain text
 */
export function cleanHtmlDescription(html: string | null | undefined): string {
  if (!html) return '';
  return html
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Fetch all products from source site (https://kfcchk.kintrends.com/)
 * Handles pagination across all pages to ensure no products are missed.
 */
export async function fetchAllSourceProducts(sourceUrl: string = 'https://kfcchk.kintrends.com'): Promise<SourceProduct[]> {
  const baseUrl = sourceUrl.replace(/\/+$/, '');
  const allProducts: SourceProduct[] = [];
  let page = 1;
  const limit = 250;

  while (true) {
    const url = `${baseUrl}/products.json?limit=${limit}&page=${page}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch from ${url} (HTTP ${response.status})`);
    }
    const data = await response.json();
    const products: SourceProduct[] = data.products || [];
    if (!products.length) break;

    allProducts.push(...products);

    if (products.length < limit) {
      break; // Last page reached
    }
    page++;
  }

  return allProducts;
}

/**
 * Import products from source website into existing menu items.
 *
 * CRITICAL REQUIREMENTS:
 * 1. ONLY import these 4 fields:
 *    - Product title/name
 *    - Product description
 *    - Product price
 *    - Product image(s)
 * 2. Do NOT import, create, modify or manage product collections, categories, tags, variants,
 *    add-ons, stock settings or any other product fields.
 * 3. Avoid duplicate products if the import is run again.
 * 4. Preserve existing app functionality and do not overwrite existing products unnecessarily.
 */
export function mergeSourceProducts(
  sourceProducts: SourceProduct[],
  existingMenuItems: MenuItem[]
): { updatedMenu: MenuItem[]; stats: ImportStats } {
  const updatedMenu: MenuItem[] = [...existingMenuItems];
  const stats: ImportStats = {
    totalProcessed: sourceProducts.length,
    updatedCount: 0,
    newCount: 0,
    failedCount: 0,
    failedProducts: [],
  };

  for (const sp of sourceProducts) {
    try {
      const title = String(sp.title || '').trim();
      if (!title) {
        stats.failedCount++;
        stats.failedProducts.push(String(sp.id || 'Unnamed'));
        continue;
      }

      const description = cleanHtmlDescription(sp.body_html);
      const rawPrice = sp.variants?.[0]?.price;
      const price = Number(rawPrice) || 0;
      const images = Array.isArray(sp.images)
        ? sp.images.map((img) => String(img.src).trim()).filter(Boolean)
        : [];
      const image = images[0] || '';

      const normalizedTitle = title.toLowerCase();

      // Check if product already exists by normalized name or ID / handle
      const existingIndex = updatedMenu.findIndex(
        (m) =>
          m.name.trim().toLowerCase() === normalizedTitle ||
          m.id === sp.handle ||
          (m as any).shopifyHandle === sp.handle
      );

      if (existingIndex >= 0) {
        // UPDATE ONLY the 4 fields; preserve categoryId, variants, addons, stock, etc.
        const current = updatedMenu[existingIndex];
        updatedMenu[existingIndex] = {
          ...current,
          name: title,
          description,
          baseKfcPrice: price,
          sellingPrice: price,
          image: image || current.image,
          galleryImages: images.length > 0 ? images : current.galleryImages,
          status: current.status || 'active',
        };
        stats.updatedCount++;
      } else {
        // NEW PRODUCT: assign default category without creating new categories
        const id = sp.handle || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `prod-${Date.now()}`;
        const newProduct: MenuItem = {
          id,
          name: title,
          description,
          baseKfcPrice: price,
          sellingPrice: price,
          image,
          galleryImages: images,
          categoryId: 'everyday-value', // Existing default category
          isAvailable: true,
          status: 'active',
        };
        updatedMenu.push(newProduct);
        stats.newCount++;
      }
    } catch (err) {
      stats.failedCount++;
      stats.failedProducts.push(String(sp.title || sp.id || 'Unknown'));
    }
  }

  return { updatedMenu, stats };
}
