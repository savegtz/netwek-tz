/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  category: 'music' | 'podcast' | 'radio';
  coverUrl: string;
  durationSec: number;
  bpm: number;
}

export const ZENIA_PLAYLIST: MusicTrack[] = [
  {
    id: 'tr_1',
    title: 'Kariakoo Amapiano Groove',
    artist: 'Fresh kk Beats',
    category: 'music',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
    durationSec: 214,
    bpm: 112,
  },
  {
    id: 'tr_2',
    title: 'Dar Tech & AI Creators (Ep. 14)',
    artist: 'Zenia Audio Podcast',
    category: 'podcast',
    coverUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=500&auto=format&fit=crop&q=80',
    durationSec: 340,
    bpm: 90,
  },
  {
    id: 'tr_3',
    title: 'Zanzibar Sunset Chill Lounge',
    artist: 'Swahili Coast Collective',
    category: 'music',
    coverUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80',
    durationSec: 188,
    bpm: 95,
  },
  {
    id: 'tr_4',
    title: 'Biashara & Masoko ya Kidijitali',
    artist: 'Kariakoo Business Hub Radio',
    category: 'radio',
    coverUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=500&auto=format&fit=crop&q=80',
    durationSec: 260,
    bpm: 100,
  },
];

interface MusicPlayerContextType {
  currentTrack: MusicTrack;
  isPlaying: boolean;
  currentTime: number;
  isExpanded: boolean;
  volume: number;
  isOpen: boolean;
  playlist: MusicTrack[];
  playTrack: (track: MusicTrack) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seekTo: (time: number) => void;
  setVolume: (vol: number) => void;
  setIsExpanded: (exp: boolean) => void;
  closePlayer: () => void;
  openPlayer: () => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export const MusicPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [volume, setVolumeState] = useState(75);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const synthTimerRef = useRef<any>(null);

  const currentTrack = ZENIA_PLAYLIST[currentTrackIndex];

  // Procedural Web Audio Ambient Synth Melody Generator
  const initSynth = () => {
    if (!audioCtxRef.current && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
        gainNodeRef.current = audioCtxRef.current.createGain();
        gainNodeRef.current.gain.setValueAtTime(volume / 100 * 0.12, audioCtxRef.current.currentTime);
        gainNodeRef.current.connect(audioCtxRef.current.destination);
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playChordNote = (freq: number, duration: number = 0.5) => {
    if (!audioCtxRef.current || !gainNodeRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      noteGain.gain.setValueAtTime(0, ctx.currentTime);
      noteGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05);
      noteGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(noteGain);
      noteGain.connect(gainNodeRef.current);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch {}
  };

  // Play musical pattern when playing
  useEffect(() => {
    if (isPlaying) {
      initSynth();
      const pentatonic = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25]; // C, D, E, G, A, C5
      let step = 0;
      synthTimerRef.current = setInterval(() => {
        const note = pentatonic[step % pentatonic.length];
        const bassNote = pentatonic[(step + 2) % pentatonic.length] / 2;
        playChordNote(note, 0.4);
        if (step % 2 === 0) {
          playChordNote(bassNote, 0.6);
        }
        step++;
      }, 500);
    } else {
      if (synthTimerRef.current) {
        clearInterval(synthTimerRef.current);
        synthTimerRef.current = null;
      }
    }

    return () => {
      if (synthTimerRef.current) {
        clearInterval(synthTimerRef.current);
      }
    };
  }, [isPlaying]);

  // Track progress ticker
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= currentTrack.durationSec) {
            // Next track automatically
            setCurrentTrackIndex((i) => (i + 1) % ZENIA_PLAYLIST.length);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack.durationSec]);

  // Volume update
  const setVolume = (val: number) => {
    setVolumeState(val);
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(val / 100 * 0.12, audioCtxRef.current.currentTime);
    }
  };

  const togglePlay = () => {
    initSynth();
    setIsPlaying(!isPlaying);
    setIsOpen(true);
  };

  const playTrack = (track: MusicTrack) => {
    const idx = ZENIA_PLAYLIST.findIndex((t) => t.id === track.id);
    if (idx !== -1) {
      setCurrentTrackIndex(idx);
      setCurrentTime(0);
      setIsPlaying(true);
      setIsOpen(true);
    }
  };

  const nextTrack = () => {
    setCurrentTrackIndex((i) => (i + 1) % ZENIA_PLAYLIST.length);
    setCurrentTime(0);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((i) => (i - 1 + ZENIA_PLAYLIST.length) % ZENIA_PLAYLIST.length);
    setCurrentTime(0);
  };

  const seekTo = (time: number) => {
    setCurrentTime(time);
  };

  const closePlayer = () => {
    setIsPlaying(false);
    setIsOpen(false);
  };

  const openPlayer = () => {
    setIsOpen(true);
  };

  return (
    <MusicPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        isExpanded,
        volume,
        isOpen,
        playlist: ZENIA_PLAYLIST,
        playTrack,
        togglePlay,
        nextTrack,
        prevTrack,
        seekTo,
        setVolume,
        setIsExpanded,
        closePlayer,
        openPlayer,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within MusicPlayerProvider');
  }
  return context;
};
