import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  RefreshCw,
  ArrowLeft,
  Volume2,
  VolumeX,
  Lock,
  Phone,
  Radio,
  Sliders,
  Check,
  PhoneCall,
  ShieldCheck,
} from 'lucide-react';
import { CallService } from '../../services/calls/callService';
import { soundEffects } from '../../services/audio/soundEffects';
import { UserProfile } from '../../types';
import freshKkAvatar from '../../assets/images/fresh_kk_avatar_1791078365294.jpg';

interface VideoCallScreenProps {
  callType?: 'video' | 'voice';
  remoteUserName?: string;
  remoteUserAvatar?: string;
  remoteUserSubtitle?: string;
  isIncoming?: boolean;
  onEndCall: () => void;
  currentUser: UserProfile;
}

export const VideoCallScreen: React.FC<VideoCallScreenProps> = ({
  callType = 'voice',
  remoteUserName = 'Fresh kk',
  remoteUserAvatar = freshKkAvatar,
  remoteUserSubtitle = 'Zenia Call • P2P Encrypted',
  isIncoming = false,
  onEndCall,
  currentUser,
}) => {
  const [callStatus, setCallStatus] = useState<'incoming' | 'ringing' | 'connected'>(
    isIncoming ? 'incoming' : 'ringing'
  );
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callVolume, setCallVolume] = useState<number>(85);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === 'voice');
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Play realistic ringtone sound during ringing or incoming
  useEffect(() => {
    if (callStatus === 'ringing' || callStatus === 'incoming') {
      soundEffects.startRingtone();
    } else {
      soundEffects.stopRingtone();
    }

    return () => {
      soundEffects.stopRingtone();
    };
  }, [callStatus]);

  // Outgoing automatic connect transition after 3.2s
  useEffect(() => {
    if (callStatus === 'ringing') {
      const ringTimer = setTimeout(() => {
        soundEffects.stopRingtone();
        soundEffects.playConnectedChime();
        setCallStatus('connected');
      }, 3200);

      return () => clearTimeout(ringTimer);
    }
  }, [callStatus]);

  // Duration timer once connected
  useEffect(() => {
    if (callStatus !== 'connected') return;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [callStatus]);

  const formatDuration = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // WebRTC real stream setup if video call
  useEffect(() => {
    if (callType !== 'video') return;
    async function initMedia() {
      const stream = await CallService.startMedia(true, true);
      if (stream) {
        setHasPermission(true);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } else {
        setHasPermission(false);
      }
    }
    initMedia();

    return () => {
      CallService.stopMedia();
    };
  }, [callType]);

  const toggleMute = () => {
    CallService.toggleMute(!isMuted);
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    CallService.toggleVideo(!isVideoOff);
    setIsVideoOff(!isVideoOff);
  };

  const handleAcceptIncoming = () => {
    soundEffects.stopRingtone();
    soundEffects.playConnectedChime();
    setCallStatus('connected');
  };

  const handleHangup = () => {
    soundEffects.stopRingtone();
    soundEffects.playHangupTone();
    CallService.stopMedia();
    onEndCall();
  };

  return (
    <div className="relative w-full max-w-lg mx-auto h-[100dvh] sm:h-[700px] bg-[#070A14] sm:rounded-3xl overflow-hidden shadow-2xl border sm:border-white/10 flex flex-col justify-between select-none">
      {/* Background Decor */}
      {callType === 'video' && !isVideoOff ? (
        <div className="absolute inset-0 z-0">
          <img
            src={remoteUserAvatar}
            alt={remoteUserName}
            className="w-full h-full object-cover filter blur-[2px]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/40 to-black/95" />
        </div>
      ) : (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-cyan-600/15 blur-3xl animate-pulse" />
          <div
            className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-indigo-600/15 blur-3xl animate-pulse"
            style={{ animationDelay: '1s' }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
        </div>
      )}

      {/* Top Header */}
      <div className="relative z-10 p-5 flex items-center justify-between text-white">
        <button
          onClick={handleHangup}
          className="p-2.5 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all active:scale-95 text-slate-300 hover:text-white"
          title="Rudi Nyuma"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[11px] text-cyan-300">
          <Lock className="w-3 h-3 text-emerald-400" />
          <span>E2E Encrypted • P2P Direct</span>
        </div>

        {/* Volume controls dropdown toggle */}
        <div className="relative">
          <button
            onClick={() => setShowVolumeSlider(!showVolumeSlider)}
            className="p-2.5 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 text-slate-300 hover:text-white transition-all"
            title="Kiwango cha Sauti"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {showVolumeSlider && (
            <div className="absolute right-0 top-12 bg-black/80 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-2xl flex flex-col items-center gap-2 w-36 animate-in fade-in">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Sauti: {callVolume}%</span>
              <input
                type="range"
                min="0"
                max="100"
                value={callVolume}
                onChange={(e) => setCallVolume(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>

      {/* Center Remote Contact Area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center">
        {/* Pulsing Avatar Container */}
        <div className="relative mb-6">
          {callStatus !== 'connected' ? (
            <>
              <div className="absolute -inset-4 rounded-full bg-cyan-500/20 animate-ping opacity-75" />
              <div className="absolute -inset-8 rounded-full bg-indigo-500/10 animate-pulse" />
            </>
          ) : (
            <div className="absolute -inset-3 rounded-full bg-emerald-500/25 blur-md" />
          )}

          <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl bg-slate-900 ring-4 ring-cyan-500/30">
            <img
              src={remoteUserAvatar}
              alt={remoteUserName}
              className="w-full h-full object-cover"
            />
          </div>

          <span
            className={`absolute bottom-1 right-2 p-2 rounded-full border-2 border-[#070A14] shadow-lg ${
              callType === 'video'
                ? 'bg-gradient-to-tr from-cyan-500 to-blue-500 text-white'
                : 'bg-emerald-500 text-white'
            }`}
          >
            {callType === 'video' ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
          </span>
        </div>

        {/* Contact Info */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1 drop-shadow-md">
          {remoteUserName}
        </h2>
        <p className="text-xs text-cyan-300 font-medium mb-3">
          {remoteUserSubtitle}
        </p>

        {/* Calling Status Indicator */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
          {callStatus === 'incoming' ? (
            <>
              <PhoneCall className="w-4 h-4 text-emerald-400 animate-bounce" />
              <span className="text-xs font-bold text-emerald-300">
                Simu Inayoingia... (Incoming Call)
              </span>
            </>
          ) : callStatus === 'ringing' ? (
            <>
              <Radio className="w-4 h-4 text-cyan-400 animate-spin" />
              <span className="text-xs font-semibold text-cyan-300">
                Inaita... (Ringing)
              </span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-mono font-bold text-emerald-300">
                {formatDuration(seconds)} • HD Audio (48kHz)
              </span>
            </>
          )}
        </div>

        {/* Audio Frequency Waveform (Animated while in call) */}
        {callStatus === 'connected' && (
          <div className="flex items-center gap-1.5 mt-6 h-8">
            {[40, 75, 55, 90, 60, 85, 45, 95, 70, 50, 80, 40].map((h, i) => (
              <span
                key={i}
                className="w-1 rounded-full bg-gradient-to-t from-cyan-400 to-indigo-400 animate-pulse"
                style={{
                  height: `${h}%`,
                  animationDuration: `${0.5 + (i % 4) * 0.2}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Picture-in-Picture Local Video View (If in video call) */}
      {callType === 'video' && !isVideoOff && (
        <div className="relative z-10 px-5 flex justify-end mb-2">
          <div className="w-24 h-32 rounded-2xl overflow-hidden border-2 border-white/30 shadow-2xl bg-slate-900 relative">
            {hasPermission ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
            ) : (
              <img
                src={currentUser.photoURL || freshKkAvatar}
                alt={currentUser.displayName}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-[9px] text-white">
              Wewe (You)
            </div>
          </div>
        </div>
      )}

      {/* Bottom Controls Bar */}
      <div className="relative z-10 p-6 pt-2 pb-8">
        {callStatus === 'incoming' ? (
          /* Incoming Call Accept/Decline Controls */
          <div className="max-w-xs mx-auto flex items-center justify-around px-6 py-4 rounded-full bg-black/70 backdrop-blur-2xl border border-white/10 shadow-2xl">
            {/* Decline */}
            <button
              onClick={handleHangup}
              className="p-4 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-xl shadow-rose-600/50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
              title="Kata (Decline)"
            >
              <PhoneOff className="w-6 h-6 stroke-[2.5]" />
            </button>

            {/* Accept */}
            <button
              onClick={handleAcceptIncoming}
              className="p-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white shadow-xl shadow-emerald-500/50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center animate-pulse"
              title="Pokea (Accept)"
            >
              <Phone className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>
        ) : (
          /* Active / Ringing Call Controls */
          <div className="max-w-sm mx-auto flex items-center justify-between px-5 py-3.5 rounded-full bg-black/60 backdrop-blur-2xl border border-white/10 shadow-2xl">
            {/* Mute Mic */}
            <button
              onClick={toggleMute}
              className={`p-3.5 rounded-full transition-all active:scale-95 ${
                isMuted
                  ? 'bg-rose-500/80 text-white shadow-lg shadow-rose-500/30'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title={isMuted ? 'Washa Mic' : 'Zima Mic'}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Speakerphone Toggle */}
            <button
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`p-3.5 rounded-full transition-all active:scale-95 ${
                isSpeakerOn
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/40'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title="Loudspeaker"
            >
              {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            {/* Toggle Camera (If Video Call) or Switch to Video */}
            <button
              onClick={toggleVideo}
              className={`p-3.5 rounded-full transition-all active:scale-95 ${
                isVideoOff
                  ? 'bg-white/10 text-slate-300 hover:bg-white/20'
                  : 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/30'
              }`}
              title="Kamera ya Video"
            >
              {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>

            {/* Switch Camera facing */}
            {callType === 'video' && !isVideoOff && (
              <button
                onClick={() => setCameraFacing((f) => (f === 'user' ? 'environment' : 'user'))}
                className="p-3.5 rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all"
                title="Geuza Kamera"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            )}

            {/* End Call Button */}
            <button
              onClick={handleHangup}
              className="p-4 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-xl shadow-rose-600/50 hover:scale-105 active:scale-90 transition-all"
              title="Kata Simu (End Call)"
            >
              <PhoneOff className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
