import React, { useState, useEffect } from 'react';
import {
  X,
  HelpCircle,
  Trophy,
  Clock,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { UserProfile } from '../../../types';

interface QuizAnswerModalProps {
  isOpen: boolean;
  onClose: () => void;
  question?: string;
  options?: string[];
  correctIndex?: number;
  timeSeconds?: number;
  points?: number;
  currentUser: UserProfile;
  onAnswerSubmitted?: (isCorrect: boolean, selectedIdx: number) => void;
}

export const QuizAnswerModal: React.FC<QuizAnswerModalProps> = ({
  isOpen,
  onClose,
  question = 'Tanzania ilipata Uhuru mwaka gani?',
  options = ['1961', '1962', '1963', '1964'],
  correctIndex = 0,
  timeSeconds = 30,
  points = 10,
  currentUser,
  onAnswerSubmitted,
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(0);
  const [timeLeft, setTimeLeft] = useState(timeSeconds);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    if (!isOpen || isAnswered) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, isAnswered]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIdx === null) return;
    const correct = selectedIdx === correctIndex;
    setIsCorrect(correct);
    setIsAnswered(true);
    if (onAnswerSubmitted) {
      onAnswerSubmitted(correct, selectedIdx);
    }
  };

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-lg bg-[#07131B] border-t sm:border border-teal-500/30 rounded-t-[32px] sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95">
        {/* Header matching Screenshot 3 */}
        <div className="p-4 bg-[#0A1B28] border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              <Lightbulb className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-teal-400 block">
                QUIZ CHALLENGE
              </span>
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                Jaribu Ufahamu Wako (Trivia Quiz)
              </h3>
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
          {/* Question Banner matching Screenshot 3 */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#091D2C] border border-teal-500/30 space-y-3 text-center shadow-lg">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-300 text-xs font-black">
              <Lightbulb className="w-3.5 h-3.5 fill-yellow-400" />
              <span>QUIZ TIME</span>
            </div>

            <h4 className="text-base sm:text-lg font-black text-white leading-snug">
              {question}
            </h4>

            {/* Time & Points indicators */}
            <div className="flex items-center justify-center gap-6 pt-1 text-xs font-mono font-bold">
              <span className="flex items-center gap-1.5 text-yellow-400">
                <Clock className="w-4 h-4" />
                <span>{timeLeft} seconds</span>
              </span>
              <span className="flex items-center gap-1.5 text-amber-300">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>+{points} points</span>
              </span>
            </div>
          </div>

          {/* Options List matching Screenshot 3 */}
          {!isAnswered ? (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-2.5">
                {options.map((opt, idx) => {
                  const isSelected = selectedIdx === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedIdx(idx)}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-md shadow-emerald-500/20'
                          : 'bg-[#0A1F30] border-white/10 hover:border-white/20 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                            isSelected
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-white/10 text-slate-300'
                          }`}
                        >
                          {optionLetters[idx]}
                        </span>
                        <span className="font-bold text-sm">{opt}</span>
                      </div>

                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-md">
                          <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit Button matching Screenshot 3 */}
              <button
                type="submit"
                disabled={selectedIdx === null || timeLeft === 0}
                className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 active:scale-95 transition-all mt-2"
              >
                <span>🧠 Submit Answer</span>
              </button>
            </form>
          ) : (
            /* Result Feedback Screen */
            <div className="p-4 text-center space-y-4 animate-in fade-in">
              <div
                className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto shadow-lg ${
                  isCorrect
                    ? 'bg-emerald-500/20 text-emerald-400 shadow-emerald-500/20'
                    : 'bg-rose-500/20 text-rose-400 shadow-rose-500/20'
                }`}
              >
                {isCorrect ? <Trophy className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
              </div>

              <div>
                <span
                  className={`text-[11px] font-black uppercase tracking-widest block ${
                    isCorrect ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isCorrect ? 'HONGERA SANA! 🎉' : 'POLE, JIBU SIO SAHIHI! ❌'}
                </span>
                <h4 className="text-xl font-black text-white mt-1">
                  {isCorrect ? `Umepata Alama +${points} Points!` : 'Usikate tamaa, jaribu tena!'}
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Jibu sahihi ni: <strong>{options[correctIndex]}</strong>. (Tanzania ilipata uhuru tarehe 9 Desemba 1961).
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#091D2C] border border-white/5 text-xs text-slate-300 space-y-1">
                <p>👤 Mshiriki: <strong>{currentUser.displayName}</strong></p>
                <p>⏱️ Muda uliotumika: <strong>{timeSeconds - timeLeft}s</strong></p>
                <p>🏆 Jumla ya Points zilizoongezwa: <strong className="text-emerald-400">+{isCorrect ? points : 0} pts</strong></p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs active:scale-95 transition-all"
              >
                Sawa, Endelea na Status Nyingine
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
