import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Users,
  X,
} from 'lucide-react';
import { UserProfile } from '../../types';

interface OnboardingSlide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  accentLabel: string;
  fallbackIcon: 'network' | 'commerce' | 'ai';
}

const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 'super-app',
    image: '/assets/aistudio/image_420a8490.png',
    title: 'Connect • Create Discover • Earn',
    subtitle: 'Mawasiliano, biashara, malipo na huduma zote mahali pamoja.',
    accentLabel: 'Zenia Super-App',
    fallbackIcon: 'network',
  },
  {
    id: 'marketplace-wallet',
    image: '/assets/aistudio/image_89fb2067.png',
    title: 'Soko, Malipo & Usafiri',
    subtitle: 'Nunua bidhaa, tuma pesa kwenye Zenia Wallet, na omba usafiri kwa haraka.',
    accentLabel: 'Huduma za Kila Siku',
    fallbackIcon: 'commerce',
  },
  {
    id: 'zenia-ai',
    image: '/assets/aistudio/image_c555ba90.png',
    title: 'Msaidizi Mahiri wa Zenia AI',
    subtitle: 'Simu za HD, Status za saa 24, ajira na msaidizi wa AI kurahisisha maisha yako.',
    accentLabel: 'Teknolojia ya Kisasa',
    fallbackIcon: 'ai',
  },
];

interface MobileOnboardingViewProps {
  isOpen: boolean;
  currentUser: UserProfile | null;
  onComplete: (action?: 'explore' | 'signin' | 'signup') => void;
}

