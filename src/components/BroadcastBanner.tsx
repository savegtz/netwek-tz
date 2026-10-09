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
    <div className="w-full bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-purple-500/20 border-b border-amber-500/30 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 text-white text-xs select-none shadow-lg backdrop-blur-md animate-in slide-in-from-top-2 z-30">
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-md">
          <Bell className="w-4 h-4 animate-bounce" />
        </div>
        <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
          <span className="font-extrabold text-amber-300 truncate text-[11px] sm:text-xs">
            📢 {announcement.title}:
          </span>
          <span className="text-slate-200 truncate text-[11px] sm:text-xs font-medium">
            {announcement.message}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          title="Funga Tangazo"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
