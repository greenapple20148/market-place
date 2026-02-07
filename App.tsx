
import React, { useState, useEffect, useLayoutEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { Product, CartItem, User } from './types';
import Navbar from './components/Navbar';
import CartSidebar from './components/CartSidebar';
import Home from './pages/Home';
import SellerDashboard from './pages/SellerDashboard';
import SellerProfile from './pages/SellerProfile';
import ProductForm from './pages/ProductForm';
import ManageInventory from './pages/ManageInventory';
import Checkout from './pages/Checkout';
import Auth from './pages/Auth';
import SellerOnboarding from './pages/SellerOnboarding'; 
import LegalTerms from './pages/LegalTerms'; 
import ModerationHub from './pages/ModerationHub'; // New Import
import { authService } from './services/auth';
import { profilesService } from './services/profiles';
import { productsService } from './services/products';
import { supabase, isSupabaseConfigured } from './services/supabase';
// Added CheckCircle2 and Loader2 icons to imports to fix line 319 and 327 errors
import { X, Star, Heart, Share2, Info, Plus, Minus, ShoppingBag, Check, Database, WifiOff, ChevronLeft, ChevronRight, Flag, AlertTriangle, CheckCircle2, Loader2, ShieldAlert } from 'lucide-react';

const ProtectedRoute: React.FC<{ children: React.ReactNode; user: User | null }> = ({ children, user }) => {
  const location = useLocation();
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [modalQty, setModalQty] = useState(1);
  const [showAddSuccess, setShowAddSuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  // Reporting state
  const [isReporting, setIsReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  useEffect(() => {
    setActiveImageIndex(0);
    setModalQty(1);
    setIsReporting(false);
    setReportSuccess(false);
  }, [selectedProduct?.id]);

  useEffect(() => {
    const initAuth = async () => {
      const user = await authService.getCurrentUser();
      if (user) {
        const profile = await profilesService.getProfile(user.id);
        setCurrentUser({ ...user, ...profile });
      } else {
        setCurrentUser(null);
      }
      setIsAuthReady(true);
    };

    initAuth();

    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const profile = await profilesService.getProfile(session.user.id);
          setCurrentUser({
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
            email: session.user.email || '',
            avatar: session.user.user_metadata?.avatar_url,
            ...profile
          });
        } else {
          setCurrentUser(null);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('marketplace_theme');
    if (saved) return saved as 'light' | 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [accent, setAccent] = useState<string>(() => {
    return localStorage.getItem('marketplace_accent') || 'terracotta';
  });

  useLayoutEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    root.setAttribute('data-accent', accent);
    localStorage.setItem('marketplace_theme', theme);
    localStorage.setItem('marketplace_accent', accent);
  }, [theme, accent]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { ...product, quantity }];
    });
    setShowAddSuccess(true);
    setTimeout(() => {
      setShowAddSuccess(false);
      setSelectedProduct(null);
      setIsCartOpen(true);
    }, 800);
  };

  const handleReport = async () => {
    if (!selectedProduct) return;
    setIsReporting(true);
    try {
      await productsService.reportProduct(selectedProduct.id, "User reported as non-handmade/mass-produced.");
      setReportSuccess(true);
      setTimeout(() => {
        setSelectedProduct(null);
        setReportSuccess(false);
      }, 1500);
    } catch (err) {
      alert("Reporting failed. Try again.");
    } finally {
      setIsReporting(false);
    }
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => setCart([]);

  if (!isAuthReady) return null;

  return (
    <Router>
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 transition-colors duration-500">
        <Navbar 
          cartCount={cart.reduce((s, i) => s + i.quantity, 0)} 
          onCartClick={() => setIsCartOpen(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
          accent={accent}
          onSetAccent={setAccent}
          user={currentUser}
          onLogout={handleLogout}
        />
        
        {!isSupabaseConfigured && (
          <div className="bg-amber-500/10 dark:bg-amber-500/5 text-amber-700 dark:text-amber-500 px-4 py-2 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] border-b border-amber-500/20">
            <WifiOff className="w-3 h-3" />
            Database Offline &bull; Demo Mode Enabled
          </div>
        )}

        <main>
          <Routes>
            <Route path="/" element={<Home onProductClick={setSelectedProduct} />} />
            <Route path="/auth" element={<Auth onLogin={setCurrentUser} />} />
            <Route path="/terms" element={<LegalTerms />} />
            <Route 
              path="/moderation" 
              element={
                <ProtectedRoute user={currentUser}>
                  <ModerationHub />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/seller" 
              element={
                <ProtectedRoute user={currentUser}>
                  <SellerDashboard user={currentUser!} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/seller/onboarding" 
              element={
                <ProtectedRoute user={currentUser}>
                  <SellerOnboarding user={currentUser!} onUpdateUser={setCurrentUser} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/seller/inventory" 
              element={
                <ProtectedRoute user={currentUser}>
                  <ManageInventory user={currentUser!} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/seller/products/new" 
              element={
                <ProtectedRoute user={currentUser}>
                  <ProductForm user={currentUser!} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/seller/products/edit/:id" 
              element={
                <ProtectedRoute user={currentUser}>
                  <ProductForm user={currentUser!} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/checkout" 
              element={
                  <Checkout items={cart} onClearCart={clearCart} />
              } 
            />
            <Route path="/profile/:sellerName" element={<SellerProfile onProductClick={setSelectedProduct} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <CartSidebar 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)} 
          items={cart} 
          onUpdateQuantity={updateCartQuantity}
          onRemove={removeFromCart}
        />

        {selectedProduct && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-stone-900/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedProduct(null)} />
            <div className="relative bg-white dark:bg-stone-900 max-w-6xl w-full max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-500 border border-stone-100 dark:border-stone-800">
              <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-20 p-2.5 bg-white/90 dark:bg-stone-800/90 backdrop-blur-xl rounded-full shadow-lg hover:text-brand-600 transition-colors text-stone-900 dark:text-stone-50"><X className="w-6 h-6" /></button>
              
              {/* Gallery */}
              <div className="md:w-3/5 bg-stone-100 dark:bg-stone-800 relative flex flex-col h-full">
                <div className="flex-1 relative overflow-hidden group">
                  <img 
                    src={selectedProduct.images?.[activeImageIndex]} 
                    alt={selectedProduct.title} 
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000" 
                  />
                  
                  {selectedProduct.images && selectedProduct.images.length > 1 && (
                    <>
                      <button 
                        onClick={() => setActiveImageIndex(prev => (prev === 0 ? selectedProduct.images.length - 1 : prev - 1))}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 dark:bg-stone-900/80 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-stone-900"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button 
                        onClick={() => setActiveImageIndex(prev => (prev === selectedProduct.images.length - 1 ? 0 : prev + 1))}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 dark:bg-stone-900/80 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-stone-900"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}
                </div>

                {selectedProduct.images && selectedProduct.images.length > 1 && (
                  <div className="flex gap-2 p-4 bg-white/50 dark:bg-black/20 backdrop-blur-md overflow-x-auto no-scrollbar">
                    {selectedProduct.images.map((img, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${activeImageIndex === idx ? 'border-brand-500 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                      >
                        <img src={img} className="w-full h-full object-cover" alt={`Thumb ${idx + 1}`} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="md:w-2/5 p-8 md:p-14 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-8">
                  <div className="space-y-3">
                    <p className="text-xs font-black text-brand-600 uppercase tracking-[0.25em]">{selectedProduct.category}</p>
                    <h2 className="text-3xl md:text-4xl font-black text-stone-900 dark:text-stone-50 leading-tight serif">{selectedProduct.title}</h2>
                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      <div className="flex items-center text-yellow-500">
                        <Star className="w-5 h-5 fill-current" />
                        <span className="ml-1.5 text-stone-900 dark:text-stone-50 font-black">{selectedProduct.rating.toFixed(1)}</span>
                        <span className="ml-1.5 text-stone-400 font-medium">({selectedProduct.reviews} reviews)</span>
                      </div>
                      <span className="text-stone-500 dark:text-stone-400 font-medium">
                        Crafted by <Link to={`/profile/${encodeURIComponent(selectedProduct.seller_name)}`} onClick={() => setSelectedProduct(null)} className="text-stone-900 dark:text-stone-50 font-black hover:text-brand-600 hover:underline cursor-pointer transition-colors">{selectedProduct.seller_name}</Link>
                      </span>
                    </div>
                  </div>
                  <p className="text-4xl font-black text-stone-900 dark:text-stone-50">${selectedProduct.price.toFixed(2)}</p>
                  <div className="bg-brand-50/50 dark:bg-brand-900/10 p-6 rounded-[2rem] border border-brand-100 dark:border-brand-900/30">
                    <p className="text-stone-700 dark:text-stone-300 leading-relaxed text-sm italic serif">"{selectedProduct.description}"</p>
                  </div>
                  
                  {/* Reporting Section */}
                  <div className="pt-4 border-t border-stone-100 dark:border-stone-800">
                    {reportSuccess ? (
                      <div className="bg-green-50 dark:bg-green-900/20 text-green-600 p-4 rounded-2xl flex items-center gap-3 text-xs font-black uppercase">
                        <CheckCircle2 className="w-4 h-4" /> Integrity report dispatched
                      </div>
                    ) : (
                      <button 
                        onClick={handleReport}
                        disabled={isReporting}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-300 hover:text-red-500 transition-colors"
                      >
                        {isReporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Flag className="w-3 h-3" />}
                        Report suspicious listing
                      </button>
                    )}
                  </div>

                  <div className="space-y-5">
                    <div className="flex flex-col gap-3">
                      <label className="text-xs font-black text-stone-400 uppercase tracking-widest">Quantity</label>
                      <div className="flex items-center w-36 border-2 border-stone-100 dark:border-stone-800 rounded-2xl overflow-hidden bg-white dark:bg-stone-800">
                        <button onClick={() => setModalQty(q => Math.max(1, q - 1))} className="p-3.5 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors text-stone-600 dark:text-stone-400"><Minus className="w-5 h-5" /></button>
                        <span className="flex-1 text-center font-black text-xl text-stone-900 dark:text-stone-50">{modalQty}</span>
                        <button onClick={() => setModalQty(q => q + 1)} className="p-3.5 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors text-stone-600 dark:text-stone-400"><Plus className="w-5 h-5" /></button>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <button onClick={() => addToCart(selectedProduct, modalQty)} disabled={showAddSuccess} className={`flex-1 flex items-center justify-center gap-3 font-black py-5 rounded-2xl transition-all text-xl shadow-2xl ${showAddSuccess ? 'bg-green-500 text-white' : 'bg-stone-900 dark:bg-brand-600 text-white hover:bg-brand-600 dark:hover:bg-brand-500 active:scale-[0.98]'}`}>
                        {showAddSuccess ? <Check className="w-7 h-7 animate-in zoom-in duration-300" /> : <ShoppingBag className="w-6 h-6" />}
                        {showAddSuccess ? 'Added to Basket' : 'Add to Basket'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <footer className="bg-stone-900 dark:bg-black text-white py-24 mt-20 border-t border-stone-800/50 text-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="text-4xl font-black text-brand-500 tracking-tighter">MARKET<span className="text-white">PLACE</span></span>
            <p className="mt-4 text-stone-400 italic">"Supporting human creativity through meaningful commerce."</p>
            <div className="mt-8 flex justify-center gap-8 text-stone-500 text-xs font-bold uppercase tracking-widest">
              <p>&copy; 2024 Marketplace</p>
              <Link to="/terms" className="hover:text-white transition-colors">Integrity Terms</Link>
              {currentUser && (
                <Link to="/moderation" className="hover:text-brand-500 transition-colors flex items-center gap-1.5 ml-4">
                  <ShieldAlert className="w-3.5 h-3.5" /> Moderation
                </Link>
              )}
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
