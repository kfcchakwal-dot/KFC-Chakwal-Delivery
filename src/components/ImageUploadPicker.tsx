import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Check, Link2, Sparkles } from 'lucide-react';

export const KFC_STOCK_IMAGES = [
  { label: 'Krunch Burger', url: '/src/assets/images/kfc_krunch_burger_1791015834419.jpg' },
  { label: 'Zinger Combo Box', url: '/src/assets/images/kfc_hero_zinger_combo_1791015805739.jpg' },
  { label: 'Chicken Bucket Feast', url: '/src/assets/images/kfc_bucket_crispy_chicken_1791015820219.jpg' },
  { label: 'Hot Wings Platter', url: '/src/assets/images/kfc_hot_wings_platter_1791015846233.jpg' },
];

interface ImageUploadPickerProps {
  label?: string;
  value: string;
  onChange: (newUrl: string) => void;
  aspectRatio?: 'square' | 'wide' | 'auto';
  helperText?: string;
  allowPresets?: boolean;
}

export const ImageUploadPicker: React.FC<ImageUploadPickerProps> = ({
  label = 'Product / Asset Image',
  value,
  onChange,
  aspectRatio = 'square',
  helperText = 'Upload an image from your device (JPG, PNG, WebP) or select a preset.',
  allowPresets = true,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<'upload' | 'url' | 'presets'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [uploadError, setUploadError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: max 5MB for smooth local storage
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size should be under 5MB for best performance.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onChange(result);
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read file. Please try another image.');
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    onChange(urlInput.trim());
    setUrlInput('');
  };

  const aspectClass = aspectRatio === 'square' ? 'aspect-square' : aspectRatio === 'wide' ? 'aspect-[16/9]' : 'aspect-auto min-h-[120px]';

  return (
    <div className="space-y-2 border border-zinc-200 bg-white rounded-2xl p-4 shadow-sm text-xs">
      <div className="flex items-center justify-between">
        <label className="font-bold text-zinc-900 flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-[#e4002b]" />
          <span>{label}</span>
        </label>
        
        {/* Switch input mode */}
        <div className="flex items-center gap-1 text-[11px] font-semibold bg-zinc-100 p-0.5 rounded-lg">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2 py-0.5 rounded-md transition ${mode === 'upload' ? 'bg-white text-zinc-900 shadow-xs font-bold' : 'text-zinc-500 hover:text-zinc-900'}`}
          >
            Upload
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2 py-0.5 rounded-md transition ${mode === 'url' ? 'bg-white text-zinc-900 shadow-xs font-bold' : 'text-zinc-500 hover:text-zinc-900'}`}
          >
            URL
          </button>
          {allowPresets && (
            <button
              type="button"
              onClick={() => setMode('presets')}
              className={`px-2 py-0.5 rounded-md transition ${mode === 'presets' ? 'bg-white text-zinc-900 shadow-xs font-bold' : 'text-zinc-500 hover:text-zinc-900'}`}
            >
              Presets
            </button>
          )}
        </div>
      </div>

      {uploadError && (
        <p className="text-[11px] text-red-600 bg-red-50 p-2 rounded-lg font-semibold">{uploadError}</p>
      )}

      {/* Main Preview and Action Box */}
      {value ? (
        <div className="space-y-2">
          <div className={`relative ${aspectClass} max-h-48 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50 group`}>
            <img
              src={value}
              alt="Selected"
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                e.currentTarget.src = '/src/assets/images/kfc_krunch_burger_1791015834419.jpg';
              }}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-white text-zinc-900 px-3 py-1.5 rounded-lg text-xs font-bold shadow hover:bg-zinc-100 cursor-pointer flex items-center gap-1"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Replace</span>
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow hover:bg-red-700 cursor-pointer flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-500">
            <span className="truncate max-w-[240px]">
              {value.startsWith('data:') ? '✓ Uploaded from Device (Ready)' : value}
            </span>
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-red-600 hover:underline font-bold"
            >
              Delete Image
            </button>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div>
          {mode === 'upload' && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed border-zinc-300 hover:border-[#e4002b] bg-zinc-50 hover:bg-red-50/20 rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${aspectClass} max-h-44`}
            >
              <div className="w-10 h-10 rounded-full bg-white border border-zinc-200 text-[#e4002b] flex items-center justify-center shadow-xs">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-zinc-900 text-xs">
                  Click to Upload Image from Phone / Computer
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  JPG, PNG, WebP up to 5MB (Saved directly to app)
                </p>
              </div>
            </div>
          )}

          {mode === 'url' && (
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
              <label className="text-[11px] font-semibold text-zinc-600 block">
                Paste Image Web URL:
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 bg-white border border-zinc-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#e4002b]"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="bg-[#e4002b] hover:bg-[#c30025] text-white px-3.5 py-2 rounded-xl font-bold cursor-pointer shrink-0"
                >
                  Save URL
                </button>
              </div>
            </div>
          )}

          {mode === 'presets' && allowPresets && (
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
              <p className="text-[11px] font-bold text-zinc-600">Select Authentic KFC Photo:</p>
              <div className="grid grid-cols-2 gap-2">
                {KFC_STOCK_IMAGES.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => onChange(preset.url)}
                    className="p-1.5 border border-zinc-200 bg-white rounded-xl flex items-center gap-2 hover:border-[#e4002b] text-left transition cursor-pointer"
                  >
                    <img
                      src={preset.url}
                      alt={preset.label}
                      className="w-8 h-8 rounded-lg object-cover shrink-0"
                    />
                    <span className="text-[11px] font-bold text-zinc-800 truncate">{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <p className="text-[10px] text-zinc-400">{helperText}</p>
    </div>
  );
};
