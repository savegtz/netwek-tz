import React, { useEffect } from 'react';
import { Phone, PhoneOff, Video, ShieldCheck, Sparkles } from 'lucide-react';
import { WebRTCCallData } from '../../services/calls/webrtcService';
import { soundEffects } from '../../services/audio/soundEffects';
import { SafeImage } from '../../components/SafeImage';
import freshKkAvatar from '../../assets/images/fresh_kk_avatar_1791078365294.jpg';

interface IncomingCallNotificationProps {
  call: WebRTCCallData;
  onAccept: () => void;
  onDecline: () => void;
}

export const IncomingCallNotification: React.FC<IncomingCallNotificationProps> = ({
  call,
  onAccept,
  onDecline,
}) => {
  // Start ringtone sound when incoming call notification is active
  useEffect(() => {
    soundEffects.startRingtone();
    return () => {
      soundEffects.stopRingtone();
    };
  }, []);

  const isVideo = call.callType === 'video';
  const callerName = call.callerName || 'Mwanachama wa Zenia';
  const callerAvatar = call.callerAvatar || freshKkAvatar;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-sm bg-[#0C101E] border border-cyan-500/40 rounded-3xl p-6 shadow-2xl text-center overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Security / Call Type Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-[11px] font-bold text-cyan-300 uppercase tracking-wider mb-4 animate-pulse">
          {isVideo ? <Video className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
          <span>{isVideo ? 'Simu ya Video ya WebRTC' : 'Simu ya Sauti ya Moja kwa Moja'}</span>
        </div>

        {/* Caller Avatar with Animated Rings */}
        <div className="relative mx-auto w-24 h-24 mb-4">
          <div className="absolute inset-0 rounded-full bg-cyan-400/20 animate-ping" />
          <div className="absolute -inset-2 rounded-full border-2 border-cyan-500/40 animate-spin" style={{ animationDuration: '6s' }} />
          <div className="relative w-full h-full rounded-full p-1 bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 shadow-xl shadow-cyan-500/30">
            <SafeImage
              src={callerAvatar}
              fallbackText={callerName}
              fallbackGradient="from-cyan-700 to-blue-900"
              alt={callerName}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
        </div>

        {/* Caller Title & Subtitle */}
        <h3 className="text-xl font-black text-white tracking-tight mb-1">
          {callerName}
        </h3>
        <p className="text-xs text-slate-300 mb-6 flex items-center justify-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Inapiga... Inayoingia kupitia WebRTC P2P</span>
        </p>

        {/* Action Buttons: Decline (Red) & Accept (Green) */}
        <div className="flex items-center justify-center gap-8 mb-4">
          {/* Decline */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={() => {
                soundEffects.stopRingtone();
                soundEffects.playHangupTone();
                onDecline();
              }}
              className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-xl shadow-rose-600/30 active:scale-95 transition-all group"
              title="Kataa simu"
            >
              <PhoneOff className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            </button>
            <span className="text-[11px] font-semibold text-rose-300">Kataa</span>
          </div>

          {/* Accept */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={() => {
                soundEffects.stopRingtone();
                soundEffects.playConnectedChime();
                onAccept();
              }}
              className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-xl shadow-emerald-500/30 active:scale-95 transition-all group"
              title="Pokea simu"
            >
              {isVideo ? (
                <Video className="w-6 h-6 group-hover:scale-110 transition-transform" />
              ) : (
                <Phone className="w-6 h-6 group-hover:scale-110 transition-transform" />
              )}
            </button>
            <span className="text-[11px] font-bold text-emerald-400">Pokea</span>
          </div>
        </div>

        {/* Encrypted Notice */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Simu hii imelindwa na Usimbaji fiche (End-to-End P2P)</span>
        </div>
      </div>
    </div>
  );
};
