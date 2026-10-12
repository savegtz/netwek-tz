import React from 'react';
import { Maximize2, Mic, MicOff, PhoneOff, Video, Phone } from 'lucide-react';
import { SafeImage } from '../../components/SafeImage';
import { webrtcService } from '../../services/calls/webrtcService';
import freshKkAvatar from '../../assets/images/fresh_kk_avatar_1791078365294.jpg';

interface FloatingCallBubbleProps {
  remoteName: string;
  remoteAvatar?: string;
  callType: 'video' | 'voice';
  durationSeconds: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onExpand: () => void;
  onEndCall: () => void;
}

export const FloatingCallBubble: React.FC<FloatingCallBubbleProps> = ({
  remoteName,
  remoteAvatar = freshKkAvatar,
  callType,
  durationSeconds,
  isMuted,
  onToggleMute,
  onExpand,
  onEndCall,
}) => {
  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      onClick={onExpand}
      className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-50 bg-[#0C1222]/95 border border-cyan-500/40 rounded-2xl p-3 shadow-2xl backdrop-blur-xl flex items-center gap-3 cursor-pointer select-none hover:border-cyan-400/70 transition-all hover:scale-[1.02] active:scale-[0.99] group animate-in slide-in-from-bottom-4 ring-1 ring-cyan-500/20 max-w-[340px]"
      title="Bofya hapa ili kurejea kwenye ukurasa kamili wa simu (Tazama Simu)"
    >
      {/* Avatar with pulsing connection ring */}
      <div className="relative shrink-0">
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-cyan-400/60 p-0.5 bg-slate-900 shadow-md">
          <SafeImage
            src={remoteAvatar}
            fallbackText={remoteName}
            fallbackGradient="from-cyan-600 to-indigo-900"
            alt={remoteName}
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        <span
          className={`absolute -bottom-1 -right-1 p-1 rounded-full text-[10px] text-white shadow-md ${
            callType === 'video' ? 'bg-cyan-500' : 'bg-emerald-500'
          }`}
        >
          {callType === 'video' ? <Video className="w-2.5 h-2.5" /> : <Phone className="w-2.5 h-2.5" />}
        </span>
      </div>

      {/* Info column */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <p className="text-xs font-bold text-white truncate max-w-[130px]">{remoteName}</p>
        </div>
        <p className="text-[11px] font-mono text-cyan-300 font-semibold mt-0.5">
          {formatDuration(durationSeconds)} • WebRTC Live
        </p>
      </div>

      {/* Mini Controls */}
      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
        {/* Mute Mic */}
        <button
          onClick={onToggleMute}
          className={`p-2 rounded-xl transition-all active:scale-95 ${
            isMuted
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
          title={isMuted ? 'Washa Mic' : 'Zima Mic'}
        >
          {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
        </button>

        {/* Expand Screen */}
        <button
          onClick={onExpand}
          className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30 transition-all active:scale-95"
          title="Panua simu (Tazama Video)"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        {/* Hangup */}
        <button
          onClick={onEndCall}
          className="p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-all active:scale-95 shadow-md shadow-rose-600/30"
          title="Kata simu"
        >
          <PhoneOff className="w-3.5 h-3.5 stroke-[2.2]" />
        </button>
      </div>
    </div>
  );
};
