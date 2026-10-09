/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Printer,
  Share2,
  CheckCircle2,
  ShieldCheck,
  Download,
  Copy,
  Check,
  CreditCard,
  QrCode,
  Building,
  Lock,
} from 'lucide-react';
import { WalletTransaction } from '../../types';

interface TransactionReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: WalletTransaction | null;
}

export const TransactionReceiptModal: React.FC<TransactionReceiptModalProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !transaction) return null;

  const isPositive = transaction.amount > 0;
  const absAmount = Math.abs(transaction.amount);
  const fee = transaction.type === 'send' ? 250 : 0;
  const total = absAmount + fee;
  const refCode = `ZN-${transaction.id.replace(/[^a-zA-Z0-9]/g, '').slice(-8).toUpperCase() || 'TX892401'}`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const text = `🧾 ZENIA OFFICIAL RECEIPT\nKumbukumbu: ${refCode}\nKiasi: TZS ${absAmount.toLocaleString()}\nAina: ${transaction.title}\nTarehe: ${transaction.timestamp}\nHali: IMEKAMILIKA (COMPLETED)\nImethibitishwa na Zenia Secure Pay`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in select-none">
      <div className="relative w-full max-w-md bg-[#0D1122] border border-cyan-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in zoom-in-95">
        {/* Top Control Bar */}
        <div className="p-4 bg-[#11172D] border-b border-white/10 flex items-center justify-between z-10 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-300">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider">
                Risiti ya Muamala
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">Zenia Financial Network</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all"
              title="Chapisha / Pakua PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopySummary}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all relative"
              title="Shiriki Risiti"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-6 overflow-y-auto space-y-5 bg-gradient-to-b from-[#0D1122] via-[#0B0E1B] to-[#080B16] text-slate-200 print:text-black print:bg-white">
          {/* Receipt Watermark Header */}
          <div className="text-center space-y-1.5 pb-4 border-b border-dashed border-white/15">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-cyan-500/30">
              Z
            </div>
            <h2 className="text-base font-extrabold text-white tracking-tight pt-1">
              ZENIA FINANCIAL SERVICES
            </h2>
            <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
              <CheckCircle2 className="w-3 h-3" />
              <span>MUAMALA UMEKAMILIKA (VERIFIED)</span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-1">
              Namba ya Kumbukumbu: <span className="text-cyan-300 font-bold">{refCode}</span>
            </p>
          </div>

          {/* Amount Hero */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              {isPositive ? 'Kiasi Kilichopokelewa' : 'Kiasi Kilicholipwa'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              TZS {absAmount.toLocaleString()}
            </h1>
            <span className="text-[11px] text-cyan-400 font-mono mt-0.5 block">
              Shilingi ya Kitanzania (TZS)
            </span>
          </div>

          {/* Transaction Metadata Grid */}
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Maelezo ya Muamala:</span>
              <span className="font-semibold text-white">{transaction.title}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Mhusika (Counterparty):</span>
              <span className="font-mono font-bold text-cyan-300">
                {transaction.counterparty || '+255 754 892 012'}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Njia ya Malipo:</span>
              <span className="font-medium text-white flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
                <span>Pochi ya Zenia (M-Pesa / Tigo Pesa Gateway)</span>
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Tarehe na Saa:</span>
              <span className="font-mono text-slate-300">{transaction.timestamp}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Ada ya Muamala:</span>
              <span className="text-emerald-400 font-bold font-mono">
                {fee === 0 ? 'BURE (TZS 0)' : `TZS ${fee.toLocaleString()}`}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Kodi ya VAT (0%):</span>
              <span className="font-mono text-slate-400">TZS 0</span>
            </div>

            <div className="flex justify-between py-2 pt-3 border-t border-dashed border-white/20 text-sm">
              <span className="font-bold text-white">Jumla Iliyokatwa:</span>
              <span className="font-black text-cyan-300 font-mono">
                TZS {total.toLocaleString()}
              </span>
            </div>
          </div>

          {/* QR Code & Security Stamp */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Uthibitisho wa Dijitali</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed max-w-[200px]">
                Risiti hii imezalishwa kielektroniki na ina nguvu ya kisheria. Hakuna saini ya mkono inayohitajika.
              </p>
            </div>

            {/* Simulated Verified QR Code Block */}
            <div className="w-16 h-16 rounded-xl bg-white p-1.5 flex flex-col items-center justify-between shrink-0 shadow-lg">
              <div className="grid grid-cols-5 gap-0.5 w-full h-full">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-[1px] ${
                      i % 2 === 0 || i === 0 || i === 4 || i === 20 || i === 24 || i === 12
                        ? 'bg-slate-950'
                        : 'bg-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 bg-[#11172D] border-t border-white/10 flex gap-2.5 shrink-0 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Pakua / Chapisha Risiti</span>
          </button>
          <button
            onClick={handleCopySummary}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <Copy className="w-4 h-4" />
            <span>{copied ? 'Imenakiliwa!' : 'Nakili'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
