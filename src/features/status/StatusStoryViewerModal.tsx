import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  Send,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Share2,
} from 'lucide-react';
import { StatusItem } from '../../types';
import { SafeImage } from '../../components/SafeImage';

interface StatusStoryViewerModalProps {
  isOpen: boolean;
  statuses: StatusItem[];
  initialIndex?: number;
  onClose: () => void;
  onReply?: (status: StatusItem, replyText: string) => void;
}

export const StatusStoryViewerModal: React.FC<StatusStoryViewerModalProps> = ({
  isOpen,
  statuses,
  initialIndex = 0,
  onClose,
  onReply,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setProgress(0);
      setIsLiked(false);
      setReplyText('');
    }
  }, [isOpen, initialIndex]);

  // Story progression timer (5 seconds per story)
  useEffect(() => {
    if (!isOpen || isPaused || statuses.length === 0) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < statuses.length - 1) {
            setCurrentIndex((idx) => idx + 1);
            return 0;
          } else {
            clearInterval(interval);
            onClose();
            return 100;
          }
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, currentIndex, isPaused, statuses.length, onClose]);

  if (!isOpen || statuses.length === 0) return null;

  const current = statuses[currentIndex] || statuses[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
      setIsLiked(false);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex < statuses.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
      setIsLiked(false);
    } else {
      onClose();
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    if (onReply) {
      onReply(current, replyText);
    }
    setReplyText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-sm h-full max-h-[640px] sm:rounded-3xl overflow-hidden bg-slate-950 border border-white/10 shadow-2xl flex flex-col justify-between select-none"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Full Media Image */}
        <div className="absolute inset-0 z-0">
          <SafeImage
            src={current.mediaUrl}
            fallbackGradient="from-cyan-900 to-indigo-950"
            alt={current.text}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-transparent to-black/85" />
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
                <h4 className="font-bold text-sm text-white drop-shadow leading-tight">
                  {current.authorName}
                </h4>
                <p className="text-[11px] text-slate-300 drop-shadow">
                  {current.createdAt}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/40 text-slate-300 hover:text-white hover:bg-black/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
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

        {/* Bottom Caption & Reply Bar */}
        <div className="relative z-20 p-4 space-y-3">
          {current.location && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs text-white">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>{current.location}</span>
            </div>
          )}

          <p className="text-sm font-semibold text-white drop-shadow-md leading-relaxed">
            {current.text}
          </p>

          <form
            onSubmit={handleSendReply}
            className="flex items-center gap-2 pt-1"
          >
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Jibu status ya ${current.authorName}...`}
              className="flex-1 bg-black/60 backdrop-blur-md border border-white/20 focus:border-cyan-400 rounded-full px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setIsLiked(!isLiked)}
              className={`p-2.5 rounded-full backdrop-blur-md border transition-all ${
                isLiked
                  ? 'bg-rose-500/20 border-rose-500 text-rose-500 scale-110'
                  : 'bg-black/60 border-white/20 text-white hover:text-rose-400'
              }`}
            >
              <Heart
                className={`w-4 h-4 ${isLiked ? 'fill-rose-500' : ''}`}
              />
            </button>
            <button
              type="submit"
              disabled={!replyText.trim()}
              className="p-2.5 rounded-full bg-cyan-500 text-slate-950 font-bold disabled:opacity-40 hover:bg-cyan-400 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
