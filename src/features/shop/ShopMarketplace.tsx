import React, { useState } from 'react';
import {
  Search,
  Laptop,
  Shirt,
  Home,
  Sparkles,
  Activity,
  Star,
  ShoppingBag,
  Bell,
  SlidersHorizontal,
  Plus,
  Check,
  CreditCard,
  X,
} from 'lucide-react';
import { ProductItem, CartItem, OrderItem } from '../../types';
import { INITIAL_PRODUCTS } from '../../services/seed/initialData';
import { PaymentService } from '../../services/payments/paymentService';
import { SafeImage } from '../../components/SafeImage';

interface ShopMarketplaceProps {
  onStartChatWithSeller: (sellerId: string, sellerName: string) => void;
  onOpenCreateProduct: () => void;
}

export const ShopMarketplace: React.FC<ShopMarketplaceProps> = ({
  onStartChatWithSeller,
  onOpenCreateProduct,
}) => {
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<OrderItem | null>(null);

  const categories = [
    { id: 'All', label: 'All', icon: Sparkles },
    { id: 'Electronics', label: 'Electronics', icon: Laptop },
    { id: 'Fashion', label: 'Fashion', icon: Shirt },
    { id: 'Home', label: 'Home', icon: Home },
    { id: 'Beauty', label: 'Beauty', icon: Sparkles },
    { id: 'Sports', label: 'Sports', icon: Activity },
  ];

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const addToCart = (product: ProductItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const totalCartAmount = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setPaymentProcessing(true);

    try {
      const result = await PaymentService.processPayment({
        amount: totalCartAmount,
        currency: 'TZS',
        description: `Purchase of ${cart.length} item(s) from Zenia Marketplace`,
        paymentMethod: 'mobile_money',
        payerInfo: {
          userId: 'current_user_id',
          name: 'Amina Kaunga',
          phoneNumber: '+255 755 123456',
        },
      });

      if (result.status === 'paid') {
        const newOrder: OrderItem = {
          id: result.transactionId,
          buyerId: 'current_user_id',
          sellerId: cart[0].product.sellerId,
          items: cart.map((c) => ({
            productId: c.product.id,
            productName: c.product.name,
            price: c.product.price,
            quantity: c.quantity,
            imageUrl: c.product.images[0],
          })),
          totalAmount: totalCartAmount,
          currency: 'TZS',
          status: 'paid',
          paymentMethod: 'Mobile Money (M-Pesa)',
          deliveryAddress: 'Plot 42, Ali Hassan Mwinyi Rd, Dar es Salaam',
          createdAt: new Date().toISOString(),
        };
        setOrderSuccess(newOrder);
        setCart([]);
      }
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setPaymentProcessing(false);
    }
  };

  return (
    <div className="w-full flex flex-col bg-[#070A12] text-white flex-1 pb-28 select-none">
      {/* Search Bar & Cart Action */}
      <div className="px-4 pt-3 pb-2 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products, tech, fashion..."
            className="w-full bg-[#121626] border border-white/[0.08] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-colors shadow-inner"
          />
        </div>

        <button
          onClick={() => setIsCartOpen(true)}
          className="p-2.5 rounded-2xl bg-[#121626] border border-white/[0.08] hover:border-cyan-500/40 text-slate-200 hover:text-white transition-all relative active:scale-95 shrink-0"
          title="Shopping Cart"
        >
          <ShoppingBag className="w-5 h-5 text-cyan-400" />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 text-[9px] font-black text-slate-950 flex items-center justify-center shadow-md animate-scale">
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </span>
          )}
        </button>
      </div>

      {/* Categories Row (Electronics, Fashion, Home, Beauty, Sports) */}
      <div className="px-4 py-2 flex items-center gap-3 overflow-x-auto no-scrollbar">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className="flex flex-col items-center gap-1.5 shrink-0 group active:scale-95 transition-all"
            >
              <div
                className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border-cyan-400 text-cyan-300 shadow-sm'
                    : 'bg-[#121626] border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`text-[10px] font-medium ${
                  isSelected ? 'text-cyan-300 font-bold' : 'text-slate-400'
                }`}
              >
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Hero Mega Sale Banner */}
      <div className="px-4 py-2">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-purple-700 via-pink-600 to-amber-500 p-4 shadow-xl flex items-center justify-between">
          <div className="max-w-[62%] z-10">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white">
              Limited Offer
            </span>
            <h3 className="text-xl font-black text-white leading-tight mt-1 mb-2 tracking-tight">
              Up to 50% Off <br />
              Mega Sale
            </h3>
            <button
              onClick={() => setSelectedCategory('Electronics')}
              className="px-4 py-1.5 rounded-full bg-white text-slate-950 font-extrabold text-xs shadow-md hover:bg-slate-100 active:scale-95 transition-all"
            >
              Shop Now
            </button>
          </div>

          <SafeImage
            src="/assets/images/amina_avatar_1790280951312.jpg"
            fallbackText="Sale"
            alt="Fashion model"
            className="w-20 h-24 sm:w-24 sm:h-28 object-cover rounded-2xl ring-2 ring-white/20 shadow-xl shrink-0"
          />
        </div>
      </div>

      {/* Featured Products Section matching Screenshot 4 */}
      <div className="px-5 pt-3 pb-1 flex items-center justify-between">
        <h4 className="font-bold text-sm text-white">Featured Products</h4>
        <button
          onClick={() => setSelectedCategory('All')}
          className="text-xs text-cyan-400 hover:underline font-semibold"
        >
          See All
        </button>
      </div>

      {/* 2-Column Product Grid (Matching Screenshot 4: Wireless Earbuds, Smart Watch) */}
      <div className="p-5 pt-2 grid grid-cols-2 gap-3.5">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="rounded-[22px] bg-[#121727] border border-white/5 p-3 flex flex-col justify-between transition-all group hover:border-cyan-500/30"
          >
            {/* Image */}
            <div
              onClick={() => setSelectedProduct(product)}
              className="relative aspect-square rounded-2xl overflow-hidden bg-black/40 mb-2.5 cursor-pointer"
            >
              <SafeImage
                src={product.images[0]}
                fallbackText={product.name}
                fallbackGradient="from-slate-800 to-indigo-950"
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Info */}
            <div>
              <h5
                onClick={() => setSelectedProduct(product)}
                className="font-bold text-xs text-white truncate cursor-pointer group-hover:text-cyan-300 transition-colors"
              >
                {product.name}
              </h5>
              <p className="font-extrabold text-xs text-slate-200 mt-1">
                {product.currency} {product.price.toLocaleString()}
              </p>
              <div className="flex items-center gap-1 my-1 text-[11px] text-amber-400">
                <Star className="w-3 h-3 fill-amber-400" />
                <span className="font-bold text-[10px]">{product.rating}</span>
                <span className="text-slate-500 text-[10px]">({product.reviewsCount})</span>
              </div>
            </div>

            {/* Add to cart / chat */}
            <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-1.5">
              <button
                onClick={() => addToCart(product)}
                className="flex-1 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 border border-cyan-500/30 text-cyan-300 font-bold text-[11px] flex items-center justify-center gap-1 active:scale-95"
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
              <button
                onClick={() => onStartChatWithSeller(product.sellerId, product.sellerName)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs"
                title="Chat with seller"
              >
                💬
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-[#0E1322] border border-white/10 rounded-3xl p-5 shadow-2xl">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-black/50 text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <SafeImage
              src={selectedProduct.images[0]}
              fallbackText={selectedProduct.name}
              fallbackGradient="from-slate-800 to-indigo-950"
              alt={selectedProduct.name}
              className="w-full h-44 object-cover rounded-2xl mb-3"
            />
            <h3 className="font-bold text-base text-white">{selectedProduct.name}</h3>
            <p className="text-xs text-slate-400 mt-1">{selectedProduct.description}</p>
            <div className="my-3 flex items-center justify-between">
              <span className="text-base font-extrabold text-cyan-400">
                {selectedProduct.currency} {selectedProduct.price.toLocaleString()}
              </span>
              <span className="text-xs text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full font-medium">
                In Stock ({selectedProduct.stock})
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  addToCart(selectedProduct);
                  setSelectedProduct(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs"
              >
                Add to Cart
              </button>
              <button
                onClick={() => {
                  onStartChatWithSeller(selectedProduct.sellerId, selectedProduct.sellerName);
                  setSelectedProduct(null);
                }}
                className="px-3 py-2.5 rounded-xl bg-white/10 text-white text-xs font-semibold"
              >
                Chat Seller
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-[#0E1322] border border-white/10 rounded-3xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-base text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-cyan-400" />
                Shopping Cart
              </h4>
              <button onClick={() => setIsCartOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {cart.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">Your cart is empty.</p>
            ) : (
              <>
                <div className="space-y-2.5 max-h-48 overflow-y-auto mb-4">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="p-2.5 rounded-xl bg-white/5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-semibold text-white">{item.product.name}</p>
                        <p className="text-slate-400">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-cyan-300">
                        {item.product.currency} {(item.product.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-3 mb-4 flex items-center justify-between text-sm">
                  <span className="text-slate-300 font-medium">Total:</span>
                  <span className="font-black text-cyan-400">
                    TZS {totalCartAmount.toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={paymentProcessing}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-purple-500 hover:from-cyan-300 text-slate-950 font-extrabold text-xs shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                >
                  {paymentProcessing ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Checkout (PaymentService)
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Order Confirmed Modal */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#0E1322] border border-emerald-500/40 rounded-3xl p-6 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h4 className="text-lg font-bold text-white mb-1">Order Confirmed!</h4>
            <p className="text-xs text-slate-300 mb-4">
              Your order has been paid and dispatched.
            </p>
            <button
              onClick={() => {
                setOrderSuccess(null);
                setIsCartOpen(false);
              }}
              className="w-full py-2.5 rounded-xl bg-white text-slate-950 font-bold text-xs"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
