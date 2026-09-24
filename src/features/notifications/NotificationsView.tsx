import React, { useState } from 'react';
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
} from 'lucide-react';
import { NotificationItem } from '../../types';
import { INITIAL_NOTIFICATIONS } from '../../services/seed/initialData';
import { SafeImage } from '../../components/SafeImage';

interface NotificationsViewProps {
  onBack?: () => void;
  onNavigate?: (type: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  onBack,
  onNavigate,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<'All' | 'Messages' | 'Social' | 'System'>('All');

  const filtered = notifications.filter((item) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Messages') return item.type === 'message';
    if (activeTab === 'Social') return item.type === 'reaction' || item.type === 'follow' || item.type === 'comment' || item.type === 'status';
    if (activeTab === 'System') return item.type === 'order' || item.type === 'event' || item.type === 'job' || item.type === 'system';
    return true;
  });

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'reaction':
        return <Heart className="w-4 h-4 text-rose-400" />;
      case 'message':
        return <MessageSquare className="w-4 h-4 text-cyan-400" />;
      case 'event':
        return <Calendar className="w-4 h-4 text-purple-400" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-emerald-400" />;
      case 'order':
        return <Package className="w-4 h-4 text-amber-400" />;
      case 'job':
        return <Briefcase className="w-4 h-4 text-blue-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-[660px] flex flex-col bg-[#0A0D18] text-white pb-20">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          {onBack && (
            <button onClick={onBack} className="p-1 text-slate-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h3 className="font-bold text-base text-white">Notifications</h3>
        </div>
        <button
          onClick={markAllAsRead}
          className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-medium"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          Mark read
        </button>
      </div>

      {/* Tabs (All, Messages, Social, System) - Matching Screenshot Screen 15 */}
      <div className="flex items-center gap-2 p-4 pb-2">
        {(['All', 'Messages', 'Social', 'System'] as const).map((tab) => {
          const isSelected = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Notifications Stream */}
      <div className="p-4 space-y-2.5 flex-1">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => onNavigate && onNavigate(item.type)}
            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
              item.read
                ? 'bg-[#14192B]/60 border-white/5 hover:bg-[#14192B]'
                : 'bg-[#14192B] border-cyan-500/30 hover:border-cyan-400 shadow-md'
            }`}
          >
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
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <h5 className="font-semibold text-xs text-white truncate">{item.title}</h5>
                <span className="text-[10px] text-slate-400 shrink-0">{item.createdAt}</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">{item.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
