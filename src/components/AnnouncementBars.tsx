import React from 'react';
import { useStore } from '../context/StoreContext';

/** Lightweight, admin-managed announcement bars. Legacy settings remain a fallback for older saved configs. */
export const AnnouncementBars: React.FC = () => {
  const { settings } = useStore();
  const bars = Array.isArray(settings.announcementBars)
    ? settings.announcementBars.filter((bar) => bar.enabled && String(bar.text || '').trim())
    : (settings.showAnnouncement !== false && String(settings.announcementText || '').trim()
      ? [{ id: 'legacy-announcement', text: settings.announcementText, enabled: true }]
      : []);

  if (!bars.length) return null;

  return (
    <div className="w-full" aria-label="Store announcements">
      {bars.map((bar) => (
        <div key={bar.id} className="w-full bg-[#e4002b] px-3 py-2 text-center text-[11px] sm:text-xs font-bold leading-relaxed text-white">
          {bar.text}
        </div>
      ))}
    </div>
  );
};
