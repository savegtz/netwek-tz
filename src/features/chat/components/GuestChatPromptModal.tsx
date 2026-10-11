import React from 'react';
import {
  X,
  MessageSquare,
  Sparkles,
  LogIn,
  UserPlus,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { SafeImage } from '../../../components/SafeImage';

interface GuestChatPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetName: string;
  targetAvatar?: string;
  targetSubtitle?: string;
  onRegister: () => void;
  onSignIn: () => void;
}

export const GuestChatPromptModal: React.FC<GuestChatPromptModalProps> = ({
  isOpen,
  onClose,
  targetName,
  targetAvatar,
  targetSubtitle = 'Mtumiaji wa Zenia Network',
  onRegister,
  onSignIn,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-sm bg-[#0E1324] border border-cyan-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors z-10"
          title="Funga"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Target Profile Card */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="relative mb-3">
            <div className="w-16 h-16 rounded-2xl p-0.5 bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-500 shadow-lg shadow-cyan-500/20">
              <SafeImage
                src={targetAvatar}
                fallbackText={targetName}
                fallbackGradient="from-cyan-800 to-indigo-900"
                alt={targetName}
                className="w-full h-full rounded-[14px] object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#0E1324] border border-cyan-400/40 text-cyan-400 shadow-sm">
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
            </div>
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-[10px] font-bold text-cyan-300 uppercase tracking-wider mb-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Kuanza Kuchati</span>
          </span>

          <h3 className="text-lg font-black text-white tracking-tight">
            Unataka Kuchati na {targetName}?
          </h3>
          <p className="text-xs text-slate-400 max-w-xs mt-1">
            Ili kutuma ujumbe, picha, sauti, au kumpigia simu{' '}
            <span className="text-slate-200 font-semibold">{targetName}</span>, unahitaji akaunti ya Zenia.
          </p>
        </div>

        {/* Options */}
        <div className="space-y-2.5 mb-4">
          {/* Option 1: Jisajili (Register if not registered) */}
          <button
            onClick={() => {
              onClose();
              onRegister();
            }}
            className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center justify-between group active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-2.5 text-left">
              <div className="p-2 rounded-xl bg-white/20 text-white shrink-0">
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <p className="font-extrabold text-white text-xs">Jisajili (Sina Akaunti)</p>
                <p className="text-[10px] text-cyan-100 font-normal">Unda akaunti bure kwa sekunde 30 tu</p>
              </div>
            </div>
            <span className="text-[11px] font-bold bg-white/20 px-2 py-0.5 rounded-lg group-hover:translate-x-0.5 transition-transform">
              Anza →
            </span>
          </button>

          {/* Option 2: Ingia (Login if already registered) */}
          <button
            onClick={() => {
              onClose();
              onSignIn();
            }}
            className="w-full p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-left flex items-center justify-between group active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 shrink-0">
                <LogIn className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-white text-xs">Ingia (Tayari Nina Akaunti)</p>
                <p className="text-[10px] text-slate-400 font-normal">Weka nenosiri au ingia na Google</p>
              </div>
            </div>
            <span className="text-[11px] font-medium text-slate-400 group-hover:text-white transition-colors">
              Ingia →
            </span>
          </button>
        </div>

        {/* Security badge footer */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Mazungumzo yote yanalindwa na End-to-End Encryption</span>
        </div>
      </div>
    </div>
  );
};
