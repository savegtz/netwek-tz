import React, { useState, useEffect } from 'react';
import {
  Bell,
  X,
  Check,
  MessageSquare,
  Eye,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Send,
  Sparkles,
} from 'lucide-react';
import {
  pushNotificationService,
  ZeniaPushPayload,
} from '../services/notifications/pushNotificationService';
import { SafeImage } from './SafeImage';

interface NotificationHeadsUpBannerProps {
  onNavigate?: (route: string) => void;
}

export const NotificationHeadsUpBanner: React.FC<NotificationHeadsUpBannerProps> = ({
  onNavigate,
}) => {
  const [activeBanner, setActiveBanner] = useState<ZeniaPushPayload | null>(null);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replySuccessMessage, setReplySuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = pushNotificationService.onBanner((payload) => {
      setActiveBanner(payload);
      setIsReplying(false);
      setReplyText('');
      setReplySuccessMessage(null);
    });

    return () => unsubscribe();
  }, []);

  // Auto-dismiss after 6.5s unless it's an active progress notification below 100%
  useEffect(() => {
    if (!activeBanner) return;

    if (
      activeBanner.mode === 'progress' &&
      activeBanner.progressPercent !== undefined &&
      activeBanner.progressPercent < 100
    ) {
      return; // Keep visible while progress is active
    }

    const timer = setTimeout(() => {
      setActiveBanner(null);
      setIsReplying(false);
    }, 6500);

    return () => clearTimeout(timer);
  }, [activeBanner?.id, activeBanner?.progressPercent, activeBanner?.mode]);

  if (!activeBanner) return null;

  const handleActionClick = (action: string) => {
    if (action === 'reply') {
      setIsReplying(true);
      return;
    }

    if (action === 'view') {
      setActiveBanner(null);
      if (onNavigate) {
        if (activeBanner.tag?.includes('chat')) onNavigate('chats');
        else if (activeBanner.tag?.includes('wallet')) onNavigate('wallet');
        else if (activeBanner.tag?.includes('market')) onNavigate('shop');
        else onNavigate('notifications');
      }
      pushNotificationService.notifyAction('view', activeBanner);
      return;
    }

    if (action === 'accept') {
      setReplySuccessMessage('✅ Umekubali ombi hili kikamilifu!');
      pushNotificationService.notifyAction('accept', activeBanner);
      setTimeout(() => setActiveBanner(null), 1800);
      return;
    }

    if (action === 'reject') {
      setReplySuccessMessage('❌ Umekataa ombi hili.');
      pushNotificationService.notifyAction('reject', activeBanner);
      if (activeBanner.mode === 'progress') {
        pushNotificationService.cancelProgressDemo();
      }
      setTimeout(() => setActiveBanner(null), 1800);
      return;
    }

    pushNotificationService.notifyAction(action, activeBanner);
    setActiveBanner(null);
  };

  const handleSendInlineReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    pushNotificationService.notifyAction('reply_sent', {
      ...activeBanner,
      data: { ...(activeBanner.data || {}), replyText },
    });

    setReplySuccessMessage(`Jibu limetumwa: "${replyText.trim()}"`);
    setReplyText('');
    setTimeout(() => {
      setActiveBanner(null);
      setIsReplying(false);
    }, 1800);
  };

  const getModeBadge = () => {
    switch (activeBanner.mode) {
      case 'lock_screen':
        return { label: 'Lock Screen', icon: '🔔', color: 'bg-amber-500/20 text-amber-300' };
      case 'banner':
        return { label: 'Banner', icon: '📱', color: 'bg-cyan-500/20 text-cyan-300' };
      case 'panel':
        return { label: 'Panel', icon: '📥', color: 'bg-blue-500/20 text-blue-300' };
      case 'badge':
        return { label: 'App Badge', icon: '🔴', color: 'bg-rose-500/20 text-rose-300' };
      case 'rich':
        return { label: 'Rich Media', icon: '🖼️', color: 'bg-purple-500/20 text-purple-300' };
      case 'action':
        return { label: 'Interactive Action', icon: '⚡', color: 'bg-emerald-500/20 text-emerald-300' };
      case 'grouped':
        return { label: 'Grouped', icon: '📚', color: 'bg-indigo-500/20 text-indigo-300' };
      case 'silent':
        return { label: 'Kimyakimya', icon: '🤫', color: 'bg-slate-500/20 text-slate-300' };
      case 'progress':
        return { label: 'Progress', icon: '⏳', color: 'bg-sky-500/20 text-sky-300' };
      default:
        return { label: 'Push Alert', icon: '🔔', color: 'bg-cyan-500/20 text-cyan-300' };
    }
  };

  const badge = getModeBadge();

  return (
    <div className="fixed top-2 sm:top-4 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-md animate-in slide-in-from-top-4 duration-300 select-none">
      <div className="p-3.5 sm:p-4 rounded-3xl bg-[#0C1122]/95 backdrop-blur-2xl border border-cyan-500/40 shadow-2xl shadow-cyan-950/60 text-white relative overflow-hidden">
        {/* Glow indicator */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500" />

        {/* Header strip */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 border border-white/10 ${badge.color}`}
            >
              <span>{badge.icon}</span>
              <span>{badge.label}</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Zenia Push</span>
          </div>

          <button
            onClick={() => setActiveBanner(null)}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Ondoa taarifa"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex items-start gap-3">
          {activeBanner.image ? (
            <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-white/10 shadow-md">
              <SafeImage
                src={activeBanner.image}
                alt="Notification visual"
                className="w-full h-full object-cover"
                fallbackText="Z"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shrink-0 shadow-md shadow-cyan-500/20 font-bold text-slate-950">
              <Bell className="w-5 h-5 text-slate-950" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">
              {activeBanner.title}
            </h4>
            <p className="text-xs text-slate-300 mt-0.5 leading-snug line-clamp-2">
              {activeBanner.body}
            </p>
          </div>
        </div>

        {/* Progress Bar (if ⏳ Progress Notification) */}
        {activeBanner.mode === 'progress' && activeBanner.progressPercent !== undefined && (
          <div className="mt-3 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between text-[11px] font-bold mb-1">
              <span className="text-cyan-300">Inaendelea Kupakia / Kupakua</span>
              <span className="text-white font-mono">{activeBanner.progressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300 rounded-full"
                style={{ width: `${activeBanner.progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Reply feedback banner */}
        {replySuccessMessage && (
          <div className="mt-2.5 p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="truncate">{replySuccessMessage}</span>
          </div>
        )}

        {/* Inline Fast Reply Form (⚡ Action Notification) */}
        {isReplying && !replySuccessMessage && (
          <form onSubmit={handleSendInlineReply} className="mt-3 pt-2 border-t border-white/10 flex items-center gap-2">
            <input
              type="text"
              autoFocus
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Andika jibu lako la haraka..."
              className="flex-1 bg-black/40 border border-cyan-500/30 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md transition-all active:scale-95"
            >
              <Send className="w-3 h-3" />
              <span>Tuma</span>
            </button>
            <button
              type="button"
              onClick={() => setIsReplying(false)}
              className="px-2 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs"
            >
              Ghairi
            </button>
          </form>
        )}

        {/* Action Buttons Strip (⚡ Interactive Actions) */}
        {!isReplying && !replySuccessMessage && activeBanner.actions && activeBanner.actions.length > 0 && (
          <div className="mt-3 pt-2 border-t border-white/10 flex items-center gap-2 overflow-x-auto">
            {activeBanner.actions.map((act) => {
              const isAccept = act.action === 'accept';
              const isReject = act.action === 'reject';
              const isReply = act.action === 'reply';

              return (
                <button
                  key={act.action}
                  onClick={() => handleActionClick(act.action)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shrink-0 ${
                    isAccept
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                      : isReject
                      ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40'
                      : isReply
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10'
                  }`}
                >
                  {isAccept && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  {isReject && <XCircle className="w-3.5 h-3.5" />}
                  {isReply && <MessageSquare className="w-3.5 h-3.5" />}
                  <span>{act.title}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
