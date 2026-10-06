import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  CheckCircle2,
  Smartphone,
  MapPin,
  ChevronRight,
  MessageCircle,
  Truck,
  ShieldCheck,
} from 'lucide-react';
import { SafeImage } from '../../../components/SafeImage';

interface ProductPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
  sellerName?: string;
  regularPrice?: number;
  salePrice?: number;
  mediaUrl?: string;
  onStartChatWithSeller?: (message: string) => void;
}

export const ProductPurchaseModal: React.FC<ProductPurchaseModalProps> = ({
  isOpen,
  onClose,
  productName = 'Nike Air Max',
  sellerName = 'Fresh Store Dar',
  regularPrice = 200000,
  salePrice = 175000,
  mediaUrl = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=80',
  onStartChatWithSeller,
}) => {
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Black');
  const [quantity, setQuantity] = useState(1);
  const [deliveryLocation, setDeliveryLocation] = useState('Masaki, Dar es Salaam');
  const [phoneNumber, setPhoneNumber] = useState('+255 714 892 012');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'M-Pesa' | 'Airtel Money' | 'Mixx by Yas' | 'HaloPesa' | 'Cash'>('M-Pesa');
  const [step, setStep] = useState<'details' | 'processing' | 'success'>('details');
  const [countdown, setCountdown] = useState(3);

  if (!isOpen) return null;

  const deliveryFee = 3000;
  const totalAmount = salePrice * quantity + deliveryFee;
  const orderNumber = `PR-${Math.floor(1000 + Math.random() * 9000)}`;

  const handleStartPayment = () => {
    setStep('processing');
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setStep('success');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-md bg-[#0A0D18] border-t sm:border border-emerald-500/30 rounded-t-[32px] sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-4 bg-[#11172A] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                Nunua Bidhaa (Buy Now)
              </h3>
              <p className="text-[11px] text-emerald-400 font-medium">
                {sellerName} ✓
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
          {step === 'details' && (
            <div className="space-y-4">
              {/* Product preview */}
              <div className="p-3 rounded-2xl bg-[#13192B] border border-white/5 flex items-center gap-3">
                <SafeImage
                  src={mediaUrl}
                  fallbackText="Prod"
                  className="w-16 h-16 rounded-xl object-cover border border-white/10"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-white truncate">
                    {productName}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-emerald-400 font-black text-sm font-mono">
                      TSh {salePrice.toLocaleString()}
                    </span>
                    <span className="text-slate-500 text-xs line-through font-mono">
                      TSh {regularPrice.toLocaleString()}
                    </span>
                  </div>
                  <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                    🔥 12.5% OFF
                  </span>
                </div>
              </div>

              {/* Variants: Size and Color */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1.5">
                  <span className="font-bold text-slate-300 block">Chagua Size:</span>
                  <div className="flex items-center gap-1.5">
                    {['S', 'M', 'L', 'XL'].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`w-8 h-8 rounded-lg font-bold border transition-all ${
                          selectedSize === sz
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/30'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="font-bold text-slate-300 block">Rangi (Color):</span>
                  <div className="flex items-center gap-1.5">
                    {['Black', 'White', 'Blue'].map((clr) => (
                      <button
                        key={clr}
                        type="button"
                        onClick={() => setSelectedColor(clr)}
                        className={`px-2.5 py-1 rounded-lg font-bold border text-[11px] transition-all ${
                          selectedColor === clr
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                            : 'bg-white/5 border-white/10 text-slate-300'
                        }`}
                      >
                        {clr}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="p-3.5 rounded-2xl bg-[#13192B] border border-white/5 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-emerald-400" />
                    <span>Eneo la Kuletewa (Delivery):</span>
                  </span>
                  <span className="text-slate-400 font-mono">TSh 3,000</span>
                </div>
                <input
                  type="text"
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  className="w-full bg-[#182038] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              {/* Phone number */}
              <div className="p-3.5 rounded-2xl bg-[#13192B] border border-white/5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-cyan-400" />
                    <span>Namba ya Malipo:</span>
                  </span>
                  <button
                    onClick={() => setIsEditingPhone(!isEditingPhone)}
                    className="text-cyan-400 text-[11px] font-semibold hover:underline"
                  >
                    {isEditingPhone ? 'Hifadhi' : 'Badili Namba'}
                  </button>
                </div>
                {isEditingPhone ? (
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-[#182038] border border-cyan-400 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                ) : (
                  <div className="p-2 rounded-xl bg-black/40 border border-white/5 font-mono text-slate-300 flex items-center justify-between">
                    <span>{phoneNumber}</span>
                    <span className="text-emerald-400 text-[11px]">✓ Imeunganishwa</span>
                  </div>
                )}
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 block">Njia ya Malipo:</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {['M-Pesa', 'Airtel Money', 'Mixx by Yas', 'HaloPesa', 'Cash'].map((m) => (
                    <button
                      key={m}
                      onClick={() => setPaymentMethod(m as any)}
                      className={`p-2.5 rounded-xl border text-left font-bold transition-all ${
                        paymentMethod === m
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                          : 'bg-white/5 border-white/5 text-slate-300'
                      }`}
                    >
                      {paymentMethod === m ? '● ' : '○ '}
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary & Button */}
              <div className="pt-2 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between text-sm font-bold text-white">
                  <span>Jumla Kuu (Total):</span>
                  <span className="text-emerald-400 font-mono text-base">
                    TSh {totalAmount.toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={handleStartPayment}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 active:scale-95 transition-all"
                >
                  Lipia Sasa (TSh {totalAmount.toLocaleString()})
                </button>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto animate-pulse">
                <Smartphone className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest block">
                  PAYMENT REQUEST PUSH 📱
                </span>
                <h4 className="text-2xl font-black text-white mt-1">
                  TSh {totalAmount.toLocaleString()}
                </h4>
                <p className="text-xs text-slate-300 font-mono mt-0.5">
                  {paymentMethod} — {phoneNumber}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#13192B] border border-emerald-500/30 text-xs text-slate-300 space-y-2">
                <p className="text-emerald-300 font-semibold animate-pulse">
                  Tafadhali angalia simu yako na uweke PIN kuidhinisha malipo.
                </p>
                <p className="text-[11px] text-slate-400">
                  Inathibitisha malipo... ({countdown}s)
                </p>
              </div>
              <button
                onClick={() => setStep('details')}
                className="text-xs text-slate-400 hover:text-rose-400 font-semibold"
              >
                Ghairi Malipo
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                  MALIPO YAMEFANIKIWA ✅
                </span>
                <h4 className="text-2xl font-black text-white mt-1">
                  Oda #{orderNumber}
                </h4>
                <p className="text-xs text-emerald-300 font-mono font-bold mt-0.5">
                  TSh {totalAmount.toLocaleString()} PAID
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#13192B] border border-white/5 text-left text-xs text-slate-300 space-y-1">
                <p>🛍️ Bidhaa: <strong>{productName} (Size {selectedSize}, {selectedColor})</strong></p>
                <p>📍 Uwasilishaji: <strong>{deliveryLocation}</strong></p>
                <p>🏪 Muuzaji: <strong>{sellerName}</strong></p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => {
                    if (onStartChatWithSeller) {
                      onStartChatWithSeller(
                        `Habari ${sellerName}! Nimenunua ${productName} (Size: ${selectedSize}, Rangi: ${selectedColor}) Oda #${orderNumber}. Nimeshalipa TSh ${totalAmount.toLocaleString()}. Tafadhali naomba kujua safari ya mzigo wangu!`
                      );
                    }
                    onClose();
                  }}
                  className="flex-1 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>💬 Chat na Muuzaji</span>
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
