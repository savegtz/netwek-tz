import React, { useState } from 'react';
import {
  Receipt,
  CheckCircle2,
  Clock,
  CreditCard,
  Smartphone,
  ShieldCheck,
  Download,
  Share2,
  X,
  Sparkles,
} from 'lucide-react';
import { InvoiceDetails, ChatMessage } from '../../../types';

interface InChatInvoiceCardProps {
  message: ChatMessage;
  invoice: InvoiceDetails;
  isMe: boolean;
  onPayInvoice: (messageId: string, updatedInvoice: InvoiceDetails) => void;
}

export const InChatInvoiceCard: React.FC<InChatInvoiceCardProps> = ({
  message,
  invoice,
  isMe,
  onPayInvoice,
}) => {
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('M-Pesa');
  const [phoneNumber, setPhoneNumber] = useState('0712345678');
  const [isProcessing, setIsProcessing] = useState(false);

  const isPaid = invoice.status === 'paid';

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const updatedInvoice: InvoiceDetails = {
        ...invoice,
        status: 'paid',
        paidAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        paymentMethod: selectedMethod,
        paidBy: isMe ? 'You' : (message.senderName || 'Customer'),
      };
      setIsProcessing(false);
      setIsPayModalOpen(false);
      onPayInvoice(message.id, updatedInvoice);
      setIsReceiptModalOpen(true);
    }, 1200);
  };

  return (
    <>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-[#13192C] to-[#0D1220] shadow-xl text-left my-1 select-none">
        {/* Card Header */}
        <div className="p-3.5 bg-white/[0.03] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center text-white ${
                isPaid ? 'bg-emerald-500 shadow-emerald-500/20 shadow-md' : 'bg-cyan-500 shadow-cyan-500/20 shadow-md'
              }`}
            >
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Ankara ya Malipo
              </span>
              <span className="text-xs font-mono font-bold text-cyan-300">
                #{invoice.invoiceNumber}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border ${
              isPaid
                ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300'
                : 'bg-amber-500/15 border-amber-400/40 text-amber-300 animate-pulse'
            }`}
          >
            {isPaid ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Imelipwa (Paid)
              </>
            ) : (
              <>
                <Clock className="w-3 h-3 text-amber-400" />
                Inasubiri Malipo
              </>
            )}
          </span>
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-3">
          <div>
            <h4 className="font-bold text-sm text-white">{invoice.title}</h4>
            {invoice.description && (
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{invoice.description}</p>
            )}
          </div>

          {/* Amount Box */}
          <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-baseline justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Jumla Inayotakiwa:</span>
            <div className="text-right">
              <span className="text-xs text-cyan-400 font-bold mr-1">{invoice.currency}</span>
              <span className="text-lg font-black text-white font-mono tracking-tight">
                {invoice.amount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Payment metadata */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
            <span>
              {isPaid
                ? `Imelipwa kupitia ${invoice.paymentMethod || 'M-Pesa'}`
                : `Mwisho: ${invoice.dueDate || 'Siku 3'}`}
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Zenia Escrow
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-3 pt-0">
          {isPaid ? (
            <button
              onClick={() => setIsReceiptModalOpen(true)}
              className="w-full py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-98"
            >
              <Receipt className="w-3.5 h-3.5" />
              Tazama Risiti (View Receipt)
            </button>
          ) : (
            <button
              onClick={() => setIsPayModalOpen(true)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-98"
            >
              <CreditCard className="w-4 h-4" />
              Lipa Sasa ({invoice.currency} {invoice.amount.toLocaleString()})
            </button>
          )}
        </div>
      </div>

      {/* PAY INVOICE MODAL / DRAWER */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-[#111728] border border-cyan-500/30 rounded-3xl p-5 shadow-2xl animate-in zoom-in-95 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Kamilisha Malipo</h3>
                  <p className="text-[11px] text-slate-400">Ankara #{invoice.invoiceNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setIsPayModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-center mb-4">
              <span className="text-[11px] text-cyan-300 font-medium block">Kiasi cha Kulipa:</span>
              <span className="text-xl font-black text-white font-mono">
                {invoice.currency} {invoice.amount.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">{invoice.title}</span>
            </div>

            <form onSubmit={handleProcessPayment} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Chagua Njia ya Malipo:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['M-Pesa', 'Airtel Money', 'Tigo Pesa', 'Kadi (Card)'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setSelectedMethod(method)}
                      className={`p-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                        selectedMethod === method
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-sm'
                          : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {method.includes('Kadi') ? (
                        <CreditCard className="w-3.5 h-3.5 shrink-0" />
                      ) : (
                        <Smartphone className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span className="truncate">{method}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  {selectedMethod.includes('Kadi') ? 'Namba ya Kadi' : 'Namba ya Simu ya Malipo'}:
                </label>
                <input
                  type="text"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder={selectedMethod.includes('Kadi') ? '4242 •••• •••• 4242' : '07xxxxxxxx'}
                  className="w-full bg-[#171F36] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Inathibitisha malipo...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Thibitisha na Lipa Sasa</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIGITAL RECEIPT MODAL */}
      {isReceiptModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-[#111728] border border-emerald-500/40 rounded-3xl p-5 shadow-2xl animate-in zoom-in-95 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Risiti ya Kidigitali</h3>
                  <p className="text-[10px] text-emerald-300">Malipo Yamekamilika</p>
                </div>
              </div>
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2.5 text-xs text-slate-300 font-mono mb-4">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Namba ya Risiti:</span>
                <span className="text-white font-bold">REC-{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Huduma:</span>
                <span className="text-white truncate max-w-[150px]">{invoice.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Kiasi:</span>
                <span className="text-emerald-400 font-bold">
                  {invoice.currency} {invoice.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Njia:</span>
                <span className="text-white">{invoice.paymentMethod || selectedMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Muda:</span>
                <span className="text-white">{invoice.paidAt || 'Papo hapo'}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-white/5 text-[10px] text-slate-400">
                <span>Hali:</span>
                <span className="text-emerald-300 font-bold">IMETHIBITISHWA (VERIFIED)</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  alert('Risiti imepakuliwa kwenye simu yako!');
                  setIsReceiptModalOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Pakua Risiti
              </button>
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="px-3.5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs text-slate-300 transition-colors"
              >
                Funga
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
