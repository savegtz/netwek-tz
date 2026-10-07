import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Heart,
  Send,
  MapPin,
  Share2,
  Utensils,
  ShoppingBag,
  BarChart2,
  Calendar,
  Ticket,
  MessageCircle,
  Bookmark,
  CheckCircle2,
  Flame,
  Briefcase,
  Check,
} from 'lucide-react';
import { StatusItem, UserProfile } from '../../types';
import { SafeImage } from '../../components/SafeImage';
import { FoodOrderModal } from './components/FoodOrderModal';
import { ProductPurchaseModal } from './components/ProductPurchaseModal';
import { EventTicketModal } from './components/EventTicketModal';
import { JobApplicationModal } from './components/JobApplicationModal';

interface StatusStoryViewerModalProps {
  isOpen: boolean;
  statuses: StatusItem[];
  initialIndex?: number;
  onClose: () => void;
  onReply?: (status: StatusItem, replyText: string) => void;
  currentUser?: UserProfile;
  onStartChatWithBusiness?: (
    businessId: string,
    businessName: string,
    initialMessage?: string,
    avatar?: string
  ) => void;
}

export const StatusStoryViewerModal: React.FC<StatusStoryViewerModalProps> = ({
  isOpen,
  statuses,
  initialIndex = 0,
  currentUser,
  onClose,
  onReply,
  onStartChatWithBusiness,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [showComments, setShowComments] = useState(false);

  // Poll voting inside story
  const [votedOption, setVotedOption] = useState<string | null>(null);
  const [copiedToast, setCopiedToast] = useState(false);

  // Submodals
  const [isFoodOrderOpen, setIsFoodOrderOpen] = useState(false);
  const [isProductPurchaseOpen, setIsProductPurchaseOpen] = useState(false);
  const [isEventTicketOpen, setIsEventTicketOpen] = useState(false);
  const [isJobApplicationOpen, setIsJobApplicationOpen] = useState(false);

  // Stable refs for callbacks
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  const onReplyRef = useRef(onReply);
  useEffect(() => {
    onReplyRef.current = onReply;
  });

  // Reset when opened or initial index changes
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setProgress(0);
      setIsLiked(false);
      setIsSaved(false);
      setReplyText('');
      setIsPaused(false);
      setShowComments(false);
      setVotedOption(null);
    }
  }, [isOpen, initialIndex]);

  // Pause timer when a submodal or comment drawer is active
  const anyModalActive = isFoodOrderOpen || isProductPurchaseOpen || isEventTicketOpen || showComments;

  // Story progression timer (advances progress every 100ms) - Pure updater
  useEffect(() => {
    if (!isOpen || isPaused || anyModalActive || statuses.length === 0) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return Math.min(100, prev + 1.6);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, currentIndex, isPaused, anyModalActive, statuses.length]);

  // Safely advance to next story or close when story finishes (runs safely in effect)
  useEffect(() => {
    if (progress >= 100 && !anyModalActive) {
      if (currentIndex < statuses.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setProgress(0);
        setIsLiked(false);
        setVotedOption(null);
      } else {
        onCloseRef.current?.();
      }
    }
  }, [progress, currentIndex, anyModalActive, statuses.length]);

  if (!isOpen || statuses.length === 0) return null;

  const current = statuses[currentIndex] || statuses[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
      setIsLiked(false);
      setVotedOption(null);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex < statuses.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
      setIsLiked(false);
      setVotedOption(null);
    } else {
      onCloseRef.current?.();
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    if (onReplyRef.current) {
      onReplyRef.current(current, replyText);
    }
    setReplyText('');
    onCloseRef.current?.();
  };

  const handleChatNow = () => {
    if (!onStartChatWithBusiness) return;
    let initialMsg = `Habari ${current.metadata?.companyName || current.authorName}!`;
    if (current.type === 'food') {
      const foodName = current.metadata?.foodName || 'Chicken Burger';
      const offer = current.metadata?.offerPrice || 12000;
      initialMsg = `Habari ${current.authorName}! Ninaulizia kuhusu: 🍔 ${foodName} (TSh ${offer.toLocaleString()}) Ofa ya Masaki Dar es Salaam. Naomba maelezo ya kuagiza.`;
    } else if (current.type === 'job') {
      const jobTitle = current.metadata?.jobTitle || 'kazi';
      initialMsg = `Habari ${current.metadata?.companyName || current.authorName}! Nimeona tangazo lenu la kazi ya "${jobTitle}". Ningependa kupata maelezo zaidi kuhusu nafasi hii.`;
    } else if (current.type === 'product') {
      const prodName = current.metadata?.productName || 'Nike Air Max';
      const price = current.metadata?.salePrice || 175000;
      initialMsg = `Habari ${current.authorName}! Ninaulizia kuhusu bidhaa ya: 🛍️ ${prodName} (TSh ${price.toLocaleString()}).`;
    } else if (current.type === 'event') {
      const evName = current.metadata?.eventName || 'Dar Food Festival 2026';
      initialMsg = `Habari waandaaji wa ${evName}! Ninaulizia tiketi za VIP na maegesho.`;
    }
    onStartChatWithBusiness(current.authorId, current.metadata?.companyName || current.authorName, initialMsg, current.authorPhoto);
    onCloseRef.current?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-200 select-none p-0 sm:p-4">
      <div
        className="relative w-full max-w-md h-full max-h-[820px] sm:rounded-[36px] overflow-hidden bg-slate-950 border border-white/10 shadow-2xl flex flex-col justify-between"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Full Media Image Background */}
        <div className="absolute inset-0 z-0 bg-black">
          <SafeImage
            src={current.mediaUrl}
            fallbackGradient="from-cyan-900 via-slate-900 to-indigo-950"
            alt={current.text}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/25 to-black/95" />
        </div>

        {/* Top Progress Bars & Header */}
        <div className="relative z-20 p-4 pt-3 space-y-3">
          {/* Progress Indicators */}
          <div className="flex items-center gap-1.5 w-full">
            {statuses.map((_, idx) => (
              <div
                key={idx}
                className="h-1 flex-1 rounded-full bg-white/25 overflow-hidden"
              >
                <div
                  className="h-full bg-cyan-400 transition-all duration-100 rounded-full"
                  style={{
                    width:
                      idx === currentIndex
                        ? `${progress}%`
                        : idx < currentIndex
                        ? '100%'
                        : '0%',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Author Details and Close */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <SafeImage
                src={current.authorPhoto}
                fallbackText={current.authorName}
                alt={current.authorName}
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md bg-black"
              />
              <div>
                <h4 className="font-extrabold text-sm text-white drop-shadow leading-tight flex items-center gap-1">
                  <span>{current.authorName}</span>
                  <span className="text-cyan-400 text-xs">✓</span>
                </h4>
                <p className="text-[11px] text-slate-300 drop-shadow flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  <span>{current.createdAt}</span>
                  {current.type === 'job' && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 text-[9px] font-black">
                      💼 Job
                    </span>
                  )}
                  {current.type === 'food' && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 text-[9px] font-black">
                      🍕 Food
                    </span>
                  )}
                  {current.type === 'poll' && (
                    <span className="px-1.5 py-0.2 rounded bg-blue-500 text-white text-[9px] font-bold">
                      📊 Poll
                    </span>
                  )}
                  {current.type === 'product' && (
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-slate-950 text-[9px] font-bold">
                      🛍️ Shop
                    </span>
                  )}
                  {current.type === 'event' && (
                    <span className="px-1.5 py-0.2 rounded bg-purple-500 text-white text-[9px] font-bold">
                      🎪 Event
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 relative">
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  setCopiedToast(true);
                  setTimeout(() => setCopiedToast(false), 2000);
                }}
                className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                title="Share"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onCloseRef.current?.()}
                className="p-2 rounded-full bg-black/40 text-slate-300 hover:text-white hover:bg-black/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* In-UI Copy Feedback Toast */}
              {copiedToast && (
                <div className="absolute right-0 -bottom-8 px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-[11px] shadow-lg animate-in fade-in slide-in-from-top-1 whitespace-nowrap z-50">
                  Kiungo kimenakiliwa! ✓
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tap areas for next/previous story */}
        <div className="absolute inset-0 z-10 flex">
          <div
            className="w-1/3 h-full cursor-pointer"
            onClick={handlePrev}
          />
          <div
            className="w-2/3 h-full cursor-pointer"
            onClick={handleNext}
          />
        </div>

        {/* ============================================================== */}
        {/* BOTTOM RICH STORY DETAILS (FOOD, POLL, PRODUCT, EVENT) */}
        {/* ============================================================== */}
        <div className="relative z-20 p-4 pt-2 space-y-3 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent">
          {/* Location Badge */}
          {current.location && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs text-white">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>{current.location}</span>
            </div>
          )}

          {/* ==================== 1. FOOD STORY CONTENT ==================== */}
          {current.type === 'food' && (
            <div className="p-3.5 rounded-2xl bg-[#0F1426]/90 backdrop-blur-md border border-amber-500/30 space-y-2.5 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-sm sm:text-base text-white flex items-center gap-1.5">
                    <span>🍔 {current.metadata?.foodName || 'Chicken Burger'}</span>
                  </h4>
                  <span className="text-[11px] text-amber-300 font-bold">
                    {current.metadata?.restaurantName || 'ZEBRA RESTAURANT'}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-xl bg-amber-500/20 text-amber-400 font-black text-xs border border-amber-500/30">
                  ⭐ {current.metadata?.rating || 4.8}
                </span>
              </div>

              {/* Price Banner */}
              <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-black/40 border border-white/5">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 text-[9px] font-black">
                    {current.metadata?.specialOfferLabel || '🔥 TODAY ONLY'}
                  </span>
                  <span className="text-amber-300 font-black font-mono text-sm">
                    TSh {(current.metadata?.offerPrice || 12000).toLocaleString()}
                  </span>
                  <span className="line-through text-slate-500 font-mono text-[11px]">
                    TSh {(current.metadata?.regularPrice || 15000).toLocaleString()}
                  </span>
                </div>
                <span className="text-amber-400 text-[10px] font-bold">
                  {current.metadata?.discount || '20% OFF — Today Only'}
                </span>
              </div>

              {/* Food Rating Breakdown */}
              <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-300 pt-1 border-t border-white/10">
                <div className="flex justify-between">
                  <span>⭐⭐⭐⭐⭐ Taste</span>
                  <strong className="text-amber-400">5.0</strong>
                </div>
                <div className="flex justify-between">
                  <span>⭐⭐⭐⭐⭐ Presentation</span>
                  <strong className="text-amber-400">4.8</strong>
                </div>
                <div className="flex justify-between">
                  <span>⭐⭐⭐⭐ Service</span>
                  <strong className="text-amber-400">4.7</strong>
                </div>
                <div className="flex justify-between">
                  <span>⭐⭐⭐⭐⭐ Value</span>
                  <strong className="text-amber-400">4.9</strong>
                </div>
              </div>

              {/* Action Buttons: [🍽️ Order Now] and [💬 Chat Now] */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsFoodOrderOpen(true)}
                  className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/30 active:scale-95 transition-all"
                >
                  <Utensils className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>🍽️ Order Now</span>
                </button>

                <button
                  type="button"
                  onClick={handleChatNow}
                  className="py-2.5 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>💬 Chat Now</span>
                </button>
              </div>
            </div>
          )}

          {/* ==================== 2. POLL STORY CONTENT ==================== */}
          {current.type === 'poll' && (
            <div className="p-3.5 rounded-2xl bg-[#0F1426]/90 backdrop-blur-md border border-blue-500/30 space-y-2.5">
              <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-blue-400" />
                <span>{current.metadata?.pollQuestion || 'Leo tukatoke wapi? 😎'}</span>
              </h4>

              <div className="space-y-1.5">
                {current.metadata?.pollOptions?.map((opt) => {
                  const isSelected = votedOption === opt.id;
                  const totalVotes =
                    current.metadata?.pollOptions?.reduce((s, o) => s + o.votes, 0) || 1;
                  const pct = Math.round((opt.votes / totalVotes) * 100);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setVotedOption(opt.id)}
                      className={`relative w-full p-2.5 rounded-xl border text-left overflow-hidden transition-all text-xs font-semibold ${
                        isSelected
                          ? 'border-blue-400 bg-blue-500/20 text-white'
                          : 'border-white/10 bg-black/40 text-slate-200 hover:border-blue-400/50'
                      }`}
                    >
                      <div
                        className="absolute inset-y-0 left-0 bg-blue-500/25 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                      <div className="relative z-10 flex items-center justify-between">
                        <span>{opt.text}</span>
                        <span className="font-mono text-blue-300 font-bold">
                          {pct}% ({opt.votes})
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================== 3. PRODUCT STORY CONTENT ==================== */}
          {current.type === 'product' && (
            <div className="p-3.5 rounded-2xl bg-[#0F1426]/90 backdrop-blur-md border border-emerald-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-white">
                  🛍️ {current.metadata?.productName || 'Nike Air Max'}
                </h4>
                <span className="text-emerald-400 text-xs font-bold font-mono">
                  TSh {(current.metadata?.salePrice || 175000).toLocaleString()}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductPurchaseOpen(true)}
                  className="py-2.5 px-3 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/30"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>🛍️ Buy Now</span>
                </button>
                <button
                  type="button"
                  onClick={handleChatNow}
                  className="py-2.5 px-3 rounded-xl bg-white/10 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>💬 Chat Now</span>
                </button>
              </div>
            </div>
          )}

          {/* ==================== 4. EVENT STORY CONTENT ==================== */}
          {current.type === 'event' && (
            <div className="p-3.5 rounded-2xl bg-[#0F1426]/90 backdrop-blur-md border border-purple-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-white">
                  🎪 {current.metadata?.eventName || 'Dar Food Festival 2026'}
                </h4>
                <span className="text-[10px] text-purple-300 font-mono">12 Oct 2026</span>
              </div>
              <div className="p-2 rounded-xl bg-purple-500/20 text-center font-mono text-xs text-purple-200 font-bold">
                EVENT STARTS IN: 🗓️ 3 Days • ⏰ 07 Hours • ⏱️ 24 Minutes
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsEventTicketOpen(true)}
                  className="py-2.5 px-3 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>🎟️ Get Tickets</span>
                </button>
                <button
                  type="button"
                  onClick={handleChatNow}
                  className="py-2.5 px-3 rounded-xl bg-white/10 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>💬 Chat Now</span>
                </button>
              </div>
            </div>
          )}

          {/* ==================== 5. JOB STORY CONTENT ==================== */}
          {current.type === 'job' && (
            <div className="p-3.5 rounded-2xl bg-[#0F1426]/90 backdrop-blur-md border border-amber-500/30 space-y-2.5 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-sm sm:text-base text-white flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-amber-400" />
                    <span>{current.metadata?.jobTitle || 'Waiter / Waitress'}</span>
                  </h4>
                  <span className="text-[11px] text-amber-300 font-bold">
                    {current.metadata?.companyName || current.authorName} • {current.location || 'Masaki, Dar es Salaam'}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-xl bg-amber-500/20 text-amber-300 font-black text-xs border border-amber-500/30">
                  ⏱️ {current.metadata?.employmentType || 'Full Time'}
                </span>
              </div>

              {/* Salary & Deadline Banner */}
              <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-black/40 border border-white/5">
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-400 font-bold">💰 Mshahara:</span>
                  <span className="text-white font-mono font-bold">
                    {current.metadata?.isSalaryNegotiable
                      ? 'Negotiable'
                      : current.metadata?.salaryMin
                      ? `TSh ${current.metadata.salaryMin.toLocaleString()} – ${(current.metadata.salaryMax || 600000).toLocaleString()}`
                      : 'TSh 400,000 – 600,000'}
                  </span>
                </div>
                {(current.metadata?.daysRemaining ?? 13) > 0 && !current.metadata?.isClosed ? (
                  <span className="text-amber-300 text-[10px] font-black bg-amber-500/20 px-2 py-0.5 rounded">
                    ⏳ {current.metadata?.daysRemaining ?? 13} days remaining
                  </span>
                ) : (
                  <span className="text-rose-300 text-[10px] font-black bg-rose-500/20 px-2 py-0.5 rounded">
                    🔴 Applications Closed
                  </span>
                )}
              </div>

              {/* Requirements */}
              {current.metadata?.requirements && current.metadata.requirements.length > 0 && (
                <div className="space-y-1 text-xs text-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Requirements:</span>
                  <div className="grid grid-cols-2 gap-1">
                    {current.metadata.requirements.map((req, i) => (
                      <div key={i} className="flex items-center gap-1 text-[11px]">
                        <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                        <span className="truncate">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons: [📄 Apply Now] and [💬 Chat Now] */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsJobApplicationOpen(true)}
                  className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/25 active:scale-95 transition-all"
                >
                  <Briefcase className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>📄 Apply Now</span>
                </button>
                <button
                  type="button"
                  onClick={handleChatNow}
                  className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>💬 Chat Now</span>
                </button>
              </div>
            </div>
          )}

          {/* Caption */}
          <p className="text-xs sm:text-sm font-medium text-white drop-shadow-md leading-relaxed whitespace-pre-line line-clamp-3">
            {current.text}
          </p>

          {/* Social Interaction Buttons: Like, Comment, Save */}
          <div className="flex items-center justify-between text-slate-300 text-xs font-semibold pt-1 border-t border-white/10">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setIsLiked(!isLiked)}
                className="flex items-center gap-1.5 hover:text-white active:scale-95 transition-all"
              >
                <Heart
                  className={`w-4 h-4 transition-transform ${
                    isLiked ? 'text-rose-500 fill-rose-500 scale-110' : 'text-slate-300'
                  }`}
                />
                <span>{(current.likesCount || 0) + (isLiked ? 1 : 0)}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-1.5 hover:text-white active:scale-95 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{current.commentsCount || 0}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsSaved(!isSaved)}
              className={`flex items-center gap-1 transition-all ${
                isSaved ? 'text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-cyan-300' : ''}`} />
              <span>{isSaved ? 'Imehifadhiwa' : 'Hifadhi'}</span>
            </button>
          </div>

          {/* Quick Reply or Comment Input */}
          <form
            onSubmit={handleSendReply}
            className="flex items-center gap-2 pt-1"
          >
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Jibu status ya ${current.authorName}...`}
              className="flex-1 bg-black/60 backdrop-blur-md border border-white/20 focus:border-cyan-400 rounded-full px-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!replyText.trim()}
              className="p-2.5 rounded-full bg-cyan-500 text-slate-950 font-bold disabled:opacity-40 hover:bg-cyan-400 transition-colors shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Submodal: Food Order Modal */}
      <FoodOrderModal
        isOpen={isFoodOrderOpen}
        onClose={() => setIsFoodOrderOpen(false)}
        foodName={current.metadata?.foodName || 'Chicken Burger'}
        restaurantName={current.metadata?.restaurantName || 'ZEBRA RESTAURANT'}
        initialPrice={current.metadata?.offerPrice || 12000}
        onStartChatWithRestaurant={(orderMsg) => {
          if (onStartChatWithBusiness) {
            onStartChatWithBusiness(
              current.authorId,
              current.authorName,
              orderMsg,
              current.authorPhoto
            );
          }
        }}
      />

      {/* Submodal: Product Purchase Modal */}
      <ProductPurchaseModal
        isOpen={isProductPurchaseOpen}
        onClose={() => setIsProductPurchaseOpen(false)}
        productName={current.metadata?.productName || 'Nike Air Max'}
        sellerName={current.authorName}
        regularPrice={current.metadata?.regularPrice || 200000}
        salePrice={current.metadata?.salePrice || 175000}
        onStartChatWithSeller={(msg) => {
          if (onStartChatWithBusiness) {
            onStartChatWithBusiness(current.authorId, current.authorName, msg, current.authorPhoto);
          }
        }}
      />

      {/* Submodal: Event Ticket Modal */}
      <EventTicketModal
        isOpen={isEventTicketOpen}
        onClose={() => setIsEventTicketOpen(false)}
        eventName={current.metadata?.eventName || 'Dar Food Festival 2026'}
        eventDate={current.metadata?.eventDate || '12 Oct 2026'}
        eventTime={current.metadata?.eventStartTime || '08:00 PM'}
        location={current.location || 'Mlimani City, Dar es Salaam'}
        onStartChatWithOrganizer={(msg) => {
          if (onStartChatWithBusiness) {
            onStartChatWithBusiness(current.authorId, current.authorName, msg, current.authorPhoto);
          }
        }}
      />

      {/* Submodal: Job Application Modal */}
      <JobApplicationModal
        isOpen={isJobApplicationOpen}
        onClose={() => setIsJobApplicationOpen(false)}
        jobTitle={current.metadata?.jobTitle || 'Waiter / Waitress'}
        companyName={current.metadata?.companyName || current.authorName || 'Zebra Restaurant'}
        location={current.location || 'Masaki, Dar es Salaam'}
        salaryText={
          current.metadata?.isSalaryNegotiable
            ? 'Negotiable'
            : current.metadata?.salaryMin
            ? `TSh ${current.metadata.salaryMin.toLocaleString()} – ${(current.metadata.salaryMax || 600000).toLocaleString()}`
            : 'TSh 400,000 – 600,000'
        }
        currentUser={
          currentUser || {
            id: 'current_user',
            email: 'amina.juma@gmail.com',
            displayName: 'Amina Juma',
            username: 'amina_juma',
            accountType: 'personal',
            followersCount: 0,
            followingCount: 0,
            postsCount: 0,
            phone: '+255 714 892 012',
          }
        }
        onStartChatWithEmployer={(appMsg) => {
          if (onStartChatWithBusiness) {
            onStartChatWithBusiness(
              current.authorId,
              current.metadata?.companyName || current.authorName,
              appMsg,
              current.authorPhoto
            );
          }
        }}
      />
    </div>
  );
};
