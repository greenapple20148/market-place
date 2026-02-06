
import React, { useState } from 'react';
import { Search, ShoppingCart, User as UserIcon, Heart, Menu, X, Sparkles, Loader2, Sun, Moon, LogOut, ChevronDown, UserCheck, Palette, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { enhanceSearch } from '../services/gemini';
import { User } from '../types';

interface NavbarProps {
  cartCount: number;
  onCartClick: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  accent: string;
  onSetAccent: (a: string) => void;
  user: User | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ cartCount, onCartClick, theme, onToggleTheme, accent, onSetAccent, user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e?: React.FormEvent, overrideQuery?: string) => {
    if (e) e.preventDefault();
    const query = overrideQuery || searchQuery;
    
    if (query.trim()) {
      navigate(`/shop?q=${encodeURIComponent(query)}`);
      
      setIsEnhancing(true);
      try {
        const tags = await enhanceSearch(query);
        setSuggestedTags(tags);
      } catch (err) {
        console.error("Failed to enhance search", err);
      } finally {
        setIsEnhancing(false);
      }
    }
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    handleSearch(undefined, tag);
  };

  const accents = [
    { id: 'terracotta', color: '#c2410c', name: 'Terracotta' },
    { id: 'sage', color: '#15803d', name: 'Sage' },
    { id: 'lavender', color: '#6d28d9', name: 'Lavender' },
    { id: 'ocean', color: '#0369a1', name: 'Ocean' },
  ];

  return (
    <nav className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border-b border-stone-200 dark:border-stone-800 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col">
          <div className="flex justify-between items-center h-20 gap-4">
            
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center group" onClick={() => setSuggestedTags([])}>
              <span className="text-2xl font-black text-brand-600 tracking-tighter sm:block hidden transition-colors">MARKET<span className="text-stone-900 dark:text-stone-50">PLACE</span></span>
              <span className="text-2xl font-black text-brand-600 sm:hidden">MP</span>
            </Link>

            {/* Search Bar Container */}
            <div className="flex-1 max-w-xl relative">
              <form onSubmit={handleSearch} className="relative group">
                <input
                  type="text"
                  placeholder="Discover handmade magic..."
                  className="w-full bg-stone-100 dark:bg-stone-800/50 border-2 border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-stone-800 rounded-2xl py-3 pl-6 pr-14 transition-all outline-none text-stone-900 dark:text-stone-50 font-medium placeholder:text-stone-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                  type="submit" 
                  disabled={isEnhancing}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-stone-400 dark:text-stone-500 hover:text-brand-600 transition-colors rounded-xl"
                >
                  {isEnhancing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                </button>
              </form>
            </div>

            {/* Actions */}
            <div className="hidden md:flex items-center space-x-4 text-stone-600 dark:text-stone-400">
              <Link to="/seller" className="hover:text-brand-600 font-black transition-colors text-[10px] uppercase tracking-[0.2em] px-3 py-2 rounded-xl">Seller Hub</Link>
              
              <div className="h-4 w-px bg-stone-200 dark:bg-stone-800" />

              {/* Theme Toggle */}
              <button 
                onClick={onToggleTheme}
                className="hover:text-brand-600 transition-all p-2.5 rounded-2xl hover:bg-stone-100 dark:hover:bg-stone-800"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>

              {/* Accent Picker */}
              <div className="relative">
                <button 
                  onClick={() => setIsPaletteOpen(!isPaletteOpen)}
                  className={`p-2.5 rounded-2xl transition-all ${isPaletteOpen ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600' : 'hover:bg-stone-100 dark:hover:bg-stone-800'}`}
                  aria-label="Change accent color"
                >
                  <Palette className="w-5 h-5" />
                </button>
                {isPaletteOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsPaletteOpen(false)} />
                    <div className="absolute right-0 mt-4 w-48 bg-white dark:bg-stone-900 rounded-[1.5rem] shadow-2xl border border-stone-100 dark:border-stone-800 p-4 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                      <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-4 px-1">Marketplace Theme</p>
                      <div className="grid grid-cols-2 gap-3">
                        {accents.map(acc => (
                          <button
                            key={acc.id}
                            onClick={() => {
                              onSetAccent(acc.id);
                              setIsPaletteOpen(false);
                            }}
                            className={`flex flex-col items-center gap-2 p-2 rounded-xl transition-all border-2 ${accent === acc.id ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-900/10' : 'border-transparent hover:bg-stone-50 dark:hover:bg-stone-800'}`}
                          >
                            <div className="w-6 h-6 rounded-full shadow-inner" style={{ backgroundColor: acc.color }} />
                            <span className="text-[10px] font-bold text-stone-600 dark:text-stone-400">{acc.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <button className="hover:text-brand-600 transition-colors p-2.5 rounded-2xl"><Heart className="w-5 h-5" /></button>
              
              {/* User Menu */}
              <div className="relative">
                {user ? (
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2.5 p-1.5 pr-4 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-all group"
                  >
                    <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-stone-100 dark:border-stone-800 group-hover:border-brand-500 transition-colors shadow-sm">
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs font-black text-stone-900 dark:text-stone-50 max-w-[90px] truncate">{user.name}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                ) : (
                  <Link 
                    to="/auth" 
                    className="flex items-center gap-2.5 px-6 py-2.5 bg-stone-900 dark:bg-stone-50 text-white dark:text-stone-900 rounded-full transition-all text-[10px] font-black uppercase tracking-widest hover:bg-brand-600 dark:hover:bg-brand-500 dark:hover:text-white"
                  >
                    <UserIcon className="w-4 h-4" />
                    Join
                  </Link>
                )}

                {/* Dropdown Menu */}
                {isUserMenuOpen && user && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-4 w-60 bg-white dark:bg-stone-900 rounded-[2rem] shadow-2xl border border-stone-100 dark:border-stone-800 py-3 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                      <div className="px-5 py-4 border-b border-stone-50 dark:border-stone-800 mb-2">
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Makers Identity</p>
                        <p className="text-sm font-black text-stone-900 dark:text-stone-50 truncate">{user.email}</p>
                      </div>
                      <Link 
                        to="/seller" 
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-4 px-5 py-3.5 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-all group"
                      >
                        <div className="p-2 bg-brand-50 dark:bg-brand-900/20 text-brand-600 rounded-xl group-hover:scale-110 transition-transform"><Sparkles className="w-4 h-4" /></div>
                        <span className="text-sm font-bold">Seller Hub</span>
                      </Link>
                      <button className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-all group text-left">
                        <div className="p-2 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-xl group-hover:scale-110 transition-transform"><Heart className="w-4 h-4" /></div>
                        <span className="text-sm font-bold">Favorites</span>
                      </button>
                      <button className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-all group text-left">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/10 text-blue-500 rounded-xl group-hover:scale-110 transition-transform"><UserCheck className="w-4 h-4" /></div>
                        <span className="text-sm font-bold">Account</span>
                      </button>
                      <div className="h-px bg-stone-50 dark:bg-stone-800 my-2 mx-5" />
                      <button 
                        onClick={() => {
                          onLogout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-[calc(100%-2.5rem)] flex items-center gap-4 mx-5 px-4 py-3.5 bg-red-50 dark:bg-red-950/20 text-red-600 rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all group mt-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

              <button onClick={onCartClick} className="relative hover:text-brand-600 transition-colors p-2.5 rounded-2xl group">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-3 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-2xl"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>

          {/* Suggested Tags */}
          {suggestedTags.length > 0 && (
            <div className="pb-5 flex items-center gap-4 overflow-x-auto no-scrollbar animate-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-2 text-[10px] font-black text-brand-600 uppercase tracking-widest whitespace-nowrap bg-brand-50 dark:bg-brand-900/20 px-3 py-1.5 rounded-xl border border-brand-100 dark:border-brand-900/30">
                <Sparkles className="w-3.5 h-3.5" />
                AI Curator
              </div>
              <div className="flex gap-2.5">
                {suggestedTags.map((tag, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleTagClick(tag)}
                    className="whitespace-nowrap bg-stone-100 dark:bg-stone-800 hover:bg-brand-100 dark:hover:bg-brand-900/40 hover:text-brand-700 dark:hover:text-brand-400 text-stone-600 dark:text-stone-400 text-xs font-black px-4 py-2 rounded-xl border-2 border-transparent hover:border-brand-200 dark:hover:border-brand-800 transition-all active:scale-95"
                  >
                    {tag}
                  </button>
                ))}
                <button 
                  onClick={() => setSuggestedTags([])}
                  className="p-2 text-stone-300 dark:text-stone-600 hover:text-stone-500 transition-colors"
                  aria-label="Clear suggestions"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 dark:bg-stone-900/95 backdrop-blur-2xl border-t border-stone-200 dark:border-stone-800 px-6 py-8 space-y-6 shadow-2xl animate-in slide-in-from-bottom-4">
          <Link to="/shop" className="block text-lg font-black dark:text-stone-50">All Treasures</Link>
          <Link to="/seller" className="block text-lg font-black dark:text-stone-50">Seller Studio</Link>
          
          <div className="flex items-center justify-between py-6 border-t border-stone-100 dark:border-stone-800 pt-6">
            <span className="text-xs font-black uppercase tracking-widest text-stone-400">Atmosphere</span>
            <button 
              onClick={onToggleTheme}
              className="flex items-center gap-3 bg-stone-100 dark:bg-stone-800 px-6 py-3 rounded-2xl text-stone-900 dark:text-stone-50 font-bold"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              {theme === 'light' ? 'Night Shift' : 'Morning Light'}
            </button>
          </div>

          <div className="flex items-center justify-between py-6 border-t border-stone-100 dark:border-stone-800">
             <span className="text-xs font-black uppercase tracking-widest text-stone-400">Brand Color</span>
             <div className="flex gap-2">
                {accents.map(acc => (
                  <button
                    key={acc.id}
                    onClick={() => onSetAccent(acc.id)}
                    className={`w-8 h-8 rounded-full border-2 ${accent === acc.id ? 'border-brand-500 scale-125' : 'border-transparent'}`}
                    style={{ backgroundColor: acc.color }}
                  />
                ))}
             </div>
          </div>

          <div className="flex justify-around pt-8 border-t border-stone-100 dark:border-stone-800">
            <button className="flex flex-col items-center gap-2 group"><Heart className="w-7 h-7 text-stone-400 group-hover:text-brand-600 transition-colors" /> <span className="text-[10px] font-black uppercase tracking-widest">Loved</span></button>
            <button className="flex flex-col items-center gap-2 group" onClick={() => !user && navigate('/auth')}><UserIcon className="w-7 h-7 text-stone-400 group-hover:text-brand-600 transition-colors" /> <span className="text-[10px] font-black uppercase tracking-widest">{user ? 'Identity' : 'Join'}</span></button>
            <button onClick={onCartClick} className="flex flex-col items-center gap-2 group">
              <div className="relative">
                <ShoppingCart className="w-7 h-7 text-stone-400 group-hover:text-brand-600 transition-colors" />
                {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full">{cartCount}</span>}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">Basket</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
