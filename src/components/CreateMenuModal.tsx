import React from 'react';
import {
  X,
  Camera,
  Video,
  Type,
  Mic,
  Music,
  BarChart2,
  CheckSquare,
  Gift,
  ShoppingBag,
  Utensils,
  Calendar,
  Briefcase,
  Home,
  Car,
  Radio,
  Megaphone,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import { StatusType } from '../types';

interface CreateMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (type: StatusType | 'ai' | 'product_listing' | 'event_create' | 'job_create') => void;
}

export const CreateMenuModal: React.FC<CreateMenuModalProps> = ({
  isOpen,
  onClose,
  onSelectOption,
}) => {
  if (!isOpen) return null;

  const createItems = [
    { id: 'photo', label: 'Photo Status', icon: Camera, color: 'from-emerald-500/30 to-teal-600/30 border-emerald-500/50 text-emerald-400' },
    { id: 'video', label: 'Video Status', icon: Video, color: 'from-purple-500/30 to-indigo-600/30 border-purple-500/50 text-purple-400' },
    { id: 'text', label: 'Text Status', icon: Type, color: 'from-indigo-500/30 to-blue-600/30 border-indigo-500/50 text-indigo-400' },
    { id: 'voice', label: 'Voice Status', icon: Mic, color: 'from-cyan-500/30 to-blue-600/30 border-cyan-500/50 text-cyan-400' },

    { id: 'music', label: 'Music', icon: Music, color: 'from-red-500/30 to-rose-600/30 border-red-500/50 text-red-400' },
    { id: 'poll', label: 'Poll', icon: BarChart2, color: 'from-blue-500/30 to-indigo-600/30 border-blue-500/50 text-blue-400' },
    { id: 'quiz', label: 'Quiz', icon: CheckSquare, color: 'from-teal-500/30 to-emerald-600/30 border-teal-500/50 text-teal-400' },
    { id: 'giveaway', label: 'Giveaway', icon: Gift, color: 'from-amber-500/30 to-yellow-600/30 border-amber-500/50 text-amber-400' },

    { id: 'product', label: 'Product', icon: ShoppingBag, color: 'from-emerald-500/30 to-green-600/30 border-emerald-500/50 text-emerald-400' },
    { id: 'food', label: 'Food', icon: Utensils, color: 'from-pink-500/30 to-rose-600/30 border-pink-500/50 text-pink-400' },
    { id: 'event', label: 'Event', icon: Calendar, color: 'from-purple-500/30 to-pink-600/30 border-purple-500/50 text-purple-400' },
    { id: 'job', label: 'Job', icon: Briefcase, color: 'from-amber-500/30 to-orange-600/30 border-amber-500/50 text-amber-400' },

    { id: 'property', label: 'Property', icon: Home, color: 'from-cyan-500/30 to-teal-600/30 border-cyan-500/50 text-cyan-400' },
    { id: 'ride', label: 'Ride', icon: Car, color: 'from-blue-500/30 to-sky-600/30 border-blue-500/50 text-blue-400' },
    { id: 'live', label: 'Live', icon: Radio, color: 'from-pink-500/30 to-purple-600/30 border-pink-500/50 text-pink-400' },
    { id: 'advertisement', label: 'Advertisement', icon: Megaphone, color: 'from-yellow-500/30 to-amber-600/30 border-yellow-500/50 text-yellow-400' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-[420px] bg-[#0A0E1A] border-t sm:border border-white/10 rounded-t-[32px] sm:rounded-[36px] p-5 pb-8 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Top Header matching Screenshot 3: Create title, sliders icon, close */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-white tracking-tight">Create</h2>
          <div className="flex items-center gap-2">
            <button className="p-1.5 text-slate-400 hover:text-white">
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 4x4 Grid of 16 Rounded Tiles matching Screenshot 3 */}
        <div className="grid grid-cols-4 gap-2.5 mb-4 overflow-y-auto pr-0.5">
          {createItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectOption(item.id as StatusType);
                  onClose();
                }}
                className="flex flex-col items-center justify-center p-2 rounded-2xl bg-[#121727] hover:bg-[#181F34] border border-white/5 hover:border-white/15 transition-all group active:scale-95 min-h-[78px]"
              >
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${item.color} border flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-105 transition-transform`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-slate-200 text-center leading-tight">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bottom AI Create Banner matching Screenshot 3 */}
        <button
          onClick={() => {
            onSelectOption('ai');
            onClose();
          }}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-purple-900/50 via-indigo-900/40 to-blue-900/50 border border-purple-500/40 hover:border-purple-400 transition-all group shrink-0"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:rotate-6 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                AI Create
              </h4>
              <p className="text-[11px] text-purple-200/80">
                Generate, enhance, create with AI
              </p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-white font-semibold group-hover:bg-cyan-500/20 group-hover:text-cyan-300">
            Open →
          </span>
        </button>
      </div>
    </div>
  );
};
