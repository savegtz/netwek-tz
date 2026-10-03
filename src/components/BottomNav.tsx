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

interface BottomNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenCreateMenu: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenCreateMenu,
}) => {
  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);

  const isServicesActive = ['events', 'jobs', 'transport', 'community'].includes(activeTab);

  return (
    <div className="shrink-0 z-40 bg-[#10131C] rounded-t-[32px] px-3 sm:px-6 pt-2 pb-3.5 transition-all shadow-[0_-8px_30px_rgba(0,0,0,0.5)] relative">
      {/* Quick Switcher Bar for the 4 Services when any of them is active */}
      {isServicesActive && (
        <div className="max-w-md mx-auto mb-2 px-1 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar animate-in slide-in-from-bottom-2">
          {[
            { id: 'events', label: 'Events & Tickets', icon: Calendar, color: 'text-purple-400', activeBg: 'bg-purple-500/20 border-purple-500/40 text-purple-300 font-bold' },
            { id: 'jobs', label: 'Jobs & Careers', icon: Briefcase, color: 'text-amber-400', activeBg: 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold' },
            { id: 'transport', label: 'Rides & Transit', icon: Car, color: 'text-blue-400', activeBg: 'bg-blue-500/20 border-blue-500/40 text-blue-300 font-bold' },
            { id: 'community', label: 'Communities', icon: Users, color: 'text-cyan-400', activeBg: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 font-bold' },
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
                    : 'bg-[#151928] border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <Icon className={`w-3 h-3 shrink-0 ${item.color}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Services & Quick Hub Popover Sheet (Attached to Center Button) */}
      {servicesMenuOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-3 mx-auto max-w-sm px-3 animate-in slide-in-from-bottom-3 duration-200 z-50">
          <div className="bg-[#121626]/98 backdrop-blur-2xl border border-white/15 rounded-3xl p-3.5 shadow-2xl">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
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
                    : 'bg-[#181D30] border-white/5 hover:border-purple-500/30 text-white'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">Events & Tickets</p>
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
                    : 'bg-[#181D30] border-white/5 hover:border-amber-500/30 text-white'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">Jobs & Careers</p>
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
                    : 'bg-[#181D30] border-white/5 hover:border-blue-500/30 text-white'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Car className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">Rides & Transit</p>
                  <p className="text-[10px] text-slate-400 truncate">Teksi & boda</p>
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
                    : 'bg-[#181D30] border-white/5 hover:border-cyan-500/30 text-white'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">Communities</p>
                  <p className="text-[10px] text-slate-400 truncate">Vikundi vya wataalamu</p>
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
                <span>Weka Tangazo / Chapisho</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Nav Bar */}
      <div className="max-w-md mx-auto w-full flex items-center justify-between relative">
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
              className={`w-5 h-5 transition-transform duration-200 ${
                activeTab === 'chats'
                  ? 'fill-[#3B82F6] text-[#3B82F6] scale-105'
                  : 'text-slate-400 group-hover:text-slate-200 stroke-[1.8]'
              }`}
            />
            {/* Unread badge dot */}
            <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-[#10131C]" />
          </div>
          <span
            className={`text-[11px] font-medium transition-colors ${
              activeTab === 'chats' ? 'text-[#3B82F6] font-semibold' : 'text-slate-400'
            }`}
          >
            Chats
          </span>
        </button>

        {/* 2. Shop / Marketplace Tab */}
        <button
          onClick={() => {
            onSelectTab('shop');
            setServicesMenuOpen(false);
          }}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-1 transition-all active:scale-95 group"
          aria-label="Shop"
        >
          <Store
            className={`w-5 h-5 transition-transform duration-200 ${
              activeTab === 'shop'
                ? 'text-[#3B82F6] stroke-[2.5] scale-105'
                : 'text-slate-400 group-hover:text-slate-200 stroke-[1.8]'
            }`}
          />
          <span
            className={`text-[11px] font-medium transition-colors ${
              activeTab === 'shop' ? 'text-[#3B82F6] font-semibold' : 'text-slate-400'
            }`}
          >
            Shop
          </span>
        </button>

        {/* 3. Center Elevated Huduma / Services Button */}
        <div className="flex-1 flex flex-col items-center justify-center relative -mt-7">
          <button
            onClick={() => setServicesMenuOpen(!servicesMenuOpen)}
            className="group relative flex items-center justify-center active:scale-90 transition-transform duration-200"
            aria-label="Huduma za Zenia (Services)"
            title="Huduma za Zenia: Events, Jobs, Rides, Communities"
          >
            {/* Outer Soft Lavender Glow Ring */}
            <div
              className={`p-1 rounded-full shadow-[0_4px_22px_rgba(99,102,241,0.55)] transition-all ${
                servicesMenuOpen || isServicesActive
                  ? 'bg-cyan-400/40 ring-2 ring-cyan-400'
                  : 'bg-[#A5B4FC]/35 group-hover:bg-[#A5B4FC]/45'
              }`}
            >
              {/* Middle Pure White Ring */}
              <div className="p-[2.5px] rounded-full bg-white shadow-sm">
                {/* Core Royal Blue-Violet Gradient Circle */}
                <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#4F46E5] to-[#6366F1] flex items-center justify-center shadow-inner">
                  {/* Store / Services icon */}
                  <Store className="w-6 h-6 text-white stroke-[2.2] group-hover:scale-110 transition-transform duration-200" />
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* 4. Tech Communities Tab */}
        <button
          onClick={() => {
            onSelectTab('community');
            setServicesMenuOpen(false);
          }}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-1 transition-all active:scale-95 group"
          aria-label="Communities"
        >
          <Users
            className={`w-5 h-5 transition-transform duration-200 ${
              activeTab === 'community'
                ? 'text-[#3B82F6] stroke-[2.5] scale-105'
                : 'text-slate-400 group-hover:text-slate-200 stroke-[1.8]'
            }`}
          />
          <span
            className={`text-[11px] font-medium transition-colors ${
              activeTab === 'community' ? 'text-[#3B82F6] font-semibold' : 'text-slate-400'
            }`}
          >
            Communities
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
            className={`w-5 h-5 transition-transform duration-200 ${
              activeTab === 'profile'
                ? 'text-[#3B82F6] stroke-[2.5] scale-105'
                : 'text-slate-400 group-hover:text-slate-200 stroke-[1.8]'
            }`}
          />
          <span
            className={`text-[11px] font-medium transition-colors ${
              activeTab === 'profile' ? 'text-[#3B82F6] font-semibold' : 'text-slate-400'
            }`}
          >
            Profile
          </span>
        </button>
      </div>
    </div>
  );
};
