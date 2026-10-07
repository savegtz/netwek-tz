import React, { useState } from 'react';
import {
  MessageSquare,
  Store,
  Users,
  User,
  Calendar,
  Briefcase,
  Car,
  Plus,
  X,
  Layers,
} from 'lucide-react';
import { StatusIcon } from './StatusIcon';

interface BottomNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenCreateMenu: () => void;
  hasUnreadChats?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenCreateMenu,
  hasUnreadChats = false,
}) => {
  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);

  const isServicesActive = ['events', 'jobs', 'transport', 'community'].includes(activeTab);

  return (
    <div className="shrink-0 z-40 bg-[#070A12]/95 backdrop-blur-md border-t border-white/[0.06] px-3 sm:px-6 pt-2 pb-3 transition-all relative">
      {/* Quick Switcher Bar for the 4 Services when any of them is active */}
      {isServicesActive && (
        <div className="max-w-md mx-auto mb-2 px-1 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar animate-in slide-in-from-bottom-2">
          {[
            { id: 'events', label: 'Events', icon: Calendar, color: 'text-purple-400', activeBg: 'bg-purple-500/15 border-purple-500/30 text-purple-300 font-semibold' },
            { id: 'jobs', label: 'Jobs', icon: Briefcase, color: 'text-amber-400', activeBg: 'bg-amber-500/15 border-amber-500/30 text-amber-300 font-semibold' },
            { id: 'transport', label: 'Rides', icon: Car, color: 'text-blue-400', activeBg: 'bg-blue-500/15 border-blue-500/30 text-blue-300 font-semibold' },
            { id: 'community', label: 'Community', icon: Users, color: 'text-cyan-400', activeBg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300 font-semibold' },
          ].map((item) => {
            const Icon = item.icon;
            const isCurrent = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex-1 py-1 px-1.5 rounded-xl text-[10px] font-medium border flex items-center justify-center gap-1 transition-all whitespace-nowrap active:scale-95 ${
                  isCurrent
                    ? item.activeBg
                    : 'bg-white/[0.03] border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <Icon className={`w-3 h-3 shrink-0 ${item.color}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Services Popover Sheet (Attached to Center Button) */}
      {servicesMenuOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-3 mx-auto max-w-sm px-3 animate-in slide-in-from-bottom-3 duration-200 z-50">
          <div className="bg-[#0E1324]/98 backdrop-blur-2xl border border-white/10 rounded-3xl p-3.5 shadow-2xl">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                Huduma za Zenia (Services)
              </span>
              <button
                onClick={() => setServicesMenuOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* 1. Events & Tickets */}
              <button
                onClick={() => {
                  onSelectTab('events');
                  setServicesMenuOpen(false);
                }}
                className={`flex items-center gap-2.5 p-2.5 rounded-2xl border text-left transition-all active:scale-95 ${
                  activeTab === 'events'
                    ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                    : 'bg-[#14192B] border-white/5 hover:border-purple-500/30 text-white'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">Events</p>
                  <p className="text-[10px] text-slate-400 truncate">Matamasha & tiketi</p>
                </div>
              </button>

              {/* 2. Jobs & Careers */}
              <button
                onClick={() => {
                  onSelectTab('jobs');
                  setServicesMenuOpen(false);
                }}
                className={`flex items-center gap-2.5 p-2.5 rounded-2xl border text-left transition-all active:scale-95 ${
                  activeTab === 'jobs'
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-[#14192B] border-white/5 hover:border-amber-500/30 text-white'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">Jobs</p>
                  <p className="text-[10px] text-slate-400 truncate">Nafasi za kazi</p>
                </div>
              </button>

              {/* 3. Rides & Transit */}
              <button
                onClick={() => {
                  onSelectTab('transport');
                  setServicesMenuOpen(false);
                }}
                className={`flex items-center gap-2.5 p-2.5 rounded-2xl border text-left transition-all active:scale-95 ${
                  activeTab === 'transport'
                    ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                    : 'bg-[#14192B] border-white/5 hover:border-blue-500/30 text-white'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Car className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">Rides</p>
                  <p className="text-[10px] text-slate-400 truncate">Teksi & safari</p>
                </div>
              </button>

              {/* 4. Tech Communities */}
              <button
                onClick={() => {
                  onSelectTab('community');
                  setServicesMenuOpen(false);
                }}
                className={`flex items-center gap-2.5 p-2.5 rounded-2xl border text-left transition-all active:scale-95 ${
                  activeTab === 'community'
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                    : 'bg-[#14192B] border-white/5 hover:border-cyan-500/30 text-white'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">Communities</p>
                  <p className="text-[10px] text-slate-400 truncate">Vikundi</p>
                </div>
              </button>
            </div>

            {/* Bottom Quick Create Action */}
            <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between">
              <button
                onClick={() => {
                  onSelectTab('shop');
                  setServicesMenuOpen(false);
                }}
                className="text-[11px] text-slate-400 hover:text-cyan-400 font-medium flex items-center gap-1.5"
              >
                <Store className="w-3.5 h-3.5 text-cyan-400" />
                <span>Soko (Marketplace)</span>
              </button>
              <button
                onClick={() => {
                  onOpenCreateMenu();
                  setServicesMenuOpen(false);
                }}
                className="text-[11px] text-cyan-400 hover:underline font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Weka Tangazo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Nav Bar: 5 cleanly aligned tabs */}
      <div className="max-w-md mx-auto w-full flex items-center justify-between">
        {/* 1. Chats Tab */}
        <button
          onClick={() => {
            onSelectTab('chats');
            setServicesMenuOpen(false);
          }}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-1 transition-all active:scale-95 group"
          aria-label="Chats"
        >
          <div className="relative">
            <MessageSquare
              className={`w-5 h-5 transition-transform duration-150 ${
                activeTab === 'chats'
                  ? 'text-cyan-400 scale-105 stroke-[2.2]'
                  : 'text-slate-400 group-hover:text-slate-200 stroke-[1.8]'
              }`}
            />
            {hasUnreadChats && (
              <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-[#070A12]" />
            )}
          </div>
          <span
            className={`text-[10px] font-medium transition-colors ${
              activeTab === 'chats' ? 'text-cyan-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Chats
          </span>
        </button>

        {/* 2. Status Tab */}
        <button
          onClick={() => {
            onSelectTab('status');
            setServicesMenuOpen(false);
          }}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-1 transition-all active:scale-95 group"
          aria-label="Status"
        >
          <div className="relative">
            <StatusIcon
              className={`w-5 h-5 transition-transform duration-150 ${
                activeTab === 'status'
                  ? 'text-cyan-400 scale-105 stroke-[2.2]'
                  : 'text-slate-400 group-hover:text-slate-200'
              }`}
            />
          </div>
          <span
            className={`text-[10px] font-medium transition-colors ${
              activeTab === 'status' ? 'text-cyan-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Status
          </span>
        </button>

        {/* 3. Center Huduma / Services Button (Sleek, integrated icon) */}
        <button
          onClick={() => setServicesMenuOpen(!servicesMenuOpen)}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-1 transition-all active:scale-95 group"
          aria-label="Huduma (Services)"
          title="Huduma za Zenia: Events, Jobs, Rides, Communities"
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              servicesMenuOpen || isServicesActive
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-sm'
                : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/5'
            }`}
          >
            <Store className="w-4 h-4 stroke-[2]" />
          </div>
          <span
            className={`text-[10px] font-medium transition-colors ${
              servicesMenuOpen || isServicesActive ? 'text-cyan-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Huduma
          </span>
        </button>

        {/* 4. Communities Tab */}
        <button
          onClick={() => {
            onSelectTab('community');
            setServicesMenuOpen(false);
          }}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-1 transition-all active:scale-95 group"
          aria-label="Communities"
        >
          <Users
            className={`w-5 h-5 transition-transform duration-150 ${
              activeTab === 'community'
                ? 'text-cyan-400 stroke-[2.2] scale-105'
                : 'text-slate-400 group-hover:text-slate-200 stroke-[1.8]'
            }`}
          />
          <span
            className={`text-[10px] font-medium transition-colors ${
              activeTab === 'community' ? 'text-cyan-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Vikundi
          </span>
        </button>

        {/* 5. Profile Tab */}
        <button
          onClick={() => {
            onSelectTab('profile');
            setServicesMenuOpen(false);
          }}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-1 transition-all active:scale-95 group"
          aria-label="Profile"
        >
          <User
            className={`w-5 h-5 transition-transform duration-150 ${
              activeTab === 'profile'
                ? 'text-cyan-400 stroke-[2.2] scale-105'
                : 'text-slate-400 group-hover:text-slate-200 stroke-[1.8]'
            }`}
          />
          <span
            className={`text-[10px] font-medium transition-colors ${
              activeTab === 'profile' ? 'text-cyan-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Wasifu
          </span>
        </button>
      </div>
    </div>
  );
};
