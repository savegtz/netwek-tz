import React, { useState, useEffect } from 'react';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  MapPin,
  Utensils,
  Navigation,
  Car,
  Clock,
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  ChevronRight,
  MessageCircle,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { SafeImage } from '../../../components/SafeImage';

interface FoodOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  foodName?: string;
  restaurantName?: string;
  initialPrice?: number;
  onStartChatWithRestaurant?: (message: string) => void;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  icon: string;
  description: string;
}

export const FoodOrderModal: React.FC<FoodOrderModalProps> = ({
  isOpen,
  onClose,
  foodName = 'Chicken Burger',
  restaurantName = 'Zebra Restaurant',
  initialPrice = 12000,
  onStartChatWithRestaurant,
}) => {
  // Step in the ordering process: 'menu' | 'fulfillment' | 'checkout' | 'processing' | 'success'
  const [step, setStep] = useState<'menu' | 'fulfillment' | 'checkout' | 'processing' | 'success'>('menu');

  // Menu & Cart State
  const [menuItems] = useState<MenuItem[]>([
    { id: 'item_1', name: 'Chicken Burger', price: 12000, icon: '🍔', description: 'Juicy crispy chicken, fresh lettuce, cheddar cheese' },
    { id: 'item_2', name: 'Grilled Chicken', price: 15000, icon: '🍗', description: 'Flame-grilled marinated half chicken with peri-peri' },
    { id: 'item_3', name: 'French Fries', price: 5000, icon: '🍟', description: 'Golden crispy potato chips with seasoning' },
    { id: 'item_4', name: 'Zebra Special Pizza', price: 22000, icon: '🍕', description: 'Wood-fired beef & mozzarella pizza' },
    { id: 'item_5', name: 'Fresh Passion Juice', price: 4000, icon: '🍹', description: 'Chilled natural passion fruit drink' },
  ]);

  const [cart, setCart] = useState<Record<string, number>>({
    item_1: 1,
    item_3: 1,
  });

  // Fulfillment Mode: 'delivery' | 'dine_in' | 'pickup'
  const [fulfillmentType, setFulfillmentType] = useState<'delivery' | 'dine_in' | 'pickup'>('delivery');

  // Delivery Details
  const [deliveryAddress, setDeliveryAddress] = useState('Masaki, Haile Selassie Rd, Dar es Salaam');
  const [isLocating, setIsLocating] = useState(false);

  // Dine-in Details
  const [selectedTable, setSelectedTable] = useState('Table 03');
  const [dineDate, setDineDate] = useState('06 Oct 2026');
  const [dineTime, setDineTime] = useState('07:30 PM');
  const [guestCount, setGuestCount] = useState(2);
  const [isTableConfirmed, setIsTableConfirmed] = useState(false);

  // Payment Details
  const [phoneNumber, setPhoneNumber] = useState('+255 714 892 012');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'M-Pesa' | 'Airtel Money' | 'Mixx by Yas' | 'HaloPesa' | 'Cash'>('M-Pesa');

  // Processing state countdown
  const [processingTime, setProcessingTime] = useState(3);
  const orderNumber = 'ZR1024';

  useEffect(() => {
    if (!isOpen) {
      setStep('menu');
      setIsTableConfirmed(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      const current = prev[itemId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return { ...prev, [itemId]: next };
    });
  };

  const cartTotalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const subtotal = Object.entries(cart).reduce((sum, [itemId, qty]) => {
    const item = menuItems.find((m) => m.id === itemId);
    return sum + (item ? item.price * qty : 0);
  }, 0);
  const deliveryFee = fulfillmentType === 'delivery' ? 2000 : 0;
  const grandTotal = subtotal + deliveryFee;

  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    setTimeout(() => {
      setDeliveryAddress('Masaki Peninsula, Dar es Salaam (GPS Accurate)');
      setIsLocating(false);
    }, 600);
  };

  const handleStartPaymentPush = () => {
    setStep('processing');
    setProcessingTime(3);

    // Simulate mobile money push request and webhook verification
    const timer = setInterval(() => {
      setProcessingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setStep('success');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-lg bg-[#0A0E1A] border-t sm:border border-amber-500/30 rounded-t-[32px] sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95">
        {/* Top Header */}
        <div className="p-4 bg-[#10162A] border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-1.5">
                <span>{restaurantName}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  Open Now
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-400" />
                <span>Masaki, Dar es Salaam • Fast Delivery 🛵</span>
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

        {/* Content Body Based on Step */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* STEP 1: RESTAURANT MENU & CART */}
          {step === 'menu' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs uppercase tracking-wider text-amber-400">
                  🔥 Menyu ya Leo (Popular Menu)
                </h4>
                <span className="text-[11px] text-slate-400">
                  Chagua chakula unachotaka
                </span>
              </div>

              <div className="space-y-2.5">
                {menuItems.map((item) => {
                  const qty = cart[item.id] || 0;
                  return (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-[#12172A] border border-white/5 hover:border-amber-500/30 flex items-center justify-between gap-3 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-2xl p-2 rounded-xl bg-black/30 shrink-0">
                          {item.icon}
                        </span>
                        <div className="min-w-0">
                          <h5 className="font-bold text-xs sm:text-sm text-white truncate">
                            {item.name}
                          </h5>
                          <p className="text-[11px] text-amber-300 font-extrabold mt-0.5">
                            TSh {item.price.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {qty > 0 && (
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-7 h-7 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all active:scale-95"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {qty > 0 && (
                          <span className="font-bold text-xs text-white px-1">
                            {qty}
                          </span>
                        )}
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-7 h-7 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center font-bold transition-all active:scale-95"
                        >
                          <Plus className="w-4 h-4 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Cart Bar */}
              {cartTotalItems > 0 && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-500/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-amber-400" />
                    <div>
                      <span className="text-xs font-bold text-white">
                        Cart ({cartTotalItems} items)
                      </span>
                      <p className="text-xs text-amber-300 font-extrabold">
                        TSh {subtotal.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setStep('fulfillment')}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
                  >
                    <span>Endelea na Oda</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: FULFILLMENT (Delivery vs Dine-in vs Pickup) */}
          {step === 'fulfillment' && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-white">
                Unapendelea kupokea vipi oda yako?
              </h4>

              {/* Tabs for Delivery, Dine-in, Pickup */}
              <div className="grid grid-cols-3 gap-2 bg-[#12172A] p-1.5 rounded-2xl border border-white/5">
                {[
                  { id: 'delivery', label: '🏠 Delivery', desc: 'Uletewe' },
                  { id: 'dine_in', label: '🪑 Dine-in', desc: 'Kwenye Meza' },
                  { id: 'pickup', label: '🛍️ Pickup', desc: 'Uchukulie' },
                ].map((tab) => {
                  const isSelected = fulfillmentType === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setFulfillmentType(tab.id as any)}
                      className={`p-2 rounded-xl text-center transition-all ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold">{tab.label}</div>
                      <div className="text-[10px] opacity-75">{tab.desc}</div>
                    </button>
                  );
                })}
              </div>

              {/* Delivery Details Section */}
              {fulfillmentType === 'delivery' && (
                <div className="p-4 rounded-2xl bg-[#12172A] border border-white/5 space-y-3">
                  <h5 className="font-bold text-xs text-white flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 text-amber-400" />
                    <span>Wapi chakula kiletwe?</span>
                  </h5>

                  <div className="relative">
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Andika mtaa au eneo lako..."
                      className="w-full bg-[#182038] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleUseCurrentLocation}
                      disabled={isLocating}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{isLocating ? 'Inatafuta GPS...' : '📍 Tumia eneo nilipo (GPS)'}</span>
                    </button>
                    <span className="text-[11px] text-slate-400">Ada: TSh 2,000</span>
                  </div>
                </div>
              )}

              {/* Dine-in Table Selection */}
              {fulfillmentType === 'dine_in' && (
                <div className="p-4 rounded-2xl bg-[#12172A] border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-xs text-white">
                      🪑 Chagua Meza (Select Table)
                    </h5>
                    <span className="text-[11px] text-emerald-400 font-semibold">
                      Zebra Restaurant
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'Table 01', status: 'available', label: 'Table 01 🟢 Available' },
                      { id: 'Table 02', status: 'occupied', label: 'Table 02 🔴 Occupied' },
                      { id: 'Table 03', status: 'available', label: 'Table 03 🟢 Available' },
                      { id: 'Table 04', status: 'available', label: 'Table 04 🟢 Available' },
                    ].map((tbl) => {
                      const isOccupied = tbl.status === 'occupied';
                      const isSelected = selectedTable === tbl.id;
                      return (
                        <button
                          key={tbl.id}
                          disabled={isOccupied}
                          onClick={() => setSelectedTable(tbl.id)}
                          className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                            isOccupied
                              ? 'bg-rose-500/10 border-rose-500/20 text-slate-500 cursor-not-allowed'
                              : isSelected
                              ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                              : 'bg-white/5 border-white/5 text-slate-300 hover:border-white/20'
                          }`}
                        >
                          {tbl.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Date, Arrival Time, Guest Count */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">📅 Tarehe</span>
                      <input
                        type="text"
                        value={dineDate}
                        onChange={(e) => setDineDate(e.target.value)}
                        className="w-full bg-[#182038] border border-white/10 rounded-lg p-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">🕐 Saa ya Kufika</span>
                      <input
                        type="text"
                        value={dineTime}
                        onChange={(e) => setDineTime(e.target.value)}
                        className="w-full bg-[#182038] border border-white/10 rounded-lg p-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">👥 Watu</span>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={guestCount}
                        onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
                        className="w-full bg-[#182038] border border-white/10 rounded-lg p-1.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                    ✓ {selectedTable} • {guestCount} Watu • {dineTime}
                  </div>
                </div>
              )}

              {/* Pickup Option */}
              {fulfillmentType === 'pickup' && (
                <div className="p-4 rounded-2xl bg-[#12172A] border border-white/5 space-y-3">
                  <h5 className="font-bold text-xs text-white flex items-center gap-1.5">
                    <span>🏪 Eneo la Kuchukulia (Pickup From)</span>
                  </h5>
                  <p className="text-xs font-semibold text-amber-300">
                    ZEBRA RESTAURANT — Masaki, Dar es Salaam
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Muda wa kuandaa chakula: <strong>20–30 dakika</strong>
                  </p>

                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <button
                      onClick={() => alert('Location imeigizwa kwenye ramani!')}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1"
                    >
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>Tazama Ramani</span>
                    </button>
                    <button
                      onClick={() => window.open('https://maps.google.com', '_blank')}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Fungua Google Maps</span>
                    </button>
                    <button
                      onClick={() => alert('Inafungua Bolt ride app...')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1"
                    >
                      <Car className="w-3.5 h-3.5" />
                      <span>Fungua Bolt Ride</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setStep('menu')}
                  className="px-4 py-2 rounded-xl bg-white/10 text-slate-300 hover:text-white text-xs font-bold"
                >
                  Rudi Nyuma
                </button>
                <button
                  onClick={() => setStep('checkout')}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                >
                  <span>Endelea na Malipo</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CHECKOUT & PAYMENT SELECTION */}
          {step === 'checkout' && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-white">
                Muhtasari wa Malipo (Order Checkout)
              </h4>

              {/* Order breakdown */}
              <div className="p-3.5 rounded-2xl bg-[#12172A] border border-white/5 space-y-2 text-xs">
                {Object.entries(cart).map(([itemId, qty]) => {
                  const item = menuItems.find((m) => m.id === itemId);
                  if (!item) return null;
                  return (
                    <div key={itemId} className="flex items-center justify-between text-slate-300">
                      <span>{item.icon} {item.name} ×{qty}</span>
                      <span className="font-mono">TSh {(item.price * qty).toLocaleString()}</span>
                    </div>
                  );
                })}
                <div className="border-t border-white/10 pt-2 flex items-center justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-mono">TSh {subtotal.toLocaleString()}</span>
                </div>
                {fulfillmentType === 'delivery' && (
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Gharama ya Usafiri (Delivery)</span>
                    <span className="font-mono">TSh 2,000</span>
                  </div>
                )}
                <div className="border-t border-white/10 pt-2 flex items-center justify-between text-white font-extrabold text-sm">
                  <span>JUMLA KUU (TOTAL)</span>
                  <span className="text-amber-400 font-mono">TSh {grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Phone number & automatic account fill */}
              <div className="p-3.5 rounded-2xl bg-[#12172A] border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-cyan-400" />
                    <span>Namba ya Simu ya Malipo</span>
                  </span>
                  <button
                    onClick={() => setIsEditingPhone(!isEditingPhone)}
                    className="text-[11px] text-cyan-400 hover:underline font-semibold"
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
                  <div className="p-2 rounded-xl bg-black/30 border border-white/5 text-xs text-slate-200 font-mono flex items-center justify-between">
                    <span>{phoneNumber}</span>
                    <span className="text-emerald-400 font-bold text-[11px]">✓ Imehakikiwa</span>
                  </div>
                )}
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 block">
                  Chagua Njia ya Malipo (Payment Method):
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'M-Pesa', color: 'text-rose-400 border-rose-500/30' },
                    { id: 'Airtel Money', color: 'text-red-400 border-red-500/30' },
                    { id: 'Mixx by Yas', color: 'text-blue-400 border-blue-500/30' },
                    { id: 'HaloPesa', color: 'text-amber-400 border-amber-500/30' },
                    { id: 'Cash', color: 'text-emerald-400 border-emerald-500/30' },
                  ].map((method) => {
                    const isSelected = paymentMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                            : 'bg-white/5 border-white/5 text-slate-300 hover:border-white/20'
                        }`}
                      >
                        {isSelected ? '● ' : '○ '}
                        {method.id}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Continue to Payment Button */}
              <button
                onClick={handleStartPaymentPush}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 active:scale-95 transition-all"
              >
                <span>🔥 Lipia Sasa (TSh {grandTotal.toLocaleString()})</span>
              </button>
            </div>
          )}

          {/* STEP 4: PROCESSING MOBILE MONEY PUSH */}
          {step === 'processing' && (
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto animate-pulse">
                <Smartphone className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
                  PAYMENT REQUEST SENT 📱
                </span>
                <h4 className="text-xl font-extrabold text-white">
                  TSh {grandTotal.toLocaleString()}
                </h4>
                <p className="text-xs text-slate-300 font-mono">
                  {paymentMethod} — {phoneNumber}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#12172A] border border-amber-500/30 text-xs text-slate-300 space-y-2">
                <p className="font-semibold text-amber-300 animate-pulse">
                  Tafadhali angalia simu yako sasa hivi na uweke PIN ili kuidhinisha malipo.
                </p>
                <p className="text-[11px] text-slate-400">
                  Waiting for network verification webhook... ({processingTime}s)
                </p>
              </div>

              <button
                onClick={() => setStep('checkout')}
                className="text-xs text-slate-400 hover:text-rose-400 font-semibold"
              >
                Ghairi Malipo (Cancel)
              </button>
            </div>
          )}

          {/* STEP 5: SUCCESSFUL PAYMENT & ORDER CONFIRMED */}
          {step === 'success' && (
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                  MALIPO YAMEFANIKIWA (PAYMENT SUCCESSFUL)
                </span>
                <h4 className="text-2xl font-black text-white mt-1">
                  Oda #{orderNumber}
                </h4>
                <p className="text-xs text-emerald-300 font-bold mt-0.5">
                  TSh {grandTotal.toLocaleString()} PAID via {paymentMethod}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#12172A] border border-white/5 text-left text-xs text-slate-300 space-y-1">
                <p>📍 Restaurant: <strong>{restaurantName}</strong></p>
                <p>
                  🛵 Njia: <strong>{fulfillmentType === 'delivery' ? `Delivery kwenda ${deliveryAddress}` : fulfillmentType === 'dine_in' ? `Dine-in (${selectedTable}, ${guestCount} People)` : 'Pickup dukani'}</strong>
                </p>
                <p>⏱️ Muda wa makadirio: <strong>Dakika 20-30</strong></p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => {
                    if (onStartChatWithRestaurant) {
                      onStartChatWithRestaurant(
                        `Habari ${restaurantName}! Nimekamilisha oda yangu #${orderNumber} ya TSh ${grandTotal.toLocaleString()} (${Object.entries(cart).map(([id, q]) => `${menuItems.find(m => m.id === id)?.name} ×${q}`).join(', ')}). Tafadhali thibitisha uwasilishaji.`
                      );
                    }
                    onClose();
                  }}
                  className="flex-1 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>💬 Chat na Restaurant</span>
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
