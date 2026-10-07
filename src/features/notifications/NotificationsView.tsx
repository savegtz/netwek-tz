import React, { useState, useEffect } from 'react';
import {
  Bell,
  Heart,
  MessageSquare,
  Calendar,
  UserPlus,
  Package,
  Briefcase,
  CheckCheck,
  ArrowLeft,
  Trash2,
  CheckSquare,
  Square,
  Check,
  X,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { NotificationItem, UserProfile } from '../../types';
import { INITIAL_NOTIFICATIONS } from '../../services/seed/initialData';
import { SafeImage } from '../../components/SafeImage';

interface NotificationsViewProps {
  onBack?: () => void;
  onNavigate?: (type: string) => void;
  notifications?: NotificationItem[];
  onUpdateNotifications?: (updated: NotificationItem[]) => void;
  currentUser?: UserProfile | null;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  onBack,
  onNavigate,
  notifications: externalNotifications,
  onUpdateNotifications,
  currentUser,
}) => {
  const storageKey = `zenia_notifications_${currentUser?.id || 'guest'}`;

  // Internal state if not controlled externally
  const [internalNotifications, setInternalNotifications] = useState<NotificationItem[]>(() => {
    if (externalNotifications) return externalNotifications;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_NOTIFICATIONS;
  });

  const notifications = externalNotifications ?? internalNotifications;

  const updateNotificationsList = (updater: (prev: NotificationItem[]) => NotificationItem[]) => {
    const updated = updater(notifications);
    if (onUpdateNotifications) {
      onUpdateNotifications(updated);
    } else {
      setInternalNotifications(updated);
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {}
    }
  };

  const [activeTab, setActiveTab] = useState<'All' | 'Messages' | 'Social' | 'System'>('All');

  // Multi-selection state
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Deletion modals
  const [confirmDeleteSingle, setConfirmDeleteSingle] = useState<NotificationItem | null>(null);
  const [confirmDeleteSelected, setConfirmDeleteSelected] = useState(false);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  // Undo / Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastDeletedItems, setLastDeletedItems] = useState<NotificationItem[] | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
      setLastDeletedItems(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const showToast = (message: string, deleted?: NotificationItem[]) => {
    setToastMessage(message);
    if (deleted && deleted.length > 0) {
      setLastDeletedItems(deleted);
    }
  };

  const handleUndo = () => {
    if (!lastDeletedItems || lastDeletedItems.length === 0) return;
    updateNotificationsList((prev) => [...lastDeletedItems, ...prev]);
    showToast(`Taarifa ${lastDeletedItems.length} zimerejeshwa! ↩️`);
    setLastDeletedItems(null);
  };

  // Filter items
  const filtered = notifications.filter((item) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Messages') return item.type === 'message';
    if (activeTab === 'Social')
      return (
        item.type === 'reaction' ||
        item.type === 'follow' ||
        item.type === 'comment' ||
        item.type === 'status'
      );
    if (activeTab === 'System')
      return (
        item.type === 'order' ||
        item.type === 'event' ||
        item.type === 'job' ||
        item.type === 'system'
      );
    return true;
  });

  const markAllAsRead = () => {
    updateNotificationsList((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('Taarifa zote zimetiwa alama ya kusomwa. ✓');
  };

  // Toggle selection for an individual notification
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Select all or deselect all
  const handleSelectAll = () => {
    const currentFilteredIds = filtered.map((n) => n.id);
    const allSelected = currentFilteredIds.every((id) => selectedIds.has(id));
    if (allSelected) {
      // Deselect filtered
      setSelectedIds((prev) => {
        const next = new Set(prev);
        currentFilteredIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      // Select all filtered
      setSelectedIds((prev) => {
        const next = new Set(prev);
        currentFilteredIds.forEach((id) => next.add(id));
        return next;
      });
    }
  };

  // Delete a single notification ("kufuta moja")
  const executeDeleteSingle = (item: NotificationItem) => {
    updateNotificationsList((prev) => prev.filter((n) => n.id !== item.id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(item.id);
      return next;
    });
    setConfirmDeleteSingle(null);
    showToast(`Taarifa ya "${item.title.slice(0, 26)}..." imefutwa! 🗑️`, [item]);
  };

  // Delete selected notifications in bulk ("kufuta zilizochaguliwa")
  const executeDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    const itemsToDelete = notifications.filter((n) => selectedIds.has(n.id));
    const count = itemsToDelete.length;

    updateNotificationsList((prev) => prev.filter((n) => !selectedIds.has(n.id)));
    setSelectedIds(new Set());
    setIsSelectionMode(false);
    setConfirmDeleteSelected(false);
    showToast(`Taarifa ${count} zimefutwa kwapamoja! 🗑️`, itemsToDelete);
  };

  // Delete all notifications at once ("kufuta zote kwapamoja")
  const executeDeleteAll = () => {
    const total = notifications.length;
    const itemsToDelete = [...notifications];
    updateNotificationsList(() => []);
    setSelectedIds(new Set());
    setIsSelectionMode(false);
    setConfirmDeleteAll(false);
    showToast(`Taarifa zote (${total}) zimefutwa kwapamoja! 🗑️`, itemsToDelete);
  };

  // Restore sample notifications
  const handleRestoreSample = () => {
    updateNotificationsList(() => INITIAL_NOTIFICATIONS);
    showToast('Sampuli ya taarifa imerejeshwa upya! ✨');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'reaction':
        return <Heart className="w-3.5 h-3.5 text-rose-400" />;
      case 'message':
        return <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />;
      case 'event':
        return <Calendar className="w-3.5 h-3.5 text-purple-400" />;
      case 'follow':
        return <UserPlus className="w-3.5 h-3.5 text-emerald-400" />;
      case 'order':
        return <Package className="w-3.5 h-3.5 text-amber-400" />;
      case 'job':
        return <Briefcase className="w-3.5 h-3.5 text-blue-400" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const isAllCurrentFilteredSelected =
    filtered.length > 0 && filtered.every((item) => selectedIds.has(item.id));

  return (
    <div className="relative w-full max-w-lg mx-auto min-h-[580px] flex flex-col bg-[#0A0D18] text-white">
      {/* Toast Notification Banner with Undo Option */}
      {toastMessage && (
        <div className="absolute top-2 left-4 right-4 z-50 bg-gradient-to-r from-[#111A33] to-[#0D1527] border border-cyan-500/40 text-cyan-200 text-xs px-3.5 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-center justify-between animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <Check className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="truncate">{toastMessage}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {lastDeletedItems && lastDeletedItems.length > 0 && (
              <button
                onClick={handleUndo}
                className="px-2 py-0.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold text-[11px] flex items-center gap-1 transition-colors"
                title="Rejesha zilizofutwa"
              >
                <RotateCcw className="w-3 h-3" />
                Rejesha
              </button>
            )}
            <button
              onClick={() => {
                setToastMessage(null);
                setLastDeletedItems(null);
              }}
              className="text-cyan-400/70 hover:text-cyan-200 font-bold text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header Bar: Standard or Multi-Select Mode */}
      {isSelectionMode ? (
        <div className="p-3.5 flex items-center justify-between border-b border-cyan-500/30 bg-[#0E1428] animate-in slide-in-from-top-1">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setIsSelectionMode(false);
                setSelectedIds(new Set());
              }}
              className="p-1 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Ghairi uchaguzi (Cancel)"
            >
              <X className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-cyan-300">
              {selectedIds.size}{' '}
              {selectedIds.size === 1 ? 'Imechaguliwa' : 'Zimechaguliwa'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleSelectAll}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold transition-all active:scale-95"
            >
              {isAllCurrentFilteredSelected ? 'Ondoa Zote' : 'Chagua Zote'}
            </button>

            <button
              disabled={selectedIds.size === 0}
              onClick={() => setConfirmDeleteSelected(true)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-sm ${
                selectedIds.size > 0
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                  : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
              }`}
              title="Futa taarifa zilizochaguliwa kwapamoja"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Futa ({selectedIds.size})</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 flex items-center justify-between border-b border-white/5 bg-[#0A0D18]">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                onClick={onBack}
                className="p-1.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                title="Rudi nyuma"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>Taarifa</span>
                <span className="text-[11px] font-semibold text-slate-400 px-2 py-0.5 rounded-full bg-white/5">
                  {notifications.length}
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <>
                {/* Select button for bulk actions */}
                <button
                  onClick={() => setIsSelectionMode(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-cyan-500/10 hover:text-cyan-300 text-slate-300 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
                  title="Chagua taarifa (Select multiple)"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">Chagua</span>
                </button>

                {/* Delete all button ("Futa zote kwapamoja") */}
                <button
                  onClick={() => setConfirmDeleteAll(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/25 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
                  title="Futa taarifa zote kwapamoja (Delete all notifications)"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span className="hidden sm:inline">Futa Zote</span>
                </button>

                {/* Mark all as read */}
                <button
                  onClick={markAllAsRead}
                  className="p-1.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-cyan-300 transition-colors"
                  title="Tia alama zote zimesomwa"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Tabs (All, Messages, Social, System) with counts */}
      <div className="flex items-center gap-1.5 p-3 pb-2 border-b border-white/[0.04] overflow-x-auto no-scrollbar">
        {(['All', 'Messages', 'Social', 'System'] as const).map((tab) => {
          const isSelected = activeTab === tab;
          const count = notifications.filter((item) => {
            if (tab === 'All') return true;
            if (tab === 'Messages') return item.type === 'message';
            if (tab === 'Social')
              return (
                item.type === 'reaction' ||
                item.type === 'follow' ||
                item.type === 'comment' ||
                item.type === 'status'
              );
            if (tab === 'System')
              return (
                item.type === 'order' ||
                item.type === 'event' ||
                item.type === 'job' ||
                item.type === 'system'
              );
            return true;
          }).length;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                isSelected
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{tab === 'All' ? 'Zote' : tab}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-black/40 text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Notifications Stream / List */}
      <div className="p-4 space-y-2.5 flex-1 overflow-y-auto max-h-[68vh]">
        {filtered.length === 0 ? (
          <div className="py-14 px-4 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3.5 shadow-inner">
              <Bell className="w-7 h-7 text-cyan-400/80" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Hakuna Taarifa Bado</h4>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed mb-4">
              {notifications.length === 0
                ? 'Taarifa zako zote zimesafishwa. Hapa zitaonekana taarifa mpya za jumbe, maoni, na matukio.'
                : 'Hakuna taarifa katika kitengo hiki kwa sasa.'}
            </p>
            {notifications.length === 0 && (
              <button
                onClick={handleRestoreSample}
                className="px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                Rejesha Sampuli ya Taarifa
              </button>
            )}
          </div>
        ) : (
          filtered.map((item) => {
            const isSelected = selectedIds.has(item.id);

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (isSelectionMode) {
                    toggleSelect(item.id);
                  } else if (onNavigate) {
                    onNavigate(item.type);
                  }
                }}
                className={`group relative p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  isSelectionMode && isSelected
                    ? 'bg-cyan-950/30 border-cyan-400/70 shadow-lg ring-1 ring-cyan-400/30'
                    : item.read
                    ? 'bg-[#14192B]/60 border-white/5 hover:bg-[#14192B]'
                    : 'bg-[#14192B] border-cyan-500/30 hover:border-cyan-400 shadow-md'
                }`}
              >
                {/* Selection Checkbox (Visible in selection mode) */}
                {isSelectionMode && (
                  <div className="pt-1.5 shrink-0">
                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-cyan-500 text-black shadow-sm'
                          : 'border border-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      ) : (
                        <Square className="w-3.5 h-3.5 opacity-0" />
                      )}
                    </div>
                  </div>
                )}

                {/* Avatar with type badge overlay */}
                <div className="relative shrink-0">
                  <SafeImage
                    src={item.avatar}
                    fallbackText={item.title}
                    fallbackGradient="from-slate-800 to-indigo-900"
                    alt=""
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10"
                  />
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#0A0D18] border border-white/10 flex items-center justify-center">
                    {getIcon(item.type)}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h5 className="font-semibold text-xs text-white truncate">{item.title}</h5>
                    <span className="text-[10px] text-slate-400 shrink-0">{item.createdAt}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">
                    {item.message}
                  </p>
                </div>

                {/* Quick Action: Delete Single Notification ("Kufuta Moja") */}
                {!isSelectionMode && (
                  <div className="shrink-0 flex items-center self-center pl-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDeleteSingle(item);
                      }}
                      className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all opacity-80 group-hover:opacity-100"
                      title="Futa taarifa hii (Delete single)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation Modal: Delete Single Notification */}
      {confirmDeleteSingle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-[#101426] border border-rose-500/30 rounded-2xl p-5 shadow-2xl animate-in zoom-in-95">
            <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-3.5">
              <Trash2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1.5">Futa Taarifa Hii?</h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Je, una uhakika unataka kufuta taarifa ya{' '}
              <span className="font-semibold text-cyan-300">
                "{confirmDeleteSingle.title}"
              </span>
              ?
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setConfirmDeleteSingle(null)}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors"
              >
                Ghairi
              </button>
              <button
                onClick={() => executeDeleteSingle(confirmDeleteSingle)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
              >
                Futa Taarifa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete Selected Notifications */}
      {confirmDeleteSelected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-[#101426] border border-rose-500/30 rounded-2xl p-5 shadow-2xl animate-in zoom-in-95">
            <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-3.5">
              <Trash2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1.5">
              Futa Taarifa Zilizochaguliwa?
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Je, una uhakika unataka kufuta taarifa{' '}
              <span className="font-bold text-white">{selectedIds.size}</span> ulizochagua
              kwapamoja?
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setConfirmDeleteSelected(false)}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors"
              >
                Ghairi
              </button>
              <button
                onClick={executeDeleteSelected}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
              >
                Futa ({selectedIds.size})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete All Notifications ("Futa Zote Kwapamoja") */}
      {confirmDeleteAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-[#101426] border border-rose-500/30 rounded-2xl p-5 shadow-2xl animate-in zoom-in-95">
            <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-3.5">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1.5">
              Futa Taarifa Zote Kwapamoja?
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Je, una uhakika unataka kufuta taarifa zako zote{' '}
              <span className="font-bold text-white">({notifications.length})</span>? Taarifa zote
              zitaondolewa kabisa.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setConfirmDeleteAll(false)}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors"
              >
                Ghairi
              </button>
              <button
                onClick={executeDeleteAll}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Futa Zote Kwapamoja</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
