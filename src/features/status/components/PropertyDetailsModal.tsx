import React, { useState } from 'react';
import {
  X,
  Home,
  MapPin,
  Bed,
  Bath,
  Car,
  Maximize2,
  Calendar,
  Phone,
  MessageCircle,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  Clock,
  Compass,
} from 'lucide-react';
import { SafeImage } from '../../../components/SafeImage';

interface PropertyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyTitle?: string;
  propertyType?: 'For Sale' | 'For Rent';
  location?: string;
  price?: number;
  beds?: number;
  baths?: number;
  parking?: number;
  areaSqMeters?: number;
  agentName?: string;
  agentPhone?: string;
  onStartChatWithAgent?: (msg: string) => void;
}

export const PropertyDetailsModal: React.FC<PropertyDetailsModalProps> = ({
  isOpen,
  onClose,
  propertyTitle = '3 Bedroom House',
  propertyType = 'For Sale',
  location = 'Mikocheni, Dar es Salaam',
  price = 350000000,
  beds = 3,
  baths = 2,
  parking = 2,
  areaSqMeters = 250,
  agentName = 'Fresh kk',
  agentPhone = '+255 714 892 012',
  onStartChatWithAgent,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [viewingDate, setViewingDate] = useState('Kesho (Tomorrow 10:00 AM)');
  const [visitorName, setVisitorName] = useState('Amina Juma');
  const [visitorPhone, setVisitorPhone] = useState('+255 714 892 012');
  const [isBookingSuccess, setIsBookingSuccess] = useState(false);

  if (!isOpen) return null;

  const galleryImages = [
    {
      url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80',
      label: 'Villa Exterior & Compound',
    },
    {
      url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
      label: 'Modern Living Room',
    },
    {
      url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&auto=format&fit=crop&q=80',
      label: 'Fully Fitted Kitchen',
    },
    {
      url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200&auto=format&fit=crop&q=80',
      label: 'Master Ensuite Bedroom',
    },
  ];

  const handleBookViewing = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBookingSuccess(true);
  };

  const handleOpenChat = () => {
    if (onStartChatWithAgent) {
      const msg = `Habari ${agentName}! Ninaulizia kuhusu nyumba ya: 🏠 "${propertyTitle}" iliyopo ${location} (TSh ${price.toLocaleString()}). Ningependa kupanga siku ya kuja kuiona physically na kupata hati miliki.`;
      onStartChatWithAgent(msg);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-lg bg-[#0A0E1A] border-t sm:border border-cyan-500/30 rounded-t-[32px] sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-4 bg-[#10162B] border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              <Home className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-cyan-400 block">
                PROPERTY {propertyType.toUpperCase()}
              </span>
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                {propertyTitle}
              </h3>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-400" />
                <span>{location}</span>
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
          {/* Main Photo Carousel */}
          <div className="space-y-2">
            <div className="aspect-[16/10] w-full rounded-2xl overflow-hidden relative bg-black shadow-lg">
              <SafeImage
                src={galleryImages[activeImageIndex].url}
                alt={galleryImages[activeImageIndex].label}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[11px] font-bold text-white">
                {galleryImages[activeImageIndex].label}
              </div>
              <div className="absolute top-2.5 right-2.5 px-3 py-1 rounded-xl bg-amber-400 text-slate-950 font-black text-xs font-mono shadow-md">
                TSh {price.toLocaleString()}
              </div>
            </div>

            {/* Thumbnail navigation */}
            <div className="grid grid-cols-4 gap-2">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`aspect-video rounded-xl overflow-hidden border-2 transition-all ${
                    activeImageIndex === idx
                      ? 'border-cyan-400 scale-[1.03]'
                      : 'border-white/10 opacity-70 hover:opacity-100'
                  }`}
                >
                  <SafeImage src={img.url} alt={img.label} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Specs Bar matching Screenshot 4 */}
          <div className="grid grid-cols-4 gap-2 p-3 rounded-2xl bg-[#12182D] border border-white/5 text-center text-xs">
            <div className="space-y-0.5">
              <Bed className="w-4 h-4 text-cyan-400 mx-auto" />
              <span className="text-white font-extrabold block">{beds} Beds</span>
              <span className="text-[10px] text-slate-400">Vyumba</span>
            </div>
            <div className="space-y-0.5">
              <Bath className="w-4 h-4 text-cyan-400 mx-auto" />
              <span className="text-white font-extrabold block">{baths} Baths</span>
              <span className="text-[10px] text-slate-400">Maliwato</span>
            </div>
            <div className="space-y-0.5">
              <Car className="w-4 h-4 text-cyan-400 mx-auto" />
              <span className="text-white font-extrabold block">{parking} Parking</span>
              <span className="text-[10px] text-slate-400">Maegesho</span>
            </div>
            <div className="space-y-0.5">
              <Maximize2 className="w-4 h-4 text-cyan-400 mx-auto" />
              <span className="text-white font-extrabold block">{areaSqMeters} m²</span>
              <span className="text-[10px] text-slate-400">Ukubwa</span>
            </div>
          </div>

          {/* Key Amenities */}
          <div className="p-3.5 rounded-2xl bg-[#12182D] border border-white/5 space-y-2">
            <span className="text-[10px] font-black uppercase text-cyan-400 tracking-wider block">
              SIFA NA HUDUMA ZA NYUMBA:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-200">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                <span>Hati Miliki ya Wizara (Title Deed)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                <span>Ulinzi Saa 24 (Gated Security)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                <span>Bwawa la Kuogelea (Swimming Pool)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                <span>Maji ya Kisima & Dawasco 24/7</span>
              </div>
            </div>
          </div>

          {/* Book Viewing Form */}
          {!isBookingSuccess ? (
            <form onSubmit={handleBookViewing} className="p-3.5 rounded-2xl bg-[#141C33] border border-cyan-500/20 space-y-3">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>Panga Siku ya Kuja Kuiona Nyumba (Schedule Viewing):</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder="Jina lako..."
                  className="bg-[#182340] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
                <input
                  type="text"
                  value={visitorPhone}
                  onChange={(e) => setVisitorPhone(e.target.value)}
                  placeholder="Namba ya simu..."
                  className="bg-[#182340] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div className="flex items-center gap-2 text-xs">
                {['Kesho 10:00 AM', 'Jumamosi 02:00 PM', 'Jumapili 11:00 AM'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setViewingDate(t)}
                    className={`flex-1 py-1.5 rounded-lg font-semibold transition-all text-[11px] ${
                      viewingDate === t
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-white/5 text-slate-300 border border-white/5'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Thibitisha Miadi ya Kuangalia Nyumba</span>
              </button>
            </form>
          ) : (
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-center space-y-1">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
              <h5 className="text-xs font-black text-white">Miadi Imepangwa Kikamilifu!</h5>
              <p className="text-[11px] text-emerald-300">
                Tarehe: <strong>{viewingDate}</strong>. Dalali <strong>{agentName}</strong> atawasiliana nawe kwa simu.
              </p>
            </div>
          )}

          {/* Action Buttons: Chat & Call Agent */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleOpenChat}
              className="py-3 px-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/25 active:scale-95 transition-all"
            >
              <MessageCircle className="w-4 h-4 stroke-[2.5]" />
              <span>💬 Chat na Dalali</span>
            </button>

            <a
              href={`tel:${agentPhone}`}
              className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>📞 Piga Simu</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
