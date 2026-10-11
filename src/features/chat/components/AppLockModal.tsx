import React, { useState } from 'react';
import {
  X,
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  Clock,
  Check,
  AlertCircle,
  Smartphone,
  Trash2,
} from 'lucide-react';
import { ChatPinModal } from './ChatPinModal';

interface AppLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLockAppNow: () => void;
}

export const AppLockModal: React.FC<AppLockModalProps> = ({
  isOpen,
  onClose,
  onLockAppNow,
}) => {
  const [pinModalMode, setPinModalMode] = useState<'create' | 'change' | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const savedPin = typeof window !== 'undefined' ? localStorage.getItem('zenia_chat_security_pin') : null;
  const isLockEnabled = typeof window !== 'undefined' ? localStorage.getItem('zenia_app_lock_enabled') === 'true' : false;
  const autoLockTimer = typeof window !== 'undefined' ? localStorage.getItem('zenia_app_autolock_timer') || 'immediate' : 'immediate';

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleToggleEnableLock = () => {
    if (!savedPin) {
      // Need to create PIN first
      setPinModalMode('create');
      return;
    }
    const nextVal = !isLockEnabled;
    localStorage.setItem('zenia_app_lock_enabled', nextVal ? 'true' : 'false');
    showToast(nextVal ? 'Kufuli la App limewashwa! 🔒' : 'Kufuli la App limezimwa.');
  };

  const handleSetAutoLockTimer = (timer: string) => {
    localStorage.setItem('zenia_app_autolock_timer', timer);
    showToast(`Muda wa kufunga umehifadhiwa: ${timer}`);
  };

  const handleRemovePin = () => {
    localStorage.removeItem('zenia_chat_security_pin');
    localStorage.removeItem('zenia_app_lock_enabled');
    showToast('PIN imeondolewa kikamilifu.');
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
        <div className="w-full max-w-md bg-[#0F1426] border border-cyan-500/30 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-md shadow-cyan-500/20">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">App Lock (Kufuli la App)</h3>
                <p className="text-[11px] text-cyan-300">Ulinzi wa PIN kwa Zenia</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Toast */}
          {toastMsg && (
            <div className="mb-3 p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-xs flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{toastMsg}</span>
            </div>
          )}

          {/* Status Box */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  savedPin
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                {savedPin ? <ShieldCheck className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">
                  {savedPin ? 'PIN ya Usalama Imewekwa' : 'PIN Haijawekwa'}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {savedPin
                    ? isLockEnabled
                      ? 'Kufuli limewashwa kikamilifu 🔒'
                      : 'PIN ipo, gusa kuwasha kufuli'
                    : 'Weka PIN ya tarakimu 4 kulinda app'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleEnableLock}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                isLockEnabled
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-white/10 text-slate-200 hover:bg-white/15'
              }`}
            >
              {isLockEnabled ? 'Imewashwa' : 'Washa'}
            </button>
          </div>

          {/* Actions List */}
          <div className="space-y-2 mb-4">
            {/* 1. Lock App Now */}
            <button
              type="button"
              onClick={() => {
                if (!savedPin) {
                  setPinModalMode('create');
                } else {
                  onClose();
                  onLockAppNow();
                }
              }}
              className="w-full p-3 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-white flex items-center justify-between transition-all active:scale-95 group text-left"
            >
              <div className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-xs font-bold">Funga App Sasa (Lock App Now)</p>
                  <p className="text-[10px] text-cyan-300">Washa kufuli mara moja kwenye skrini</p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-bold">
                Lock 🔒
              </span>
            </button>

            {/* 2. Change / Set PIN */}
            <button
              type="button"
              onClick={() => setPinModalMode(savedPin ? 'change' : 'create')}
              className="w-full p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 text-slate-200 flex items-center justify-between transition-all active:scale-95 text-left"
            >
              <div className="flex items-center gap-2.5">
                <KeyRound className="w-4 h-4 text-indigo-400" />
                <div>
                  <p className="text-xs font-bold">
                    {savedPin ? 'Badilisha PIN (Change PIN)' : 'Weka PIN Mpya (Set PIN)'}
                  </p>
                  <p className="text-[10px] text-slate-400">Tarakimu 4 za siri</p>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-mono">••••</span>
            </button>

            {/* 3. Auto-Lock Timers */}
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Muda wa Kufunga Kiotomatiki:</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'immediate', label: 'Papo hapo' },
                  { id: '1m', label: 'Dakika 1' },
                  { id: '15m', label: 'Dakika 15' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSetAutoLockTimer(t.id)}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold text-center transition-all ${
                      autoLockTimer === t.id
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Remove PIN */}
            {savedPin && (
              <button
                type="button"
                onClick={handleRemovePin}
                className="w-full p-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 flex items-center justify-center gap-2 text-xs font-semibold transition-all active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Zima na Ondoa PIN</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pin Setup/Change Modal */}
      {pinModalMode && (
        <ChatPinModal
          isOpen={!!pinModalMode}
          mode={pinModalMode}
          chatTitle="Usalama wa Zenia App"
          onClose={() => setPinModalMode(null)}
          onSuccess={() => {
            setPinModalMode(null);
            localStorage.setItem('zenia_app_lock_enabled', 'true');
            showToast('PIN imehifadhiwa kikamilifu! 🔒');
          }}
        />
      )}
    </>
  );
};
