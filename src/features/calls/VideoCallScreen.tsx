import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  RefreshCw,
  Sparkles,
  ArrowLeft,
  Volume2,
} from 'lucide-react';
import { CallService } from '../../services/calls/callService';
import { UserProfile } from '../../types';

interface VideoCallScreenProps {
  remoteUserName?: string;
  remoteUserAvatar?: string;
  onEndCall: () => void;
  currentUser: UserProfile;
}

export const VideoCallScreen: React.FC<VideoCallScreenProps> = ({
  remoteUserName = 'Sarah Mwangi',
  remoteUserAvatar = '/src/assets/images/amina_avatar_1790280951312.jpg',
  onEndCall,
  currentUser,
}) => {
  const [seconds, setSeconds] = useState(754); // 12:34
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // WebRTC real stream setup
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    async function initMedia() {
      const stream = await CallService.startMedia(true, true);
      if (stream) {
        activeStream = stream;
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
  }, []);

  const toggleMute = () => {
    CallService.toggleMute(!isMuted);
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    CallService.toggleVideo(!isVideoOff);
    setIsVideoOff(!isVideoOff);
  };

  return (
    <div className="relative w-full max-w-md mx-auto h-[680px] bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col justify-between">
      {/* Remote User Background (Matching Video Call screenshot) */}
      <div className="absolute inset-0 z-0">
        <img
          src={remoteUserAvatar}
          alt={remoteUserName}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
      </div>

      {/* Top Header */}
      <div className="relative z-10 p-5 flex items-center justify-between text-white">
        <button
          onClick={onEndCall}
          className="p-2 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h3 className="font-bold text-lg drop-shadow-md">{remoteUserName}</h3>
          <p className="text-xs text-cyan-300 font-mono font-medium drop-shadow">
            {formatDuration(seconds)}
          </p>
        </div>

        <div className="w-9" />
      </div>

      {/* Picture-in-Picture Local User View (Bottom Right, matching screenshot) */}
      <div className="relative z-10 px-5 flex justify-end">
        <div className="w-24 h-32 rounded-2xl overflow-hidden border-2 border-white/30 shadow-2xl bg-slate-900 relative">
          {hasPermission && !isVideoOff ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
          ) : (
            <img
              src={currentUser.photoURL || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200'}
              alt={currentUser.displayName}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-[9px] text-white">
            You
          </div>
        </div>
      </div>

      {/* Bottom Controls Bar (Mic, Video, Hangup, Camera Flip) */}
      <div className="relative z-10 p-6 pt-3">
        <div className="max-w-xs mx-auto flex items-center justify-between px-4 py-3 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl">
          {/* Mute */}
          <button
            onClick={toggleMute}
            className={`p-3 rounded-full transition-all ${
              isMuted
                ? 'bg-red-500/80 text-white shadow-lg shadow-red-500/30'
                : 'bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Toggle Camera */}
          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full transition-all ${
              isVideoOff
                ? 'bg-red-500/80 text-white shadow-lg shadow-red-500/30'
                : 'bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          {/* End Call Button */}
          <button
            onClick={() => {
              CallService.stopMedia();
              onEndCall();
            }}
            className="p-4 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-xl shadow-red-600/40 hover:scale-105 active:scale-95 transition-all"
          >
            <PhoneOff className="w-6 h-6" />
          </button>

          {/* Switch Camera */}
          <button
            onClick={() => setCameraFacing((f) => (f === 'user' ? 'environment' : 'user'))}
            className="p-3 rounded-full bg-white/15 text-white hover:bg-white/25 transition-all"
            title="Switch Camera"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