export const MobileOnboardingView: React.FC<MobileOnboardingViewProps> = ({
  isOpen,
  currentUser,
  onComplete,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [dragOffset, setDragOffset] = useState(0);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const isHorizontalSwipeRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setDragOffset(0);
    }
  }, [isOpen]);

  // Keyboard navigation support
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => Math.min(ONBOARDING_SLIDES.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'Escape' && currentUser) {
        onComplete('explore');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentUser, onComplete]);

  if (!isOpen) return null;

  const isLastSlide = currentIndex === ONBOARDING_SLIDES.length - 1;
  const isFirstSlide = currentIndex === 0;

  const handleNext = () => {
    if (!isLastSlide) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onComplete(currentUser ? 'explore' : 'signup');
    }
  };

  const handlePrev = () => {
    if (!isFirstSlide) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    isHorizontalSwipeRef.current = null;
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const dx = e.touches[0].clientX - touchStartXRef.current;
    const dy = e.touches[0].clientY - touchStartYRef.current;

    if (isHorizontalSwipeRef.current === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      isHorizontalSwipeRef.current = Math.abs(dx) > Math.abs(dy);
    }

    if (isHorizontalSwipeRef.current) {
      // Dampen pull at edges
      if ((isFirstSlide && dx > 0) || (isLastSlide && dx < 0)) {
        setDragOffset(dx * 0.25);
      } else {
        setDragOffset(dx);
      }
    }
  };

  const handleTouchEnd = () => {
    if (isHorizontalSwipeRef.current) {
      if (dragOffset < -48 && !isLastSlide) {
        setCurrentIndex((prev) => prev + 1);
      } else if (dragOffset > 48 && !isFirstSlide) {
        setCurrentIndex((prev) => prev - 1);
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
    isHorizontalSwipeRef.current = null;
    setDragOffset(0);
  };

  const renderFallbackArtwork = (slide: OnboardingSlide) => {
    const Icon =
      slide.fallbackIcon === 'network'
        ? Users
        : slide.fallbackIcon === 'commerce'
        ? ShoppingBag
        : Sparkles;
    return (
      <div className="w-full h-full flex flex-col items-center justify-center px-7 text-center bg-gradient-to-b from-[#0A1328] via-[#060B17] to-[#060B17]">
        <div className="w-24 h-24 rounded-3xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center mb-8 shadow-lg shadow-cyan-500/10">
          <Icon className="w-11 h-11 text-cyan-400" />
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight text-balance mb-3">
          {slide.title}
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed max-w-xs">
          {slide.subtitle}
        </p>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[80] bg-[#040710] flex items-center justify-center overflow-hidden select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Zenia Onboarding"
    >
      {/* Mobile-First Stage: Edge-to-edge on mobile, crisp 430px phone frame on desktop */}
      <div className="relative w-full h-[100dvh] md:max-w-[430px] md:h-[min(860px,94dvh)] md:rounded-[36px] md:border md:border-white/10 md:shadow-[0_32px_90px_rgba(0,0,0,0.85)] bg-[#060B17] flex flex-col overflow-hidden">
        {/* Top Compact Safe Header Bar */}
        <div className="shrink-0 flex items-center justify-between px-4 pt-safe py-2.5 bg-[#060B17] z-20">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-400 to-blue-600 p-[1.5px] shrink-0">
              <div className="w-full h-full bg-[#060B17] rounded-[6px] flex items-center justify-center">
                <span className="text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 to-blue-400 font-black text-xs">
                  Z
                </span>
              </div>
            </div>
            <span className="text-sm font-bold text-white tracking-tight">Zenia</span>
            <span aria-hidden="true" className="text-slate-600 text-xs">
              ·
            </span>
            <span className="text-xs font-medium text-slate-400 tabular-nums">
              {currentIndex + 1} / {ONBOARDING_SLIDES.length}
            </span>
          </div>

          {currentUser ? (
            <button
              type="button"
              onClick={() => onComplete('explore')}
              className="min-h-[44px] min-w-[44px] px-3 flex items-center justify-center gap-1 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.06] active:scale-95 transition-all"
              aria-label="Funga mwongozo"
            >
              <X className="w-4 h-4" />
              <span>Funga</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onComplete('signin')}
              className="min-h-[44px] px-3.5 flex items-center justify-center rounded-xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-cyan-300 active:scale-95 transition-all"
            >
              Ingia
            </button>
          )}
        </div>

        {/* Swipeable Visual Slide Track */}
        <div
          className="relative flex-1 min-h-0 overflow-hidden bg-[#060B17] touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className={`flex h-full w-full ${
              dragOffset === 0 ? 'transition-transform duration-300 ease-out' : ''
            }`}
            style={{
              transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`,
            }}
          >
            {ONBOARDING_SLIDES.map((slide) => (
              <div
                key={slide.id}
                className="w-full h-full shrink-0 flex items-center justify-center bg-[#060B17] px-2"
              >
                {failedImages[slide.id] ? (
                  renderFallbackArtwork(slide)
                ) : (
                  <img
                    src={slide.image}
                    alt={`${slide.title} — ${slide.subtitle}`}
                    referrerPolicy="no-referrer"
                    draggable={false}
                    onError={() =>
                      setFailedImages((prev) => ({ ...prev, [slide.id]: true }))
                    }
                    className="w-full h-full max-h-full object-contain object-center select-none"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Subtle Desktop/Tablet Arrow Affordances */}
          {!isFirstSlide && (
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Slaidi iliyopita"
              className="hidden sm:flex absolute left-2.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/45 hover:bg-black/70 border border-white/10 text-white items-center justify-center backdrop-blur-sm transition-all active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {!isLastSlide && (
            <button
              type="button"
              onClick={handleNext}
              aria-label="Slaidi inayofuata"
              className="hidden sm:flex absolute right-2.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/45 hover:bg-black/70 border border-white/10 text-white items-center justify-center backdrop-blur-sm transition-all active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Soft bottom gradient blend into action dock */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-5 bg-gradient-to-t from-[#060B17] to-transparent" />
        </div>

        {/* Bottom Thumb-Zone Action Dock */}
        <div className="shrink-0 bg-[#060B17] px-5 pt-2 pb-5 pb-safe flex flex-col gap-3 z-20">
          {/* Interactive Progress Indicators */}
          <div
            className="flex items-center justify-center gap-2"
            role="tablist"
            aria-label="Hatua za maelezo"
          >
            {ONBOARDING_SLIDES.map((slide, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Slaidi ya ${idx + 1}: ${slide.accentLabel}`}
                  onClick={() => setCurrentIndex(idx)}
                  className="py-2 px-1 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-full"
                >
                  <span
                    className={`h-1.5 rounded-full transition-all duration-200 ${
                      isActive
                        ? 'w-7 bg-cyan-400'
                        : 'w-2 bg-white/20 hover:bg-white/40'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Primary & Secondary CTAs */}
          {!isLastSlide ? (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2.5">
                {!isFirstSlide && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Rudi nyuma"
                    className="min-h-[48px] min-w-[48px] rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-slate-200 flex items-center justify-center active:scale-95 transition-all shrink-0"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 min-h-[48px] px-5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all whitespace-nowrap"
                >
                  <span>Endelea</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

              {!currentUser && (
                <button
                  type="button"
                  onClick={() => onComplete('signin')}
                  className="min-h-[44px] w-full text-xs font-medium text-slate-400 hover:text-cyan-300 transition-colors flex items-center justify-center"
                >
                  Tayari una akaunti? <span className="text-cyan-400 font-semibold ml-1">Ingia</span>
                </button>
              )}
            </div>
          ) : currentUser ? (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => onComplete('explore')}
                className="w-full min-h-[48px] px-5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all whitespace-nowrap"
              >
                <span>Anza Kutumia Zenia</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentIndex(0)}
                className="min-h-[44px] w-full rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                Tazama Tena Mwanzo
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => onComplete('signup')}
                className="w-full min-h-[48px] px-5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all whitespace-nowrap"
              >
                <span>Anza Sasa — Jisajili</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
              <button
                type="button"
                onClick={() => onComplete('signin')}
                className="w-full min-h-[44px] px-4 rounded-2xl bg-white/[0.07] hover:bg-white/[0.13] border border-white/10 text-white font-semibold text-xs transition-all active:scale-[0.98] whitespace-nowrap"
              >
                Tayari Nina Akaunti — Ingia
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
