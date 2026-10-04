import React, { useState, useEffect } from 'react';
import {
  X,
  Radio,
  Mic,
  MicOff,
  Hand,
  Volume2,
  Users,
  Sparkles,
  PhoneOff,
  Share2,
} from 'lucide-react';
import { SafeImage } from '../../../components/SafeImage';
import freshKkAvatar from '../../../assets/images/fresh_kk_avatar_1791078365294.jpg';

interface LiveAudioSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  spaceTitle?: string;
  hostName?: string;
  hostAvatar?: string;
  currentUserName: string;
}

export const LiveAudioSpaceModal: React.FC<LiveAudioSpaceModalProps> = ({
  isOpen,
  onClose,
  spaceTitle = 'Kariakoo Tech & Business Talk 🇹🇿',
  hostName = 'Fresh kk',
  hostAvatar = freshKkAvatar,
  currentUserName,
}) => {
  const [isMicMuted, setIsMicMuted] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [activeSpeakerIndex, setActiveSpeakerIndex] = useState(0);
  const [listenerCount, setListenerCount] = useState(38);

  // Simulate active speaker cycling
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setActiveSpeakerIndex((prev) => (prev === 0 ? 1 : 0));
    }, 3500);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in select-none">
      <div className="w-full max-w-lg bg-[#0C101E] border border-cyan-500/30 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -left-24 w-60 h-60 rounded-full bg-cyan-600/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4 z-10">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>LIVE SPACE</span>
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>{listenerCount} wanasikiliza</span>
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
            title="Ondoka"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Space Title */}
        <div className="mb-6 z-10">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400" />
            <span>{spaceTitle}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Mwenyeji: <span className="text-cyan-300 font-semibold">{hostName}</span> • Zenia Audio Space
          </p>
        </div>

        {/* Speakers Section */}
        <div className="mb-6 z-10">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
            Wazungumzaji (Speakers)
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {/* Host */}
            <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-white/[0.04] border border-white/5 relative">
              <div className="relative mb-2">
                {activeSpeakerIndex === 0 && (
                  <div className="absolute -inset-1.5 rounded-full bg-cyan-400 animate-ping opacity-60" />
                )}
                <div
                  className={`relative w-14 h-14 rounded-full overflow-hidden border-2 ${
                    activeSpeakerIndex === 0
                      ? 'border-cyan-400 ring-4 ring-cyan-500/30'
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
                <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-bold text-[9px]">
                  Host
                </span>
              </div>
              <span className="text-xs font-bold text-white truncate max-w-full">
                {hostName}
              </span>
              <span className="text-[10px] text-cyan-300">Anaongea...</span>
            </div>

            {/* Co-Host */}
            <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-white/[0.04] border border-white/5 relative">
              <div className="relative mb-2">
                {activeSpeakerIndex === 1 && (
                  <div className="absolute -inset-1.5 rounded-full bg-cyan-400 animate-ping opacity-60" />
                )}
                <div
                  className={`relative w-14 h-14 rounded-full overflow-hidden border-2 ${
                    activeSpeakerIndex === 1
                      ? 'border-cyan-400 ring-4 ring-cyan-500/30'
                      : 'border-white/20'
                  }`}
                >
                  <img
                    src="/src/assets/images/wireless_earbuds_1790280984496.jpg"
                    alt="Sarah M"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-indigo-500 text-white font-bold text-[9px]">
                  Co-Host
                </span>
              </div>
              <span className="text-xs font-bold text-white truncate max-w-full">
                Sarah M.
              </span>
              <span className="text-[10px] text-slate-400">
                {activeSpeakerIndex === 1 ? 'Anaongea...' : 'Kimya'}
              </span>
            </div>

            {/* Current User (Listener or Speaker) */}
            <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-white/[0.04] border border-white/5 relative">
              <div className="relative mb-2">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/20 bg-slate-800">
                  <div className="w-full h-full flex items-center justify-center font-bold text-cyan-400 text-lg bg-gradient-to-tr from-cyan-900 to-indigo-900">
                    {currentUserName.charAt(0)}
                  </div>
                </div>
                <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-slate-700 text-slate-300">
                  <MicOff className="w-2.5 h-2.5" />
                </span>
              </div>
              <span className="text-xs font-bold text-white truncate max-w-full">
                Wewe ({currentUserName})
              </span>
              <span className="text-[10px] text-slate-400">Msikilizaji</span>
            </div>
          </div>
        </div>

        {/* Listeners Preview */}
        <div className="flex-1 mb-6 overflow-hidden z-10">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Wasikilizaji Wengine
          </h4>
          <div className="flex flex-wrap gap-2">
            {['Amani', 'Juma', 'Neema', 'Baraka', 'Zainab', 'Rashid', 'Emanuel'].map((u, i) => (
              <div
                key={u}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] text-slate-300"
              >
                <div className="w-5 h-5 rounded-full bg-cyan-800/60 flex items-center justify-center text-[10px] font-bold text-cyan-300">
                  {u.charAt(0)}
                </div>
                <span>{u}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between z-10">
          {/* Leave Button */}
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
          >
            <PhoneOff className="w-4 h-4" />
            <span>Ondoka Kimya Kimya</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Raise Hand Button */}
            <button
              onClick={() => setIsHandRaised(!isHandRaised)}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
                isHandRaised
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
              }`}
              title="Omba Kuongea"
            >
              <Hand className={`w-4 h-4 ${isHandRaised ? 'fill-amber-400' : ''}`} />
              <span className="hidden sm:inline">
                {isHandRaised ? 'Umeomba Kuongea' : 'Omba Kuongea'}
              </span>
            </button>

            {/* Mic Toggle */}
            <button
              onClick={() => setIsMicMuted(!isMicMuted)}
              className={`p-2.5 rounded-xl transition-all active:scale-95 ${
                isMicMuted
                  ? 'bg-white/10 text-slate-400 hover:text-white'
                  : 'bg-cyan-500 text-slate-950 font-bold'
              }`}
              title={isMicMuted ? 'Washa Mic' : 'Zima Mic'}
            >
              {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
