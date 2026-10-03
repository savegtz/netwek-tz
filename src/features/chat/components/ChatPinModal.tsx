import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  KeyRound,
  Delete,
  X,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

export type PinModalMode = 'verify' | 'create' | 'change';

interface ChatPinModalProps {
  isOpen: boolean;
  mode: PinModalMode;
  chatTitle?: string;
  onClose: () => void;
  onSuccess: () => void;
  onPinChanged?: (newPin: string) => void;
}

export const ChatPinModal: React.FC<ChatPinModalProps> = ({
  isOpen,
  mode: initialMode,
  chatTitle,
  onClose,
  onSuccess,
  onPinChanged,
}) => {
  const [currentMode, setCurrentMode] = useState<PinModalMode>(initialMode);
  const [pinDigits, setPinDigits] = useState<string[]>([]);
  const [confirmDigits, setConfirmDigits] = useState<string[]>([]);
  const [isConfirmingStep, setIsConfirmingStep] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [showForgotConfirm, setShowForgotConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentMode(initialMode);
      setPinDigits([]);
      setConfirmDigits([]);
      setIsConfirmingStep(false);
      setErrorMsg(null);
      setIsShaking(false);
      setShowForgotConfirm(false);
    }
  }, [isOpen, initialMode]);

  // Physical keyboard support
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handlePressDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, pinDigits, confirmDigits, isConfirmingStep, currentMode]);

  if (!isOpen) return null;

  const savedPin = localStorage.getItem('zenia_chat_security_pin') || '';

  const triggerError = (msg: string) => {
    setErrorMsg(msg);
    setIsShaking(true);
    setTimeout(() => {
      setIsShaking(false);
    }, 500);
  };

  const handlePressDigit = (digit: string) => {
    setErrorMsg(null);

    if (currentMode === 'verify') {
      if (pinDigits.length >= 4) return;
      const nextDigits = [...pinDigits, digit];
      setPinDigits(nextDigits);

      if (nextDigits.length === 4) {
        const enteredPin = nextDigits.join('');
        // If no PIN was ever set, default is 1234 or auto-verify
        const actualExpectedPin = savedPin || '1234';
        if (enteredPin === actualExpectedPin) {
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 150);
        } else {
          setTimeout(() => {
            triggerError('PIN siyo sahihi! Jaribu tena.');
            setPinDigits([]);
          }, 200);
        }
      }
    } else {
      // Create or Change Mode
      if (!isConfirmingStep) {
        if (pinDigits.length >= 4) return;
        const nextDigits = [...pinDigits, digit];
        setPinDigits(nextDigits);

        if (nextDigits.length === 4) {
          setTimeout(() => {
            setIsConfirmingStep(true);
          }, 200);
        }
      } else {
        if (confirmDigits.length >= 4) return;
        const nextConfirm = [...confirmDigits, digit];
        setConfirmDigits(nextConfirm);

        if (nextConfirm.length === 4) {
          const firstPin = pinDigits.join('');
          const secondPin = nextConfirm.join('');

          if (firstPin === secondPin) {
            localStorage.setItem('zenia_chat_security_pin', firstPin);
            if (onPinChanged) onPinChanged(firstPin);
            setTimeout(() => {
              onSuccess();
              onClose();
            }, 250);
          } else {
            setTimeout(() => {
              triggerError('PIN hazilingani! Weka tena.');
              setConfirmDigits([]);
            }, 200);
          }
        }
      }
    }
  };

  const handleBackspace = () => {
    setErrorMsg(null);
    if (currentMode === 'verify') {
      setPinDigits((prev) => prev.slice(0, -1));
    } else {
      if (isConfirmingStep) {
        if (confirmDigits.length === 0) {
          setIsConfirmingStep(false);
        } else {
          setConfirmDigits((prev) => prev.slice(0, -1));
        }
      } else {
        setPinDigits((prev) => prev.slice(0, -1));
      }
    }
  };

  const handleClear = () => {
    setErrorMsg(null);
    if (isConfirmingStep) {
      setConfirmDigits([]);
    } else {
      setPinDigits([]);
    }
  };

  const handleResetPin = () => {
    localStorage.removeItem('zenia_chat_security_pin');
    setCurrentMode('create');
    setIsConfirmingStep(false);
    setPinDigits([]);
    setConfirmDigits([]);
    setShowForgotConfirm(false);
    setErrorMsg(null);
  };

  const currentDisplayDigits = isConfirmingStep ? confirmDigits : pinDigits;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-xs sm:max-w-sm rounded-3xl bg-[#121626] border border-white/10 p-6 shadow-2xl text-center relative select-none ${
          isShaking ? 'animate-bounce' : ''
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Funga"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Lock Icon Header */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-3 shadow-lg shadow-cyan-500/10">
          {currentMode === 'verify' ? (
            <Lock className="w-7 h-7 stroke-[2.2]" />
          ) : (
            <KeyRound className="w-7 h-7 stroke-[2.2]" />
          )}
        </div>

        {/* Title & Description */}
        <h2 className="text-lg font-bold text-white mb-1">
          {currentMode === 'verify'
            ? 'Mazungumzo Yamefungwa'
            : isConfirmingStep
            ? 'Thibitisha PIN Yako'
            : 'Tengeneza PIN ya Meseji'}
        </h2>

        <p className="text-xs text-slate-400 mb-5 leading-relaxed px-2">
          {currentMode === 'verify'
            ? chatTitle
              ? `Weka PIN ya tarakimu 4 ili kufungua mazungumzo na "${chatTitle}".`
              : 'Weka PIN ya tarakimu 4 ili kufungua ujumbe huu.'
            : isConfirmingStep
            ? 'Weka tena PIN ile ile ili kuthibitisha usalama.'
            : 'Chagua PIN ya tarakimu 4 unayoitaka ili kulinda meseji zako dhidi ya wengine.'}
        </p>

        {/* PIN Circles Display */}
        <div className="flex items-center justify-center gap-3.5 mb-3">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = index < currentDisplayDigits.length;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 scale-125 shadow-md shadow-cyan-500/50'
                    : 'border-2 border-white/20 bg-white/5'
                }`}
              />
            );
          })}
        </div>

        {/* Error message */}
        <div className="h-6 flex items-center justify-center mb-2">
          {errorMsg && (
            <div className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold animate-in fade-in">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handlePressDigit(num)}
              className="h-13 rounded-2xl bg-white/5 hover:bg-white/15 active:scale-90 border border-white/5 text-lg font-bold text-white transition-all shadow-sm flex items-center justify-center"
            >
              {num}
            </button>
          ))}

          {/* Clear / Reset button */}
          <button
            onClick={handleClear}
            className="h-13 rounded-2xl bg-white/[0.02] hover:bg-white/10 active:scale-90 text-xs font-medium text-slate-400 hover:text-white transition-all flex items-center justify-center"
          >
            Futa
          </button>

          {/* Digit 0 */}
          <button
            onClick={() => handlePressDigit('0')}
            className="h-13 rounded-2xl bg-white/5 hover:bg-white/15 active:scale-90 border border-white/5 text-lg font-bold text-white transition-all shadow-sm flex items-center justify-center"
          >
            0
          </button>

          {/* Backspace button */}
          <button
            onClick={handleBackspace}
            className="h-13 rounded-2xl bg-white/[0.02] hover:bg-white/10 active:scale-90 text-slate-400 hover:text-white transition-all flex items-center justify-center"
            aria-label="Futa herufi moja"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
          {currentMode === 'verify' && (
            <button
              onClick={() => setShowForgotConfirm(true)}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              Umesahau PIN? (Reset / Badili PIN)
            </button>
          )}

          {currentMode !== 'verify' && isConfirmingStep && (
            <button
              onClick={() => {
                setIsConfirmingStep(false);
                setConfirmDigits([]);
              }}
              className="text-xs text-slate-400 hover:text-white font-medium"
            >
              ← Rudia kuweka PIN ya mwanzo
            </button>
          )}
        </div>

        {/* Forgot PIN Confirmation Dialog */}
        {showForgotConfirm && (
          <div className="absolute inset-0 bg-[#0D101C]/98 rounded-3xl p-5 flex flex-col items-center justify-center z-20 animate-in fade-in">
            <RotateCcw className="w-10 h-10 text-cyan-400 mb-3" />
            <h4 className="text-sm font-bold text-white mb-1">Weka Upya PIN Yako?</h4>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed text-center px-2">
              Kuweka upya kutakuruhusu kuchagua PIN mpya ya usalama mara moja.
            </p>
            <div className="flex gap-2 w-full">
              <button
                onClick={() => setShowForgotConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold"
              >
                Ghairi
              </button>
              <button
                onClick={handleResetPin}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20"
              >
                Weka PIN Mpya
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
