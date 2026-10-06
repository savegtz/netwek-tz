import React, { useState } from 'react';
import {
  X,
  Ticket,
  QrCode,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Smartphone,
  Share2,
  MessageCircle,
  Copy,
} from 'lucide-react';

interface EventTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventName?: string;
  eventDate?: string;
  eventTime?: string;
  location?: string;
  onStartChatWithOrganizer?: (msg: string) => void;
}

export const EventTicketModal: React.FC<EventTicketModalProps> = ({
  isOpen,
  onClose,
  eventName = 'Dar Food Festival 2026',
  eventDate = '12 Oct 2026',
  eventTime = '8:00 PM',
  location = 'Mlimani City, Dar es Salaam',
  onStartChatWithOrganizer,
}) => {
  const [selectedTier, setSelectedTier] = useState<{ name: string; price: number }>({
    name: 'VIP',
    price: 50000,
  });
  const [quantity, setQuantity] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('+255 714 892 012');
  const [paymentMethod, setPaymentMethod] = useState<'M-Pesa' | 'Airtel Money' | 'Mixx by Yas'>('M-Pesa');
  const [step, setStep] = useState<'select' | 'processing' | 'ticket'>('select');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const totalAmount = selectedTier.price * quantity;
  const ticketId = 'DF2026-00821';

  const handlePay = () => {
    setStep('processing');
    setTimeout(() => {
      setStep('ticket');
    }, 2500);
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(`Tiketi: ${eventName} - ${selectedTier.name} | ID: ${ticketId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-md bg-[#0A0D18] border-t sm:border border-purple-500/30 rounded-t-[32px] sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95">
        {/* Top Header */}
        <div className="p-4 bg-[#12162A] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                Kata Tiketi (Get Event Ticket)
              </h3>
              <p className="text-[11px] text-purple-300 truncate max-w-[220px]">
                {eventName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {step === 'select' && (
            <div className="space-y-4">
              {/* Event Summary Card */}
              <div className="p-3.5 rounded-2xl bg-[#14192B] border border-white/5 space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <span>🎪 {eventName}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                  <span>{eventDate} • {eventTime}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>{location}</span>
                </div>
              </div>

              {/* Tiers */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 block">
                  Chagua Aina ya Tiketi:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { name: 'REGULAR', price: 20000, color: 'border-blue-500/30' },
                    { name: 'VIP', price: 50000, color: 'border-purple-500/30' },
                    { name: 'VVIP', price: 100000, color: 'border-amber-500/30' },
                  ].map((tier) => {
                    const isSelected = selectedTier.name === tier.name;
                    return (
                      <button
                        key={tier.name}
                        onClick={() => setSelectedTier(tier)}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          isSelected
                            ? 'bg-purple-600 text-white font-black shadow-lg shadow-purple-600/30 scale-102 border-purple-400'
                            : 'bg-[#12162A] text-slate-300 border-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="text-xs font-bold">{tier.name}</div>
                        <div className="text-[11px] font-mono mt-1 opacity-90">
                          TSh {tier.price.toLocaleString()}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity */}
              <div className="p-3.5 rounded-2xl bg-[#12162A] border border-white/5 flex items-center justify-between">
                <span className="text-xs font-bold text-white">Idadi ya Tiketi:</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-xl bg-white/10 text-white font-bold"
                  >
                    -
                  </button>
                  <span className="text-sm font-bold text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-xl bg-purple-600 text-white font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Mobile Payment */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 block">
                  Namba ya Kulipia:
                </span>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-[#182038] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono"
                />
              </div>

              {/* Pay Button */}
              <button
                onClick={handlePay}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-purple-500/25 active:scale-95 transition-all"
              >
                <span>🔥 Lipia Tiketi (TSh {totalAmount.toLocaleString()})</span>
              </button>
            </div>
          )}

          {step === 'processing' && (
            <div className="p-8 text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto animate-pulse">
                <Smartphone className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-white">Inasubiri Malipo ya M-Pesa...</h4>
              <p className="text-xs text-slate-400 font-mono">
                TSh {totalAmount.toLocaleString()} — {phoneNumber}
              </p>
              <p className="text-xs text-purple-300 animate-pulse">
                📱 Angalia simu yako sasa na weka PIN kuidhinisha tiketi yako.
              </p>
            </div>
          )}

          {step === 'ticket' && (
            <div className="space-y-4">
              {/* DIGITAL TICKET CARD matching user specification */}
              <div className="p-5 rounded-3xl bg-gradient-to-b from-[#181B34] to-[#101222] border-2 border-purple-500/40 text-center space-y-3 relative overflow-hidden shadow-2xl">
                <div className="flex items-center justify-center gap-2 text-purple-300 font-extrabold text-sm uppercase tracking-wider">
                  <Ticket className="w-4 h-4" />
                  <span>DIGITAL TICKET</span>
                </div>

                <h4 className="text-xl font-black text-white">{eventName}</h4>

                <div className="p-3 rounded-2xl bg-black/40 border border-white/5 text-xs text-slate-200 font-mono space-y-1 text-left">
                  <p>👤 Jina: <strong>Fresh kk</strong></p>
                  <p>🎟️ Tiketi: <strong className="text-purple-400">{selectedTier.name} ({quantity})</strong></p>
                  <p>📅 Tarehe: <strong>{eventDate}</strong> • <strong>{eventTime}</strong></p>
                  <p>📍 Eneo: <strong>{location}</strong></p>
                </div>

                {/* Simulated QR Code box */}
                <div className="w-36 h-36 bg-white p-3 rounded-2xl mx-auto flex flex-col items-center justify-center shadow-lg">
                  <QrCode className="w-28 h-28 text-slate-950" />
                </div>

                <div className="text-[11px] font-mono text-purple-300 font-bold">
                  Ticket ID: {ticketId}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/30"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{copied ? 'Imenakiliwa! ✓' : 'Share Ticket'}</span>
                </button>

                <button
                  onClick={() => {
                    if (onStartChatWithOrganizer) {
                      onStartChatWithOrganizer(`Habari! Nimenunua tiketi ya ${eventName} #${ticketId} (${selectedTier.name}). Nitaona nani langoni?`);
                    }
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center gap-1"
                  title="Chat na Mwandaaji"
                >
                  <MessageCircle className="w-4 h-4 text-cyan-400" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
