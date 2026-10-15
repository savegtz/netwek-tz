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
  Monitor,
  MonitorOff,
  MessageSquare,
  Send,
  X,
  Sparkles,
  Maximize2,
  Minimize2,
  FlipHorizontal,
  Wifi,
  Activity,
} from 'lucide-react';
import { webrtcService, WebRTCCallData } from '../../services/calls/webrtcService';
import { ChatSyncService } from '../../services/chat/chatSyncService';
import { soundEffects } from '../../services/audio/soundEffects';
import { callHistoryService } from '../../services/calls/callHistoryService';
import { UserProfile, ChatMessage } from '../../types';
import { SafeImage } from '../../components/SafeImage';
import freshKkAvatar from '../../assets/images/fresh_kk_avatar_1791078365294.jpg';

interface VideoCallScreenProps {
  callType?: 'video' | 'voice';
  callId?: string;
  remoteUserId?: string;
  remoteUserName?: string;
  remoteUserAvatar?: string;
  remoteUserSubtitle?: string;
  isIncoming?: boolean;
  incomingCallData?: WebRTCCallData;
  onEndCall: () => void;
  onMinimizeCall?: () => void;
  currentUser: UserProfile;
}

export const VideoCallScreen: React.FC<VideoCallScreenProps> = ({
  callType = 'voice',
  callId,
  remoteUserId = 'user_fresh_kk',
  remoteUserName = 'Fresh kk',
  remoteUserAvatar = freshKkAvatar,
  remoteUserSubtitle = 'Zenia Call • WebRTC P2P Encrypted',
  isIncoming = false,
  incomingCallData,
  onEndCall,
  onMinimizeCall,
  currentUser,
}) => {
  const effectiveCallId = useRef(callId || incomingCallData?.id || `call_${Date.now()}`).current;

  const [callStatus, setCallStatus] = useState<'incoming' | 'ringing' | 'connecting' | 'connected' | 'ended'>(
    isIncoming ? 'incoming' : 'ringing'
  );
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callVolume, setCallVolume] = useState<number>(85);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === 'voice');
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInputText, setChatInputText] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isSwappedVideo, setIsSwappedVideo] = useState(false);
  const [qualityMode, setQualityMode] = useState<'hd' | 'sd'>('hd');

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const callLoggedRef = useRef(false);

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

  // Record call into call history service when call ends
  const logCallRecord = (duration: number, finalStatus: 'connected' | 'missed' | 'rejected' = 'connected') => {
    if (callLoggedRef.current) return;
    callLoggedRef.current = true;

    callHistoryService.addCallRecord(
      {
        callId: effectiveCallId,
        remoteUserId,
        remoteUserName,
        remoteUserAvatar,
        callType,
        direction: isIncoming ? 'incoming' : 'outgoing',
        status: finalStatus,
        durationSeconds: duration,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      currentUser.id
    );
  };

  // WebRTC Real-Time Connection Setup
  useEffect(() => {
    let isCancelled = false;

    async function setupWebRTC() {
      // 1. Get local camera/audio stream and attach to local video preview
      const localStream = await webrtcService.getLocalStream(callType, facingMode);
      if (localVideoRef.current && localStream) {
        localVideoRef.current.srcObject = localStream;
      }

      const handleRemoteStream = (remoteStream: MediaStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
          setHasRemoteVideo(remoteStream.getVideoTracks().length > 0);
        }
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = remoteStream;
        }
      };

      const handleConnected = () => {
        if (!isCancelled) {
          soundEffects.stopRingtone();
          soundEffects.playConnectedChime();
          setCallStatus('connected');
        }
      };

      const handleEnd = () => {
        if (!isCancelled) {
          soundEffects.stopRingtone();
          soundEffects.playHangupTone();
          setCallStatus('ended');
          logCallRecord(seconds, 'connected');
          setTimeout(() => {
            onEndCall();
          }, 1000);
        }
      };

      if (isIncoming && incomingCallData) {
        // Callee answers call
        setCallStatus('connecting');
        await webrtcService.answerCall(
          incomingCallData,
          currentUser,
          handleRemoteStream,
          handleConnected,
          handleEnd
        );
      } else if (!isIncoming) {
        // Caller initiates call
        await webrtcService.startCall(
          effectiveCallId,
          currentUser,
          { id: remoteUserId, displayName: remoteUserName, photoURL: remoteUserAvatar },
          callType,
          handleRemoteStream,
          handleConnected,
          handleEnd
        );

        // 35s unanswered call timeout (missed call)
        const missedCallTimeout = setTimeout(() => {
          if (callStatus === 'ringing' && !isCancelled) {
            soundEffects.stopRingtone();
            soundEffects.playHangupTone();
            setCallStatus('ended');
            logCallRecord(0, 'missed');
            setTimeout(() => {
              onEndCall();
            }, 1200);
          }
        }, 35000);

        return () => clearTimeout(missedCallTimeout);
      }
    }

    setupWebRTC();

    return () => {
      isCancelled = true;
      webrtcService.endCall(effectiveCallId);
    };
  }, [callType, effectiveCallId, isIncoming]);

  // Sync in-call messages using ChatSyncService
  useEffect(() => {
    const chatConvId = `call_chat_${effectiveCallId}`;
    const unsubscribe = ChatSyncService.subscribeMessages(chatConvId, [], (msgs) => {
      setChatMessages(msgs);
    });
    return () => unsubscribe();
  }, [effectiveCallId]);

  useEffect(() => {
    if (isChatOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen]);

  const toggleMute = () => {
    webrtcService.toggleMute(!isMuted);
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    webrtcService.toggleVideo(!isVideoOff);
    setIsVideoOff(!isVideoOff);
  };

  const handleToggleScreenShare = async () => {
    const nextState = !isScreenSharing;
    setIsScreenSharing(nextState);
    const screenStream = await webrtcService.toggleScreenShare(nextState, () => {
      setIsScreenSharing(false);
    });
    if (nextState && screenStream && localVideoRef.current) {
      localVideoRef.current.srcObject = screenStream;
    } else if (!nextState && localVideoRef.current) {
      const cameraStream = await webrtcService.getLocalStream(callType, facingMode);
      localVideoRef.current.srcObject = cameraStream;
    }
  };

  const handleFlipCamera = async () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    const stream = await webrtcService.switchCamera(nextMode);
    if (stream && localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
  };

  const handleAcceptIncoming = async () => {
    soundEffects.stopRingtone();
    soundEffects.playConnectedChime();
    setCallStatus('connecting');

    if (incomingCallData) {
      await webrtcService.answerCall(
        incomingCallData,
        currentUser,
        (stream) => {
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = stream;
          if (remoteAudioRef.current) remoteAudioRef.current.srcObject = stream;
        },
        () => setCallStatus('connected'),
        () => onEndCall()
      );
    } else {
      setCallStatus('connected');
    }
  };

  const handleHangup = () => {
    soundEffects.stopRingtone();
    soundEffects.playHangupTone();
    logCallRecord(seconds, callStatus === 'connected' ? 'connected' : 'missed');
    webrtcService.endCall(effectiveCallId);
    onEndCall();
  };

  const handleSendInCallMessage = async (textToSend?: string) => {
    const text = (textToSend || chatInputText).trim();
    if (!text) return;

    const chatConvId = `call_chat_${effectiveCallId}`;
    const newMsg: ChatMessage = {
      id: `call_msg_${Date.now()}`,
      conversationId: chatConvId,
      senderId: currentUser.id,
      senderName: currentUser.displayName || 'Mimi',
      text,
      messageType: 'text',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    if (!textToSend) setChatInputText('');
    await ChatSyncService.sendMessage(chatConvId, newMsg);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-lg mx-auto h-[100dvh] sm:h-[720px] bg-[#070A14] sm:rounded-3xl overflow-hidden shadow-2xl border sm:border-white/10 flex flex-col justify-between select-none"
    >
      {/* Hidden audio element for WebRTC Remote Sound */}
      <audio ref={remoteAudioRef} autoPlay playsInline />

      {/* Main Remote Video or Swapped Video Feed */}
      {callType === 'video' && !isVideoOff ? (
        <div className="absolute inset-0 z-0 bg-black overflow-hidden flex items-center justify-center">
          {/* Main Video View */}
          <video
            ref={isSwappedVideo ? localVideoRef : remoteVideoRef}
            autoPlay
            playsInline
            muted={isSwappedVideo}
            className={`w-full h-full object-cover filter contrast-[1.05] ${
              isSwappedVideo && !isScreenSharing ? 'scale-x-[-1]' : ''
            }`}
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90 pointer-events-none" />
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

      {/* Top Bar Header */}
      <div className="relative z-20 p-3 sm:p-5 flex items-center justify-between text-white gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handleHangup}
            className="p-2 sm:p-2.5 rounded-full bg-black/40 backdrop-blur-md hover:bg-white/20 transition-all active:scale-95 text-slate-300 hover:text-white border border-white/10"
            title="Kata simu na urudi"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* BORESHA 5: "Tazama Mazungumzo" (Minimize Call to floating window & view chats) */}
          {onMinimizeCall && (
            <button
              onClick={onMinimizeCall}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-400/40 text-cyan-200 text-xs font-bold transition-all active:scale-95 shadow-sm group"
              title="Punguza simu uendelee kuchati (Tazama Mazungumzo)"
            >
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Tazama Mazungumzo</span>
              <span className="sm:hidden">Mazungumzo</span>
            </button>
          )}
        </div>

        {/* Security & Quality Pill */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-cyan-500/30 text-[11px] text-cyan-300 shadow-sm">
            <Lock className="w-3 h-3 text-cyan-400" />
            <span className="font-semibold tracking-wide">WebRTC P2P</span>
          </div>

          <button
            onClick={() => setQualityMode(qualityMode === 'hd' ? 'sd' : 'hd')}
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border transition-colors ${
              qualityMode === 'hd'
                ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                : 'bg-amber-500/20 border-amber-400/40 text-amber-300'
            }`}
            title="Bofya kubadili ubora wa video"
          >
            {qualityMode.toUpperCase()} 60fps
          </button>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full bg-black/40 backdrop-blur-md hover:bg-white/20 text-slate-300 hover:text-white transition-all border border-white/10"
            title={isFullscreen ? 'Toka Screen Kubwa' : 'Screen Kubwa'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>

          {/* Volume dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowVolumeSlider(!showVolumeSlider)}
              className="p-2 rounded-full bg-black/40 backdrop-blur-md hover:bg-white/20 text-slate-300 hover:text-white transition-all border border-white/10"
              title="Kiwango cha Sauti"
            >
              <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {showVolumeSlider && (
              <div className="absolute right-0 top-11 bg-black/95 backdrop-blur-xl border border-white/15 p-3 rounded-2xl shadow-2xl flex flex-col items-center gap-2 w-36 z-30 animate-in fade-in">
                <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">
                  Sauti: {callVolume}%
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={callVolume}
                  onChange={(e) => {
                    const vol = Number(e.target.value);
                    setCallVolume(vol);
                    if (remoteAudioRef.current) {
                      remoteAudioRef.current.volume = vol / 100;
                    }
                  }}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BORESHA 3: Screen Sharing Active Banner */}
      {isScreenSharing && (
        <div className="relative z-20 mx-4 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-purple-900/90 to-indigo-900/90 border border-purple-400/50 text-purple-200 text-xs flex items-center justify-between shadow-xl backdrop-blur-md animate-in slide-in-from-top-1">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500"></span>
            </span>
            <Monitor className="w-4 h-4 text-purple-300" />
            <div className="flex flex-col">
              <span className="font-bold text-[11px] text-white">Unashiriki Skrini Yako (Screen Share)</span>
              <span className="text-[9px] text-purple-300">Washiriki wanaona skrini hii kwa wakati mmoja</span>
            </div>
          </div>
          <button
            onClick={handleToggleScreenShare}
            className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white transition-colors shadow-sm"
          >
            Acha Kushiriki
          </button>
        </div>
      )}

      {/* Center Contact & Status Section (Shown if voice call or while ringing/connecting) */}
      {(callType === 'voice' || isVideoOff || callStatus !== 'connected') && (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center">
          {/* Avatar with Pulsing Rings */}
          <div className="relative mb-5">
            {callStatus !== 'connected' ? (
              <>
                <div className="absolute -inset-4 rounded-full bg-cyan-500/20 animate-ping opacity-75" />
                <div className="absolute -inset-8 rounded-full bg-indigo-500/10 animate-pulse" />
              </>
            ) : (
              <div className="absolute -inset-3 rounded-full bg-emerald-500/25 blur-md" />
            )}

            <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl bg-slate-900 ring-4 ring-cyan-500/30">
              <SafeImage
                src={remoteUserAvatar}
                fallbackText={remoteUserName}
                fallbackGradient="from-cyan-700 to-indigo-900"
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

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1 drop-shadow-md">
            {remoteUserName}
          </h2>
          <p className="text-xs text-cyan-300 font-medium mb-3">
            {remoteUserSubtitle}
          </p>

          {/* Calling Status Pill */}
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-md shadow-inner">
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
                  Inaita... (Ringing via WebRTC)
                </span>
              </>
            ) : callStatus === 'connecting' ? (
              <>
                <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                <span className="text-xs font-semibold text-amber-300">
                  Inaunganisha P2P... (Connecting)
                </span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono font-bold text-emerald-300">
                  {formatDuration(seconds)} • Live WebRTC Stream
                </span>
              </>
            )}
          </div>

          {callStatus === 'ringing' && !isIncoming && (
            <div className="mt-4 flex flex-col items-center gap-2 max-w-sm animate-in fade-in">
              <span className="text-[11px] text-slate-300">
                Simu inaita kwa <span className="text-cyan-300 font-bold">{remoteUserName}</span>...
              </span>
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <button
                  onClick={() => {
                    soundEffects.stopRingtone();
                    soundEffects.playConnectedChime();
                    const stream = webrtcService.simulateRemoteAnswer(effectiveCallId);
                    if (remoteVideoRef.current) {
                      remoteVideoRef.current.srcObject = stream;
                      setHasRemoteVideo(true);
                    }
                    if (remoteAudioRef.current) {
                      remoteAudioRef.current.srcObject = stream;
                    }
                    setCallStatus('connected');
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-400/40 text-emerald-300 text-[11px] font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm group"
                  title="Jaribu kupokea simu hii mara moja"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span>Pokea kama {remoteUserName}</span>
                </button>
                <button
                  onClick={() => {
                    soundEffects.stopRingtone();
                    soundEffects.playHangupTone();
                    setCallStatus('ended');
                    logCallRecord(0, 'rejected');
                    setTimeout(() => {
                      onEndCall();
                    }, 1000);
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/35 border border-rose-400/40 text-rose-300 text-[11px] font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm"
                  title="Jaribu kukataa simu hii"
                >
                  <PhoneOff className="w-3.5 h-3.5 text-rose-400" />
                  <span>Kataa</span>
                </button>
              </div>
            </div>
          )}

          {/* Audio Waveform Indicator */}
          {callStatus === 'connected' && (
            <div className="flex items-center gap-1.5 mt-5 h-7">
              {[40, 75, 55, 90, 60, 85, 45, 95, 70, 50, 80, 40].map((h, i) => (
                <span
                  key={i}
                  className="w-1 rounded-full bg-gradient-to-t from-cyan-400 via-blue-400 to-indigo-400 animate-pulse"
                  style={{
                    height: `${h}%`,
                    animationDuration: `${0.4 + (i % 4) * 0.2}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Picture-in-Picture Local / Swapped Video View (Click to Swap Streams!) */}
      {callType === 'video' && !isVideoOff && (
        <div className="relative z-20 px-5 flex justify-end mb-2">
          <div
            onClick={() => setIsSwappedVideo(!isSwappedVideo)}
            className="w-28 h-36 rounded-2xl overflow-hidden border-2 border-cyan-400/60 shadow-2xl bg-slate-900 relative group cursor-pointer hover:border-cyan-300 transition-all active:scale-95"
            title="Bofya hapa kubadilisha mwonekano wa video (Click to swap views)"
          >
            <video
              ref={isSwappedVideo ? remoteVideoRef : localVideoRef}
              autoPlay
              playsInline
              muted={!isSwappedVideo}
              className={`w-full h-full object-cover ${
                !isSwappedVideo && !isScreenSharing ? 'scale-x-[-1]' : ''
              }`}
            />
            <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-xs text-[9px] font-bold text-cyan-200 flex items-center gap-1">
              <span>{isSwappedVideo ? remoteUserName : isScreenSharing ? 'Skrini' : 'Wewe'}</span>
              <FlipHorizontal className="w-2.5 h-2.5 opacity-60" />
            </div>
          </div>
        </div>
      )}

      {/* In-Call Live Chat Drawer (Slide-up modal with Swahili Quick Reaction Chips) */}
      {isChatOpen && (
        <div className="absolute inset-x-0 bottom-24 top-16 z-30 mx-3 p-3.5 rounded-3xl bg-[#090E1D]/95 border border-cyan-500/30 backdrop-blur-xl flex flex-col shadow-2xl animate-in slide-in-from-bottom-5">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white">Chat ya Moja kwa Moja kwenye Simu</span>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Swahili Reaction Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 pt-1 no-scrollbar shrink-0">
            {['👋 Habari!', '👂 Nakusikia vizuri', '👍 Sawa kabisa', '📍 Niko hapa', '🚀 Safi sana!'].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendInCallMessage(chip)}
                className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-cyan-500/20 text-[10px] text-cyan-200 border border-white/10 hover:border-cyan-400/40 whitespace-nowrap transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Messages scroll list */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
            {chatMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-4">
                <Sparkles className="w-6 h-6 text-cyan-400 mb-1" />
                <p className="text-[11px]">Andika ujumbe hapa wakati simu inaendelea!</p>
              </div>
            ) : (
              chatMessages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] px-3 py-2 rounded-2xl ${
                        isMe
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-medium'
                          : 'bg-[#151C30] text-white border border-white/10'
                      }`}
                    >
                      <p className="text-[10px] opacity-75 font-bold mb-0.5">{msg.senderName}</p>
                      <p className="text-xs leading-relaxed">{msg.text}</p>
                      <span className="text-[9px] opacity-60 block text-right mt-0.5">{msg.createdAt}</span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Emojis Row */}
          <div className="flex items-center gap-2 pt-2 border-t border-white/10">
            {['❤️', '🔥', '😂', '👏', '🙏', '👍'].map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => handleSendInCallMessage(em)}
                className="p-1 rounded-lg hover:bg-white/10 text-sm transition-transform active:scale-125"
              >
                {em}
              </button>
            ))}
          </div>

          {/* Message input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendInCallMessage();
            }}
            className="mt-1 flex items-center gap-2"
          >
            <input
              type="text"
              value={chatInputText}
              onChange={(e) => setChatInputText(e.target.value)}
              placeholder="Andika ujumbe kwenye simu..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition-colors shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Bottom Controls Bar */}
      <div className="relative z-20 p-4 sm:p-6 pt-2 pb-6">
        {callStatus === 'incoming' ? (
          /* Incoming Call Controls */
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
              className="p-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-xl shadow-emerald-500/50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center animate-pulse"
              title="Pokea (Accept WebRTC Call)"
            >
              {callType === 'video' ? <Video className="w-6 h-6" /> : <Phone className="w-6 h-6" />}
            </button>
          </div>
        ) : (
          /* Active Call Controls Bar */
          <div className="max-w-md mx-auto flex items-center justify-between gap-1 sm:gap-2 px-3 sm:px-4 py-3 rounded-full bg-black/80 backdrop-blur-2xl border border-white/15 shadow-2xl">
            {/* 1. Mute Mic */}
            <button
              onClick={toggleMute}
              className={`p-3 rounded-full transition-all active:scale-95 ${
                isMuted
                  ? 'bg-rose-500/80 text-white shadow-lg shadow-rose-500/30'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title={isMuted ? 'Washa Mic' : 'Zima Mic'}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* 2. Speakerphone */}
            <button
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`p-3 rounded-full transition-all active:scale-95 ${
                isSpeakerOn
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/40'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title="Loudspeaker"
            >
              {isSpeakerOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* 3. Camera Toggle */}
            <button
              onClick={toggleVideo}
              className={`p-3 rounded-full transition-all active:scale-95 ${
                isVideoOff
                  ? 'bg-white/10 text-slate-400 hover:bg-white/20'
                  : 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/30'
              }`}
              title="Kamera"
            >
              {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            </button>

            {/* 3b. Flip Camera (if video is on) */}
            {callType === 'video' && !isVideoOff && (
              <button
                onClick={handleFlipCamera}
                className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all active:scale-95"
                title="Geuza Kamera (Flip Camera)"
              >
                <FlipHorizontal className="w-4 h-4" />
              </button>
            )}

            {/* 4. Screen Sharing Toggle */}
            <button
              onClick={handleToggleScreenShare}
              className={`p-3 rounded-full transition-all active:scale-95 ${
                isScreenSharing
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/40 animate-pulse'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title="Shiriki Skrini (Screen Share)"
            >
              {isScreenSharing ? <MonitorOff className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
            </button>

            {/* 5. In-Call Live Chat Drawer Toggle */}
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`relative p-3 rounded-full transition-all active:scale-95 ${
                isChatOpen
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/40'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title="Chat ya Moja kwa Moja (In-call Live Chat)"
            >
              <MessageSquare className="w-4 h-4" />
              {chatMessages.length > 0 && !isChatOpen && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-2 ring-black" />
              )}
            </button>

            {/* 6. End Call Button */}
            <button
              onClick={handleHangup}
              className="p-3.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-xl shadow-rose-600/50 hover:scale-105 active:scale-90 transition-all ml-1"
              title="Kata Simu (End Call)"
            >
              <PhoneOff className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
