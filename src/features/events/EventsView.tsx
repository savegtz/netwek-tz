import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Ticket,
  Users,
  Share2,
  Heart,
  QrCode,
  X,
  CreditCard,
  Check,
} from 'lucide-react';
import { EventItem } from '../../types';
import { INITIAL_EVENTS } from '../../services/seed/initialData';
import { PaymentService } from '../../services/payments/paymentService';
import { SafeImage } from '../../components/SafeImage';

interface EventsViewProps {
  onBack?: () => void;
}

export const EventsView: React.FC<EventsViewProps> = ({ onBack }) => {
  const [event, setEvent] = useState<EventItem>(INITIAL_EVENTS[0]);
  const [selectedTier, setSelectedTier] = useState<'general' | 'vip'>('general');
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchasedTicket, setPurchasedTicket] = useState<{
    id: string;
    tier: string;
    qrCode: string;
    total: number;
  } | null>(null);

  const price = selectedTier === 'general' ? event.generalAdmissionPrice : event.vipPrice;
  const totalPrice = price * quantity;

  const handleBuyTicket = async () => {
    setIsProcessing(true);
    try {
      const res = await PaymentService.processPayment({
        amount: totalPrice,
        currency: event.currency,
        description: `Ticket Purchase for ${event.title} (${selectedTier.toUpperCase()})`,
        paymentMethod: 'mobile_money',
        payerInfo: {
          userId: 'current_user_id',
          name: 'Amina Kaunga',
        },
      });

      if (res.status === 'paid') {
        setPurchasedTicket({
          id: res.transactionId,
          tier: selectedTier.toUpperCase(),
          qrCode: `ZENIA-EVENT-${event.id}-${res.transactionId}`,
          total: totalPrice,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full flex flex-col bg-[#070A12] text-white flex-1 pb-28 md:pb-12 select-none">
      <div className="max-w-4xl mx-auto w-full flex flex-col flex-1">
      {/* Hero Banner (Matching Music Festival 2026 Screenshot Screen 9) */}
      <div className="relative h-64 w-full bg-black">
        <SafeImage
          src={event.bannerUrl}
          fallbackText={event.title}
          fallbackGradient="from-indigo-950 via-purple-900 to-black"
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D18] via-[#0A0D18]/40 to-transparent" />
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white">
            <Share2 className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white">
            <Heart className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Event Details Content */}
      <div className="p-5 pt-2 flex-1 flex flex-col justify-between">
        <div>
          {/* Title with verified badge */}
          <div className="flex items-center gap-1.5 mb-2">
            <h3 className="text-xl font-extrabold text-white tracking-tight">{event.title}</h3>
            <CheckCircle2 className="w-5 h-5 text-cyan-400 fill-cyan-400 shrink-0" />
          </div>

          {/* Date, Time, Location metadata */}
          <div className="space-y-1.5 text-xs text-slate-300 mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {event.date} • {event.time}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-pink-400" />
              <span>
                {event.location} • <strong className="text-white">{event.hostName}</strong>
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed mb-5">{event.description}</p>

          {/* Tickets Section */}
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
            <Ticket className="w-4 h-4 text-cyan-400" />
            Select Tickets
          </h4>

          <div className="space-y-2 mb-4">
            {/* General Admission */}
            <button
              onClick={() => setSelectedTier('general')}
              className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                selectedTier === 'general'
                  ? 'bg-cyan-500/15 border-cyan-400 shadow-sm'
                  : 'bg-white/5 border-white/5 hover:border-white/10'
              }`}
            >
              <div>
                <p className="font-bold text-xs text-white">General Admission</p>
                <p className="text-[11px] text-slate-400">Regular entrance, festival stage access</p>
              </div>
              <span className="font-black text-xs text-cyan-300">
                TZS {event.generalAdmissionPrice.toLocaleString()}
              </span>
            </button>

            {/* VIP Admission */}
            <button
              onClick={() => setSelectedTier('vip')}
              className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                selectedTier === 'vip'
                  ? 'bg-purple-500/15 border-purple-400 shadow-sm'
                  : 'bg-white/5 border-white/5 hover:border-white/10'
              }`}
            >
              <div>
                <p className="font-bold text-xs text-white">VIP Lounge Pass</p>
                <p className="text-[11px] text-slate-400">Backstage lounge, complimentary drink & parking</p>
              </div>
              <span className="font-black text-xs text-purple-300">
                TZS {event.vipPrice.toLocaleString()}
              </span>
            </button>
          </div>
        </div>

        {/* Buy Ticket Button */}
        <div className="pt-2">
          <button
            onClick={handleBuyTicket}
            disabled={isProcessing}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs shadow-xl shadow-purple-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                Buy Ticket • TZS {totalPrice.toLocaleString()}
              </>
            )}
          </button>
        </div>
      </div>
      </div>

      {/* Ticket QR Modal */}
      {purchasedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#0F1424] border border-cyan-400/40 rounded-3xl p-6 text-center shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h4 className="text-lg font-bold text-white mb-1">Ticket Confirmed!</h4>
            <p className="text-xs text-slate-400 mb-4">{event.title}</p>

            {/* QR Code Pass representation */}
            <div className="p-4 rounded-2xl bg-white text-slate-900 mx-auto max-w-[200px] mb-4 flex flex-col items-center">
              <QrCode className="w-28 h-28 text-slate-900" />
              <span className="font-mono text-[9px] font-bold mt-2">
                {purchasedTicket.id.slice(0, 16)}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 text-xs text-slate-300 mb-4">
              <p>Tier: <strong className="text-cyan-300">{purchasedTicket.tier}</strong></p>
              <p>Total: TZS {purchasedTicket.total.toLocaleString()}</p>
            </div>

            <button
              onClick={() => setPurchasedTicket(null)}
              className="w-full py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
