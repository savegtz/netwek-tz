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
    <div className="shrink-0 z-40 bg-[#070A12]/95 backdrop-blur-md border-t border-white/[0.08] px-3 sm:px-6 py-2 transition-all relative">
      {/* Services Modal Sheet (Clean, native mobile bottom sheet) */}
      {servicesMenuOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm animate-in fade-in p-0 sm:p-4"
          onClick={() => setServicesMenuOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#0D1224] border-t sm:border border-white/15 rounded-t-[28px] sm:rounded-3xl p-4 sm:p-5 shadow-2xl animate-in slide-in-from-bottom-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle for Mobile */}
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-3 sm:hidden" />

            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Huduma za Zenia
              </span>
              <button
                onClick={() => setServicesMenuOpen(false)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                title="Funga"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grid of All Services */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* 1. Rides & Transport */}
              <button
                onClick={() => {
                  onSelectTab('transport');
                  setServicesMenuOpen(false);
                }}
                className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all active:scale-95 ${
                  activeTab === 'transport'
                    ? 'bg-blue-500/20 border-blue-400/50 text-blue-300'
                    : 'bg-white/[0.03] border-white/5 hover:border-blue-400/30 text-white'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Car className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">Zenia Rides</p>
                  <p className="text-[10px] text-slate-400 truncate">Teksi & safari</p>
                </div>
              </button>

              {/* 2. Events & Tickets */}
              <button
                onClick={() => {
                  onSelectTab('events');
                  setServicesMenuOpen(false);
                }}
                className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all active:scale-95 ${
                  activeTab === 'events'
                    ? 'bg-purple-500/20 border-purple-400/50 text-purple-300'
                    : 'bg-white/[0.03] border-white/5 hover:border-purple-400/30 text-white'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">Events</p>
                  <p className="text-[10px] text-slate-400 truncate">Matamasha & tiketi</p>
                </div>
              </button>

              {/* 3. Jobs & Careers */}
              <button
                onClick={() => {
                  onSelectTab('jobs');
                  setServicesMenuOpen(false);
                }}
                className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all active:scale-95 ${
                  activeTab === 'jobs'
                    ? 'bg-amber-500/20 border-amber-400/50 text-amber-300'
                    : 'bg-white/[0.03] border-white/5 hover:border-amber-400/30 text-white'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">Kazi (Jobs)</p>
                  <p className="text-[10px] text-slate-400 truncate">Nafasi za kazi</p>
                </div>
              </button>

              {/* 4. Tech Communities */}
              <button
                onClick={() => {
                  onSelectTab('community');
                  setServicesMenuOpen(false);
                }}
                className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all active:scale-95 ${
                  activeTab === 'community'
                    ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300'
                    : 'bg-white/[0.03] border-white/5 hover:border-cyan-400/30 text-white'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">Vikundi</p>
                  <p className="text-[10px] text-slate-400 truncate">Jamii & makundi</p>
                </div>
              </button>

              {/* 5. Wallet */}
              <button
                onClick={() => {
                  onSelectTab('wallet');
                  setServicesMenuOpen(false);
                }}
                className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all active:scale-95 ${
                  activeTab === 'wallet'
                    ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                    : 'bg-white/[0.03] border-white/5 hover:border-emerald-400/30 text-white'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Store className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">Pochi (Wallet)</p>
                  <p className="text-[10px] text-slate-400 truncate">Miamala & pesa</p>
                </div>
              </button>

              {/* 6. Post Ad */}
              <button
                onClick={() => {
                  onOpenCreateMenu();
                  setServicesMenuOpen(false);
                }}
                className="flex items-center gap-2.5 p-3 rounded-2xl border border-dashed border-cyan-500/40 bg-cyan-500/10 text-cyan-300 text-left transition-all active:scale-95 hover:bg-cyan-500/20"
              >
                <div className="w-9 h-9 rounded-xl bg-cyan-500 text-slate-950 flex items-center justify-center shrink-0 font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">+ Tangazo</p>
                  <p className="text-[10px] text-cyan-300/80 truncate">Weka bidhaa au kazi</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Nav Bar: 5 clearly aligned tabs */}
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
            Hali
          </span>
        </button>

        {/* 3. Marketplace (Soko) Tab */}
        <button
          onClick={() => {
            onSelectTab('shop');
            setServicesMenuOpen(false);
          }}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-1 transition-all active:scale-95 group"
          aria-label="Soko (Marketplace)"
        >
          <div className="relative">
            <Store
              className={`w-5 h-5 transition-transform duration-150 ${
                activeTab === 'shop'
                  ? 'text-cyan-400 scale-105 stroke-[2.2]'
                  : 'text-slate-400 group-hover:text-slate-200 stroke-[1.8]'
              }`}
            />
          </div>
          <span
            className={`text-[10px] font-medium transition-colors ${
              activeTab === 'shop' ? 'text-cyan-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Soko
          </span>
        </button>

        {/* 4. Huduma (Services Drawer) */}
        <button
          onClick={() => setServicesMenuOpen(!servicesMenuOpen)}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-1 transition-all active:scale-95 group"
          aria-label="Huduma (Services)"
          title="Huduma: Teksi, Tiketi, Kazi, Jamii, Pochi"
        >
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
              servicesMenuOpen || ['events', 'jobs', 'transport', 'wallet', 'community'].includes(activeTab)
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                : 'text-slate-400 group-hover:text-slate-200'
            }`}
          >
            <Layers className="w-5 h-5" />
          </div>
          <span
            className={`text-[10px] font-medium transition-colors ${
              servicesMenuOpen || ['events', 'jobs', 'transport', 'wallet', 'community'].includes(activeTab)
                ? 'text-cyan-400 font-semibold'
                : 'text-slate-400'
            }`}
          >
            Huduma
          </span>
        </button>

        {/* 5. Wasifu (Profile) Tab */}
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
