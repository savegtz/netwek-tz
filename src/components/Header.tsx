import React, { useState } from 'react';
import {
  Bell,
  Sparkles,
  Shield,
  Smartphone,
  Monitor,
  Menu,
  X,
  CreditCard,
  Briefcase,
  Compass,
  ShoppingBag,
  MessageCircle,
  Video,
  Users,
  Car,
  Calendar,
  ChevronLeft,
} from 'lucide-react';
import { UserProfile } from '../types';
import { SafeImage } from './SafeImage';

interface HeaderProps {
  currentUser: UserProfile;
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mainTabs = [
    { id: 'chats', label: 'Chats', icon: MessageCircle },
    { id: 'status', label: 'Status', icon: Video },
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'shop', label: 'Shop', icon: ShoppingBag },
    { id: 'profile', label: 'Profile', icon: Users },
  ];

  const subServices = [
    { id: 'events', label: 'Events & Tickets', icon: Calendar, color: 'text-purple-400' },
    { id: 'jobs', label: 'Jobs & Careers', icon: Briefcase, color: 'text-amber-400' },
    { id: 'transport', label: 'Rides & Transit', icon: Car, color: 'text-blue-400' },
    { id: 'wallet', label: 'Zenia Wallet', icon: CreditCard, color: 'text-emerald-400' },
    { id: 'community', label: 'Tech Communities', icon: Users, color: 'text-cyan-400' },
  ];

  const isSubService = ['events', 'jobs', 'transport', 'wallet', 'community'].includes(activeTab);

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'chats':
        return 'Chats';
      case 'status':
        return 'Status Stories';
      case 'discover':
        return 'Discover';
      case 'shop':
        return 'Marketplace';
      case 'profile':
        return 'My Profile';
      case 'events':
        return 'Events & Tickets';
      case 'jobs':
        return 'Jobs & Careers';
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
    <header className="sticky top-0 z-40 bg-[#070A14]/95 backdrop-blur-xl border-b border-white/[0.08] px-3 sm:px-5 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand / Sub-service back navigation */}
        <div className="flex items-center gap-2">
          {isSubService ? (
            <button
              onClick={() => onSelectTab('discover')}
              className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-cyan-400" />
              <span className="text-xs font-semibold text-white">{getTabTitle(activeTab)}</span>
            </button>
          ) : (
            <button
              onClick={() => onSelectTab('chats')}
              className="flex items-center gap-2 group text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-500 p-0.5 shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform shrink-0">
                <div className="w-full h-full bg-[#080B14] rounded-[10px] flex items-center justify-center">
                  <span className="text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 to-purple-400 font-black text-sm">
                    Z
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-white group-hover:text-cyan-300 transition-colors leading-none">
                  Zenia
                </span>
                <span className="text-[10px] text-cyan-400/90 font-medium sm:hidden leading-tight mt-0.5">
                  {getTabTitle(activeTab)}
                </span>
              </div>
            </button>
          )}
        </div>

        {/* Center: Desktop Navigation Tabs (Visible on tablet & desktop) */}
        <nav className="hidden md:flex items-center gap-1">
          {mainTabs.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'text-cyan-300 font-bold bg-cyan-500/10 border border-cyan-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* AI Assistant Quick Pill / Button */}
          <button
            onClick={onOpenAI}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 border border-purple-500/40 text-purple-200 hover:text-white text-xs font-semibold shadow-sm transition-all active:scale-95 group"
            title="Open Zenia AI Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400 group-hover:rotate-12 transition-transform" />
            <span className="text-[11px] sm:text-xs">AI</span>
          </button>

          {/* Desktop Only: Preview Mode Toggle */}
          <button
            onClick={onToggleFrameMode}
            className={`p-2 rounded-xl border transition-all text-xs hidden md:flex items-center gap-1.5 ${
              !isFrameMode
                ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-300 shadow-sm'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
            title={!isFrameMode ? 'Full Screen Web View (Active)' : 'Switch to Full Screen Web View'}
          >
            {!isFrameMode ? <Monitor className="w-4 h-4 text-cyan-400" /> : <Smartphone className="w-4 h-4" />}
            <span className="text-[11px] font-medium hidden lg:inline">
              {!isFrameMode ? 'Web View' : 'Mobile View'}
            </span>
          </button>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 transition-colors active:scale-95"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* User Profile Avatar with SafeImage */}
          <button
            onClick={() => onSelectTab('profile')}
            className="flex items-center gap-1.5 p-1 pl-1 pr-2 rounded-full bg-white/5 border border-white/10 hover:border-white/20 transition-all active:scale-95"
            title="Profile"
          >
            <div className="relative">
              <SafeImage
                src={currentUser.photoURL}
                fallbackText={currentUser.displayName}
                fallbackGradient="from-cyan-700 to-purple-800"
                alt={currentUser.displayName}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-purple-500/50"
              />
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[#080B14]" />
            </div>
            <span className="text-xs font-semibold text-slate-200 hidden sm:block">
              {currentUser.displayName.split(' ')[0]}
            </span>
          </button>

          {/* More menu drawer trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 transition-colors"
            title="All Services"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Services Dropdown Drawer (Mobile & Quick Hub) */}
      {mobileMenuOpen && (
        <div className="pt-3 pb-2 mt-2 border-t border-white/10 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {subServices.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                      : 'bg-[#121626] text-slate-300 hover:text-white border border-white/5 hover:border-white/15'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${item.color}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
            <button
              onClick={() => {
                onOpenAuth();
                setMobileMenuOpen(false);
              }}
              className="text-cyan-400 hover:underline py-1"
            >
              Account & Settings
            </button>
            <button
              onClick={() => {
                onOpenAdmin();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-1 text-slate-400 hover:text-cyan-300 py-1"
            >
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>Admin & System</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
