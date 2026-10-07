import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Sparkles,
  Smartphone,
  Monitor,
  Compass,
  ShoppingBag,
  MessageCircle,
  Users,
  ChevronLeft,
  ShieldCheck,
  Sun,
  Moon,
  LogIn,
  MoreVertical,
  LogOut,
  User,
  Settings,
} from 'lucide-react';
import { UserProfile } from '../types';
import { SafeImage } from './SafeImage';
import { StatusIcon } from './StatusIcon';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  currentUser: UserProfile | null;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenNotifications: () => void;
  onOpenAI: () => void;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
  isFrameMode: boolean;
  onToggleFrameMode: () => void;
  unreadNotificationsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeTab,
  onSelectTab,
  onOpenNotifications,
  onOpenAI,
  onOpenAuth,
  onOpenAdmin,
  isFrameMode,
  onToggleFrameMode,
  unreadNotificationsCount,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const mainTabs = [
    { id: 'chats', label: 'Chats', icon: MessageCircle },
    { id: 'status', label: 'Status', icon: StatusIcon },
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'shop', label: 'Marketplace', icon: ShoppingBag },
    { id: 'profile', label: 'Profile', icon: Users },
  ];

  const isSubService = ['events', 'jobs', 'transport', 'wallet'].includes(activeTab);

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'chats':
        return 'Chats';
      case 'status':
        return 'Status';
      case 'discover':
        return 'Discover';
      case 'shop':
        return 'Marketplace';
      case 'profile':
        return 'Profile';
      case 'events':
        return 'Events';
      case 'jobs':
        return 'Jobs';
      case 'transport':
        return 'Rides';
      case 'wallet':
        return 'Wallet';
      case 'community':
        return 'Community';
      default:
        return 'Zenia';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#070A12]/95 backdrop-blur-md border-b border-white/[0.06] px-3.5 sm:px-6 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Zone 1: Brand Wordmark / Back Nav */}
        <div className="flex items-center gap-2">
          {isSubService ? (
            <button
              onClick={() => onSelectTab('profile')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-semibold text-white">{getTabTitle(activeTab)}</span>
            </button>
          ) : (
            <button
              onClick={() => onSelectTab('chats')}
              className="flex items-center gap-2.5 group text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 p-[1.5px] shadow-sm shadow-cyan-500/20 group-hover:scale-105 transition-transform shrink-0">
                <div className="w-full h-full bg-[#080B14] rounded-[10px] flex items-center justify-center">
                  <span className="text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 to-blue-400 font-black text-sm">
                    Z
                  </span>
                </div>
              </div>
              <span className="font-extrabold text-base tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                Zenia
              </span>
            </button>
          )}
        </div>

        {/* Zone 2: Desktop Navigation Links (Clean & unboxed) */}
        <nav className="hidden md:flex items-center gap-1">
          {mainTabs.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'text-cyan-300 font-semibold bg-cyan-500/10 border border-cyan-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Refined Action Controls (Max 3 clean icons, zero clutter) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* 1. Zenia AI Assistant Button */}
          <button
            onClick={onOpenAI}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-200 text-xs font-semibold transition-all active:scale-95 group"
            title="Zenia AI Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400 group-hover:rotate-12 transition-transform" />
            <span className="text-xs">AI</span>
          </button>

          {/* 2. Notifications Bell with subtle counter */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white transition-colors active:scale-95"
            title="Taarifa (Notifications)"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center">
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* 3. Consolidated Profile & App Settings Dropdown Menu */}
          <div className="relative" ref={menuRef}>
            {currentUser ? (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`flex items-center gap-1.5 p-1 pl-1 pr-1.5 rounded-xl border transition-all active:scale-95 ${
                  isMenuOpen
                    ? 'bg-cyan-500/15 border-cyan-400/40'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
                title="Menyu ya Mipangilio na Wasifu"
                aria-label="User menu"
              >
                <div className="relative">
                  <SafeImage
                    src={currentUser.photoURL}
                    fallbackText={currentUser.displayName}
                    fallbackGradient="from-cyan-700 to-purple-800"
                    alt={currentUser.displayName}
                    className="w-6 h-6 rounded-lg object-cover"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[#070A12]" />
                </div>
                <MoreVertical className="w-3.5 h-3.5 text-slate-400" />
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all active:scale-95 shadow-sm"
                title="Ingia kwenye Akaunti"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-950" />
                <span>Ingia</span>
              </button>
            )}

            {/* Elegant Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-[#0E1324] border border-white/10 rounded-2xl p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
                {currentUser && (
                  <div className="px-3 py-2 border-b border-white/5 mb-1">
                    <p className="text-xs font-bold text-white truncate">{currentUser.displayName}</p>
                    <p className="text-[10px] text-slate-400 truncate">@{currentUser.username}</p>
                  </div>
                )}

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onSelectTab('profile');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-white/5 transition-colors text-left"
                >
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Wasifu Wangu (Profile)</span>
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    toggleTheme();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-white/5 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    {isDark ? (
                      <Moon className="w-3.5 h-3.5 text-indigo-400" />
                    ) : (
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    <span>Mandhari ({isDark ? 'Usiku' : 'Mchana'})</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {isDark ? '🌙' : '☀️'}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onToggleFrameMode();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-white/5 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    {!isFrameMode ? (
                      <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                    ) : (
                      <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                    )}
                    <span>Mtazamo ({!isFrameMode ? 'Simu' : 'Web'})</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {!isFrameMode ? 'Mobile' : 'Desktop'}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-white/5 transition-colors text-left"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Usimamizi wa Mfumo (Admin)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
