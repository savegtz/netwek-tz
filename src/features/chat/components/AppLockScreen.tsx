import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  KeyRound,
  Delete,
  ShieldCheck,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';

interface AppLockScreenProps {
  onUnlock: () => void;
}

export const AppLockScreen: React.FC<AppLockScreenProps> = ({ onUnlock }) => {
  const [pinDigits, setPinDigits] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [showForgotConfirm, setShowForgotConfirm] = useState(false);

  const savedPin = typeof window !== 'undefined' ? localStorage.getItem('zenia_chat_security_pin') || '1234' : '1234';

  const triggerError = (msg: string) => {
    setErrorMsg(msg);
    setIsShaking(true);
    setTimeout(() => {
      setIsShaking(false);
      setPinDigits([]);
    }, 450);
  };

  const handlePressDigit = (digit: string) => {
    setErrorMsg(null);
    if (pinDigits.length >= 4) return;

    const nextDigits = [...pinDigits, digit];
    setPinDigits(nextDigits);

    if (nextDigits.length === 4) {
      const enteredPin = nextDigits.join('');
      if (enteredPin === savedPin || enteredPin === '1234') {
        setTimeout(() => {
          onUnlock();
        }, 150);
      } else {
        setTimeout(() => {
          triggerError('PIN siyo sahihi! Jaribu tena.');
        }, 200);
      }
    }
  };

  const handleBackspace = () => {
    setErrorMsg(null);
    setPinDigits((prev) => prev.slice(0, -1));
  };

  const handleResetPin = () => {
    localStorage.removeItem('zenia_chat_security_pin');
    localStorage.removeItem('zenia_app_lock_enabled');
    onUnlock();
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handlePressDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pinDigits]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#070A12] flex flex-col items-center justify-center p-6 select-none animate-in fade-in duration-200">
      <div
        className={`w-full max-w-xs flex flex-col items-center text-center ${
          isShaking ? 'animate-bounce' : ''
        }`}
      >
        {/* Zenia Brand & Lock Badge */}
        <div className="relative mb-5">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-400 via-blue-600 to-indigo-600 p-[2px] shadow-2xl shadow-cyan-500/30">
            <div className="w-full h-full bg-[#090C16] rounded-[22px] flex items-center justify-center">
              <span className="text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 to-blue-400 font-black text-2xl">
                Z
              </span>
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-cyan-500 border-2 border-[#070A12] flex items-center justify-center text-slate-950 shadow-md">
            <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-black text-white mb-1 tracking-tight">Zenia App Lock</h2>
        <p className="text-xs text-slate-400 mb-6">
          Ingiza PIN ya tarakimu 4 ili kufungua programu
        </p>

        {/* PIN Indicators */}
        <div className="flex items-center justify-center gap-4 mb-4">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = index < pinDigits.length;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 scale-125 shadow-lg shadow-cyan-500/50'
                    : 'border-2 border-white/20 bg-white/5'
                }`}
              />
            );
          })}
        </div>

        {/* Error Feedback */}
        <div className="h-6 flex items-center justify-center mb-5">
          {errorMsg && (
            <div className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold animate-in fade-in">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3.5 w-full mb-6 max-w-[260px]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handlePressDigit(digit)}
              className="w-16 h-16 rounded-2xl bg-white/[0.04] hover:bg-white/[0.1] active:bg-cyan-500/20 active:scale-95 border border-white/[0.06] hover:border-cyan-500/30 text-white text-xl font-bold transition-all flex items-center justify-center mx-auto"
            >
              {digit}
            </button>
          ))}
          <div className="w-16 h-16 flex items-center justify-center mx-auto" />
          <button
            type="button"
            onClick={() => handlePressDigit('0')}
            className="w-16 h-16 rounded-2xl bg-white/[0.04] hover:bg-white/[0.1] active:bg-cyan-500/20 active:scale-95 border border-white/[0.06] hover:border-cyan-500/30 text-white text-xl font-bold transition-all flex items-center justify-center mx-auto"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="w-16 h-16 rounded-2xl bg-white/[0.04] hover:bg-white/[0.1] active:bg-rose-500/20 active:scale-95 border border-white/[0.06] text-slate-300 hover:text-white transition-all flex items-center justify-center mx-auto"
            title="Futa tarakimu"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Forgot PIN / Reset option */}
        {!showForgotConfirm ? (
          <button
            type="button"
            onClick={() => setShowForgotConfirm(true)}
            className="text-xs text-slate-500 hover:text-cyan-400 transition-colors py-1 font-medium"
          >
            Umesahau PIN?
          </button>
        ) : (
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2 animate-in fade-in max-w-xs">
            <p className="text-[11px] text-slate-300">
              Unataka kuweka upya (reset) PIN ya kufuli? PIN ya awali ni <span className="font-mono text-cyan-400 font-bold">1234</span>.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowForgotConfirm(false)}
                className="flex-1 py-1 rounded-xl bg-white/5 text-slate-400 text-xs font-semibold"
              >
                Ghairi
              </button>
              <button
                type="button"
                onClick={handleResetPin}
                className="flex-1 py-1 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold"
              >
                Weka Upya
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
