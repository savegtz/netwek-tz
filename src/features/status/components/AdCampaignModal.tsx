import React, { useState } from 'react';
import {
  X,
  Megaphone,
  Rocket,
  CheckCircle2,
  TrendingUp,
  Target,
  Zap,
  Smartphone,
  ChevronRight,
  ShieldCheck,
  MapPin,
  Check,
} from 'lucide-react';
import { UserProfile } from '../../../types';

interface AdCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  initialHeadline?: string;
  onAdCreated?: (campaignDetails: any) => void;
}

export const AdCampaignModal: React.FC<AdCampaignModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  initialHeadline = 'BOOST YOUR BUSINESS',
  onAdCreated,
}) => {
  const [adHeadline, setAdHeadline] = useState(initialHeadline);
  const [targetLocation, setTargetLocation] = useState('Dar es Salaam, Tanzania');
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'growth' | 'pro'>('growth');
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'airtel' | 'mixx' | 'halopesa'>('mpesa');
  const [phone, setPhone] = useState(currentUser.phone || '+255 714 892 012');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  interface PlanItem {
    name: string;
    price: number;
    reach: string;
    duration: string;
    color: string;
    popular?: boolean;
  }

  const plans: Record<'starter' | 'growth' | 'pro', PlanItem> = {
    starter: {
      name: 'Starter Boost',
      price: 10000,
      reach: '5,000 - 8,000 Watu',
      duration: 'Siku 1 (24 Hours)',
      color: 'border-blue-500/40 text-blue-400',
      popular: false,
    },
    growth: {
      name: 'Growth Campaign 🔥',
      price: 25000,
      reach: '18,000 - 25,000 Watu',
      duration: 'Siku 3 (3 Days)',
      color: 'border-amber-500/50 text-amber-400',
      popular: true,
    },
    pro: {
      name: 'Pro Viral Scale 🚀',
      price: 50000,
      reach: '50,000+ Watu',
      duration: 'Siku 7 (1 Week)',
      color: 'border-purple-500/50 text-purple-400',
      popular: false,
    },
  };

  const handleLaunchCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      if (onAdCreated) {
        onAdCreated({
          headline: adHeadline,
          plan: selectedPlan,
          amount: plans[selectedPlan].price,
          targetLocation,
        });
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-lg bg-[#0A0D18] border-t sm:border border-amber-500/40 rounded-t-[32px] sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-4 bg-[#141A2E] border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-400/30">
              <Megaphone className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-amber-400 block flex items-center gap-1">
                <Zap className="w-3 h-3 fill-amber-400" />
                <span>SPONSORED AD CAMPAIGN</span>
              </span>
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                Tangaza Biashara Yako (Boost Status)
              </h3>
              <p className="text-[11px] text-slate-400">
                Fikia wateja maelfu waliopo karibu nawe
              </p>
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
          {!isSuccess ? (
            <form onSubmit={handleLaunchCampaign} className="space-y-4">
              {/* Value Proposition matching Screenshot 6 */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/15 to-amber-500/15 border border-amber-500/30 space-y-2">
                <h4 className="text-sm font-black text-amber-300">
                  ⚡ BOOST YOUR BUSINESS
                </h4>
                <p className="text-xs text-slate-200">
                  Reach more customers with our targeted ad campaign.
                </p>
                <div className="grid grid-cols-3 gap-1 pt-1 text-[11px] text-slate-100 font-bold">
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-amber-400 stroke-[3]" /> More Visibility
                  </span>
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-amber-400 stroke-[3]" /> Targeted
                  </span>
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-amber-400 stroke-[3]" /> Better Results
                  </span>
                </div>
              </div>

              {/* 1. Headline */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-200 block">
                  Kichwa cha Tangazo (Ad Headline):
                </label>
                <input
                  type="text"
                  required
                  value={adHeadline}
                  onChange={(e) => setAdHeadline(e.target.value)}
                  className="w-full bg-[#161D33] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* 2. Target Location */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Walengwa / Eneo (Target Location):</span>
                </label>
                <input
                  type="text"
                  value={targetLocation}
                  onChange={(e) => setTargetLocation(e.target.value)}
                  className="w-full bg-[#161D33] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-semibold"
                />
              </div>

              {/* 3. Chagua Bajeti (Budget Plans) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-200 block">
                  Chagua Kifurushi cha Matangazo (Budget):
                </label>
                <div className="space-y-2">
                  {(Object.keys(plans) as (keyof typeof plans)[]).map((key) => {
                    const plan = plans[key];
                    const isSelected = selectedPlan === key;
                    return (
                      <div
                        key={key}
                        onClick={() => setSelectedPlan(key)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-400 text-white shadow-md'
                            : 'bg-[#12182D] border-white/5 hover:border-white/15 text-slate-300'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-xs text-white">{plan.name}</span>
                            {plan.popular && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 text-[9px] font-black">
                                INAYOPENDELEWA
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400">
                            Watazamaji: <strong className="text-emerald-400">{plan.reach}</strong> • {plan.duration}
                          </p>
                        </div>
                        <span className="text-sm font-black font-mono text-amber-300">
                          TSh {plan.price.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. Malipo kwa Mobile Money */}
              <div className="p-3.5 rounded-2xl bg-[#12182D] border border-white/5 space-y-2.5">
                <span className="text-xs font-bold text-slate-200 block">
                  Njia ya Malipo (Mobile Money):
                </span>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {[
                    { id: 'mpesa', name: 'M-Pesa', color: 'bg-red-500/20 text-red-400 border-red-500/40' },
                    { id: 'airtel', name: 'Airtel', color: 'bg-rose-500/20 text-rose-400 border-rose-500/40' },
                    { id: 'mixx', name: 'Mixx', color: 'bg-blue-500/20 text-blue-400 border-blue-500/40' },
                    { id: 'halopesa', name: 'HaloPesa', color: 'bg-orange-500/20 text-orange-400 border-orange-500/40' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-2 rounded-xl text-center font-bold border transition-all text-xs ${
                        paymentMethod === m.id
                          ? `${m.color} ring-2 ring-amber-400 font-black`
                          : 'bg-white/5 border-white/10 text-slate-400'
                      }`}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>

                <div className="pt-1">
                  <span className="text-[10px] text-slate-400 block mb-1">Namba ya Simu:</span>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#18223D] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Launch Button matching Screenshot 6 */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-400/25 active:scale-95 transition-all"
              >
                {isProcessing ? (
                  <span>Inatuma USSD Push kwenye simu yako...</span>
                ) : (
                  <>
                    <Rocket className="w-4 h-4 stroke-[2.5]" />
                    <span>🚀 Lipia TSh {plans[selectedPlan].price.toLocaleString()} na Anzisha Tangazo</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Confirmation screen */
            <div className="p-4 text-center space-y-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400 block">
                  MALIPO YAMEFANIKIWA! 🚀
                </span>
                <h4 className="text-xl font-black text-white mt-1">
                  Tangazo Lako Liko Hewani Sasa!
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Kampeni ya <strong>"{adHeadline}"</strong> imeanza kuonyeshwa kwa watumiaji <strong>{plans[selectedPlan].reach}</strong> hapa {targetLocation}.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#12182D] border border-white/5 text-left text-xs space-y-1 text-slate-300">
                <p>📋 Kifurushi: <strong>{plans[selectedPlan].name}</strong></p>
                <p>💰 Kiasi: <strong>TSh {plans[selectedPlan].price.toLocaleString()} (PAID via {paymentMethod.toUpperCase()})</strong></p>
                <p>⏱️ Muda: <strong>{plans[selectedPlan].duration}</strong></p>
                <p>📍 Eneo: <strong>{targetLocation}</strong></p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs active:scale-95 transition-all"
              >
                Sawa, Endelea Kufuatilia Takwimu
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
