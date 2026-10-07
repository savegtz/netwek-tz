import React, { useState } from 'react';
import {
  X,
  Gift,
  CheckCircle2,
  Sparkles,
  User,
  Phone,
  MessageSquare,
  Share2,
  Trophy,
  Heart,
  Check,
} from 'lucide-react';
import { UserProfile } from '../../../types';

interface GiveawayModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  authorName?: string;
  currentUser: UserProfile;
  prizes?: string;
  winnersCount?: number;
  onStartChatWithAuthor?: (msg: string) => void;
}

export const GiveawayModal: React.FC<GiveawayModalProps> = ({
  isOpen,
  onClose,
  title = 'WIN AMAZING PRIZES!',
  authorName = 'Fresh kk',
  currentUser,
  prizes = 'iPhone 15 Pro Max, Apple Watch Ultra, AirPods Pro',
  winnersCount = 3,
  onStartChatWithAuthor,
}) => {
  const [fullName, setFullName] = useState(currentUser.displayName || 'Amina Juma');
  const [phone, setPhone] = useState(currentUser.phone || '+255 714 892 012');
  const [selectedPrize, setSelectedPrize] = useState('iPhone 15 Pro Max');
  const [customPrize, setCustomPrize] = useState('');
  const [hasFollowed, setHasFollowed] = useState(true);
  const [hasLiked, setHasLiked] = useState(true);
  const [hasShared, setHasShared] = useState(true);
  const [commentDreamPrize, setCommentDreamPrize] = useState(
    'Ndoto yangu ni kupata iPhone 15 Pro Max kwa ajili ya kurekodi maudhui ya biashara yangu! 🔥🙏'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [luckyTicket, setLuckyTicket] = useState('');

  if (!isOpen) return null;

  const prizeOptions = [
    'iPhone 15 Pro Max',
    'Apple Watch Ultra',
    'AirPods Pro 2',
    'TSh 500,000 Cash',
    'PlayStation 5',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const randomTicket = `GW-${Math.floor(100000 + Math.random() * 900000)}`;
      setLuckyTicket(randomTicket);
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1000);
  };

  const handleOpenChat = () => {
    if (onStartChatWithAuthor) {
      const msg = `Habari ${authorName}! Nimejiunga na Giveaway yako rasmi.\n\n🎫 Tiketi Namba: ${luckyTicket}\n🎁 Zawadi Niliyoomba: ${customPrize || selectedPrize}\n👤 Jina: ${fullName}\n📱 Simu: ${phone}\n💬 Maoni: "${commentDreamPrize}"`;
      onStartChatWithAuthor(msg);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-lg bg-[#0A0D18] border-t sm:border border-amber-500/30 rounded-t-[32px] sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-4 bg-[#141A2E] border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/30">
              <Gift className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-amber-400 block">
                OFFICIAL GIVEAWAY
              </span>
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                {title}
              </h3>
              <p className="text-[11px] text-slate-400">
                Imeandaliwa na <strong className="text-amber-300">{authorName}</strong> ✓
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Prize Badge & Winners pill */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/15 to-orange-500/15 border border-amber-500/30 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-black">
                  <span className="text-amber-400 flex items-center gap-1.5">
                    <Trophy className="w-4 h-4" />
                    <span>WIN AMAZING PRIZES!</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px]">
                    🎁 {winnersCount} Lucky Winners!
                  </span>
                </div>
                <p className="text-xs text-slate-200">
                  Zawadi: <strong>{prizes}</strong>
                </p>
              </div>

              {/* HOW TO ENTER Checkbox List matching Screenshot 2 */}
              <div className="p-3.5 rounded-2xl bg-[#12182C] border border-white/5 space-y-2">
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block">
                  HOW TO ENTER (Masharti ya Ushiriki):
                </span>
                <div className="space-y-2 text-xs text-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasFollowed}
                      onChange={(e) => setHasFollowed(e.target.checked)}
                      className="rounded accent-amber-500"
                    />
                    <span>1️⃣ Follow our page (@{authorName.toLowerCase().replace(/\s+/g, '_')})</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasLiked}
                      onChange={(e) => setHasLiked(e.target.checked)}
                      className="rounded accent-amber-500"
                    />
                    <span>2️⃣ Like this status</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasShared}
                      onChange={(e) => setHasShared(e.target.checked)}
                      className="rounded accent-amber-500"
                    />
                    <span>3️⃣ Share to your friends</span>
                  </label>
                </div>
              </div>

              {/* 1. Chagua Zawadi ya Ndoto */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                  <span>🎁 Chagua Zawadi Unayotaka Kushinda:</span>
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {prizeOptions.map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => {
                        setSelectedPrize(opt);
                        setCustomPrize('');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selectedPrize === opt && !customPrize
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={customPrize}
                  onChange={(e) => setCustomPrize(e.target.value)}
                  placeholder="au andika zawadi nyingine..."
                  className="w-full bg-[#161D33] border border-white/10 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500"
                />
              </div>

              {/* 2. Full Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Jina Kamili</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#161D33] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Namba ya Simu</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#161D33] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* 3. Comment your dream prize */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span>Maoni / Comment your dream prize:</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={commentDreamPrize}
                  onChange={(e) => setCommentDreamPrize(e.target.value)}
                  className="w-full bg-[#161D33] border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Submit Button matching Screenshot 2 */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 active:scale-95 transition-all"
              >
                {isSubmitting ? (
                  <span>Inaingiza jina lako...</span>
                ) : (
                  <>
                    <Gift className="w-4 h-4 stroke-[2.5]" />
                    <span>🎁 Join Giveaway Sasa</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Confirmation screen */
            <div className="p-4 text-center space-y-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
                <Trophy className="w-10 h-10" />
              </div>

              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 block">
                  HONGERA SANA! 🎉
                </span>
                <h4 className="text-xl font-black text-white mt-1">
                  Umefanikiwa Kuingia kwenye Droo!
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Jina lako limeingizwa rasmi katika droo ya washindi <strong>{winnersCount}</strong> wa <strong>{authorName}</strong>.
                </p>
              </div>

              {/* Ticket box */}
              <div className="p-3.5 rounded-2xl bg-[#141A2E] border-2 border-amber-500/40 text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  TIKETI YAKO YA USHINDI:
                </span>
                <div className="text-2xl font-black text-amber-300 font-mono tracking-widest">
                  {luckyTicket}
                </div>
                <p className="text-[11px] text-slate-400">
                  Zawadi Uliyoomba: <strong className="text-white">{customPrize || selectedPrize}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleOpenChat}
                  className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>💬 Tuma Ujumbe kwa {authorName}</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs"
                >
                  Funga
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
