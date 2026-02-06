
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
import { authService } from './services/auth';
import { supabase, isSupabaseConfigured } from './services/supabase';
import { X, Star, Heart, Share2, Info, Plus, Minus, ShoppingBag, Check, Database, WifiOff } from 'lucide-react';

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
  const [modalQty, setModalQty] = useState(1);
  const [showAddSuccess, setShowAddSuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    // Initial fetch
    authService.getCurrentUser().then(user => {
      setCurrentUser(user);
      setIsAuthReady(true);
    });

    // Supabase auth listener (Only if configured)
    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          setCurrentUser({
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
            email: session.user.email || '',
            avatar: session.user.user_metadata?.avatar_url
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
        
        {/* Backend Connection Status Indicator */}
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
            <Route 
              path="/seller" 
              element={
                <ProtectedRoute user={currentUser}>
                  <SellerDashboard user={currentUser!} />
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
                <ProtectedRoute user={currentUser}>
                  <Checkout items={cart} onClearCart={clearCart} />
                </ProtectedRoute>
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
            <div className="relative bg-white dark:bg-stone-900 max-w-5xl w-full max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-500 border border-stone-100 dark:border-stone-800">
              <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-20 p-2.5 bg-white/90 dark:bg-stone-800/90 backdrop-blur-xl rounded-full shadow-lg hover:text-brand-600 transition-colors text-stone-900 dark:text-stone-50"><X className="w-6 h-6" /></button>
              <div className="md:w-1/2 bg-stone-100 dark:bg-stone-800 sticky top-0 md:relative overflow-hidden">
                <img src={selectedProduct.image} alt={selectedProduct.title} className="w-full h-full object-cover min-h-[350px] max-h-[450px] md:max-h-none transform hover:scale-110 transition-transform duration-1000" />
              </div>
              <div className="md:w-1/2 p-8 md:p-14 flex flex-col justify-between">
                <div className="space-y-8">
                  <div className="space-y-3">
                    <p className="text-xs font-black text-brand-600 uppercase tracking-[0.25em]">{selectedProduct.category}</p>
                    <h2 className="text-3xl md:text-5xl font-black text-stone-900 dark:text-stone-50 leading-tight serif">{selectedProduct.title}</h2>
                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      <div className="flex items-center text-yellow-500">
                        <Star className="w-5 h-5 fill-current" />
                        <span className="ml-1.5 text-stone-900 dark:text-stone-50 font-black">{selectedProduct.rating.toFixed(1)}</span>
                        <span className="ml-1.5 text-stone-400 font-medium">({selectedProduct.reviews} reviews)</span>
                      </div>
                      <span className="text-stone-500 dark:text-stone-400 font-medium">
                        Crafted by <Link to={`/profile/${encodeURIComponent(selectedProduct.seller)}`} onClick={() => setSelectedProduct(null)} className="text-stone-900 dark:text-stone-50 font-black hover:text-brand-600 hover:underline cursor-pointer transition-colors">{selectedProduct.seller}</Link>
                      </span>
                    </div>
                  </div>
                  <p className="text-4xl md:text-5xl font-black text-stone-900 dark:text-stone-50">${selectedProduct.price.toFixed(2)}</p>
                  <div className="bg-brand-50/50 dark:bg-brand-900/10 p-6 rounded-[2rem] border border-brand-100 dark:border-brand-900/30">
                    <p className="text-stone-700 dark:text-stone-300 leading-relaxed text-lg italic serif">"{selectedProduct.description}"</p>
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
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
