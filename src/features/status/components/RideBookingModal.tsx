import React, { useState } from 'react';
import {
  X,
  Car,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  Phone,
  MessageCircle,
  Navigation,
} from 'lucide-react';

interface RideBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  pickupLocation?: string;
  destination?: string;
  departureTime?: string;
  farePerPerson?: number;
  availableSeats?: number;
  driverName?: string;
  vehicleType?: string;
  numberPlate?: string;
  onStartChatWithDriver?: (msg: string) => void;
}

export const RideBookingModal: React.FC<RideBookingModalProps> = ({
  isOpen,
  onClose,
  pickupLocation = 'Masaki (Kutoka)',
  destination = 'Mbezi Beach (Kwenda)',
  departureTime = 'Leo • 07:30 PM',
  farePerPerson = 5000,
  availableSeats = 2,
  driverName = 'Fresh kk',
  vehicleType = 'Toyota Noah',
  numberPlate = 'T 123 ABC',
  onStartChatWithDriver,
}) => {
  const [selectedSeats, setSelectedSeats] = useState(1);
  const [isBooked, setIsBooked] = useState(false);

  if (!isOpen) return null;

  const totalFare = farePerPerson * selectedSeats;

  const handleConfirmRide = () => {
    setIsBooked(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-md bg-[#090D18] border-t sm:border border-emerald-500/30 rounded-t-[32px] sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-4 bg-[#0E1528] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                Ungana na Safari (Join Ride)
              </h3>
              <p className="text-[11px] text-emerald-400 font-semibold">
                Ride Sharing • {vehicleType}
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
          {!isBooked ? (
            <div className="space-y-4">
              {/* Route Card */}
              <div className="p-4 rounded-2xl bg-[#12192F] border border-white/5 space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Kuanzia</span>
                    <p className="font-bold text-xs text-white">{pickupLocation}</p>
                  </div>
                </div>

                <div className="w-0.5 h-4 bg-white/20 ml-1.5" />

                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500 ring-4 ring-rose-500/20 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Kuelekea</span>
                    <p className="font-bold text-xs text-white">{destination}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{departureTime}</span>
                  </span>
                  <span className="font-mono text-cyan-300">~18 km</span>
                </div>
              </div>

              {/* Driver & Car Info */}
              <div className="p-3.5 rounded-2xl bg-[#12192F] border border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-white flex items-center gap-1.5">
                    <span>Dereva: {driverName}</span>
                    <span className="text-[10px] text-amber-400 font-semibold">⭐ 4.9 (86 rides)</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                    {vehicleType} • {numberPlate}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-semibold">Mchango kwa mtu</span>
                  <span className="text-sm font-extrabold text-emerald-400 font-mono">
                    TSh {farePerPerson.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Seats Selection */}
              <div className="p-3.5 rounded-2xl bg-[#12192F] border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Idadi ya Viti:</span>
                  <span className="text-[10px] text-slate-400">
                    Nafasi zilizopo: {availableSeats}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {[1, 2, 3].map((num) => {
                    const isSelected = selectedSeats === num;
                    return (
                      <button
                        key={num}
                        onClick={() => setSelectedSeats(num)}
                        className={`w-9 h-9 rounded-xl font-bold text-xs transition-all ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                            : 'bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Join Button */}
              <button
                onClick={handleConfirmRide}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 active:scale-95 transition-all"
              >
                <Car className="w-4 h-4 stroke-[2.5]" />
                <span>Thibitisha Safari (TSh {totalFare.toLocaleString()})</span>
              </button>
            </div>
          ) : (
            /* Booking Confirmed */
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                  NAFASI IMETHIBITISHWA! (BOOKING CONFIRMED)
                </span>
                <h4 className="text-xl font-black text-white mt-1">
                  {selectedSeats} Seat(s) Booked
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Mchango: <strong>TSh {totalFare.toLocaleString()}</strong> (Lipa wakati wa kupanda)
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#12192F] border border-white/5 text-left text-xs text-slate-300 space-y-1">
                <p>📍 Eneo la kukutana: <strong>{pickupLocation}</strong></p>
                <p>🕐 Muda wa kuondoka: <strong>{departureTime}</strong></p>
                <p>🚗 Chombo: <strong>{vehicleType} ({numberPlate})</strong></p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => {
                    if (onStartChatWithDriver) {
                      onStartChatWithDriver(
                        `Habari ${driverName}! Nimethibitisha kujiunga na safari yako kutoka ${pickupLocation} kwenda ${destination} saa ${departureTime}. Nipo tayari!`
                      );
                    }
                    onClose();
                  }}
                  className="flex-1 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>💬 Chat na Dereva ({driverName})</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs"
                >
                  Sawa
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
