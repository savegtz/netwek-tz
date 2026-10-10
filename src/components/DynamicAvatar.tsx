import React, { useState, useEffect } from 'react';
import { AvatarShapeStyle } from '../types';
import {
  getStoredAvatarStyle,
  getAvatarStyleDef,
  AvatarStyleDefinition,
} from '../features/profile/avatarStyles';
import { SafeImage } from './SafeImage';

export interface DynamicAvatarProps {
  src?: string;
  fallbackText?: string;
  alt?: string;
  size?: 'mini' | 'sm' | 'md' | 'story' | 'lg' | 'xl' | '2xl' | number;
  styleVariant?: AvatarShapeStyle;
  hasStory?: boolean;
  storyCount?: number; // > 1 activates the multi-story stacked effect!
  isUnread?: boolean;
  ringGradient?: string;
  className?: string;
  showOnline?: boolean;
  showStoryBadge?: boolean;
  onClick?: () => void;
  title?: string;
}

const SIZE_MAP: Record<string, { outer: string; inner: string; px: number }> = {
  mini: { outer: 'w-8 h-8', inner: 'w-7 h-7', px: 32 },
  sm: { outer: 'w-9 h-9', inner: 'w-7.5 h-7.5', px: 36 },
  md: { outer: 'w-12 h-12', inner: 'w-10 h-10', px: 48 },
  story: { outer: 'w-20 h-20 sm:w-[88px] sm:h-[88px]', inner: 'w-[72px] h-[72px] sm:w-[80px] sm:h-[80px]', px: 84 },
  'story-lg': { outer: 'w-24 h-24 sm:w-28 sm:h-28', inner: 'w-[86px] h-[86px] sm:w-[102px] sm:h-[102px]', px: 100 },
  lg: { outer: 'w-16 h-16', inner: 'w-14 h-14', px: 64 },
  xl: { outer: 'w-20 h-20 sm:w-24 sm:h-24', inner: 'w-18 h-18 sm:w-21 sm:h-21', px: 88 },
  '2xl': { outer: 'w-28 h-28 sm:w-32 sm:h-32', inner: 'w-24 h-24 sm:w-28 sm:h-28', px: 112 },
};

