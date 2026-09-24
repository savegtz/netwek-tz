import React from 'react';
import { MessageSquare, Compass, Plus, ShoppingBag, User } from 'lucide-react';

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
  const tabs = [
    { id: 'chats', label: 'Chats', icon: MessageSquare, badge: true },
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'create', label: 'Create', isFab: true },
    { id: 'shop', label: 'Shop', icon: ShoppingBag },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="shrink-0 z-40 bg-[#070A14]/95 backdrop-blur-2xl border-t border-white/[0.08] px-3 sm:px-6 py-2 transition-all">
      <div className="w-full flex items-center justify-around relative">
        {tabs.map((tab) => {
          if (tab.isFab) {
            return (
              <div key="create-fab" className="relative -top-5 flex flex-col items-center">
                <button
                  onClick={onOpenCreateMenu}
                  className="w-13 h-13 rounded-full bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 text-white shadow-lg shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center ring-4 ring-[#070A12] group"
                  aria-label="Create new status, post, or listing"
                >
                  <Plus className="w-6 h-6 stroke-[2.8] text-white group-hover:rotate-90 transition-transform duration-300" />
                  <span className="absolute inset-0 rounded-full animate-ping opacity-25 bg-cyan-400" />
                </button>
                <span className="text-[10px] font-semibold text-slate-300 mt-1">Create</span>
              </div>
            );
          }

          const Icon = tab.icon!;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all relative ${
                isActive
                  ? 'text-cyan-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`} />
                {tab.badge && (
                  <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-[#070A14]" />
                )}
              </div>
              <span className={`text-[10px] tracking-tight ${isActive ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-3 h-0.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/80" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

