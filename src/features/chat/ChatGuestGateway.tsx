import React from 'react';
import {
  ShieldCheck,
  Lock,
  MessageSquare,
  Sparkles,
  UserCheck,
  KeyRound,
  Zap,
  ArrowRight,
  LogIn,
  UserPlus,
} from 'lucide-react';

interface ChatGuestGatewayProps {
  onOpenAuth: () => void;
  onLoginDemoAmina?: () => void;
}

export const ChatGuestGateway: React.FC<ChatGuestGatewayProps> = ({
  onOpenAuth,
  onLoginDemoAmina,
}) => {
  return (
    <div className="w-full h-full min-h-0 flex-1 flex flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-b from-[#070A12] via-[#090E1E] to-[#070A12] text-white overflow-y-auto select-none">
      <div className="max-w-md w-full my-auto flex flex-col items-center text-center">
        {/* Animated Privacy & Chat Shield Icon */}
        <div className="relative mb-5">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-cyan-500/20 via-blue-600/25 to-purple-600/20 border border-cyan-500/40 flex items-center justify-center shadow-2xl shadow-cyan-500/20">
            <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 text-cyan-400 animate-pulse" />
          </div>
          <div className="absolute -bottom-2 -right-2 p-2 rounded-2xl bg-[#0D1326] border border-cyan-400/50 shadow-lg text-emerald-400">
            <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
          </div>
          <div className="absolute -top-1 -left-1 p-1.5 rounded-xl bg-purple-500/20 border border-purple-400/30 text-purple-300">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Heading & Subtitle */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-bold text-cyan-300 uppercase tracking-wider mb-2.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Ulinzi wa Faragha (Privacy Protected)</span>
        </span>

        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2.5">
          Mazungumzo Yamelindwa na Yako Faragha
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 max-w-sm">
          Hujaingia kwenye akaunti yako. Ili kulinda usiri wako na kuzuia mtu asiye na akaunti kuona chats, 
          tafadhali <span className="text-cyan-300 font-semibold">ingia</span> au <span className="text-cyan-300 font-semibold">jisajili</span> ili uweze kuanza kuchati.
        </p>

        {/* Main Action Buttons */}
        <div className="w-full space-y-2.5 mb-7">
          <button
            onClick={onOpenAuth}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group"
          >
            <LogIn className="w-4 h-4 text-slate-950" />
            <span>Ingia au Jisajili ili Uanze Kuchat</span>
            <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
          </button>

          {onLoginDemoAmina && (
            <button
              onClick={onLoginDemoAmina}
              className="w-full py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4 text-cyan-400" />
              <span>Jaribu Moja kwa Moja kama Amina Kaunga (Demo)</span>
            </button>
          )}
        </div>

        {/* Feature Highlights Grid */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-2 text-left">
          <div className="p-3 rounded-2xl bg-[#0D1224] border border-white/[0.06] flex items-start gap-2.5">
            <div className="p-1.5 rounded-xl bg-cyan-500/15 text-cyan-400 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-white mb-0.5">Usimbaji fiche</h4>
              <p className="text-[10px] text-slate-400 leading-snug">Jumbe zako ni siri kati yako na uliyetuma naye pekee.</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#0D1224] border border-white/[0.06] flex items-start gap-2.5">
            <div className="p-1.5 rounded-xl bg-emerald-500/15 text-emerald-400 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-white mb-0.5">Papo kwa Papo</h4>
              <p className="text-[10px] text-slate-400 leading-snug">Piga simu za video, rekodi sauti, na tuma picha haraka.</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#0D1224] border border-white/[0.06] flex items-start gap-2.5">
            <div className="p-1.5 rounded-xl bg-purple-500/15 text-purple-400 shrink-0">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-white mb-0.5">Ulinzi wa PIN</h4>
              <p className="text-[10px] text-slate-400 leading-snug">Weka PIN ya siri kulinda mazungumzo yako maalum.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