export const DynamicAvatar: React.FC<DynamicAvatarProps> = ({
  src,
  fallbackText = 'User',
  alt = 'Avatar',
  size = 'md',
  styleVariant,
  hasStory = false,
  storyCount = 1,
  isUnread = true,
  ringGradient = 'from-cyan-400 via-blue-500 to-indigo-600',
  className = '',
  showOnline = false,
  showStoryBadge = false,
  onClick,
  title,
}) => {
  // Listen for global style changes if no direct override is given
  const [activeStyle, setActiveStyle] = useState<AvatarShapeStyle>(
    styleVariant || getStoredAvatarStyle()
  );

  useEffect(() => {
    if (styleVariant) {
      setActiveStyle(styleVariant);
      return;
    }

    const handleStyleChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ style: AvatarShapeStyle }>;
      if (customEvent.detail?.style) {
        setActiveStyle(customEvent.detail.style);
      }
    };

    window.addEventListener('zenia_avatar_style_changed', handleStyleChange);
    return () => {
      window.removeEventListener('zenia_avatar_style_changed', handleStyleChange);
    };
  }, [styleVariant]);

  const styleDef: AvatarStyleDefinition = getAvatarStyleDef(activeStyle);
  const isMultiStory = hasStory && storyCount > 1;

  // Determine sizing class or inline pixel styles
  const sizeConfig = typeof size === 'string' ? SIZE_MAP[size] || SIZE_MAP.md : null;
  const customPx = typeof size === 'number' ? size : sizeConfig?.px || 48;

  // Render Segmented SVG Ring for Multi-Story status only on classic circular avatars
  const renderSegmentedRing = () => {
    if (!hasStory || activeStyle !== 'circle') return null;

    const count = Math.min(Math.max(storyCount, 1), 10);
    if (count <= 1) return null;

    // SVG parameters
    const svgSize = customPx + 10;
    const center = svgSize / 2;
    const radius = customPx / 2 + 2;
    const circumference = 2 * Math.PI * radius;
    const gap = 6; // gap in px between segments
    const segmentLength = (circumference - count * gap) / count;

    return (
      <svg
        className="absolute inset-0 -m-[5px] pointer-events-none z-10 animate-spin-slow-subtle"
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="url(#story-gradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={`${segmentLength} ${gap}`}
        />
        <defs>
          <linearGradient id="story-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#818CF8" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  const sizeClasses = sizeConfig ? sizeConfig.outer : 'w-12 h-12';

  return (
    <div
      onClick={onClick}
      title={title || alt}
      className={`relative inline-flex items-center justify-center shrink-0 ${sizeClasses} ${
        onClick ? 'cursor-pointer active:scale-95 transition-transform' : ''
      } ${className}`}
      style={
        typeof size === 'number'
          ? { width: customPx, height: customPx }
          : undefined
      }
    >
      {/* ============================================================== */}
      {/* MULTI-STORY STACKED BACKGROUND EFFECT (ZAIDI YA MOJA)           */}
      {/* Layered asymmetrical cards matching the reference design!      */}
      {/* ============================================================== */}
      {isMultiStory && (
        <>
          {/* Deepest Stack Layer 3 (if 3+ stories) */}
          {storyCount >= 3 && (
            <div
              className={`absolute inset-0 pointer-events-none transition-all duration-300 opacity-40 ${
                styleDef.backdropLayerClass || 'bg-cyan-500/30'
              }`}
              style={{
                ...styleDef.backdropLayerStyle,
                transform: 'rotate(-10deg) scale(0.97) translate(-3px, 2px)',
                clipPath: styleDef.clipPath,
              }}
            />
          )}

          {/* Secondary Stack Layer 2 (Asymmetrical offset layer) */}
          <div
            className={`absolute inset-0 pointer-events-none transition-all duration-300 shadow-md ${
              styleDef.backdropLayerClass || 'bg-gradient-to-tr from-cyan-500/50 via-blue-600/40 to-indigo-600/50'
            }`}
            style={{
              ...styleDef.backdropLayerStyle,
              clipPath: styleDef.clipPath,
            }}
          />
        </>
      )}

      {/* Segmented Story Border Ring if multi-story */}
      {renderSegmentedRing()}

      {/* ============================================================== */}
      {/* MAIN AVATAR CONTAINER & OUTER FRAME                           */}
      {/* ============================================================== */}
      <div
        className={`relative w-full h-full p-[2.5px] transition-all duration-300 ${
          styleDef.outerRadiusClass
        } ${
          hasStory
            ? `bg-gradient-to-tr ${ringGradient} shadow-md`
            : activeStyle === '3d-glass'
            ? 'bg-white/10 backdrop-blur-md border border-white/30 shadow-lg'
            : activeStyle === 'polaroid'
            ? 'bg-white dark:bg-slate-800 p-1 pb-3 shadow-lg border border-slate-200 dark:border-white/10 rotate-1'
            : activeStyle === 'double-ring'
            ? 'bg-gradient-to-tr from-cyan-400 to-blue-600 p-[3px] ring-2 ring-[#080B16] ring-offset-2 ring-offset-cyan-500/40'
            : 'bg-slate-800 ring-1 ring-white/10'
        }`}
        style={{
          ...styleDef.customStyle,
          clipPath: styleDef.clipPath,
        }}
      >
        {/* Inner Border / Backdrop gap */}
        <div
          className={`w-full h-full overflow-hidden transition-all duration-300 bg-[#080B16] flex items-center justify-center ${
            styleDef.innerRadiusClass
          }`}
          style={{
            ...styleDef.customInnerStyle,
            clipPath: styleDef.clipPath,
          }}
        >
          {/* Main Photo with safe full-face preservation */}
          <SafeImage
            src={src}
            fallbackText={fallbackText}
            alt={alt}
            className="w-full h-full object-cover object-center select-none"
          />
        </div>

        {/* 3D Glass Specular Reflection Highlight */}
        {activeStyle === '3d-glass' && (
          <div
            className="absolute inset-0 pointer-events-none rounded-[inherit] bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-60"
            style={styleDef.customStyle}
          />
        )}
      </div>

      {/* ============================================================== */}
      {/* MULTI-STORY COUNT BADGE (e.g. "2" au "3+")                     */}
      {/* ============================================================== */}
      {isMultiStory && showStoryBadge && (
        <div
          className="absolute -top-1 -right-1 z-20 px-1.5 py-0.5 min-w-[18px] h-[18px] rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-[10px] font-black text-slate-950 flex items-center justify-center shadow-md ring-2 ring-[#080B16] leading-none"
          title={`${storyCount} Stories zilizopo`}
        >
          {storyCount}
        </div>
      )}

      {/* Online Status Indicator */}
      {showOnline && (
        <span
          className="absolute bottom-0 right-0 z-20 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-[#080B16] shadow-sm"
          title="Yupo Mtandaoni"
        />
      )}
    </div>
  );
};
