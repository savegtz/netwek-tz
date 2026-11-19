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
  const activeSlide = ONBOARDING_SLIDES[currentIndex];

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
      <div className="w-full h-full flex flex-col items-center justify-center px-6 text-center bg-gradient-to-b from-[#0A1328] via-[#060B17] to-[#060B17]">
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
      className="fixed inset-0 z-[80] w-full h-[100dvh] bg-[#060B17] flex flex-col overflow-hidden select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Zenia Onboarding"
    >
      {/* Top Safe Header Bar (Spans full width cleanly) */}
      <div className="shrink-0 w-full flex items-center justify-between px-4 sm:px-6 pt-safe py-3 bg-[#060B17] z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 p-[1.5px] shrink-0">
            <div className="w-full h-full bg-[#060B17] rounded-[10px] flex items-center justify-center">
              <span className="text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 to-blue-400 font-black text-sm">
                Z
              </span>
            </div>
          </div>
          <span className="text-base font-extrabold text-white tracking-tight">Zenia</span>
          <span aria-hidden="true" className="text-slate-600 text-sm">
            ·
          </span>
          <span className="text-xs sm:text-sm font-medium text-slate-400 tabular-nums">
            {currentIndex + 1} / {ONBOARDING_SLIDES.length}
          </span>
        </div>

        {currentUser ? (
          <button
            type="button"
            onClick={() => onComplete('explore')}
            className="min-h-[44px] min-w-[44px] px-3.5 flex items-center justify-center gap-1.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/[0.08] active:scale-95 transition-all"
            aria-label="Funga mwongozo"
          >
            <X className="w-4 h-4" />
            <span>Funga</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onComplete('signin')}
            className="min-h-[44px] px-4 flex items-center justify-center rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-xs sm:text-sm font-semibold text-cyan-300 active:scale-95 transition-all"
          >
            Ingia
          </button>
        )}
      </div>

      {/* Main Content Area: Full-screen vertical on mobile/portrait; balanced 2-column stage on wide desktop landscape */}
      <div className="flex-1 min-h-0 w-full flex flex-col [@media(min-width:1024px)_and_(orientation:landscape)]:grid [@media(min-width:1024px)_and_(orientation:landscape)]:grid-cols-12 [@media(min-width:1024px)_and_(orientation:landscape)]:items-center [@media(min-width:1024px)_and_(orientation:landscape)]:max-w-6xl [@media(min-width:1024px)_and_(orientation:landscape)]:mx-auto [@media(min-width:1024px)_and_(orientation:landscape)]:px-8 [@media(min-width:1024px)_and_(orientation:landscape)]:gap-10">
        {/* Swipeable Visual Carousel */}
        <div
          className="relative flex-1 min-h-0 w-full [@media(min-width:1024px)_and_(orientation:landscape)]:col-span-7 [@media(min-width:1024px)_and_(orientation:landscape)]:h-[min(78dvh,680px)] overflow-hidden bg-[#060B17] touch-pan-y"
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
                className="w-full h-full shrink-0 flex items-center justify-center bg-[#060B17]"
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

          {/* Left/Right Navigation Chevrons for wide screens */}
          {!isFirstSlide && (
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Slaidi iliyopita"
              className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 hover:bg-black/75 border border-white/15 text-white items-center justify-center backdrop-blur-sm transition-all active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {!isLastSlide && (
            <button
              type="button"
              onClick={handleNext}
              aria-label="Slaidi inayofuata"
              className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 hover:bg-black/75 border border-white/15 text-white items-center justify-center backdrop-blur-sm transition-all active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Soft bottom gradient blend */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-[#060B17] to-transparent" />
        </div>

        {/* Bottom Thumb-Zone Dock (or Right Action Column on Desktop Landscape) */}
        <div className="shrink-0 w-full max-w-xl mx-auto bg-[#060B17] px-5 sm:px-6 pt-2 pb-6 pb-safe flex flex-col gap-3 z-20 [@media(min-width:1024px)_and_(orientation:landscape)]:col-span-5 [@media(min-width:1024px)_and_(orientation:landscape)]:max-w-none [@media(min-width:1024px)_and_(orientation:landscape)]:p-0">
          {/* Desktop Landscape Context Copy (Hidden on portrait phones since text is inside artwork) */}
          <div className="hidden [@media(min-width:1024px)_and_(orientation:landscape)]:block mb-2">
            <p className="text-xs font-semibold text-cyan-400 tracking-wide mb-2">
              {activeSlide.accentLabel}
            </p>
            <h1 className="text-3xl font-extrabold text-white tracking-tight text-balance mb-3">
              {activeSlide.title}
            </h1>
            <p className="text-base text-slate-300 leading-relaxed">
              {activeSlide.subtitle}
            </p>
          </div>

          {/* Interactive Progress Indicators */}
          <div
            className="flex items-center justify-center [@media(min-width:1024px)_and_(orientation:landscape)]:justify-start gap-2.5"
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
                    className={`h-2 rounded-full transition-all duration-200 ${
                      isActive
                        ? 'w-8 bg-cyan-400'
                        : 'w-2.5 bg-white/25 hover:bg-white/45'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Primary & Secondary CTAs */}
          {!isLastSlide ? (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-3">
                {!isFirstSlide && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Rudi nyuma"
                    className="min-h-[50px] min-w-[50px] rounded-2xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/10 text-slate-200 flex items-center justify-center active:scale-95 transition-all shrink-0"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 min-h-[50px] px-6 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all whitespace-nowrap"
                >
                  <span>Endelea</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

              {!currentUser && (
                <button
                  type="button"
                  onClick={() => onComplete('signin')}
                  className="min-h-[44px] w-full text-xs sm:text-sm font-medium text-slate-400 hover:text-cyan-300 transition-colors flex items-center justify-center [@media(min-width:1024px)_and_(orientation:landscape)]:justify-start"
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
                className="w-full min-h-[50px] px-6 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all whitespace-nowrap"
              >
                <span>Anza Kutumia Zenia</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentIndex(0)}
                className="min-h-[44px] w-full rounded-xl text-xs sm:text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                Tazama Tena Mwanzo
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => onComplete('signup')}
                className="w-full min-h-[50px] px-6 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all whitespace-nowrap"
              >
                <span>Anza Sasa — Jisajili</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
              <button
                type="button"
                onClick={() => onComplete('signin')}
                className="w-full min-h-[48px] px-5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-white font-semibold text-xs sm:text-sm transition-all active:scale-[0.98] whitespace-nowrap"
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
