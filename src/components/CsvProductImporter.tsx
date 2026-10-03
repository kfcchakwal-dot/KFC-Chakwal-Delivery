import React, { useState, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { MenuItem, CategoryId } from '../types';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  Check, 
  AlertCircle, 
  Trash2, 
  Sparkles,
  HelpCircle
} from 'lucide-react';

export const CsvProductImporter: React.FC = () => {
  const { menuItems, bulkImportProducts, formatPKR, themeMode } = useStore();
  const isDark = themeMode === 'dark';

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvData, setCsvData] = useState<MenuItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Download Sample Shopify-Pattern CSV Template
  const handleDownloadTemplate = () => {
    const headers = [
      'Handle',
      'Title',
      'Body (HTML)',
      'Vendor',
      'Type',
      'Tags',
      'Published',
      'Option1 Name',
      'Option1 Value',
      'Variant SKU',
      'Variant Grams',
      'Variant Inventory Qty',
      'Variant Price',
      'Variant Compare At Price',
      'Image Src',
    ];

    const sampleRows = [
      [
        'krunch-burger-deluxe',
        'Krunch Burger Deluxe',
        'Crunchy spiced chicken fillet with fresh iceberg lettuce and secret mayo.',
        'KFC Chakwal',
        'Everyday Value',
        'burger, value, crunchy',
        'TRUE',
        'Title',
        'Default Title',
        'KFC-KB-01',
        '250',
        '100',
        '360',
        '450',
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
      ],
      [
        'zinger-super-combo',
        'Zinger Super Combo',
        'Signature spicy Zinger burger with regular fries, 1 pc chicken, and chilled drink.',
        'KFC Chakwal',
        'Ala-Carte & Combos',
        'zinger, spicy, combo',
        'TRUE',
        'Title',
        'Default Title',
        'KFC-ZC-02',
        '450',
        '50',
        '990',
        '1200',
        'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=80',
      ],
      [
        'hot-wings-bucket-20',
        'Hot & Spicy Wings Bucket (20 Pcs)',
        '20 pieces of extra crispy, spicy wings with 2 signature garlic mayo dips.',
        'KFC Chakwal',
        'Family Sharing',
        'wings, bucket, spicy',
        'TRUE',
        'Title',
        'Default Title',
        'KFC-HW-20',
        '800',
        '30',
        '1590',
        '1890',
        'https://images.unsplash.com/photo-1527477378378-fb80778a8767?w=600&auto=format&fit=crop&q=80',
      ],
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...sampleRows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'kfc_shopify_products_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export existing menu items to CSV
  const handleExportMenuToCsv = () => {
    const headers = [
      'Handle',
      'Title',
      'Body (HTML)',
      'Type',
      'Variant Price',
      'Variant Compare At Price',
      'Image Src',
    ];

    const rows = menuItems.map((item) => [
      item.id,
      item.name,
      item.description,
      item.categoryId,
      item.sellingPrice || item.baseKfcPrice,
      item.compareAtPrice || '',
      item.image,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'kfc_chakwal_full_menu.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Category ID helper
  const mapToCategoryId = (typeStr: string): CategoryId => {
    const lower = (typeStr || '').toLowerCase();
    if (lower.includes('value') || lower.includes('krunch')) return 'everyday-value';
    if (lower.includes('ala') || lower.includes('carte') || lower.includes('combo') || lower.includes('zinger')) return 'ala-carte-combos';
    if (lower.includes('family') || lower.includes('sharing') || lower.includes('bucket') || lower.includes('feast')) return 'family-sharing';
    if (lower.includes('midnight') || lower.includes('night')) return 'midnight-deals';
    if (lower.includes('snack') || lower.includes('side') || lower.includes('wing') || lower.includes('fries')) return 'snacks-sides';
    if (lower.includes('beverage') || lower.includes('drink') || lower.includes('dessert')) return 'beverages-desserts';
    return 'everyday-value';
  };

  // Parse CSV File (Robust CSV regex parser supporting quotes and commas)
  const parseCSVText = (text: string) => {
    const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length < 2) {
      throw new Error('CSV file contains no product rows.');
    }

    const parseRow = (line: string): string[] => {
      const result: string[] = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            cur += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          result.push(cur.trim());
          cur = '';
        } else {
          cur += char;
        }
      }
      result.push(cur.trim());
      return result;
    };

    const header = parseRow(lines[0]).map((h) => h.toLowerCase().replace(/[\s_()]/g, ''));

    // Find indices for standard Shopify or simple format
    const titleIdx = header.findIndex((h) => h === 'title' || h === 'name' || h === 'productname');
    const descIdx = header.findIndex((h) => h === 'bodyhtml' || h === 'description' || h === 'body');
    const priceIdx = header.findIndex((h) => h === 'variantprice' || h === 'price' || h === 'sellingprice');
    const comparePriceIdx = header.findIndex((h) => h === 'variantcompareatprice' || h === 'compareatprice' || h === 'originalprice');
    const imageIdx = header.findIndex((h) => h === 'imagesrc' || h === 'image' || h === 'imageurl');
    const typeIdx = header.findIndex((h) => h === 'type' || h === 'category' || h === 'producttype');
    const handleIdx = header.findIndex((h) => h === 'handle' || h === 'id' || h === 'sku');

    if (titleIdx === -1 || priceIdx === -1) {
      throw new Error('CSV must contain at least "Title" and "Price" columns.');
    }

    const items: MenuItem[] = [];

    for (let r = 1; r < lines.length; r++) {
      const row = parseRow(lines[r]);
      const title = row[titleIdx];
      if (!title) continue;

      const rawPrice = parseFloat(row[priceIdx]?.replace(/[^0-9.]/g, '') || '0');
      const rawComparePrice = comparePriceIdx > -1 && row[comparePriceIdx]
        ? parseFloat(row[comparePriceIdx]?.replace(/[^0-9.]/g, '') || '0')
        : undefined;

      const desc = descIdx > -1 && row[descIdx] ? row[descIdx].replace(/<[^>]*>?/gm, '') : 'Fresh authentic KFC preparation.';
      const img = imageIdx > -1 && row[imageIdx] ? row[imageIdx] : '/src/assets/images/kfc_hero_zinger_combo_1791015805739.jpg';
      const category = typeIdx > -1 ? mapToCategoryId(row[typeIdx]) : 'everyday-value';
      const handle = handleIdx > -1 && row[handleIdx] 
        ? row[handleIdx].toLowerCase().replace(/[^a-z0-9]/g, '-')
        : title.toLowerCase().replace(/[^a-z0-9]/g, '-');

      const newItem: MenuItem = {
        id: handle || `item-${Date.now()}-${r}`,
        name: title,
        categoryId: category,
        description: desc,
        baseKfcPrice: rawPrice,
        sellingPrice: rawPrice,
        compareAtPrice: rawComparePrice && rawComparePrice > rawPrice ? rawComparePrice : undefined,
        image: img,
        isSpicy: title.toLowerCase().includes('spicy') || title.toLowerCase().includes('zinger'),
        isPopular: true,
        isAvailable: true,
        customBadgeText: rawComparePrice && rawComparePrice > rawPrice ? 'OFFER' : undefined,
      };

      items.push(newItem);
    }

    return items;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseCSVText(text);
        setCsvData(parsed);
        setSuccessMsg(`Successfully parsed ${parsed.length} products! Preview below and click "Import" to add to store.`);
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to parse CSV file. Please check columns.');
      } finally {
        setIsProcessing(false);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read file.');
      setIsProcessing(false);
    };
    reader.readAsText(file);
  };

  const handleImportToMenu = () => {
    if (csvData.length === 0) return;
    bulkImportProducts(csvData);
    setSuccessMsg(`🎉 Successfully imported ${csvData.length} products to the live store menu!`);
    setCsvData([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Banner / Instructions */}
      <div className={`p-5 rounded-2xl border ${
        isDark ? 'bg-[#15151a] border-[#292934]' : 'bg-zinc-50 border-zinc-200'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-[#e4002b]" />
              <h4 className="font-bold text-base text-white">
                Shopify Pattern CSV Bulk Product Import
              </h4>
            </div>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl">
              Upload hundreds of products simultaneously via CSV. Standard Shopify column headers (Title, Variant Price, Variant Compare At Price, Body, Image Src, Type) are fully supported.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Sample CSV Template</span>
            </button>

            <button
              type="button"
              onClick={handleExportMenuToCsv}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                isDark 
                  ? 'border-zinc-700 bg-zinc-800 text-zinc-200 hover:text-white' 
                  : 'border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export Current Menu ({menuItems.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* File Upload Zone */}
      <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
        isDark ? 'border-zinc-700 hover:border-[#e4002b] bg-[#121215]' : 'border-zinc-300 hover:border-[#e4002b] bg-zinc-50'
      }`}>
        <input
          type="file"
          ref={fileInputRef}
          accept=".csv,text/csv"
          onChange={handleFileUpload}
          className="hidden"
          id="csv-file-uploader"
        />
        <label htmlFor="csv-file-uploader" className="cursor-pointer block space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#e4002b]/10 text-[#e4002b] flex items-center justify-center">
            <Upload className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">
              Click to select or drag & drop your products CSV file
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">
              Supports .csv files with Title, Variant Price, Compare At Price, Description, and Images
            </p>
          </div>
          <span className="inline-block bg-[#e4002b] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md">
            Browse File
          </span>
        </label>
      </div>

      {/* Feedback Messages */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Preview Parsed Items */}
      {csvData.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Parsed Preview ({csvData.length} Products Ready)
            </h5>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCsvData([])}
                className="text-xs text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg border border-zinc-700"
              >
                Clear Preview
              </button>
              <button
                type="button"
                onClick={handleImportToMenu}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Import {csvData.length} Products Now</span>
              </button>
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto border border-zinc-800 rounded-xl divide-y divide-zinc-800">
            {csvData.map((item, idx) => (
              <div key={idx} className="p-3 flex items-center justify-between gap-4 text-xs hover:bg-zinc-800/30">
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-10 h-10 rounded-lg object-cover bg-zinc-800 shrink-0"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/src/assets/images/kfc_hero_zinger_combo_1791015805739.jpg';
                    }}
                  />
                  <div>
                    <p className="font-bold text-white">{item.name}</p>
                    <p className="text-[10px] text-zinc-400 line-clamp-1">{item.description}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-baseline gap-2 justify-end">
                    <span className="font-bold text-white tabular-nums">
                      Rs. {item.sellingPrice || item.baseKfcPrice}
                    </span>
                    {item.compareAtPrice && (
                      <span className="text-[10px] text-zinc-500 line-through tabular-nums">
                        Rs. {item.compareAtPrice}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-indigo-400 uppercase font-semibold">
                    {item.categoryId}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
