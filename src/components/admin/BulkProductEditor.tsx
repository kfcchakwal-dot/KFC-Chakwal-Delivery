import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { MenuItem, CategoryId } from '../../types';
import { KFC_CATEGORIES } from '../../data/kfcMenu';
import { 
  Check, 
  Save, 
  Search, 
  Filter, 
  Edit3, 
  Layers, 
  Tag, 
  DollarSign, 
  Eye, 
  EyeOff, 
  Sparkles,
  PackageCheck
} from 'lucide-react';

export const BulkProductEditor: React.FC = () => {
  const { menuItems, updateMenuItem, formatPKR } = useStore();

  // Local editable copies
  const [editableItems, setEditableItems] = useState<{ [id: string]: Partial<MenuItem> }>({});
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [savedBatchNotice, setSavedBatchNotice] = useState<string | null>(null);

  const savedLabels = Array.from(new Set(menuItems.flatMap((item) => [...(item.badges || []), ...(item.customBadgeText ? [item.customBadgeText] : [])]).map((label) => String(label).trim()).filter(Boolean))).sort((a,b) => a.localeCompare(b));

  const filteredItems = menuItems.filter((item) => {
    const matchesCat = selectedCatFilter === 'all' || item.categoryId === selectedCatFilter;
    const matchesSearch = !searchFilter.trim() || item.name.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getFieldValue = (item: MenuItem, field: keyof MenuItem) => {
    if (editableItems[item.id] && editableItems[item.id][field] !== undefined) {
      return editableItems[item.id][field];
    }
    return item[field];
  };

  const handleFieldChange = (itemId: string, field: keyof MenuItem, value: any) => {
    setEditableItems((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }));
  };

  const handleSaveSingle = (item: MenuItem) => {
    const changes = editableItems[item.id];
    if (!changes) return;

    updateMenuItem({
      ...item,
      ...changes
    } as MenuItem);

    // Remove from pending edits
    setEditableItems((prev) => {
      const next = { ...prev };
      delete next[item.id];
      return next;
    });

    setSavedBatchNotice(`"${item.name}" updated successfully!`);
    setTimeout(() => setSavedBatchNotice(null), 3000);
  };

  const handleSaveAll = () => {
    const idsToUpdate = Object.keys(editableItems);
    if (idsToUpdate.length === 0) return;

    idsToUpdate.forEach((id) => {
      const original = menuItems.find((m) => m.id === id);
      if (original) {
        updateMenuItem({
          ...original,
          ...editableItems[id]
        } as MenuItem);
      }
    });

    setEditableItems({});
    setSavedBatchNotice(`All ${idsToUpdate.length} modified products saved successfully!`);
    setTimeout(() => setSavedBatchNotice(null), 3000);
  };

  const pendingCount = Object.keys(editableItems).length;

  return (
    <div className="space-y-4">
      {/* Top Filter & Bulk Save Controls */}
      <div className="bg-white border border-zinc-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products in bulk..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2 text-xs"
            />
          </div>

          <select
            value={selectedCatFilter}
            onChange={(e) => setSelectedCatFilter(e.target.value)}
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-medium"
          >
            <option value="all">All Categories ({menuItems.length})</option>
            {KFC_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
              {pendingCount} unsaved changes
            </span>
          )}

          <button
            onClick={handleSaveAll}
            disabled={pendingCount === 0}
            className="bg-[#e4002b] hover:bg-[#c30025] disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            <span>Save All Edits</span>
          </button>
        </div>
      </div>

      {/* Status Notice */}
      {savedBatchNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{savedBatchNotice}</span>
        </div>
      )}

      {/* Bulk Editable Table */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[950px]">
            <thead className="bg-zinc-100 text-zinc-700 uppercase font-black text-[10px] tracking-wider border-b border-zinc-200">
              <tr>
                <th className="p-3 w-16">Image</th>
                <th className="p-3 min-w-[220px]">Product Title</th>
                <th className="p-3 w-36">Category</th>
                <th className="p-3 w-28">Selling (PKR)</th>
                <th className="p-3 w-28">Strike Price</th>
                <th className="p-3 w-36">Badge / Label</th>
                <th className="p-3 min-w-[240px]">Description</th>
                <th className="p-3 w-24 text-center">Status</th>
                <th className="p-3 w-20 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredItems.map((item) => {
                const currentName = getFieldValue(item, 'name') as string;
                const currentCat = getFieldValue(item, 'categoryId') as CategoryId;
                const currentSellingPrice = getFieldValue(item, 'sellingPrice') as number | undefined;
                const currentComparePrice = getFieldValue(item, 'compareAtPrice') as number | undefined;
                const currentBadge = getFieldValue(item, 'customBadgeText') as string | undefined;
                const currentDesc = getFieldValue(item, 'description') as string;
                const isAvailable = getFieldValue(item, 'isAvailable') as boolean;
                const hasEdits = Boolean(editableItems[item.id]);

                return (
                  <tr key={item.id} className={`hover:bg-zinc-50 ${hasEdits ? 'bg-amber-50/40' : ''}`}>
                    <td className="p-2.5">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-xl border border-zinc-200"
                      />
                    </td>
                    
                    <td className="p-2.5">
                      <input
                        type="text"
                        value={currentName}
                        onChange={(e) => handleFieldChange(item.id, 'name', e.target.value)}
                        className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 font-bold text-zinc-900 focus:outline-none focus:border-[#e4002b]"
                      />
                    </td>

                    <td className="p-2.5">
                      <select
                        value={currentCat}
                        onChange={(e) => handleFieldChange(item.id, 'categoryId', e.target.value)}
                        className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-[11px]"
                      >
                        {KFC_CATEGORIES.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </td>

                    <td className="p-2.5">
                      <input
                        type="number"
                        value={currentSellingPrice ?? item.baseKfcPrice}
                        onChange={(e) => handleFieldChange(item.id, 'sellingPrice', Number(e.target.value))}
                        className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 font-mono font-bold text-emerald-700 text-right"
                      />
                    </td>

                    <td className="p-2.5">
                      <input
                        type="number"
                        placeholder="Strike"
                        value={currentComparePrice ?? ''}
                        onChange={(e) => handleFieldChange(item.id, 'compareAtPrice', e.target.value ? Number(e.target.value) : undefined)}
                        className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 font-mono text-zinc-500 text-right"
                      />
                    </td>

                    <td className="p-2.5">
                      <details className="relative min-w-[145px]">
                        <summary className="cursor-pointer list-none rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-[11px] font-semibold text-zinc-700">{(getFieldValue(item, 'badges') as string[] | undefined)?.length ? (getFieldValue(item, 'badges') as string[]).join(', ') : currentBadge || 'None'} ▾</summary>
                        <div className="absolute right-0 top-full z-20 mt-1 max-h-52 w-56 overflow-y-auto rounded-xl border border-zinc-200 bg-white p-2 shadow-xl">
                          <button type="button" onClick={() => { handleFieldChange(item.id, 'badges', []); handleFieldChange(item.id, 'customBadgeText', ''); }} className="mb-2 w-full rounded-md border border-zinc-200 px-2 py-1.5 text-left text-xs font-bold text-zinc-700 hover:bg-zinc-100">None — clear all labels</button>
                          {savedLabels.length ? savedLabels.map((label) => {
                            const current = (getFieldValue(item, 'badges') as string[] | undefined) || (currentBadge ? [currentBadge] : []);
                            return <label key={label} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-zinc-50"><input type="checkbox" checked={current.includes(label)} onChange={(e) => { const next = e.target.checked ? [...current.filter((v) => v !== label), label] : current.filter((v) => v !== label); handleFieldChange(item.id, 'badges', next); handleFieldChange(item.id, 'customBadgeText', next[0] || ''); }} className="accent-red-600"/>{label}</label>;
                          }) : <p className="p-2 text-[11px] text-zinc-500">No saved labels yet. Add labels on products first.</p>}
                        </div>
                      </details>
                    </td>

                    <td className="p-2.5">
                      <textarea
                        rows={1}
                        value={currentDesc}
                        onChange={(e) => handleFieldChange(item.id, 'description', e.target.value)}
                        className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-[11px]"
                      />
                    </td>

                    <td className="p-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleFieldChange(item.id, 'isAvailable', !isAvailable)}
                        className={`p-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                          isAvailable ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-zinc-100 text-zinc-400 border-zinc-300'
                        }`}
                        title={isAvailable ? 'In Stock (Click to disable)' : 'Out of Stock (Click to enable)'}
                      >
                        {isAvailable ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    </td>

                    <td className="p-2.5 text-center">
                      {hasEdits && (
                        <button
                          type="button"
                          onClick={() => handleSaveSingle(item)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-lg shadow cursor-pointer"
                          title="Save this product"
                        >
                          <Save className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
