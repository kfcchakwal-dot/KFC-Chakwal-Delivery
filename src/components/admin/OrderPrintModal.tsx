import React, { useState, useEffect } from 'react';
import { Order } from '../../types';
import {
  PrintFormat,
  printOrdersReceipt,
  generateInvoiceHtml,
  formatPKR,
} from '../../utils/orderInvoice';
import {
  X,
  Printer,
  Receipt,
  FileText,
  Check,
  Eye,
  Settings2,
} from 'lucide-react';

interface OrderPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  storeSettings?: any;
}

const STORAGE_KEY = 'kfc_admin_preferred_print_format';

export const OrderPrintModal: React.FC<OrderPrintModalProps> = ({
  isOpen,
  onClose,
  orders,
  storeSettings,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<PrintFormat>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as PrintFormat | null;
      if (saved && ['thermal-58', 'thermal-80', 'a4'].includes(saved)) {
        return saved;
      }
    } catch {}
    return 'thermal-80';
  });

  const [rememberPreference, setRememberPreference] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY) as PrintFormat | null;
        if (saved && ['thermal-58', 'thermal-80', 'a4'].includes(saved)) {
          setSelectedFormat(saved);
        }
      } catch {}
    }
  }, [isOpen]);

  if (!isOpen || orders.length === 0) return null;

  const totalBillSum = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  const handlePrint = () => {
    if (rememberPreference) {
      try {
        localStorage.setItem(STORAGE_KEY, selectedFormat);
      } catch {}
    }
    printOrdersReceipt(orders, selectedFormat, storeSettings);
    onClose();
  };

  const previewHtml = showPreview
    ? generateInvoiceHtml(orders.slice(0, 3), selectedFormat, storeSettings)
    : '';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#e4002b] text-white flex items-center justify-center shadow-sm">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                {orders.length === 1 ? `Print Bill — Order #${orders[0].id}` : `Bulk Print Bills (${orders.length} Orders)`}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Choose format for POS thermal printer or standard A4 invoice
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Order Summary Pill */}
          <div className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="text-zinc-600 dark:text-zinc-300">
              Orders to print: <strong className="text-zinc-900 dark:text-white">{orders.length}</strong>
              {orders.length > 1 && (
                <span className="ml-2 text-zinc-500">
                  (Each order gets its own separate invoice page)
                </span>
              )}
            </div>
            <div className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
              Combined Total: {formatPKR(totalBillSum)}
            </div>
          </div>

          {/* Format Selector Cards */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2 uppercase tracking-wider">
              Select Print Format
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 80mm Thermal */}
              <button
                type="button"
                onClick={() => setSelectedFormat('thermal-80')}
                className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  selectedFormat === 'thermal-80'
                    ? 'border-[#e4002b] bg-red-50/50 dark:bg-red-950/20 ring-2 ring-[#e4002b]'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Receipt className={`w-5 h-5 ${selectedFormat === 'thermal-80' ? 'text-[#e4002b]' : 'text-zinc-400'}`} />
                    {selectedFormat === 'thermal-80' && (
                      <span className="w-5 h-5 rounded-full bg-[#e4002b] text-white flex items-center justify-center text-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div className="font-black text-sm text-zinc-900 dark:text-white">
                    80 mm Thermal
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                    Standard restaurant POS receipt paper roll
                  </div>
                </div>
                <div className="mt-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Recommended for Kitchen / POS
                </div>
              </button>

              {/* 58mm Thermal */}
              <button
                type="button"
                onClick={() => setSelectedFormat('thermal-58')}
                className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  selectedFormat === 'thermal-58'
                    ? 'border-[#e4002b] bg-red-50/50 dark:bg-red-950/20 ring-2 ring-[#e4002b]'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Receipt className={`w-5 h-5 ${selectedFormat === 'thermal-58' ? 'text-[#e4002b]' : 'text-zinc-400'}`} />
                    {selectedFormat === 'thermal-58' && (
                      <span className="w-5 h-5 rounded-full bg-[#e4002b] text-white flex items-center justify-center text-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div className="font-black text-sm text-zinc-900 dark:text-white">
                    58 mm Thermal
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                    Compact portable / rider receipt printer
                  </div>
                </div>
                <div className="mt-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Mini 2-Inch Roll
                </div>
              </button>

              {/* A4 Invoice */}
              <button
                type="button"
                onClick={() => setSelectedFormat('a4')}
                className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  selectedFormat === 'a4'
                    ? 'border-[#e4002b] bg-red-50/50 dark:bg-red-950/20 ring-2 ring-[#e4002b]'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <FileText className={`w-5 h-5 ${selectedFormat === 'a4' ? 'text-[#e4002b]' : 'text-zinc-400'}`} />
                    {selectedFormat === 'a4' && (
                      <span className="w-5 h-5 rounded-full bg-[#e4002b] text-white flex items-center justify-center text-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div className="font-black text-sm text-zinc-900 dark:text-white">
                    A4 Full Invoice
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                    Full-sheet tax bill & office records
                  </div>
                </div>
                <div className="mt-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Laser / Desktop Printer
                </div>
              </button>
            </div>
          </div>

          {/* Preferences and Preview toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={rememberPreference}
                onChange={(e) => setRememberPreference(e.target.checked)}
                className="w-4 h-4 rounded text-[#e4002b] focus:ring-[#e4002b] accent-[#e4002b]"
              />
              <span>Remember as default print format</span>
            </label>

            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showPreview ? 'Hide Preview' : 'Show Live Preview'}</span>
            </button>
          </div>

          {/* Live Preview Pane */}
          {showPreview && (
            <div className="border border-zinc-200 dark:border-zinc-700 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 p-3">
              <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 mb-2 flex items-center justify-between">
                <span>Print Document Preview</span>
                <span className="text-[10px] uppercase font-mono">{selectedFormat}</span>
              </div>
              <div className="bg-white dark:bg-white rounded-xl shadow-inner max-h-72 overflow-y-auto p-4 border border-zinc-300">
                <iframe
                  title="Receipt Preview"
                  srcDoc={previewHtml}
                  className="w-full min-h-[300px] border-0"
                />
              </div>
            </div>
          )}

          {/* Order list preview for multiple orders */}
          {orders.length > 1 && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                Selected Orders Queue ({orders.length}):
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1 text-xs">
                {orders.map((o) => (
                  <div
                    key={o.id}
                    className="flex justify-between items-center px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/40"
                  >
                    <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      #{o.id} · {o.customer.fullName}
                    </span>
                    <span className="font-mono font-bold text-[#e4002b]">
                      {formatPKR(o.total)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-6 py-2.5 rounded-xl text-xs font-black bg-[#e4002b] hover:bg-red-700 text-white transition flex items-center gap-2 shadow-md cursor-pointer active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>
              {orders.length === 1 ? 'Open Print Dialog' : `Print All ${orders.length} Bills`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
