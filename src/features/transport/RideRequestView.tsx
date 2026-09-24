import React, { useState } from 'react';
import {
  ArrowLeft,
  MapPin,
  Navigation,
  Car,
  Clock,
  Users,
  ShieldCheck,
  CheckCircle2,
  X,
} from 'lucide-react';
import { RideOption } from '../../types';
import { PaymentService } from '../../services/payments/paymentService';

interface RideRequestViewProps {
  onBack?: () => void;
}

export const RideRequestView: React.FC<RideRequestViewProps> = ({ onBack }) => {
  const [pickup, setPickup] = useState('Mlimani City, Dar es Salaam');
  const [destination, setDestination] = useState('Arusha City Center');
  const [selectedTier, setSelectedTier] = useState<'Economy' | 'Comfort' | 'XL'>('Economy');
  const [rideStatus, setRideStatus] = useState<'idle' | 'searching' | 'matched' | 'completed'>('idle');
  const [driverInfo, setDriverInfo] = useState<{
    name: string;
    car: string;
    plate: string;
    rating: number;
    eta: number;
  } | null>(null);

  const options: RideOption[] = [
    { tier: 'Economy', name: 'Economy', seats: '3 seats', etaMinutes: 4, price: 8000, currency: 'TZS', icon: '🚗' },
    { tier: 'Comfort', name: 'Comfort', seats: '4 seats', etaMinutes: 6, price: 12000, currency: 'TZS', icon: '🚙' },
    { tier: 'XL', name: 'XL', seats: '6 seats', etaMinutes: 8, price: 18000, currency: 'TZS', icon: '🚐' },
  ];

  const handleRequestRide = () => {
    setRideStatus('searching');
    setTimeout(() => {
      setRideStatus('matched');
      setDriverInfo({
        name: 'Juma Bakari',
        car: 'Toyota Crown Silver',
        plate: 'T 842 DZF',
        rating: 4.9,
        eta: 4,
      });
    }, 2000);
  };

  return (
    <div className="w-full flex flex-col bg-[#070A12] text-white flex-1 pb-28 md:pb-12 select-none">
      <div className="max-w-4xl mx-auto w-full flex flex-col flex-1">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          {onBack && (
            <button onClick={onBack} className="p-1 text-slate-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h3 className="font-bold text-base text-white">Ride Request</h3>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-medium">
          Zenia Mobility
        </span>
      </div>

      {/* Stylized Interactive Map Route Preview (Matching Screenshot Screen 11) */}
      <div className="relative h-44 w-full bg-[#11162B] overflow-hidden border-b border-white/10 flex items-center justify-center">
        {/* Subtle grid pattern for map styling */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Animated route vector */}
        <svg className="w-full h-full absolute inset-0 pointer-events-none">
          <path
            d="M 60 110 Q 180 30 340 80"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="4"
            strokeDasharray="6 4"
            className="animate-pulse"
          />
        </svg>

        {/* Pickup Pin */}
        <div className="absolute left-12 bottom-8 flex flex-col items-center">
          <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/50">
            <div className="w-2 h-2 rounded-full bg-white" />
          </div>
          <span className="text-[10px] font-bold text-cyan-300 mt-1 bg-black/60 px-1.5 py-0.5 rounded">
            Mlimani City
          </span>
        </div>

        {/* Destination Pin */}
        <div className="absolute right-12 top-10 flex flex-col items-center">
          <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/50">
            <Navigation className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-[10px] font-bold text-purple-300 mt-1 bg-black/60 px-1.5 py-0.5 rounded">
            Arusha
          </span>
        </div>
      </div>

      {/* Pickup & Destination Form Inputs */}
      <div className="p-4 space-y-2 border-b border-white/5">
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#14192B] border border-white/5">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0" />
          <input
            type="text"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            className="flex-1 bg-transparent text-xs text-white focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#14192B] border border-white/5">
          <div className="w-2.5 h-2.5 rounded-full bg-purple-400 shrink-0" />
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="flex-1 bg-transparent text-xs text-white focus:outline-none"
          />
        </div>
      </div>

      {/* Vehicle Tier Options: Economy, Comfort, XL (Matching Screenshot Screen 11) */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2.5">
          {options.map((opt) => {
            const isSelected = selectedTier === opt.tier;
            return (
              <button
                key={opt.tier}
                onClick={() => setSelectedTier(opt.tier)}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-cyan-500/15 border-cyan-400 shadow-md'
                    : 'bg-[#14192B] border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{opt.icon}</div>
                  <div>
                    <h5 className="font-bold text-xs text-white flex items-center gap-2">
                      {opt.name}
                      <span className="text-[10px] text-slate-400 font-normal">
                        {opt.etaMinutes} min • {opt.seats}
                      </span>
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">Instant dispatch nearby</p>
                  </div>
                </div>
                <span className="font-extrabold text-xs text-cyan-300">
                  {opt.currency} {opt.price.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live status or Request Button */}
        <div className="pt-4">
          {rideStatus === 'idle' && (
            <button
              onClick={handleRequestRide}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-xl shadow-cyan-500/30 active:scale-95 transition-all"
            >
              Request Ride
            </button>
          )}

          {rideStatus === 'searching' && (
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-center animate-pulse">
              <p className="text-xs font-bold text-cyan-300">Searching for nearby drivers...</p>
              <p className="text-[10px] text-slate-400 mt-1">Connecting with Zenia mobility network</p>
            </div>
          )}

          {rideStatus === 'matched' && driverInfo && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 animate-in fade-in">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-xs text-white">Driver Assigned!</span>
                </div>
                <span className="text-xs text-emerald-300 font-mono font-bold">
                  ETA {driverInfo.eta} MIN
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/30 text-xs flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">{driverInfo.name} ★ {driverInfo.rating}</p>
                  <p className="text-slate-300">{driverInfo.car}</p>
                </div>
                <span className="px-2 py-1 rounded bg-white text-slate-900 font-mono font-black text-xs">
                  {driverInfo.plate}
                </span>
              </div>
              <button
                onClick={() => setRideStatus('idle')}
                className="w-full mt-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-slate-300"
              >
                Cancel / Reset Ride
              </button>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};
