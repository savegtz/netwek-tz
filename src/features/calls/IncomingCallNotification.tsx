import React, { useEffect, useState, useRef } from 'react';
import {
  Phone,
  PhoneOff,
  Video,
  ShieldCheck,
  MessageSquare,
  Volume2,
  VolumeX,
  Clock,
  Send,
  X,
} from 'lucide-react';
import { WebRTCCallData } from '../../services/calls/webrtcService';
import { soundEffects } from '../../services/audio/soundEffects';
import { callHistoryService } from '../../services/calls/callHistoryService';
import { SafeImage } from '../../components/SafeImage';
import freshKkAvatar from '../../assets/images/fresh_kk_avatar_1791078365294.jpg';

interface IncomingCallNotificationProps {
  call: WebRTCCallData;
  onAccept: () => void;
  onDecline: () => void;
  onReplyWithMessage?: (msg: string) => void;
}

const QUICK_RESPONSES = [
  'Niko kwenye mkutano, nitakupigia baadaye.',
  'Siwezi kupokea sasa hivi, nitumie ujumbe hapa.',
  'Niko njiani, nipigie baada ya dakika 10.',
  'Habari! Nitakupigia punde tu nikitulia.',
];

export const IncomingCallNotification: React.FC<IncomingCallNotificationProps> = ({
  call,
  onAccept,
  onDecline,
  onReplyWithMessage,
}) => {
  const [isRingerMuted, setIsRingerMuted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [showQuickReply, setShowQuickReply] = useState(false);
  const [customReply, setCustomReply] = useState('');
  const handledRef = useRef(false);

  // Start ringtone sound when incoming call notification is active
  useEffect(() => {
    if (!isRingerMuted) {
      soundEffects.startRingtone();
    } else {
      soundEffects.stopRingtone();
    }

    return () => {
      soundEffects.stopRingtone();
    };
  }, [isRingerMuted]);

  // 30-second timeout countdown for auto missed call
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleMissedCall();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleMissedCall = () => {
    if (handledRef.current) return;
    handledRef.current = true;
    soundEffects.stopRingtone();
    soundEffects.playHangupTone();

    // Record as missed call
    callHistoryService.addCallRecord(
      {
        callId: call.id,
        remoteUserId: call.callerId,
        remoteUserName: call.callerName || 'Mwanachama wa Zenia',
        remoteUserAvatar: call.callerAvatar || freshKkAvatar,
        callType: call.callType,
        direction: 'missed',
        status: 'missed',
        durationSeconds: 0,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        note: 'Simu imekosekana (Hakuna jibu)',
      },
      call.receiverId
    );

    onDecline();
  };

  const handleManualDecline = () => {
    if (handledRef.current) return;
    handledRef.current = true;
    soundEffects.stopRingtone();
    soundEffects.playHangupTone();

    // Record as rejected
    callHistoryService.addCallRecord(
      {
        callId: call.id,
        remoteUserId: call.callerId,
        remoteUserName: call.callerName || 'Mwanachama wa Zenia',
        remoteUserAvatar: call.callerAvatar || freshKkAvatar,
        callType: call.callType,
        direction: 'missed',
        status: 'rejected',
        durationSeconds: 0,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        note: 'Simu imekataliwa',
      },
      call.receiverId
    );

    onDecline();
  };

  const handleSendQuickReply = (msgText: string) => {
    if (handledRef.current) return;
    handledRef.current = true;
    soundEffects.stopRingtone();

    callHistoryService.addCallRecord(
      {
        callId: call.id,
        remoteUserId: call.callerId,
        remoteUserName: call.callerName || 'Mwanachama wa Zenia',
        remoteUserAvatar: call.callerAvatar || freshKkAvatar,
        callType: call.callType,
        direction: 'missed',
        status: 'rejected',
        durationSeconds: 0,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        note: `Jibu kwa ujumbe: "${msgText}"`,
      },
      call.receiverId
    );

    if (onReplyWithMessage) {
      onReplyWithMessage(msgText);
    }
    onDecline();
  };

  const isVideo = call.callType === 'video';
  const callerName = call.callerName || 'Mwanachama wa Zenia';
  const callerAvatar = call.callerAvatar || freshKkAvatar;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-sm bg-[#0C101E] border border-cyan-500/40 rounded-3xl p-6 shadow-2xl text-center overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Actions (Ringer Mute & Timeout) */}
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 font-mono text-[11px]">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>00:{secondsLeft.toString().padStart(2, '0')}</span>
          </div>

          <button
            onClick={() => setIsRingerMuted(!isRingerMuted)}
            className={`p-2 rounded-full border transition-colors ${
              isRingerMuted
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
            }`}
            title={isRingerMuted ? 'Washa sauti ya mlio' : 'Nyamazisha mlio'}
          >
            {isRingerMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Security / Call Type Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-[11px] font-bold text-cyan-300 uppercase tracking-wider mb-4 animate-pulse">
          {isVideo ? <Video className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
          <span>{isVideo ? 'Simu ya Video ya WebRTC' : 'Simu ya Sauti ya Moja kwa Moja'}</span>
        </div>

        {/* Caller Avatar with Animated Rings */}
        <div className="relative mx-auto w-24 h-24 mb-4">
          <div className="absolute inset-0 rounded-full bg-cyan-400/20 animate-ping" />
          <div
            className="absolute -inset-2 rounded-full border-2 border-cyan-500/40 animate-spin"
            style={{ animationDuration: '6s' }}
          />
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
        <h3 className="text-xl font-black text-white tracking-tight mb-1 truncate px-2">
          {callerName}
        </h3>
        <p className="text-xs text-slate-300 mb-5 flex items-center justify-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Inapiga... Inayoingia kupitia WebRTC P2P</span>
        </p>

        {/* Quick Reply Drawer if toggled */}
        {showQuickReply ? (
          <div className="mb-4 text-left p-3 rounded-2xl bg-[#141B30] border border-cyan-500/30 animate-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-white/10">
              <span className="text-[11px] font-bold text-cyan-300 flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                Jibu kwa Ujumbe wa Haraka
              </span>
              <button
                onClick={() => setShowQuickReply(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {QUICK_RESPONSES.map((resp, i) => (
                <button
                  key={i}
                  onClick={() => handleSendQuickReply(resp)}
                  className="w-full text-left p-2 rounded-xl bg-white/5 hover:bg-cyan-500/20 text-xs text-slate-200 hover:text-cyan-200 border border-white/5 transition-colors"
                >
                  {resp}
                </button>
              ))}
            </div>

            {/* Custom Reply Input */}
            <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-1.5">
              <input
                type="text"
                value={customReply}
                onChange={(e) => setCustomReply(e.target.value)}
                placeholder="Andika jibu lingine..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
              />
              <button
                disabled={!customReply.trim()}
                onClick={() => {
                  if (customReply.trim()) handleSendQuickReply(customReply.trim());
                }}
                className={`p-2 rounded-xl transition-all ${
                  customReply.trim()
                    ? 'bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400'
                    : 'bg-white/5 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* "Jibu kwa Ujumbe" trigger button */
          <div className="mb-4">
            <button
              onClick={() => setShowQuickReply(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all active:scale-95"
            >
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
              <span>Jibu kwa Ujumbe (Quick Reply)</span>
            </button>
          </div>
        )}

        {/* Action Buttons: Decline (Red) & Accept (Green) */}
        <div className="flex items-center justify-center gap-8 mb-4">
          {/* Decline */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={handleManualDecline}
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
                handledRef.current = true;
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
