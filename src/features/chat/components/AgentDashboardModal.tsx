import React from 'react';
import {
  X,
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  Star,
  Receipt,
  ShieldCheck,
  Award,
} from 'lucide-react';

interface AgentDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentName?: string;
}

export const AgentDashboardModal: React.FC<AgentDashboardModalProps> = ({
  isOpen,
  onClose,
  agentName = 'Sarah Mwangi',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#0F1424] border border-cyan-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                Dashibodi ya Wakala (Mobijet Hub)
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40">
                  Online
                </span>
              </h3>
              <p className="text-xs text-cyan-300">Wakala: {agentName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          {/* Revenue */}
          <div className="p-3.5 rounded-2xl bg-[#141C31] border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-medium">Malipo Yaliyokusanywa</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-lg font-black text-emerald-400 font-mono">TZS 845,000</p>
            <span className="text-[10px] text-emerald-300/80 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +18% leo
            </span>
          </div>

          {/* Customers */}
          <div className="p-3.5 rounded-2xl bg-[#141C31] border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-medium">Wateja Waliohudumiwa</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-lg font-black text-white font-mono">28 Wateja</p>
            <span className="text-[10px] text-cyan-300/80 font-medium">Tiketi 22 zimekamilika</span>
          </div>

          {/* Response Time */}
          <div className="p-3.5 rounded-2xl bg-[#141C31] border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-medium">Kasi ya Kujibu</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-lg font-black text-white font-mono">Dakika 1.2</p>
            <span className="text-[10px] text-emerald-400 font-medium">Kasi ya juu sana ⚡</span>
          </div>

          {/* CSAT Rating */}
          <div className="p-3.5 rounded-2xl bg-[#141C31] border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-medium">Kiwango cha Kuridhika</span>
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            </div>
            <p className="text-lg font-black text-yellow-300 font-mono">4.9 / 5.0</p>
            <span className="text-[10px] text-slate-400">Kutoka tathmini 46 za wateja</span>
          </div>
        </div>

        {/* Recent In-Chat Payments Table */}
        <div className="space-y-2 mb-4">
          <h4 className="text-xs font-bold text-white flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-cyan-400" />
              Malipo ya Hivi Karibuni Ndani ya Chat
            </span>
            <span className="text-[10px] text-cyan-300">Miamala 14 leo</span>
          </h4>

          <div className="space-y-1.5">
            {[
              { id: 'INV-849201', customer: 'Sarah Mwangi', item: 'Wireless Earbuds Pro', amount: 'TZS 45,000', method: 'M-Pesa', status: 'Imelipwa', time: '12:25 PM' },
              { id: 'INV-849195', customer: 'Alex Kimani', item: 'Usajili wa VIP Pass', amount: 'TZS 120,000', method: 'Tigo Pesa', status: 'Imelipwa', time: '11:40 AM' },
              { id: 'INV-849182', customer: 'Amina Juma', item: 'Ushauri wa Biashara', amount: 'TZS 50,000', method: 'Airtel Money', status: 'Imelipwa', time: '10:15 AM' },
            ].map((tx) => (
              <div
                key={tx.id}
                className="p-2.5 rounded-xl bg-[#141C31] border border-white/5 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white">{tx.customer}</span>
                    <span className="text-[10px] text-slate-400 font-mono">#{tx.id}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{tx.item} • {tx.method}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-400 font-mono block">{tx.amount}</span>
                  <span className="text-[10px] text-emerald-300 flex items-center gap-0.5 justify-end">
                    <CheckCircle2 className="w-2.5 h-2.5" /> {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security and Guarantee badge */}
        <div className="p-3 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 flex items-center gap-2.5 text-xs text-slate-300">
          <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
          <span>
            Miamala yote inalindwa na mfumo wa **Zenia Escrow & Mobijet Instant Settlement**. Fedha zinaingia papo hapo kwenye pochi yako.
          </span>
        </div>
      </div>
    </div>
  );
};
