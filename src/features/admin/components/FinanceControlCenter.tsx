import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Percent,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  CreditCard,
  Building,
  Save,
  Sliders,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { CommissionConfig } from '../types';

interface PayoutItem {
  id: string;
  sellerName: string;
  sellerEmail: string;
  amount: number;
  method: string;
  accountNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface FinanceControlCenterProps {
  commissions: CommissionConfig;
  onSaveCommissions: (newConfig: CommissionConfig) => void;
  payouts: PayoutItem[];
  onApprovePayout: (payoutId: string) => void;
  onRejectPayout: (payoutId: string) => void;
}

export const FinanceControlCenter: React.FC<FinanceControlCenterProps> = ({
  commissions,
  onSaveCommissions,
  payouts,
  onApprovePayout,
  onRejectPayout,
}) => {
  const [formData, setFormData] = useState<CommissionConfig>(commissions);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCommissions(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6 select-none">
      {/* 1. Revenue Overview & Key Financial Indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-3xl bg-[#12162A] border border-emerald-500/20 shadow-md">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Mapato ya Ada za Mfumo</span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-emerald-300 mt-1">TZS 4,612,500</h3>
          <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">
            ↑ +18.4% mwezi huu
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-[#12162A] border border-amber-500/20 shadow-md">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Jumla ya Mauzo Sokoni (GMV)</span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-amber-300 mt-1">TZS 184,500,000</h3>
          <span className="text-[11px] text-amber-400 font-semibold mt-1 block">
            Biashara 1,890 zimekamilika
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-[#12162A] border border-purple-500/20 shadow-md">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Salio la Pochi Zote (User Escrow)</span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-purple-300 mt-1">TZS 42,800,000</h3>
          <span className="text-[11px] text-purple-400 font-semibold mt-1 block">
            Salama kwenye Escrow Trust
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-[#12162A] border border-cyan-500/20 shadow-md">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Maombi ya Payouts</span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-cyan-300 mt-1">
            {payouts.filter((p) => p.status === 'pending').length} Inasubiri
          </h3>
          <span className="text-[11px] text-slate-400 font-semibold mt-1 block">
            TZS {payouts.filter((p) => p.status === 'pending').reduce((a, b) => a + b.amount, 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* 2. Multi-Service Commission Management */}
      <div className="p-5 rounded-3xl bg-[#0F1426] border border-cyan-500/30 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
          <div>
            <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
              <Percent className="w-4 h-4 text-cyan-400" />
              <span>Usimamizi wa Ada za Kamisheni (Commission Management)</span>
            </h4>
            <p className="text-xs text-slate-400">
              Sanidi asilimia ya ada ya Zenia kwa kila huduma. Mabadiliko yanahusu miamala mipya pekee.
            </p>
          </div>
          {commissions.lastUpdatedAt && (
            <span className="text-[11px] text-slate-400 font-mono">
              Ilisasishwa mwisho: {commissions.lastUpdatedAt} ({commissions.lastUpdatedBy})
            </span>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Marketplace Fee */}
            <div className="p-4 rounded-2xl bg-[#131930] border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">🛍️ Soko & Marketplace</span>
                <span className="text-sm font-extrabold text-cyan-400 font-mono">{formData.marketplace}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="10"
                step="0.5"
                value={formData.marketplace}
                onChange={(e) => setFormData({ ...formData, marketplace: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block">Ada ya kila mauzo ya bidhaa sokoni</span>
            </div>

            {/* Promoted Status Fee */}
            <div className="p-4 rounded-2xl bg-[#131930] border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">⭐ Status Komfemu</span>
                <span className="text-sm font-extrabold text-amber-400 font-mono">{formData.promotedStatus}%</span>
              </div>
              <input
                type="range"
                min="2"
                max="25"
                step="1"
                value={formData.promotedStatus}
                onChange={(e) => setFormData({ ...formData, promotedStatus: parseFloat(e.target.value) })}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block">Ada ya matangazo ya stori za kulipia</span>
            </div>

            {/* Live Shopping Fee */}
            <div className="p-4 rounded-2xl bg-[#131930] border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">🎥 Live Shopping</span>
                <span className="text-sm font-extrabold text-purple-400 font-mono">{formData.liveShopping}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                step="0.5"
                value={formData.liveShopping}
                onChange={(e) => setFormData({ ...formData, liveShopping: parseFloat(e.target.value) })}
                className="w-full accent-purple-400 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block">Ada ya mauzo ndani ya Live Spaces</span>
            </div>

            {/* Digital Services Fee */}
            <div className="p-4 rounded-2xl bg-[#131930] border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">💼 Huduma za Kidijitali</span>
                <span className="text-sm font-extrabold text-emerald-400 font-mono">{formData.digitalServices}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={formData.digitalServices}
                onChange={(e) => setFormData({ ...formData, digitalServices: parseFloat(e.target.value) })}
                className="w-full accent-emerald-400 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block">Ada ya mikataba ya kazi na ajira</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {isSaved ? (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>Viwango vipya vya Kamisheni vimehifadhiwa na kurekodiwa kwenye Audit Log!</span>
              </span>
            ) : (
              <span className="text-[11px] text-slate-400">
                Mabadiliko ya viwango yanarekodiwa moja kwa moja kwenye Audit Trail.
              </span>
            )}

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Hifadhi Viwango Vipya (Save Commissions)</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. Pending Seller Payout Requests */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <span>Maombi ya Kutoa Pesa ya Wauzaji na Wabunifu (Payout Requests)</span>
          </h4>
          <span className="text-xs text-slate-400">
            {payouts.filter((p) => p.status === 'pending').length} Inasubiri idhini
          </span>
        </div>

        <div className="space-y-2.5">
          {payouts.map((po) => (
            <div
              key={po.id}
              className="p-4 rounded-2xl bg-[#0F1326] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all hover:border-white/15"
            >
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h5 className="font-bold text-sm text-white">{po.sellerName}</h5>
                  <span className="text-xs text-slate-400 font-mono">({po.sellerEmail})</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      po.status === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : po.status === 'rejected'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {po.status}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 font-mono">
                  Kiasi: <strong className="text-emerald-400 text-sm">TZS {po.amount.toLocaleString()}</strong> • Njia: <span className="text-white font-semibold">{po.method}</span> ({po.accountNumber}) • {po.createdAt}
                </p>
              </div>

              {po.status === 'pending' ? (
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => onRejectPayout(po.id)}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-bold text-xs transition-colors"
                  >
                    Kataa (Reject)
                  </button>
                  <button
                    type="button"
                    onClick={() => onApprovePayout(po.id)}
                    className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Idhinisha (Pay Out)</span>
                  </button>
                </div>
              ) : (
                <span className="text-xs font-bold text-slate-400 font-mono">
                  {po.status === 'approved' ? '✓ Imelipwa' : '✕ Imekataliwa'}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Payment Provider Gateway Status (M-Pesa, Tigo Pesa, Airtel, Banks) */}
      <div className="p-5 rounded-3xl bg-[#0F1326] border border-white/10 space-y-3">
        <h4 className="font-bold text-sm text-white flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-cyan-400" />
          <span>Hali ya Mitandao ya Malipo (Payment Providers Status)</span>
        </h4>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-black/30 border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block font-semibold">Vodacom M-Pesa</span>
              <span className="text-emerald-400 font-bold">100% Operational</span>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>

          <div className="p-3.5 rounded-2xl bg-black/30 border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block font-semibold">Tigo Pesa Gateway</span>
              <span className="text-emerald-400 font-bold">100% Operational</span>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>

          <div className="p-3.5 rounded-2xl bg-black/30 border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block font-semibold">Airtel Money Switch</span>
              <span className="text-emerald-400 font-bold">100% Operational</span>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>

          <div className="p-3.5 rounded-2xl bg-black/30 border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block font-semibold">Selcom / Bank Switch</span>
              <span className="text-emerald-400 font-bold">100% Operational</span>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
        </div>
      </div>
    </div>
  );
};
