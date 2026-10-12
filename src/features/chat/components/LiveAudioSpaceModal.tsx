import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Radio,
  Mic,
  MicOff,
  Hand,
  Volume2,
  VolumeX,
  Users,
  Sparkles,
  PhoneOff,
  Share2,
  MessageSquare,
  Send,
  Heart,
  Flame,
  ThumbsUp,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import { SafeImage } from '../../../components/SafeImage';
import { soundEffects } from '../../../services/audio/soundEffects';
import freshKkAvatar from '../../../assets/images/fresh_kk_avatar_1791078365294.jpg';
import sarahAvatar from '../../../assets/images/sarah_avatar_1790802224123.jpg';

interface LiveAudioSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  spaceTitle?: string;
  hostName?: string;
  hostAvatar?: string;
  currentUserName: string;
}

interface FloatingReaction {
  id: number;
  emoji: string;
  left: number;
}

interface SpaceComment {
  id: string;
  userName: string;
  userInitial: string;
  text: string;
  time: string;
}

export const LiveAudioSpaceModal: React.FC<LiveAudioSpaceModalProps> = ({
  isOpen,
  onClose,
  spaceTitle = 'Kariakoo Tech & Business Talk 🇹🇿',
  hostName = 'Fresh kk',
  hostAvatar = freshKkAvatar,
  currentUserName,
}) => {
  // User role in space: 'listener' | 'hand_raised' | 'speaker'
  const [userRole, setUserRole] = useState<'listener' | 'hand_raised' | 'speaker'>('listener');
  const [isMicMuted, setIsMicMuted] = useState(true);
  const [isSpaceAudioMuted, setIsSpaceAudioMuted] = useState(false);
  const [spaceVolume, setSpaceVolume] = useState(85);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // Active speaker index: 0 = Host (Fresh kk), 1 = Co-Host (Sarah M.), 2 = User
  const [activeSpeakerIndex, setActiveSpeakerIndex] = useState<number>(0);
  const [listenerCount, setListenerCount] = useState(38);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // In-space chat & reactions
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInputText, setChatInputText] = useState('');
  const [comments, setComments] = useState<SpaceComment[]>([
    {
      id: 'c1',
      userName: 'Amani',
      userInitial: 'A',
      text: 'Mada nzuri sana leo! Fursa za kidijitali zinafungua milango.',
      time: '11:02',
    },
    {
      id: 'c2',
      userName: 'Baraka',
      userInitial: 'B',
      text: 'Sauti inasikika vizuri kabisa hapa Mwenge Dar es Salaam 🔥',
      time: '11:04',
    },
    {
      id: 'c3',
      userName: 'Neema',
      userInitial: 'N',
      text: 'Swali langu: Je, unawezaje kuanza biashara ya mtandaoni bila mtaji mkubwa?',
      time: '11:06',
    },
  ]);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);

  // User mic stream & audio level
  const [userAudioLevel, setUserAudioLevel] = useState(0);
  const userMicStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const ambientOscillatorRef = useRef<OscillatorNode | null>(null);
  const ambientGainRef = useRef<GainNode | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Clean toast timer
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 4000);
  };

  // Play ambient audio stream when modal is opened
  useEffect(() => {
    if (!isOpen) return;

    soundEffects.playConnectedChime();

    // Setup Web Audio API ambient room tone (simulates broadcast room presence)
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        audioContextRef.current = ctx;

        // Warm ambient hum/frequency representing live radio broadcast line
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, ctx.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, ctx.currentTime);

        gain.gain.setValueAtTime(isSpaceAudioMuted ? 0 : 0.015 * (spaceVolume / 100), ctx.currentTime);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        ambientOscillatorRef.current = osc;
        ambientGainRef.current = gain;
      }
    } catch (_) {}

    // Simulated speech dialogue between Fresh kk and Sarah M.
    const speechPhrases = [
      { speaker: 0, text: 'Karibuni sana wote kwenye Kariakoo Tech & Business Talk 2026!' },
      { speaker: 1, text: 'Ni kweli Fresh kk. Teknolojia za mtandao sasa zinarahisisha biashara sana.' },
      { speaker: 0, text: 'Wale mnaotaka kuuliza au kuchangia mada, gusa Omba Kuongea hapo chini.' },
      { speaker: 1, text: 'Tunafurahi kuona wasikilizaji wengi kutoka pande mbalimbali za nchi.' },
    ];

    let phraseIndex = 0;
    const dialogueInterval = setInterval(() => {
      if (isSpaceAudioMuted) return;

      const currentPhrase = speechPhrases[phraseIndex % speechPhrases.length];
      setActiveSpeakerIndex(currentPhrase.speaker);
      phraseIndex++;

      // Trigger native browser SpeechSynthesis if supported and not muted
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && !isSpaceAudioMuted) {
        try {
          // Check if speech synthesis is already speaking
          if (!window.speechSynthesis.speaking) {
            const utter = new SpeechSynthesisUtterance(currentPhrase.text);
            utter.rate = 1.0;
            utter.pitch = currentPhrase.speaker === 0 ? 0.95 : 1.15;
            utter.volume = Math.max(0.1, (spaceVolume / 100) * 0.8);
            window.speechSynthesis.speak(utter);
          }
        } catch (_) {}
      }
    }, 4500);

    // Natural fluctuation in listener count
    const listenerInterval = setInterval(() => {
      setListenerCount((prev) => Math.max(30, prev + (Math.random() > 0.4 ? 1 : -1)));
    }, 5000);

    // Automated community reactions
    const autoReactionInterval = setInterval(() => {
      const sampleEmojis = ['❤️', '🔥', '👏', '🚀', '💯', '🤝'];
      const randomEmoji = sampleEmojis[Math.floor(Math.random() * sampleEmojis.length)];
      triggerFloatingReaction(randomEmoji);
    }, 3800);

    return () => {
      clearInterval(dialogueInterval);
      clearInterval(listenerInterval);
      clearInterval(autoReactionInterval);

      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch (_) {}
      }

      if (ambientOscillatorRef.current) {
        try {
          ambientOscillatorRef.current.stop();
          ambientOscillatorRef.current.disconnect();
        } catch (_) {}
      }

      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          audioContextRef.current.close();
        } catch (_) {}
      }
    };
  }, [isOpen]);

  // Adjust ambient volume
  useEffect(() => {
    if (ambientGainRef.current && audioContextRef.current) {
      const targetGain = isSpaceAudioMuted ? 0 : 0.015 * (spaceVolume / 100);
      ambientGainRef.current.gain.setValueAtTime(targetGain, audioContextRef.current.currentTime);
    }
  }, [isSpaceAudioMuted, spaceVolume]);

  // Handle user's real mic toggle
  useEffect(() => {
    if (userRole === 'speaker' && !isMicMuted) {
      // User is live and unmuted: acquire real mic stream
      setActiveSpeakerIndex(2);
      navigator.mediaDevices
        ?.getUserMedia({ audio: true })
        .then((stream) => {
          userMicStreamRef.current = stream;

          // Compute voice level with AnalyserNode
          try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioContextClass();
            const source = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 64;
            source.connect(analyser);
            analyserRef.current = analyser;

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const updateMeter = () => {
              if (!analyserRef.current) return;
              analyserRef.current.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
              }
              const avg = sum / dataArray.length;
              setUserAudioLevel(Math.min(100, Math.round(avg * 1.5)));
              animationFrameRef.current = requestAnimationFrame(updateMeter);
            };
            updateMeter();
          } catch (_) {
            setUserAudioLevel(65);
          }
        })
        .catch((err) => {
          console.warn('Microphone permission not granted, using simulated speaking mode:', err);
          setUserAudioLevel(70);
        });
    } else {
      // User muted or not a speaker
      if (userMicStreamRef.current) {
        userMicStreamRef.current.getTracks().forEach((track) => track.stop());
        userMicStreamRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setUserAudioLevel(0);
      if (activeSpeakerIndex === 2) {
        setActiveSpeakerIndex(0);
      }
    }

    return () => {
      if (userMicStreamRef.current) {
        userMicStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [userRole, isMicMuted]);

  // Scroll chat bottom
  useEffect(() => {
    if (isChatOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments, isChatOpen]);

  // Handle hand raise
  const handleToggleHandRaise = () => {
    if (userRole === 'speaker') {
      showToast('Tayari wewe ni Mzungumzaji (Speaker)! Washa mic uanze kuongea.');
      return;
    }

    if (userRole === 'hand_raised') {
      setUserRole('listener');
      showToast('Umeondoa ombi lako la kuongea.');
      return;
    }

    // Raise hand
    setUserRole('hand_raised');
    soundEffects.playConnectedChime();
    showToast('Ombi lako la kuongea limetumwa kwa Mwenyeji Fresh kk... ⏳');

    // Simulate host granting speaker permission after 2.5 seconds
    setTimeout(() => {
      setUserRole('speaker');
      soundEffects.playConnectedChime();
      showToast('🎉 Mwenyeji Fresh kk amekuruhusu kuongea! Washa maikrofoni yako sasa.');
    }, 2800);
  };

  // Handle user mic button click
  const handleToggleMic = () => {
    if (userRole !== 'speaker') {
      soundEffects.playHangupTone();
      showToast('Tafadhali gusa ✋ "Omba Kuongea" kwanza ili mwenyeji akupe nafasi ya kuongea!');
      return;
    }

    const nextMuted = !isMicMuted;
    setIsMicMuted(nextMuted);
    if (!nextMuted) {
      soundEffects.playConnectedChime();
      showToast('Maikrofoni yako ipo WAZI! Unaongea moja kwa moja kwenye Live Space 🎙️');
    } else {
      showToast('Maikrofoni yako IMEZIMWA (Kimya).');
    }
  };

  // Trigger floating reaction
  const triggerFloatingReaction = (emoji: string) => {
    const id = Date.now() + Math.random();
    const left = Math.floor(15 + Math.random() * 70);
    setFloatingReactions((prev) => [...prev, { id, emoji, left }]);

    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
    }, 2500);
  };

  // Send in-space comment
  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim()) return;

    const newComment: SpaceComment = {
      id: `c_${Date.now()}`,
      userName: currentUserName,
      userInitial: currentUserName.charAt(0).toUpperCase() || 'W',
      text: chatInputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setComments((prev) => [...prev, newComment]);
    setChatInputText('');
    triggerFloatingReaction('💬');
  };

  // Handle Leave
  const handleLeaveQuietly = () => {
    soundEffects.playHangupTone();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }
    if (userMicStreamRef.current) {
      userMicStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in select-none">
      <div className="w-full max-w-lg bg-[#0C101E] border border-cyan-500/35 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[92vh] animate-in zoom-in-95 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -left-24 w-60 h-60 rounded-full bg-cyan-600/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />

        {/* Floating Reactions Canvas */}
        <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
          {floatingReactions.map((r) => (
            <div
              key={r.id}
              className="absolute text-2xl animate-float-up opacity-90 transition-all pointer-events-none"
              style={{
                left: `${r.left}%`,
                bottom: '80px',
                animation: 'floatUp 2.4s ease-out forwards',
              }}
            >
              {r.emoji}
            </div>
          ))}
        </div>

        {/* Toast notification banner */}
        {toastMessage && (
          <div className="absolute top-3 left-4 right-4 z-40 bg-gradient-to-r from-cyan-900/95 to-indigo-900/95 border border-cyan-400/40 text-cyan-200 text-xs px-3.5 py-2 rounded-2xl shadow-xl backdrop-blur-md flex items-center justify-between animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-300 shrink-0" />
              <span className="font-medium">{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-cyan-300/70 hover:text-white text-xs font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4 z-10">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>LIVE SPACE</span>
            </span>
            <span className="text-xs text-slate-300 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>{listenerCount} wanasikiliza</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Listening Audio Volume Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                className={`p-2 rounded-full border transition-all ${
                  isSpaceAudioMuted
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
                }`}
                title={isSpaceAudioMuted ? 'Washa Sauti ya Space' : 'Rekebisha Sauti'}
              >
                {isSpaceAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {showVolumeSlider && (
                <div className="absolute right-0 top-11 bg-black/95 backdrop-blur-xl border border-white/15 p-3 rounded-2xl shadow-2xl flex flex-col items-center gap-2 w-36 z-40 animate-in fade-in">
                  <div className="flex items-center justify-between w-full text-[10px] text-cyan-300 font-bold uppercase">
                    <span>Sauti</span>
                    <span>{isSpaceAudioMuted ? '0%' : `${spaceVolume}%`}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isSpaceAudioMuted ? 0 : spaceVolume}
                    onChange={(e) => {
                      const vol = Number(e.target.value);
                      setSpaceVolume(vol);
                      setIsSpaceAudioMuted(vol === 0);
                    }}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <button
                    onClick={() => setIsSpaceAudioMuted(!isSpaceAudioMuted)}
                    className="text-[10px] text-slate-300 hover:text-white underline pt-1"
                  >
                    {isSpaceAudioMuted ? 'Washa sauti' : 'Zima sauti (Mute)'}
                  </button>
                </div>
              )}
            </div>

            {/* Close / Leave */}
            <button
              onClick={handleLeaveQuietly}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Ondoka"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Space Title & Subtitle */}
        <div className="mb-5 z-10">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400 shrink-0" />
            <span className="truncate">{spaceTitle}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <span>Mwenyeji:</span>
            <span className="text-cyan-300 font-semibold">{hostName}</span>
            <span>• Zenia Audio Space</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
          </p>
        </div>

        {/* Speakers Section */}
        <div className="mb-5 z-10">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Wazungumzaji (Speakers)
            </h4>
            <span className="text-[10px] text-cyan-400 font-semibold">
              {userRole === 'speaker' ? 'Wewe pia ni Mzungumzaji 🎙️' : 'Mwenyeji na Wasaidizi'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* 1. Host (Fresh kk) */}
            <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-white/[0.04] border border-white/5 relative transition-all hover:bg-white/[0.06]">
              <div className="relative mb-2">
                {activeSpeakerIndex === 0 && (
                  <>
                    <div className="absolute -inset-2 rounded-full bg-cyan-400/30 animate-ping" />
                    <div className="absolute -inset-1 rounded-full border border-cyan-400/80 animate-pulse" />
                  </>
                )}
                <div
                  className={`relative w-14 h-14 rounded-full overflow-hidden border-2 transition-all ${
                    activeSpeakerIndex === 0
                      ? 'border-cyan-400 ring-4 ring-cyan-500/40 scale-105'
                      : 'border-white/20'
                  }`}
                >
                  <SafeImage
                    src={hostAvatar}
                    fallbackText={hostName}
                    fallbackGradient="from-cyan-800 to-indigo-900"
                    alt={hostName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-bold text-[9px] shadow-sm">
                  Host
                </span>
              </div>
              <span className="text-xs font-bold text-white truncate max-w-full">
                {hostName}
              </span>
              <span
                className={`text-[10px] font-medium flex items-center gap-1 ${
                  activeSpeakerIndex === 0 ? 'text-cyan-300 font-bold' : 'text-slate-400'
                }`}
              >
                {activeSpeakerIndex === 0 ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span>Anaongea...</span>
                  </>
                ) : (
                  <span>Kimya</span>
                )}
              </span>
            </div>

            {/* 2. Co-Host (Sarah M.) */}
            <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-white/[0.04] border border-white/5 relative transition-all hover:bg-white/[0.06]">
              <div className="relative mb-2">
                {activeSpeakerIndex === 1 && (
                  <>
                    <div className="absolute -inset-2 rounded-full bg-indigo-400/30 animate-ping" />
                    <div className="absolute -inset-1 rounded-full border border-indigo-400/80 animate-pulse" />
                  </>
                )}
                <div
                  className={`relative w-14 h-14 rounded-full overflow-hidden border-2 transition-all ${
                    activeSpeakerIndex === 1
                      ? 'border-indigo-400 ring-4 ring-indigo-500/40 scale-105'
                      : 'border-white/20'
                  }`}
                >
                  <SafeImage
                    src={sarahAvatar}
                    fallbackText="Sarah M."
                    fallbackGradient="from-pink-600 to-purple-800"
                    alt="Sarah M."
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-indigo-500 text-white font-bold text-[9px] shadow-sm">
                  Co-Host
                </span>
              </div>
              <span className="text-xs font-bold text-white truncate max-w-full">
                Sarah M.
              </span>
              <span
                className={`text-[10px] font-medium flex items-center gap-1 ${
                  activeSpeakerIndex === 1 ? 'text-indigo-300 font-bold' : 'text-slate-400'
                }`}
              >
                {activeSpeakerIndex === 1 ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                    <span>Anaongea...</span>
                  </>
                ) : (
                  <span>Kimya</span>
                )}
              </span>
            </div>

            {/* 3. Current User Card */}
            <div
              className={`flex flex-col items-center text-center p-3 rounded-2xl border relative transition-all ${
                userRole === 'speaker'
                  ? 'bg-gradient-to-b from-cyan-950/40 to-slate-900 border-cyan-500/40 shadow-lg'
                  : 'bg-white/[0.04] border-white/5'
              }`}
            >
              <div className="relative mb-2">
                {/* Visualizer ring when user is talking live */}
                {userRole === 'speaker' && !isMicMuted && (
                  <>
                    <div className="absolute -inset-2 rounded-full bg-emerald-400/30 animate-ping" />
                    <div className="absolute -inset-1 rounded-full border border-emerald-400 animate-pulse" />
                  </>
                )}
                <div
                  className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-all ${
                    userRole === 'speaker' && !isMicMuted
                      ? 'border-emerald-400 ring-4 ring-emerald-500/40 scale-105'
                      : 'border-white/20 bg-slate-800'
                  }`}
                >
                  <div className="w-full h-full flex items-center justify-center font-bold text-cyan-300 text-lg bg-gradient-to-tr from-cyan-900 to-indigo-900">
                    {currentUserName.charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Badge based on state */}
                {userRole === 'speaker' ? (
                  <span
                    className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold shadow-sm ${
                      isMicMuted ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-slate-950'
                    }`}
                  >
                    {isMicMuted ? 'Muted' : 'Live'}
                  </span>
                ) : (
                  <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-slate-700 text-slate-300">
                    <MicOff className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>

              <span className="text-xs font-bold text-white truncate max-w-full">
                Wewe ({currentUserName})
              </span>

              {/* Status text */}
              <span
                className={`text-[10px] font-medium ${
                  userRole === 'speaker'
                    ? isMicMuted
                      ? 'text-amber-300'
                      : 'text-emerald-400 font-bold'
                    : userRole === 'hand_raised'
                    ? 'text-amber-400'
                    : 'text-slate-400'
                }`}
              >
                {userRole === 'speaker'
                  ? isMicMuted
                    ? 'Washa mic kuongea'
                    : 'Unaongea Live! 🎙️'
                  : userRole === 'hand_raised'
                  ? 'Ombi linasubiri...'
                  : 'Msikilizaji'}
              </span>
            </div>
          </div>
        </div>

        {/* Listeners Preview */}
        <div className="mb-4 overflow-hidden z-10">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Wasikilizaji Wengine ({listenerCount})
            </h4>
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{isChatOpen ? 'Ficha Maoni' : `Maoni (${comments.length})`}</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
            {['Amani', 'Juma', 'Neema', 'Baraka', 'Zainab', 'Rashid', 'Emanuel', 'Khadija', 'Daniel'].map((u) => (
              <div
                key={u}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] text-slate-300 hover:bg-white/[0.06] transition-colors"
              >
                <div className="w-4 h-4 rounded-full bg-cyan-800/70 flex items-center justify-center text-[9px] font-bold text-cyan-300">
                  {u.charAt(0)}
                </div>
                <span>{u}</span>
              </div>
            ))}
          </div>
        </div>

        {/* In-Space Live Chat Drawer */}
        {isChatOpen && (
          <div className="mb-3 p-3 rounded-2xl bg-[#090D1A] border border-cyan-500/25 flex flex-col z-20 max-h-44 animate-in slide-in-from-bottom-2">
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs max-h-28">
              {comments.map((c) => (
                <div key={c.id} className="bg-white/[0.03] p-2 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-[11px] text-cyan-300">{c.userName}</span>
                    <span className="text-[9px] text-slate-400">{c.time}</span>
                  </div>
                  <p className="text-[11.5px] text-slate-200">{c.text}</p>
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>

            <form onSubmit={handleSendComment} className="mt-2 pt-2 border-t border-white/10 flex items-center gap-2">
              <input
                type="text"
                value={chatInputText}
                onChange={(e) => setChatInputText(e.target.value)}
                placeholder="Uliza swali au toa maoni..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition-colors shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* Quick Reactions Bar */}
        <div className="flex items-center justify-around py-2 px-3 rounded-2xl bg-white/[0.03] border border-white/5 mb-3 z-10">
          <span className="text-[10px] text-slate-400 font-semibold mr-1">Tuma hisia:</span>
          {['❤️', '🔥', '👏', '🚀', '💯', '🤝'].map((emoji) => (
            <button
              key={emoji}
              onClick={() => triggerFloatingReaction(emoji)}
              className="text-base p-1 hover:scale-125 active:scale-95 transition-transform"
              title={`Tuma ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Bottom Control Bar Matching Screenshot Layout */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between z-10">
          {/* Leave Button */}
          <button
            onClick={handleLeaveQuietly}
            className="px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
          >
            <PhoneOff className="w-4 h-4" />
            <span>Ondoka Kimya Kimya</span>
          </button>

          <div className="flex items-center gap-2.5">
            {/* Raise Hand Button */}
            <button
              onClick={handleToggleHandRaise}
              className={`p-2.5 sm:px-3.5 sm:py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
                userRole === 'speaker'
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                  : userRole === 'hand_raised'
                  ? 'bg-amber-500/25 border-amber-400 text-amber-300 animate-pulse'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
              }`}
              title={
                userRole === 'speaker'
                  ? 'Tayari wewe ni Mzungumzaji'
                  : userRole === 'hand_raised'
                  ? 'Umeomba Kuongea (Inasubiri...)'
                  : 'Omba Kuongea'
              }
            >
              <Hand
                className={`w-4 h-4 ${
                  userRole === 'hand_raised' || userRole === 'speaker' ? 'fill-current' : ''
                }`}
              />
              <span className="hidden sm:inline font-bold">
                {userRole === 'speaker'
                  ? 'Mzungumzaji'
                  : userRole === 'hand_raised'
                  ? 'Umeomba Kuongea...'
                  : 'Omba Kuongea'}
              </span>
            </button>

            {/* Mic Toggle Button */}
            <button
              onClick={handleToggleMic}
              className={`p-2.5 rounded-xl transition-all active:scale-95 ${
                userRole === 'speaker' && !isMicMuted
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/30 animate-pulse'
                  : userRole === 'speaker' && isMicMuted
                  ? 'bg-amber-500/20 border border-amber-400 text-amber-300'
                  : isMicMuted
                  ? 'bg-white/10 text-slate-400 hover:text-white'
                  : 'bg-cyan-500 text-slate-950 font-bold'
              }`}
              title={
                userRole !== 'speaker'
                  ? 'Omba kuongea kwanza ili kuwasha mic'
                  : isMicMuted
                  ? 'Washa Maikrofoni'
                  : 'Zima Maikrofoni'
              }
            >
              {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
