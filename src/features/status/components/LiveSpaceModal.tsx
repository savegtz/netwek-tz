import React, { useState, useEffect } from 'react';
import {
  X,
  Radio,
  Mic,
  MicOff,
  Hand,
  Users,
  MessageCircle,
  Share2,
  Volume2,
  Sparkles,
  Flame,
  Heart,
  Send,
  ThumbsUp,
  Smile,
} from 'lucide-react';
import { SafeImage } from '../../../components/SafeImage';
import { UserProfile } from '../../../types';

interface LiveSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  spaceTitle?: string;
  spaceSubtitle?: string;
  hostName?: string;
  hostAvatar?: string;
  listenersCount?: number;
  currentUser: UserProfile;
}

export const LiveSpaceModal: React.FC<LiveSpaceModalProps> = ({
  isOpen,
  onClose,
  spaceTitle = 'Tech & Business',
  spaceSubtitle = 'Jinsi ya kujenga brand yako mtandaoni',
  hostName = 'Fresh kk',
  hostAvatar,
  listenersCount = 456,
  currentUser,
}) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [listeners, setListeners] = useState(listenersCount);
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; emoji: string; left: number }[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<string[]>([
    'Karibuni sana wote kwenye Tech & Business Space!',
    'Maudhui bora kabisa leo 🔥',
    'Nimefurahia sana point ya Jane kuhusu content strategy!',
  ]);
  const [inputMsg, setInputMsg] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setListeners((prev) => prev + Math.floor(Math.random() * 3) - 1);
    }, 4000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const speakers = [
    {
      name: hostName,
      role: 'Host',
      isHost: true,
      avatar:
        hostAvatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      isSpeaking: true,
    },
    {
      name: 'Jane Mollel',
      role: 'Digital Marketer',
      isHost: false,
      avatar:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
      isSpeaking: false,
    },
    {
      name: 'Steve K',
      role: 'Business Coach',
      isHost: false,
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      isSpeaking: false,
    },
  ];

  const handleSendReaction = (emoji: string) => {
    const id = Date.now() + Math.random();
    const left = Math.floor(20 + Math.random() * 60);
    setFloatingEmojis((prev) => [...prev, { id, emoji, left }]);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((item) => item.id !== id));
    }, 2000);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMsg.trim()) {
      setChatMessages((prev) => [...prev, `${currentUser.displayName || 'Wewe'}: ${inputMsg.trim()}`]);
      setInputMsg('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/95 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#150A2E] via-[#0E0620] to-[#080314] border-t sm:border border-purple-500/40 rounded-t-[32px] sm:rounded-3xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden animate-in zoom-in-95">
        {/* Floating Reactions Container */}
        <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
          {floatingEmojis.map((item) => (
            <div
              key={item.id}
              style={{ left: `${item.left}%` }}
              className="absolute bottom-20 text-3xl animate-bounce transition-all duration-1000 opacity-90 drop-shadow-lg"
            >
              {item.emoji}
            </div>
          ))}
        </div>

        {/* Top Header */}
        <div className="p-4 bg-[#1C0D3D]/80 border-b border-purple-500/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1.5 text-xs font-black animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
              <span>((•)) LIVE SPACE</span>
            </div>
            <span className="text-xs text-purple-300 font-semibold flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <strong className="text-white font-mono">{listeners}</strong> wanasikiliza
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1">
          {/* Space Title & Audio Waveform Banner */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-purple-900/40 border border-purple-500/30 space-y-2 text-center relative overflow-hidden shadow-xl">
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {spaceTitle}
            </h3>
            <p className="text-xs sm:text-sm text-purple-200 font-medium">
              “{spaceSubtitle}”
            </p>

            {/* Glowing animated sound wave visual */}
            <div className="flex items-center justify-center gap-1.5 py-2">
              {[4, 12, 24, 16, 32, 20, 36, 18, 28, 14, 30, 8].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}px` }}
                  className="w-1.5 rounded-full bg-gradient-to-t from-purple-500 to-cyan-400 animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* Speakers Stage (Matching Screenshot 5) */}
          <div className="space-y-2.5">
            <span className="text-[10px] uppercase font-black text-purple-300 tracking-wider block">
              JUKWAA LA WASAJILI (SPEAKERS STAGE):
            </span>
            <div className="grid grid-cols-3 gap-3">
              {speakers.map((spk, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-[#1D103D]/60 border border-purple-500/20 flex flex-col items-center text-center relative group"
                >
                  <div className="relative mb-2">
                    <SafeImage
                      src={spk.avatar}
                      alt={spk.name}
                      fallbackText={spk.name}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 shadow-lg ${
                        spk.isSpeaking
                          ? 'border-cyan-400 ring-4 ring-cyan-500/40 scale-105'
                          : 'border-purple-400/50'
                      }`}
                    />
                    {spk.isSpeaking && (
                      <span className="absolute bottom-0 right-0 p-1 rounded-full bg-cyan-500 text-slate-950 shadow-md">
                        <Mic className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-white truncate max-w-full flex items-center gap-0.5">
                    <span>{spk.name}</span>
                    {spk.isHost && <span className="text-cyan-400 text-[10px]">✓</span>}
                  </span>
                  <span className="text-[10px] text-purple-300 font-semibold truncate max-w-full">
                    {spk.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Floating Emoji Reactions Bar */}
          <div className="p-2.5 rounded-2xl bg-[#170B33] border border-white/5 flex items-center justify-around">
            {['🔥', '👏', '❤️', '🚀', '💯', '🙌'].map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => handleSendReaction(em)}
                className="w-10 h-10 rounded-xl hover:bg-white/10 active:scale-125 transition-transform text-xl flex items-center justify-center"
              >
                {em}
              </button>
            ))}
          </div>

          {/* Live Chat Drawer */}
          {showChat && (
            <div className="p-3.5 rounded-2xl bg-[#14082D] border border-purple-500/30 space-y-2.5 animate-in fade-in">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-cyan-400" />
                <span>Live Space Chat:</span>
              </span>
              <div className="space-y-1.5 max-h-32 overflow-y-auto text-xs text-slate-200">
                {chatMessages.map((msg, i) => (
                  <p key={i} className="p-1.5 rounded-lg bg-white/5">
                    {msg}
                  </p>
                ))}
              </div>
              <form onSubmit={handleSendChat} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  placeholder="Andika maoni yako hapa..."
                  className="flex-1 bg-white/10 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-purple-600 text-white font-bold active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Bottom Interactive Controls */}
        <div className="p-4 bg-[#14082E] border-t border-purple-500/20 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3 rounded-2xl flex items-center gap-1.5 text-xs font-bold transition-all ${
                isMuted
                  ? 'bg-white/10 text-slate-300 hover:text-white'
                  : 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/30'
              }`}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isMuted ? 'Mute' : 'Unaongea'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsHandRaised(!isHandRaised)}
              className={`p-3 rounded-2xl flex items-center gap-1.5 text-xs font-bold transition-all ${
                isHandRaised
                  ? 'bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-400/30'
                  : 'bg-white/10 text-slate-300 hover:text-white'
              }`}
              title="Inua Mkono kuomba kuongea"
            >
              <Hand className="w-4 h-4" />
              <span>{isHandRaised ? 'Mkono Juu ✋' : 'Inua Mkono'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowChat(!showChat)}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white"
              title="Chat"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs"
          >
            Ondoka Kimya
          </button>
        </div>
      </div>
    </div>
  );
};
