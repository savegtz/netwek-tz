import React, { useState } from 'react';
import { X, Gift, Sparkles, Send, Coins, CreditCard, Check } from 'lucide-react';
import { TipDetails } from '../../../types';

interface SendTipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendTip: (tip: TipDetails) => void;
  recipientName: string;
}

const PRESET_AMOUNTS = [2000, 5000, 10000, 20000, 50000];

export const SendTipModal: React.FC<SendTipModalProps> = ({
  isOpen,
  onClose,
  onSendTip,
  recipientName,
}) => {
  const [amount, setAmount] = useState<number>(5000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [note, setNote] = useState<string>('Pesa ya kahawa / Asante kwa huduma nzuri! ☕');
  const [selectedMethod, setSelectedMethod] = useState<'wallet' | 'mpesa' | 'tigopesa'>('wallet');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = customAmount ? parseFloat(customAmount) : amount;
    if (!finalAmount || finalAmount <= 0) return;

    const tip: TipDetails = {
      id: `tip_${Date.now()}`,
      amount: finalAmount,
      currency: 'TZS',
      note: note.trim() || 'Zawadi ya kirafiki! 🎁',
      senderName: 'You',
      receiverName: recipientName,
      isOpened: false,
    };

    onSendTip(tip);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-sm bg-[#111628] border border-amber-500/30 rounded-3xl p-5 shadow-2xl animate-in zoom-in-95 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Tuma Pesa ya Chai / Zawadi</h3>
              <p className="text-[11px] text-amber-300">P2P Instant Tip kwa {recipientName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Preset Buttons */}
          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-2">
              Chagua Kiasi (TZS)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_AMOUNTS.map((val) => {
                const isSelected = amount === val && !customAmount;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      setAmount(val);
                      setCustomAmount('');
                    }}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 shadow-md scale-[1.02]'
                        : 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/5'
                    }`}
                  >
                    {val.toLocaleString()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Amount */}
          <div>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Au weka kiasi maalum (mf. 15000)..."
              className="w-full bg-[#182038] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Message Note */}
          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1">
              Ujumbe / Sababu ya Zawadi
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="mf. Asante sana kiongozi! ☕"
              className="w-full bg-[#182038] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
              Njia ya Malipo
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'wallet', name: 'Zenia Wallet', icon: Coins },
                { id: 'mpesa', name: 'M-Pesa', icon: CreditCard },
                { id: 'tigopesa', name: 'Tigo Pesa', icon: CreditCard },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMethod(m.id as any)}
                  className={`p-2 rounded-xl border text-[10px] font-semibold flex flex-col items-center gap-1 transition-all ${
                    selectedMethod === m.id
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                      : 'bg-white/[0.03] border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <m.icon className="w-3.5 h-3.5" />
                  <span>{m.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-white/10 text-slate-300 hover:text-white text-xs font-semibold"
            >
              Ghairi
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              Tuma TZS {(customAmount ? parseFloat(customAmount) || 0 : amount).toLocaleString()}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
