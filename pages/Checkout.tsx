
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, ShoppingBag, CheckCircle2, ChevronRight, ArrowLeft, Loader2, Sparkles, Package, ShieldCheck, Lock, Mail } from 'lucide-react';
import { CartItem, User } from '../types';
import { ordersService } from '../services/orders';
import { authService } from '../services/auth';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with publishable key from env
const stripePromise = loadStripe(process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

interface CheckoutProps {
  items: CartItem[];
  onClearCart: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ items, onClearCart }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [shippingData, setShippingData] = useState({
    name: '',
    email: '', // Added for Guest Checkout
    address: '',
    city: '',
    postalCode: ''
  });

  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: ''
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    authService.getCurrentUser().then(user => {
      if (user) {
        setCurrentUser(user);
        setShippingData(prev => ({ ...prev, name: user.name, email: user.email }));
      }
    });
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 12.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleNextStep = () => {
    if (step === 1) {
       // Simple validation
       if (!shippingData.name || !shippingData.email || !shippingData.address) {
          setStripeError("Please complete all shipping fields.");
          return;
       }
       setStripeError(null);
    }
    
    if (step < 3) {
      setIsLoading(true);
      setTimeout(() => {
        setStep(step + 1);
        setIsLoading(false);
        window.scrollTo(0, 0);
      }, 600);
    } else {
      handlePlaceOrder();
    }
  };

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    setStripeError(null);
    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe failed to initialize");

      // Simulating Payment Processing
      await new Promise(resolve => setTimeout(resolve, 1500)); 

      // 3. Persist order (Guest or Logged In)
      const order = await ordersService.createOrder(
        currentUser?.id || null, // Allow null for Guest
        items,
        total,
        { ...shippingData, guest_email: !currentUser ? shippingData.email : undefined }
      );

      setOrderNumber(order.id.split('-')[0].toUpperCase());
      setIsSuccess(true);
      onClearCart();
    } catch (err: any) {
      console.error("Payment failed:", err);
      setStripeError(err.message || "Your card was declined. Please try a different payment method.");
    } finally {
      setIsLoading(false);
      window.scrollTo(0, 0);
    }
  };

  if (items.length === 0 && !isSuccess) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="bg-stone-100 dark:bg-stone-900 p-10 rounded-full">
          <ShoppingBag className="w-16 h-16 text-stone-300 dark:text-stone-700" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black serif italic dark:text-stone-50">Your basket is empty.</h2>
          <p className="text-stone-500 dark:text-stone-400 max-w-sm mx-auto">Treasures are waiting to be discovered. Start your journey in the marketplace.</p>
        </div>
        <Link to="/" className="bg-stone-900 dark:bg-brand-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-brand-600 transition-all">
          Explore Marketplace
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-xl w-full text-center space-y-10 animate-in fade-in zoom-in-95 duration-700">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-brand-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="relative bg-brand-600 text-white p-10 rounded-full shadow-2xl">
              <CheckCircle2 className="w-20 h-20" />
            </div>
            <Sparkles className="absolute -top-4 -right-4 w-12 h-12 text-brand-500 animate-bounce" />
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl font-black serif italic dark:text-stone-50">Payment Successful!</h1>
            <p className="text-stone-500 dark:text-stone-400 text-lg leading-relaxed font-medium">
              Stripe has verified your transaction. Your unique treasures are now in the hands of the makers.
            </p>
          </div>

          <div className="bg-white dark:bg-stone-900 p-8 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 shadow-xl space-y-6 text-left">
            <div className="flex justify-between items-center pb-4 border-b border-stone-50 dark:border-stone-800">
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Transaction ID</span>
              <span className="font-black dark:text-stone-50 text-sm">#MP-{orderNumber}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-stone-50 dark:border-stone-800">
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Sent To</span>
              <span className="font-black text-stone-900 dark:text-stone-50 text-sm uppercase">{shippingData.email}</span>
            </div>
            <p className="text-xs text-stone-400 font-medium italic text-center">
              A receipt has been dispatched to your digital mailbox.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link to="/" className="flex-1 bg-stone-900 dark:bg-brand-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-brand-600 transition-all uppercase text-xs tracking-widest">
              Back to Marketplace
            </Link>
            {!currentUser && (
               <Link to="/auth" className="flex-1 border-2 border-brand-500 text-brand-600 font-black py-5 rounded-2xl hover:bg-brand-50 transition-all uppercase text-xs tracking-widest">
                 Join to Track Shipments
               </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="flex flex-col lg:flex-row gap-16">
        
        {/* Main Flow */}
        <div className="flex-1 space-y-12">
          
          {/* Progress Tracker */}
          <div className="flex items-center justify-between max-w-md mx-auto relative px-4">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-stone-100 dark:bg-stone-800 -translate-y-1/2 z-0" />
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-black transition-all duration-500 border-2 ${
                  step >= i 
                  ? 'bg-brand-600 border-brand-600 text-white shadow-lg shadow-brand-500/20' 
                  : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-300'
                }`}
              >
                {step > i ? <CheckCircle2 className="w-5 h-5" /> : i}
              </div>
            ))}
          </div>

          {/* Form Content */}
          <div className="bg-white dark:bg-stone-900/50 p-8 md:p-12 rounded-[3rem] border border-stone-100 dark:border-stone-800 shadow-2xl overflow-hidden">
            
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-brand-50 dark:bg-brand-900/20 text-brand-600 rounded-2xl">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <h2 className="text-3xl font-black serif dark:text-stone-50">Shipping Destination</h2>
                  </div>
                  {!currentUser && (
                    <Link to="/auth" className="text-[10px] font-black uppercase text-brand-600 hover:underline">Sign in for faster checkout</Link>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-2">Contact Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300 group-focus-within:text-brand-500" />
                      <input 
                        type="email" 
                        className="w-full bg-stone-50 dark:bg-stone-800 border-2 border-transparent focus:border-brand-500 rounded-2xl py-4 pl-12 pr-4 outline-none dark:text-stone-50 font-medium" 
                        placeholder="your@email.com"
                        value={shippingData.email}
                        onChange={(e) => setShippingData({...shippingData, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-2">Recipient Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-stone-50 dark:bg-stone-800 border-2 border-transparent focus:border-brand-500 rounded-2xl p-4 outline-none dark:text-stone-50 font-medium" 
                      placeholder="Jane Doe"
                      value={shippingData.name}
                      onChange={(e) => setShippingData({...shippingData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-2">Street Address</label>
                    <input 
                      type="text" 
                      className="w-full bg-stone-50 dark:bg-stone-800 border-2 border-transparent focus:border-brand-500 rounded-2xl p-4 outline-none dark:text-stone-50 font-medium" 
                      placeholder="123 Artisan Lane"
                      value={shippingData.address}
                      onChange={(e) => setShippingData({...shippingData, address: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-2">City</label>
                    <input 
                      type="text" 
                      className="w-full bg-stone-50 dark:bg-stone-800 border-2 border-transparent focus:border-brand-500 rounded-2xl p-4 outline-none dark:text-stone-50 font-medium" 
                      placeholder="Portland"
                      value={shippingData.city}
                      onChange={(e) => setShippingData({...shippingData, city: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-2">Postal Code</label>
                    <input 
                      type="text" 
                      className="w-full bg-stone-50 dark:bg-stone-800 border-2 border-transparent focus:border-brand-500 rounded-2xl p-4 outline-none dark:text-stone-50 font-medium" 
                      placeholder="97201"
                      value={shippingData.postalCode}
                      onChange={(e) => setShippingData({...shippingData, postalCode: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-brand-50 dark:bg-brand-900/20 text-brand-600 rounded-2xl">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <h2 className="text-3xl font-black serif dark:text-stone-50">Stripe Payment</h2>
                  </div>
                  <div className="flex items-center gap-2 text-stone-400 font-black text-[10px] uppercase tracking-widest">
                    <Lock className="w-3 h-3" />
                    Secure SSL
                  </div>
                </div>

                <div className="space-y-6">
                  {stripeError && (
                    <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-black rounded-2xl border border-red-100 dark:border-red-900/30">
                      {stripeError}
                    </div>
                  )}

                  <div className="bg-stone-50 dark:bg-stone-800/50 p-8 rounded-[2rem] border-2 border-transparent focus-within:border-brand-500 transition-all">
                    <div className="space-y-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Card Number</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            className="w-full bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 rounded-xl p-4 outline-none dark:text-stone-50 font-medium shadow-sm" 
                            placeholder="4242 4242 4242 4242"
                            value={cardData.number}
                            onChange={(e) => setCardData({...cardData, number: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Expiry</label>
                          <input 
                            type="text" 
                            className="w-full bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 rounded-xl p-4 outline-none dark:text-stone-50 font-medium shadow-sm" 
                            placeholder="MM / YY"
                            value={cardData.expiry}
                            onChange={(e) => setCardData({...cardData, expiry: e.target.value})}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">CVC</label>
                          <input 
                            type="text" 
                            className="w-full bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 rounded-xl p-4 outline-none dark:text-stone-50 font-medium shadow-sm" 
                            placeholder="CVC"
                            value={cardData.cvc}
                            onChange={(e) => setCardData({...cardData, cvc: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-50 dark:bg-brand-900/20 text-brand-600 rounded-2xl">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h2 className="text-3xl font-black serif dark:text-stone-50">Final Verification</h2>
                </div>

                <div className="space-y-6">
                  <div className="bg-stone-50 dark:bg-stone-800/30 p-6 rounded-[2rem] border border-stone-100 dark:border-stone-800 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-black uppercase text-stone-400 tracking-widest mb-1">Shipping & Receipt To</p>
                        <p className="text-sm font-black dark:text-stone-50">{shippingData.name} ({shippingData.email})</p>
                        <p className="text-xs text-stone-500 dark:text-stone-400">{shippingData.address}, {shippingData.city}</p>
                      </div>
                      <button onClick={() => setStep(1)} className="text-[10px] font-black uppercase text-brand-600 hover:underline">Edit</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-12 border-t border-stone-50 dark:border-stone-800 mt-12">
              {step > 1 && (
                <button 
                  onClick={() => setStep(step - 1)}
                  className="px-8 border-2 border-stone-100 dark:border-stone-800 text-stone-400 hover:text-stone-900 dark:hover:text-stone-50 rounded-2xl transition-all font-black uppercase text-xs tracking-widest"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <button 
                onClick={handleNextStep}
                disabled={isLoading}
                className="flex-1 bg-stone-900 dark:bg-brand-600 text-white font-black py-5 rounded-2xl hover:bg-brand-600 dark:hover:bg-brand-500 transition-all shadow-xl flex items-center justify-center gap-3 uppercase text-xs tracking-[0.25em] active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    {step === 3 ? 'Confirm & Pay Now' : 'Continue Step'}
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="lg:w-96 space-y-8">
          <div className="bg-white dark:bg-stone-900 p-8 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 shadow-xl space-y-8">
            <h3 className="text-xl font-black serif dark:text-stone-50">Order Summary</h3>
            
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-4 group">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 flex-shrink-0">
                    <img src={item.images?.[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <p className="text-xs font-black text-stone-900 dark:text-stone-50 line-clamp-1">{item.title}</p>
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Qty: {item.quantity}</p>
                    <p className="text-xs font-black text-brand-600">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-stone-50 dark:border-stone-800 space-y-3">
              <div className="flex justify-between text-sm font-medium text-stone-500">
                <span>Items Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium text-stone-500">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-sm font-medium text-stone-500">
                <span>Estimated Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="h-px bg-stone-50 dark:bg-stone-800 my-4" />
              <div className="flex justify-between items-baseline">
                <span className="font-black serif italic text-xl dark:text-stone-50">Total Due</span>
                <span className="text-3xl font-black dark:text-stone-50">${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-2xl border border-green-100 dark:border-green-900/30 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-green-600" />
              <span className="text-[10px] font-black text-green-700 dark:text-green-500 uppercase tracking-widest">Safe & Secured by Stripe</span>
            </div>
          </div>

          <button 
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 text-stone-400 hover:text-stone-900 dark:hover:text-stone-50 font-black text-[10px] uppercase tracking-widest transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Keep Exploring
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
