import React, { useMemo, useState } from 'react';
import { Palette, Check } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

type Scheme = { background: string; text: string; button: string; buttonText: string; border: string };
const sections = [
  { id: 'header', label: 'Header & Logo' },
  { id: 'announcement', label: 'Announcement Bars' },
  { id: 'hero', label: 'Hero Banner' },
  { id: 'menu', label: 'Menu & Categories' },
  { id: 'product', label: 'Product Details' },
  { id: 'cart', label: 'Cart & Checkout' },
  { id: 'vip', label: 'VIP Passes' },
  { id: 'footer', label: 'Footer' },
];
const palettes: { name: string; colors: Scheme }[] = [
  { name: 'KFC Classic', colors: { background: '#ffffff', text: '#18181b', button: '#e4002b', buttonText: '#ffffff', border: '#e4e4e7' } },
  { name: 'Dark Premium', colors: { background: '#18181b', text: '#fafafa', button: '#e4002b', buttonText: '#ffffff', border: '#3f3f46' } },
  { name: 'Warm Cream', colors: { background: '#fff7ed', text: '#431407', button: '#c2410c', buttonText: '#ffffff', border: '#fed7aa' } },
  { name: 'Forest', colors: { background: '#f0fdf4', text: '#14532d', button: '#15803d', buttonText: '#ffffff', border: '#bbf7d0' } },
  { name: 'Ocean', colors: { background: '#eff6ff', text: '#1e3a8a', button: '#2563eb', buttonText: '#ffffff', border: '#bfdbfe' } },
  { name: 'Royal Purple', colors: { background: '#faf5ff', text: '#581c87', button: '#7e22ce', buttonText: '#ffffff', border: '#e9d5ff' } },
];
const defaults = palettes[0].colors;

export const SectionColorManager: React.FC = () => {
  const { settings, updateSettings } = useStore();
  const [section, setSection] = useState('header');
  const current: Scheme = settings.sectionColorSchemes?.[section] || defaults;
  const save = (next: Scheme) => updateSettings({ sectionColorSchemes: { ...(settings.sectionColorSchemes || {}), [section]: next } });
  const schemeIsSaved = Boolean(settings.sectionColorSchemes?.[section]);
  return <div className="max-w-5xl space-y-5">
    <div><h2 className="flex items-center gap-2 text-2xl font-black text-zinc-900"><Palette className="text-[#e4002b]"/> Section Color Schemes</h2><p className="mt-1 text-sm text-zinc-500">Har storefront section ke background, text, button aur border colors alag customize karein. Changes settings mein save hoti hain.</p></div>
    <div className="grid gap-4 lg:grid-cols-[250px_1fr]">
      <div className="space-y-2 rounded-2xl border bg-white p-3">{sections.map(s=><button key={s.id} onClick={()=>setSection(s.id)} className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-bold ${section===s.id?'bg-red-50 text-red-700 border border-red-200':'border border-transparent hover:bg-zinc-50 text-zinc-700'}`}>{s.label}{section===s.id&&<Check size={16}/>}</button>)}</div>
      <div className="space-y-5 rounded-2xl border bg-white p-4 sm:p-6">
        <div><h3 className="text-lg font-black">{sections.find(s=>s.id===section)?.label}</h3><p className="text-xs text-zinc-500">Suggested palettes select karein ya har color apni marzi se choose karein.</p></div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{palettes.map(p=><button key={p.name} onClick={()=>save(p.colors)} className="rounded-xl border p-3 text-left hover:border-red-300"><div className="mb-2 flex h-10 overflow-hidden rounded-lg border" style={{background:p.colors.background}}><span className="flex-1" style={{background:p.colors.button}}/><span className="flex-1" style={{background:p.colors.border}}/></div><span className="text-xs font-bold">{p.name}</span></button>)}</div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{([{key:'background',label:'Background'}, {key:'text',label:'Text'}, {key:'button',label:'Button'}, {key:'buttonText',label:'Button Text'}, {key:'border',label:'Border'}] as const).map(field=><label key={field.key} className="flex items-center justify-between gap-3 rounded-xl border p-3 text-sm font-semibold">{field.label}<span className="flex items-center gap-2"><input aria-label={field.label+' color'} type="color" value={current[field.key]} onChange={e=>save({...current,[field.key]:e.target.value})} className="h-9 w-12 cursor-pointer rounded border-0 bg-transparent"/><code className="text-xs text-zinc-500">{current[field.key]}</code></span></label>)}</div>
        <div className="rounded-2xl border p-4" style={{background:current.background,color:current.text,borderColor:current.border}}><p className="text-sm font-black">Live Preview</p><p className="my-2 text-sm">Yeh selected section ka sample preview hai.</p><button style={{background:current.button,color:current.buttonText}} className="rounded-xl px-4 py-2 text-sm font-black">Sample Button</button></div>
        <div className="flex flex-wrap gap-2"><button onClick={()=>save(defaults)} className="rounded-xl border px-4 py-2 text-sm font-bold">Reset to KFC Classic</button><span className="self-center text-xs text-zinc-500">{schemeIsSaved?'Custom scheme saved':'Default palette active'}</span></div>
      </div>
    </div>
  </div>;
};
