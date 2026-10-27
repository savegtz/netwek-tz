import React, { useState } from 'react';
import {
  Activity,
  Play,
  Pause,
  Trash2,
  Filter,
  UserPlus,
  ShoppingBag,
  Award,
  DollarSign,
  Radio,
  Flag,
  ArrowRight,
} from 'lucide-react';
import { LiveActivityEvent } from '../types';

interface LiveActivityFeedProps {
  events: LiveActivityEvent[];
  onClearFeed: () => void;
}

export const LiveActivityFeedView: React.FC<LiveActivityFeedProps> = ({ events, onClearFeed }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  const filteredEvents = events.filter((ev) => {
    if (filterType === 'all') return true;
    return ev.type === filterType;
  });

  const getIconForType = (type: LiveActivityEvent['type']) => {
    switch (type) {
      case 'user_registered':
        return <UserPlus className="w-4 h-4 text-emerald-400" />;
      case 'product_listed':
        return <ShoppingBag className="w-4 h-4 text-cyan-400" />;
      case 'status_promoted':
        return <Award className="w-4 h-4 text-amber-400" />;
      case 'payout_requested':
      case 'wallet_transfer':
        return <DollarSign className="w-4 h-4 text-purple-400" />;
      case 'space_started':
        return <Radio className="w-4 h-4 text-rose-400" />;
      case 'report_submitted':
        return <Flag className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="p-5 rounded-3xl bg-[#0F1426] border border-cyan-500/25 shadow-xl space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <span className="w-3 h-3 rounded-full bg-emerald-500 block animate-ping absolute inset-0" />
            <span className="w-3 h-3 rounded-full bg-emerald-400 block relative" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
              <span>Mfuatano wa Matukio Mubashara (Live Activity Feed)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 font-mono">
                {isPaused ? '⏸️ Imesimamishwa' : '🔴 Hewani'}
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              Matukio ya watumiaji yanayotokea ndani ya Zenia Network kwa wakati halisi
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              isPaused
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
            }`}
          >
            {isPaused ? <Play className="w-3 h-3 fill-amber-300" /> : <Pause className="w-3 h-3" />}
            <span>{isPaused ? 'Endeleza Feed' : 'Pumzisha'}</span>
          </button>

          <button
            type="button"
            onClick={onClearFeed}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 transition-colors"
            title="Safisha Orodha ya Matukio"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
        {[
          { id: 'all', label: 'Yote' },
          { id: 'user_registered', label: 'Watumiaji Wapya' },
          { id: 'product_listed', label: 'Bidhaa za Soko' },
          { id: 'status_promoted', label: 'Status Komfemu' },
          { id: 'payout_requested', label: 'Malipo & Payouts' },
          { id: 'space_started', label: 'Live Spaces' },
          { id: 'report_submitted', label: 'Malalamiko' },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilterType(f.id)}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all shrink-0 ${
              filterType === f.id
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Event Items List */}
      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            Hakuna matukio yaliyopatikana kwa kichujio hiki.
          </div>
        ) : (
          filteredEvents.map((ev) => (
            <div
              key={ev.id}
              className="p-3 rounded-2xl bg-[#090D1A] border border-white/5 hover:border-cyan-500/20 transition-all flex items-start justify-between gap-3 group animate-in fade-in"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0 mt-0.5 border border-white/5 group-hover:border-cyan-500/30 transition-colors">
                  {getIconForType(ev.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h5 className="font-bold text-xs text-white">{ev.title}</h5>
                    <span className="text-[10px] text-slate-500 font-mono">• {ev.timeAgo}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{ev.description}</p>
                  <span className="text-[10px] text-cyan-400 font-semibold mt-1 block">
                    Mhusika: {ev.actor}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
