/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  X,
  Disc,
  Radio,
  Headphones,
  Music,
} from 'lucide-react';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { SafeImage } from './SafeImage';

export const ZeniaMiniPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    isExpanded,
    volume,
    isOpen,
    playlist,
    playTrack,
    togglePlay,
    nextTrack,
    prevTrack,
    seekTo,
    setVolume,
    setIsExpanded,
    closePlayer,
  } = useMusicPlayer();

  if (!isOpen) return null;

  const formatSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = (currentTime / (currentTrack.durationSec || 1)) * 100;

  return (
    <>
      {/* ============================================================== */}
      {/* 1. EXPANDED FULL-SCREEN / MODAL PLAYER */}
      {/* ============================================================== */}
      {isExpanded ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl animate-in fade-in select-none">
          <div className="relative w-full max-w-md bg-[#0C1022] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col justify-between max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                  <Headphones className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="text-sm font-black text-white">Zenia Beats & Podcasts</h4>
                  <p className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider">
                    {currentTrack.category} • HD Stereo Audio
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300"
                  title="Punguza (Minimize)"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={closePlayer}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300"
                  title="Funga (Close)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Album Art with spinning disc */}
            <div className="relative my-4 flex justify-center">
              <div className="relative w-56 h-56 rounded-3xl overflow-hidden shadow-2xl border-2 border-white/10 group">
                <SafeImage
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                {/* Spinning vinyl badge */}
                <div
                  className={`absolute bottom-3 right-3 w-10 h-10 rounded-full bg-black/70 border border-white/20 flex items-center justify-center text-cyan-400 ${
                    isPlaying ? 'animate-spin' : ''
                  }`}
                  style={{ animationDuration: '4s' }}
                >
                  <Disc className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Track Info */}
            <div className="text-center my-2">
              <h3 className="text-lg font-black text-white tracking-tight">{currentTrack.title}</h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">{currentTrack.artist}</p>
            </div>

            {/* Equalizer animation */}
            <div className="flex items-center justify-center gap-1 my-3 h-6">
              {[35, 75, 45, 90, 60, 80, 50, 95, 65, 40, 85, 55].map((h, i) => (
                <span
                  key={i}
                  className={`w-1 rounded-full ${
                    isPlaying
                      ? 'bg-gradient-to-t from-cyan-400 to-indigo-500 animate-pulse'
                      : 'bg-white/20'
                  }`}
                  style={{
                    height: isPlaying ? `${h}%` : '20%',
                    animationDuration: `${0.4 + (i % 3) * 0.2}s`,
                  }}
                />
              ))}
            </div>

            {/* Progress Slider */}
            <div className="space-y-1 my-2">
              <div
                className="relative h-2 rounded-full bg-white/10 overflow-hidden cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pos = (e.clientX - rect.left) / rect.width;
                  seekTo(pos * currentTrack.durationSec);
                }}
              >
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-150"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>{formatSec(currentTime)}</span>
                <span>{formatSec(currentTrack.durationSec)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-5 my-3">
              <button
                onClick={prevTrack}
                className="p-3 rounded-full bg-white/5 hover:bg-white/15 text-slate-200 transition-all active:scale-95"
                title="Iliyopita"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={togglePlay}
                className="p-4 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black shadow-xl shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all"
                title={isPlaying ? 'Sitisha' : 'Cheza'}
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
              </button>

              <button
                onClick={nextTrack}
                className="p-3 rounded-full bg-white/5 hover:bg-white/15 text-slate-200 transition-all active:scale-95"
                title="Inayofuata"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            {/* Volume slider */}
            <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-2xl my-2">
              <button onClick={() => setVolume(volume > 0 ? 0 : 75)} className="text-slate-400 hover:text-white">
                {volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="flex-1 accent-cyan-400 cursor-pointer h-1.5"
              />
              <span className="text-[10px] font-mono text-slate-400 w-8 text-right">{volume}%</span>
            </div>

            {/* Playlist Drawer */}
            <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                Orodha ya Nyimbo (Playlist)
              </span>
              <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                {playlist.map((trk) => {
                  const isCurrent = trk.id === currentTrack.id;
                  return (
                    <button
                      key={trk.id}
                      onClick={() => playTrack(trk)}
                      className={`w-full p-2 rounded-xl text-left flex items-center justify-between text-xs transition-all ${
                        isCurrent
                          ? 'bg-cyan-500/20 border border-cyan-400/40 text-cyan-300'
                          : 'bg-white/[0.02] hover:bg-white/[0.06] text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-xs">
                          {isCurrent && isPlaying ? '🔊' : '🎵'}
                        </span>
                        <div className="truncate">
                          <p className="font-bold truncate text-[11px]">{trk.title}</p>
                          <p className="text-[9px] text-slate-400 truncate">{trk.artist}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {formatSec(trk.durationSec)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ============================================================== */
        /* 2. COMPACT FLOATING MINI-PLAYER BAR (PERSISTENT ON ALL SCREENS) */
        /* ============================================================== */
        <aside
          aria-label="Kicheza Muziki cha Zenia"
          className="fixed bottom-[62px] md:bottom-6 left-2.5 right-2.5 md:left-auto md:right-6 md:w-96 z-40 bg-[#0B0F20]/95 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-xl p-2 flex items-center justify-between gap-2.5 animate-in slide-in-from-bottom-2 transition-all"
        >
          {/* Track cover & title (clickable to expand) */}
          <div
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer group"
          >
            <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-white/10">
              <SafeImage
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
              <div
                className={`absolute inset-0 bg-black/40 flex items-center justify-center text-cyan-300 ${
                  isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
              >
                <Disc className={`w-4 h-4 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h5 className="font-bold text-[11px] text-white truncate group-hover:text-cyan-300 transition-colors">
                  {currentTrack.title}
                </h5>
                <span className="px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[7.5px] font-bold uppercase shrink-0">
                  {currentTrack.category}
                </span>
              </div>
              <p className="text-[9.5px] text-slate-400 truncate leading-tight mt-0.5">
                {currentTrack.artist} • <span className="font-mono text-cyan-400">{formatSec(currentTime)}</span>
              </p>

              {/* Mini progress bar */}
              <div className="w-full h-0.5 bg-white/10 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-cyan-400 rounded-full transition-all duration-200"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={prevTrack}
              className="p-1 rounded-full hover:bg-white/10 text-slate-300 transition-all"
              title="Iliyopita"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={togglePlay}
              className="p-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all"
              title={isPlaying ? 'Sitisha' : 'Cheza'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
            </button>

            <button
              onClick={nextTrack}
              className="p-1 rounded-full hover:bg-white/10 text-slate-300 transition-all"
              title="Inayofuata"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsExpanded(true)}
              className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all"
              title="Panua (Expand)"
            >
              <Maximize2 className="w-3 h-3" />
            </button>

            <button
              onClick={closePlayer}
              className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-rose-400 transition-all"
              title="Funga"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>
      )}
    </>
  );
};
