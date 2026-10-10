import React, { useState } from 'react';
import {
  X,
  Check,
  Sparkles,
  Layers,
  Eye,
  Sliders,
  CheckCircle2,
  Shield,
  Square,
  Circle,
  Gem,
  Camera,
} from 'lucide-react';
import { AvatarShapeStyle, UserProfile } from '../types';
import {
  AVATAR_STYLES_LIST,
  getStoredAvatarStyle,
  setStoredAvatarStyle,
  AvatarStyleDefinition,
} from '../features/profile/avatarStyles';
import { DynamicAvatar } from './DynamicAvatar';
import aminaAvatar from '../assets/images/amina_avatar_1790280951312.jpg';

interface AvatarStyleSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile | null;
  onStyleApplied?: (newStyle: AvatarShapeStyle) => void;
}

export const AvatarStyleSelectorModal: React.FC<AvatarStyleSelectorModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onStyleApplied,
}) => {
  const currentSaved = getStoredAvatarStyle();
  const [selectedStyle, setSelectedStyle] = useState<AvatarShapeStyle>(currentSaved);
  const [previewMode, setPreviewMode] = useState<'single' | 'multi'>('multi'); // default to multi so user immediately sees the multi-story feature!
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const userPhoto = currentUser?.photoURL || aminaAvatar;
  const userName = currentUser?.displayName || 'Amina Kaunga';

  const selectedDef =
    AVATAR_STYLES_LIST.find((s) => s.id === selectedStyle) || AVATAR_STYLES_LIST[0];

  const handleApply = () => {
    setStoredAvatarStyle(selectedStyle);
    if (onStyleApplied) {
      onStyleApplied(selectedStyle);
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div
        className="w-full sm:max-w-2xl bg-[#080B16] border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ============================================================== */}
        {/* 1. MODAL HEADER                                                */}
        {/* ============================================================== */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#0A0E1F]/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg text-slate-950 font-bold">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                Mtindo wa Picha ya Wasifu & Story
              </h2>
              <p className="text-xs text-slate-400">
                Chagua muonekano wa Avatar na stori unazoweka kwenye Zenia
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ============================================================== */}
        {/* 2. INTERACTIVE LIVE HERO PREVIEW STUDIO                        */}
        {/* ============================================================== */}
        <div className="px-5 py-4 bg-gradient-to-b from-[#0D1328] to-[#080B16] border-b border-white/10 shrink-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-4">
            {/* Live Interactive Avatar Rendering */}
            <div className="relative flex flex-col items-center justify-center p-3 rounded-2xl bg-[#0A0F1E] border border-white/10 shadow-inner shrink-0 min-w-[140px]">
              <DynamicAvatar
                src={userPhoto}
                fallbackText={userName}
                alt={userName}
                size="2xl"
                styleVariant={selectedStyle}
                hasStory={true}
                storyCount={previewMode === 'multi' ? 3 : 1}
                showStoryBadge={previewMode === 'multi'}
                ringGradient="from-cyan-400 via-blue-500 to-indigo-600"
              />

              <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-cyan-400 font-mono">
                <Eye className="w-3.5 h-3.5" />
                <span>Mwonekano Halisi</span>
              </div>
            </div>

            {/* Selected Style Meta & Single vs Multi Story Switcher */}
            <div className="flex-1 flex flex-col justify-between text-center sm:text-left">
              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${selectedDef.badgeColor}`}>
                    {selectedDef.badge}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    ID: {selectedDef.id}
                  </span>
                </div>
                <h3 className="text-lg font-black text-white">{selectedDef.name}</h3>
                <p className="text-xs font-semibold text-cyan-300 mb-1">
                  {selectedDef.tagline}
                </p>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {selectedDef.description}
                </p>
              </div>

              {/* Story Mode Toggle: Single vs Multi-Story Stacked */}
              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-medium">Jaribu Stori Zikiwa:</span>
                </div>
                <div className="flex items-center p-0.5 rounded-xl bg-slate-900 border border-white/10">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('single')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      previewMode === 'single'
                        ? 'bg-slate-700 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Moja tu (1)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('multi')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                      previewMode === 'multi'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md font-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>Zaidi ya Moja (3)</span>
                    <span className="px-1 py-0.2 rounded-full bg-slate-950/20 text-[9px]">Stacked</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. SCROLLABLE GRID OF ALL 10 AVATAR STYLES                     */}
        {/* ============================================================== */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5 no-scrollbar">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 mb-2">
            Mitindo Yote 10 Inayopatikana:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {AVATAR_STYLES_LIST.map((item) => {
              const isSelected = selectedStyle === item.id;
              const isSaved = currentSaved === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedStyle(item.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 group relative ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-[#0F172A] border-cyan-400 ring-1 ring-cyan-400/50 shadow-lg'
                      : 'bg-[#0B0F20] hover:bg-[#101730] border-white/[0.08] hover:border-white/20'
                  }`}
                >
                  {/* Mini Live Preview Avatar */}
                  <div className="relative shrink-0">
                    <DynamicAvatar
                      src={userPhoto}
                      fallbackText={userName}
                      alt={item.name}
                      size="story"
                      styleVariant={item.id}
                      hasStory={true}
                      storyCount={previewMode === 'multi' ? 3 : 1}
                      ringGradient="from-cyan-400 via-blue-500 to-indigo-500"
                    />
                  </div>

                  {/* Information & Tag */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="font-bold text-xs sm:text-sm text-white truncate">
                        {item.name}
                      </span>
                      {isSaved && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold shrink-0">
                          Inayotumika
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-cyan-400 truncate font-medium">
                      {item.tagline}
                    </p>
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                      {item.description}
                    </p>
                  </div>

                  {/* Radio Selection Checkmark */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-cyan-400 text-slate-950 font-black'
                        : 'border border-white/20 text-transparent group-hover:border-white/40'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ============================================================== */}
        {/* 4. MODAL FOOTER & ACTION BUTTONS                               */}
        {/* ============================================================== */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#0A0E1F] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 text-xs sm:text-sm font-semibold transition-colors"
          >
            Funga
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="flex-1 max-w-sm px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>Imehifadhiwa! ✨</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Ruhusu & Weka Huu Mtindo</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
