import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Layers,
  CheckCircle2,
  Check,
  Eye,
  Shapes,
} from 'lucide-react';
import { AvatarShapeStyle, UserProfile } from '../types';
import {
  AVATAR_STYLES_LIST,
  getStoredAvatarStyle,
  setStoredAvatarStyle,
} from '../features/profile/avatarStyles';
import { DynamicAvatar } from './DynamicAvatar';
import aminaAvatar from '../assets/images/amina_avatar_1790280951312.jpg';

interface AvatarShapeShowcaseStudioProps {
  currentUser?: UserProfile | null;
  onStyleChanged?: (style: AvatarShapeStyle) => void;
  className?: string;
  compact?: boolean;
}

export const AvatarShapeShowcaseStudio: React.FC<AvatarShapeShowcaseStudioProps> = ({
  currentUser,
  onStyleChanged,
  className = '',
  compact = false,
}) => {
  const [activeStyle, setActiveStyle] = useState<AvatarShapeStyle>(() => getStoredAvatarStyle());
  const [previewMode, setPreviewMode] = useState<'single' | 'multi'>('multi');
  const [justAppliedId, setJustAppliedId] = useState<string | null>(null);

  useEffect(() => {
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
  }, []);

  const userPhoto = currentUser?.photoURL || aminaAvatar;
  const userName = currentUser?.displayName || 'Amina Kaunga';

  const handleSelectStyle = (styleId: AvatarShapeStyle) => {
    setStoredAvatarStyle(styleId);
    setActiveStyle(styleId);
    setJustAppliedId(styleId);
    if (onStyleChanged) {
      onStyleChanged(styleId);
    }
    setTimeout(() => {
      setJustAppliedId(null);
    }, 1500);
  };

  return (
    <div
      className={`w-full rounded-3xl border border-cyan-500/20 bg-gradient-to-b from-[#0B1024] to-[#070A14] p-4 sm:p-5 shadow-xl select-none ${className}`}
    >
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 shadow-md shrink-0">
            <Shapes className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black text-white tracking-tight">
                Studio ya Maumbo ya Avatar & Story
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                10 Mitindo
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Chagua umbo la picha ya wasifu wako na muonekano wa stori za 1:1 zenye kona laini.
            </p>
          </div>
        </div>

        {/* Story Count Toggle: Single vs Multi Stacked */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-black/40 p-1 rounded-2xl border border-white/10 shrink-0">
          <span className="text-[10px] text-slate-400 px-1.5 font-medium flex items-center gap-1">
            <Layers className="w-3 h-3 text-cyan-400" />
            <span>Ona Stori:</span>
          </span>
          <button
            type="button"
            onClick={() => setPreviewMode('single')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
              previewMode === 'single'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            1 Tu
          </button>
          <button
            type="button"
            onClick={() => setPreviewMode('multi')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              previewMode === 'multi'
                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>3 Stacked</span>
            <span className="text-[9px] px-1 rounded-full bg-slate-950/20">Tabaka</span>
          </button>
        </div>
      </div>

      {/* Grid / Horizontal Showcase of All 10 Avatar Styles */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
        {AVATAR_STYLES_LIST.map((styleItem) => {
          const isCurrentActive = activeStyle === styleItem.id;
          const isJustApplied = justAppliedId === styleItem.id;

          return (
            <div
              key={styleItem.id}
              onClick={() => handleSelectStyle(styleItem.id)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group relative ${
                isCurrentActive
                  ? 'bg-gradient-to-br from-cyan-950/50 via-[#0E152E] to-[#0A0F22] border-cyan-400 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-400/50'
                  : 'bg-[#0B0F22]/80 hover:bg-[#111736] border-white/[0.08] hover:border-white/20'
              }`}
            >
              <div className="flex items-start gap-3.5">
                {/* Visual Avatar in this Exact Shape */}
                <div className="relative shrink-0">
                  <DynamicAvatar
                    src={userPhoto}
                    fallbackText={userName}
                    alt={styleItem.name}
                    size="story"
                    styleVariant={styleItem.id}
                    hasStory={true}
                    storyCount={previewMode === 'multi' ? 3 : 1}
                    showStoryBadge={previewMode === 'multi'}
                    ringGradient="from-cyan-400 via-blue-500 to-indigo-500"
                  />
                  {isCurrentActive && (
                    <div className="absolute -bottom-1 -left-1 w-4.5 h-4.5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-md ring-2 ring-[#080B16] z-30">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                    <span className="font-bold text-xs sm:text-sm text-white truncate">
                      {styleItem.name}
                    </span>
                    <span
                      className={`text-[9px] px-2 py-0.2 rounded-full font-bold ${styleItem.badgeColor}`}
                    >
                      {styleItem.badge}
                    </span>
                  </div>

                  <p className="text-[11px] font-semibold text-cyan-400 truncate mb-1">
                    {styleItem.swahiliTitle}
                  </p>

                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                    {styleItem.description}
                  </p>
                </div>
              </div>

              {/* Bottom Action Row */}
              <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-400 font-mono">
                  {styleItem.tagline}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectStyle(styleItem.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 ${
                    isCurrentActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-xs'
                      : isJustApplied
                      ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                      : 'bg-white/10 hover:bg-cyan-500 hover:text-slate-950 text-white border border-white/10'
                  }`}
                >
                  {isCurrentActive ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Umetumika Sasa ✅</span>
                    </>
                  ) : isJustApplied ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Imewekwa!</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400 group-hover:text-slate-950" />
                      <span>Ruhusu & Weka Huu Mtindo</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
