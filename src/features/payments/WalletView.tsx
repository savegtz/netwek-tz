import React, { useState } from 'react';
import {
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  MoreHorizontal,
  Smartphone,
  Building,
  PhoneCall,
  Store,
  Receipt,
  Plus,
  ArrowLeft,
  CheckCircle2,
  X,
} from 'lucide-react';
import { WalletTransaction } from '../../types';
import { INITIAL_TRANSACTIONS } from '../../services/seed/initialData';
import { PaymentService } from '../../services/payments/paymentService';

interface WalletViewProps {
  onBack?: () => void;
}

export const WalletView: React.FC<WalletViewProps> = ({ onBack }) => {
  const [balance, setBalance] = useState(245000);
  const [transactions, setTransactions] = useState<WalletTransaction[]>(INITIAL_TRANSACTIONS);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [recipientNumber, setRecipientNumber] = useState('');
  const [amountToSend, setAmountToSend] = useState('');
  const [processing, setProcessing] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const services = [
    { id: 'mobile_money', label: 'Mobile Money', icon: Smartphone, color: 'text-cyan-400' },
    { id: 'bank', label: 'Bank Transfer', icon: Building, color: 'text-purple-400' },
    { id: 'airtime', label: 'Buy Airtime', icon: PhoneCall, color: 'text-amber-400' },
    { id: 'business', label: 'Pay Business', icon: Store, color: 'text-emerald-400' },
    { id: 'services', label: 'Pay Services', icon: Receipt, color: 'text-blue-400' },
  ];

  const handleSendPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amountToSend);
    if (!val || val <= 0 || val > balance) return;

    setProcessing(true);
    try {
      const res = await PaymentService.processPayment({
        amount: val,
        currency: 'TZS',
        description: `Transfer to ${recipientNumber}`,
        paymentMethod: 'mobile_money',
        payerInfo: {
          userId: 'current_user_id',
          phoneNumber: recipientNumber,
        },
      });

      if (res.status === 'paid') {
        setBalance((b) => b - val);
        const newTx: WalletTransaction = {
          id: res.transactionId,
          userId: 'current_user_id',
          type: 'send',
          amount: -val,
          currency: 'TZS',
          title: `Sent to ${recipientNumber}`,
          counterparty: recipientNumber,
          status: 'completed',
          timestamp: 'Just now',
        };
        setTransactions([newTx, ...transactions]);
        setSuccessNotice(`Sent TZS ${val.toLocaleString()} to ${recipientNumber}`);
        setTimeout(() => {
          setSuccessNotice(null);
          setIsSendModalOpen(false);
          setRecipientNumber('');
          setAmountToSend('');
        }, 1200);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="w-full flex flex-col bg-[#070A12] text-white flex-1 pb-28 select-none">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          {onBack && (
            <button onClick={onBack} className="p-1 text-slate-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h3 className="font-bold text-base text-white">Wallet</h3>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
          TZS WALLET
        </span>
      </div>

      {/* Main Balance Card (Matching Screenshot Screen 12: TZS 245,000) */}
      <div className="p-4">
        <div className="relative rounded-3xl p-6 bg-gradient-to-br from-[#151D33] via-[#161F3B] to-[#12182D] border border-white/10 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <CreditCard className="w-4 h-4" />
            </div>
            <span className="text-xs text-slate-400 font-medium">Available Balance</span>
          </div>

          <h2 className="text-3xl font-black text-white tracking-tight">
            TZS {balance.toLocaleString()}
          </h2>

          {/* 4 Action Circles: Send, Receive, Pay, More */}
          <div className="grid grid-cols-4 gap-2 mt-6">
            <button
              onClick={() => setIsSendModalOpen(true)}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-cyan-500/20 hover:border-cyan-400 border border-white/10 flex items-center justify-center transition-all group-hover:scale-105">
                <ArrowUpRight className="w-5 h-5 text-cyan-300" />
              </div>
              <span className="text-[11px] font-medium text-slate-300">Send</span>
            </button>

            <button
              onClick={() => {
                const add = 20000;
                setBalance((b) => b + add);
                alert(`Top up simulated: +TZS ${add.toLocaleString()}`);
              }}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-emerald-500/20 hover:border-emerald-400 border border-white/10 flex items-center justify-center transition-all group-hover:scale-105">
                <ArrowDownLeft className="w-5 h-5 text-emerald-300" />
              </div>
              <span className="text-[11px] font-medium text-slate-300">Receive</span>
            </button>

            <button
              onClick={() => setIsSendModalOpen(true)}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-purple-500/20 hover:border-purple-400 border border-white/10 flex items-center justify-center transition-all group-hover:scale-105">
                <CreditCard className="w-5 h-5 text-purple-300" />
              </div>
              <span className="text-[11px] font-medium text-slate-300">Pay</span>
            </button>

            <button className="flex flex-col items-center gap-1.5 group">
              <div className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 flex items-center justify-center transition-all group-hover:scale-105">
                <MoreHorizontal className="w-5 h-5 text-slate-300" />
              </div>
              <span className="text-[11px] font-medium text-slate-300">More</span>
            </button>
          </div>
        </div>
      </div>

      {/* Services Grid (Mobile Money, Bank Transfer, Buy Airtime, Pay Business, Pay Services) */}
      <div className="px-4 py-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
          Services
        </h4>
        <div className="grid grid-cols-5 gap-2">
          {services.map((srv) => {
            const Icon = srv.icon;
            return (
              <button
                key={srv.id}
                onClick={() => setIsSendModalOpen(true)}
                className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 transition-all text-center group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className={`w-5 h-5 ${srv.color}`} />
                </div>
                <span className="text-[10px] font-medium text-slate-300 leading-tight">
                  {srv.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions List (Matching Screenshot Screen 12) */}
      <div className="p-4 flex-1">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Recent Transactions
          </h4>
          <button className="text-[11px] text-cyan-400 hover:underline">View All</button>
        </div>

        <div className="space-y-2">
          {transactions.map((tx) => {
            const isPositive = tx.amount > 0;
            return (
              <div
                key={tx.id}
                className="p-3 rounded-2xl bg-[#14192B] border border-white/5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                      isPositive
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {isPositive ? '+' : '-'}
                  </div>
                  <div>
                    <h5 className="font-semibold text-xs text-white">{tx.title}</h5>
                    <p className="text-[10px] text-slate-400">{tx.timestamp}</p>
                  </div>
                </div>

                <span
                  className={`font-bold text-xs ${
                    isPositive ? 'text-emerald-400' : 'text-slate-200'
                  }`}
                >
                  {isPositive ? '+' : ''}TZS {Math.abs(tx.amount).toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Send Payment Modal */}
      {isSendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-[#0F1424] border border-white/10 rounded-3xl p-5 shadow-2xl">
            <button
              onClick={() => setIsSendModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            {successNotice ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
                <h4 className="font-bold text-base text-white">Transfer Successful!</h4>
                <p className="text-xs text-slate-300 mt-1">{successNotice}</p>
              </div>
            ) : (
              <form onSubmit={handleSendPayment} className="space-y-3">
                <h4 className="font-bold text-base text-white">Send Money</h4>
                <p className="text-xs text-slate-400">Instant transfer via Mobile Money or Zenia ID</p>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Recipient Phone / Wallet ID</label>
                  <input
                    type="text"
                    required
                    placeholder="+255 755 000 000"
                    value={recipientNumber}
                    onChange={(e) => setRecipientNumber(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-slate-300">Amount (TZS)</label>
                    <span className="text-[10px] text-slate-400">Max: {balance.toLocaleString()}</span>
                  </div>
                  <input
                    type="number"
                    required
                    max={balance}
                    placeholder="25000"
                    value={amountToSend}
                    onChange={(e) => setAmountToSend(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold text-xs shadow-lg shadow-purple-500/20"
                >
                  {processing ? 'Processing Transfer...' : 'Confirm & Transfer'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
