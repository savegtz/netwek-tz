/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Bell, X, AlertTriangle, Sparkles, ExternalLink } from 'lucide-react';

export interface BroadcastAnnouncement {
  id: string;
  title: string;
  message: string;
  urgency?: 'normal' | 'high' | 'promo';
  createdAt?: string;
}

interface BroadcastBannerProps {
  onNavigate?: (targetTab: string) => void;
}

export const BroadcastBanner: React.FC<BroadcastBannerProps> = ({ onNavigate }) => {
  const [announcement, setAnnouncement] = useState<BroadcastAnnouncement | null>(() => {
    try {
      const saved = localStorage.getItem('zenia_global_announcement');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem('zenia_global_announcement');
        setAnnouncement(saved ? JSON.parse(saved) : null);
        setDismissed(false);
      } catch {
        setAnnouncement(null);
      }
    };

    window.addEventListener('zenia_announcement_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('zenia_announcement_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  if (!announcement || dismissed) return null;

  return (
    <div className="w-full bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-purple-500/15 border-b border-amber-500/30 px-3 sm:px-6 py-1.5 sm:py-2 flex items-center justify-between gap-2.5 text-white text-xs select-none shadow-md backdrop-blur-md animate-in slide-in-from-top-1 z-30">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-sm text-xs">
          <Bell className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </div>
        <div className="min-w-0 flex-1 flex flex-row items-center gap-1.5 overflow-hidden">
          <span className="font-extrabold text-amber-300 truncate text-[10.5px] sm:text-xs shrink-0">
            {announcement.title}:
          </span>
          <span className="text-slate-200 truncate text-[10.5px] sm:text-xs font-normal">
            {announcement.message}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          title="Funga Tangazo"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
