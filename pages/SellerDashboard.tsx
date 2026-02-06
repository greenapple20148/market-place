
import React, { useState, useEffect } from 'react';
import { 
  Wand2, Store, Sparkles, Loader2, CheckCircle2, 
  ChevronRight, RefreshCw, Lightbulb, Package, 
  TrendingUp, DollarSign, LayoutDashboard, ListMusic, 
  ShoppingBag, Trash2, Edit3, Eye, ArrowUpRight, 
  ExternalLink, Plus, AlertCircle, Heart, Star, FileText,
  Settings
} from 'lucide-react';
import { generateProductDetails, getGrowthTips, GrowthTip } from '../services/gemini';
import { productsService } from '../services/products';
import { AIProductSuggestion, User, Category, Product } from '../types';
import { Link, useNavigate } from 'react-router-dom';

interface SellerDashboardProps {
  user: User;
}

type Tab = 'overview' | 'listings' | 'creator' | 'orders' | 'growth';

const SellerDashboard: React.FC<SellerDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [productIdea, setProductIdea] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [suggestion, setSuggestion] = useState<AIProductSuggestion | null>(null);
  const [growthTips, setGrowthTips] = useState<GrowthTip[]>([]);
  const [isLoadingTips, setIsLoadingTips] = useState(false);
  
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchTips();
    fetchMyProducts();
  }, [user.name]);

  const fetchMyProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const prods = await productsService.getSellerProducts(user.name);
      setMyProducts(prods);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const fetchTips = async () => {
    setIsLoadingTips(true);
    try {
      const tips = await getGrowthTips();
      setGrowthTips(tips);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingTips(false);
    }
  };

  const handleGenerateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productIdea) return;
    setIsGenerating(true);
    try {
      const result = await generateProductDetails(productIdea);
      setSuggestion(result);
    } catch (err) {
      console.error(err);
      alert("AI failed to weave its magic. Try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleManifestListing = async () => {
    if (!suggestion) return;
    setIsSaving(true);
    try {
      const newProduct = await productsService.createProduct({
        title: suggestion.title,
        description: suggestion.description,
        price: suggestion.suggestedPrice,
        seller: user.name,
        category: Category.Craft,
        image: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&q=80&w=800', 
        rating: 5,
        reviews: 0,
        tags: suggestion.tags
      });
      
      setMyProducts(prev => [newProduct, ...prev]);
      setSuggestion(null);
      setProductIdea('');
      setActiveTab('listings');
    } catch (err) {
      console.error(err);
      alert("Failed to manifest. Check connection.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!confirm("Are you sure you want to remove this piece from the marketplace?")) return;
    try {
      await productsService.deleteProduct(id);
      setMyProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert("Failed to remove listing.");
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 pb-20 transition-colors duration-500">
      {/* Header */}
      <div className="bg-stone-900 dark:bg-black text-white pt-16 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-brand-500 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-600 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl bg-stone-800">
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-4xl font-black serif italic flex items-center gap-4">
                  Seller Hub
                </h1>
                <p className="text-stone-400 mt-1 flex items-center gap-2 font-medium">
                  {user.name}'s Studio &bull; <span className="text-brand-500 font-black tracking-widest text-[10px] uppercase">Established 2024</span>
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => navigate('/seller/products/new')}
                className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-xl shadow-brand-600/20"
              >
                <Plus className="w-4 h-4" /> New Listing
              </button>
              <Link 
                to={`/profile/${encodeURIComponent(user.name)}`}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" /> View Shop
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] shadow-2xl border border-stone-100 dark:border-stone-800 overflow-hidden">
          
          {/* Sub Navigation */}
          <div className="flex overflow-x-auto no-scrollbar border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/20 p-2">
            {[
              { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
              { id: 'listings', icon: Package, label: 'Listings' },
              { id: 'creator', icon: Wand2, label: 'AI Creator' },
              { id: 'orders', icon: ShoppingBag, label: 'Orders' },
              { id: 'growth', icon: Lightbulb, label: 'Growth Lab' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                  ? 'bg-white dark:bg-stone-900 text-brand-600 shadow-sm' 
                  : 'text-stone-400 hover:text-stone-900 dark:hover:text-stone-50'
                }`}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-brand-600' : ''}`} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-8 md:p-12">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-12 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Revenue', value: '$2,482.00', trend: '+12.5%', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/10' },
                    { label: 'Active Listings', value: myProducts.length.toString(), trend: 'Stable', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/10' },
                    { label: 'Shop Visits', value: '12,842', trend: '+24%', icon: Eye, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/10' },
                    { label: 'Conversion', value: '3.2%', trend: '-2%', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/10' },
                  ].map((stat, i) => (
                    <div key={i} className="p-6 bg-stone-50 dark:bg-stone-800/50 rounded-3xl border border-stone-100 dark:border-stone-700/50 space-y-4 group hover:border-brand-500 transition-all">
                      <div className="flex justify-between items-start">
                        <div className={`p-3 ${stat.bg} ${stat.color} rounded-2xl group-hover:scale-110 transition-transform`}>
                          <stat.icon className="w-5 h-5" />
                        </div>
                        <span className={`text-[10px] font-black ${stat.trend.startsWith('+') ? 'text-green-600' : stat.trend === 'Stable' ? 'text-stone-400' : 'text-red-500'}`}>
                          {stat.trend}
                        </span>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{stat.label}</p>
                        <p className="text-2xl font-black text-stone-900 dark:text-stone-50">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-10">
                  <div className="bg-stone-900 dark:bg-black p-8 rounded-[2.5rem] text-white relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 flex flex-col justify-between h-full space-y-8">
                      <div className="space-y-2">
                        <h3 className="text-2xl font-black serif">AI Performance Report</h3>
                        <p className="text-stone-400 text-sm leading-relaxed">Your "Botanical" category is trending. We suggest adding 2 more items with "Eco-friendly" tags.</p>
                      </div>
                      <button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-brand-500 hover:text-white transition-colors">
                        View Detailed Insights <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="border border-stone-100 dark:border-stone-800 p-8 rounded-[2.5rem] space-y-6">
                    <h3 className="text-xl font-black dark:text-stone-50 serif italic">Recent Activity</h3>
                    <div className="space-y-6">
                      {[
                        { event: 'New Order', detail: 'Abstract Linen Print', time: '2h ago', icon: ShoppingBag, color: 'text-brand-600' },
                        { event: 'New Favorite', detail: 'Minimalist Gold Necklace', time: '5h ago', icon: Heart, color: 'text-red-500' },
                        { event: 'Review Received', detail: '5-star from Sarah', time: '1d ago', icon: Star, color: 'text-yellow-500' },
                      ].map((item, i) => (
                        <div key={i} className="flex gap-4 items-center">
                          <div className={`p-2 rounded-xl bg-stone-50 dark:bg-stone-800 ${item.color}`}>
                            <item.icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-black text-stone-900 dark:text-stone-50">{item.event}</p>
                            <p className="text-xs text-stone-400">{item.detail}</p>
                          </div>
                          <span className="text-[10px] text-stone-300 font-bold">{item.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* LISTINGS TAB */}
            {activeTab === 'listings' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-black serif dark:text-stone-50">Marketplace Presence</h2>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => navigate('/seller/inventory')}
                      className="px-4 py-2 border-2 border-stone-200 dark:border-stone-800 hover:border-brand-500 rounded-xl text-[10px] font-black uppercase tracking-widest text-stone-500 transition-colors flex items-center gap-2"
                    >
                      <Settings className="w-3.5 h-3.5" /> Full Management
                    </button>
                    <div className="flex items-center gap-2 px-4 py-2 bg-stone-50 dark:bg-stone-800 rounded-xl text-[10px] font-black text-stone-500 uppercase tracking-widest">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      {myProducts.length} Items Live
                    </div>
                  </div>
                </div>

                {isLoadingProducts ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
                    <p className="text-xs font-black text-stone-400 uppercase tracking-widest">Gathering your treasures...</p>
                  </div>
                ) : myProducts.length === 0 ? (
                  <div className="text-center py-20 bg-stone-50 dark:bg-stone-800/20 rounded-[3rem] border-2 border-dashed border-stone-200 dark:border-stone-800">
                    <Package className="w-16 h-16 text-stone-200 dark:text-stone-800 mx-auto mb-4" />
                    <h3 className="text-xl font-black dark:text-stone-50">No listings yet</h3>
                    <p className="text-stone-400 text-sm mt-2 mb-8">Your digital shelves are waiting for your unique creations.</p>
                    <div className="flex justify-center gap-4">
                      <button 
                        onClick={() => setActiveTab('creator')}
                        className="bg-stone-900 dark:bg-brand-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                      >
                        Use AI Assistant
                      </button>
                      <button 
                        onClick={() => navigate('/seller/products/new')}
                        className="border-2 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                      >
                        Manual Entry
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {myProducts.map((p) => (
                      <div key={p.id} className="flex flex-col sm:flex-row gap-6 p-4 bg-white dark:bg-stone-800/30 rounded-3xl border border-stone-100 dark:border-stone-800 hover:border-brand-500 transition-all group">
                        <div className="w-full sm:w-32 h-32 rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800 flex-shrink-0">
                          <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-lg font-black text-stone-900 dark:text-stone-50">{p.title}</h4>
                              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{p.category}</p>
                            </div>
                            <p className="text-xl font-black text-stone-900 dark:text-stone-50">${p.price.toFixed(2)}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {p.tags?.map((t, idx) => (
                              <span key={idx} className="text-[9px] font-black text-stone-400 px-2.5 py-1 bg-stone-50 dark:bg-stone-900 rounded-lg">#{t}</span>
                            ))}
                          </div>
                          <div className="flex gap-4 pt-2">
                             <div className="flex items-center gap-1.5 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                               <Eye className="w-3.5 h-3.5" /> 124 Views
                             </div>
                             <div className="flex items-center gap-1.5 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                               <Heart className="w-3.5 h-3.5" /> 12 Loves
                             </div>
                          </div>
                        </div>
                        <div className="flex sm:flex-col gap-2 justify-center">
                          <button 
                            onClick={() => navigate(`/seller/products/edit/${p.id}`)}
                            className="p-3 bg-stone-50 dark:bg-stone-900 rounded-xl text-stone-400 hover:text-brand-600 transition-colors" 
                            title="Edit Listing"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteListing(p.id)}
                            className="p-3 bg-red-50 dark:bg-red-950/20 rounded-xl text-red-400 hover:text-red-600 transition-colors" 
                            title="Delete Listing"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button 
                      onClick={() => navigate('/seller/inventory')}
                      className="w-full py-4 bg-stone-50 dark:bg-stone-800/50 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-2xl text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] transition-all border border-transparent hover:border-stone-200 dark:hover:border-stone-700"
                    >
                      View All in Full Inventory Manager
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* CREATOR TAB */}
            {activeTab === 'creator' && (
              <div className="space-y-10 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row gap-12 items-start">
                  <div className="flex-1 space-y-10">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-brand-50 dark:bg-brand-900/20 text-brand-600 rounded-2xl">
                          <Wand2 className="w-6 h-6" />
                        </div>
                        <h2 className="text-3xl font-black serif dark:text-stone-50">Magic Listing Assistant</h2>
                      </div>
                      <p className="text-stone-500 dark:text-stone-400 font-medium">Briefly describe your creation, and let our AI artisan weave a professional, high-converting story for your shop.</p>
                    </div>

                    <form onSubmit={handleGenerateListing} className="space-y-6">
                      <div className="relative group">
                        <textarea 
                          className="w-full bg-stone-50 dark:bg-stone-800/50 border-2 border-transparent focus:border-brand-500 rounded-3xl p-8 outline-none transition-all h-48 text-stone-800 dark:text-stone-50 text-xl font-medium resize-none shadow-inner"
                          placeholder="e.g. A hand-carved oak cutting board with a unique wave-pattern inlay of dark walnut..."
                          value={productIdea}
                          onChange={(e) => setProductIdea(e.target.value)}
                        />
                        <div className="absolute bottom-6 right-6 flex items-center gap-2 text-[10px] font-black text-stone-300 uppercase tracking-widest pointer-events-none group-focus-within:text-brand-400">
                          <Sparkles className="w-3 h-3" /> AI Enhanced
                        </div>
                      </div>
                      
                      <div className="flex gap-4">
                        <button 
                          type="submit"
                          disabled={isGenerating || !productIdea}
                          className="flex-1 bg-stone-900 dark:bg-brand-600 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-4 shadow-2xl uppercase tracking-[0.2em] text-xs transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                          {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                          {isGenerating ? 'Drafting Excellence...' : 'Enchant Listing Now'}
                        </button>
                        <button 
                          type="button"
                          onClick={() => navigate('/seller/products/new')}
                          className="px-8 border-2 border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-50 rounded-2xl font-black uppercase text-xs tracking-widest transition-all"
                        >
                          <FileText className="w-5 h-5" />
                        </button>
                      </div>
                    </form>

                    {suggestion && (
                      <div className="bg-brand-50/30 dark:bg-brand-900/10 p-10 rounded-[3rem] border-2 border-brand-200 dark:border-brand-900/30 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-20"><Sparkles className="w-20 h-20 text-brand-500" /></div>
                        
                        <div className="space-y-6 relative z-10">
                          <div className="space-y-2">
                            <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest">Suggested Title</span>
                            <h3 className="text-3xl font-black serif italic dark:text-stone-50">{suggestion.title}</h3>
                          </div>
                          
                          <div className="space-y-2">
                            <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest">Narrative Description</span>
                            <p className="text-stone-600 dark:text-stone-400 italic font-serif text-xl leading-relaxed">"{suggestion.description}"</p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {suggestion.tags.map((tag, i) => (
                              <span key={i} className="px-3 py-1.5 bg-white dark:bg-stone-900 rounded-xl text-[10px] font-black text-stone-500 border border-brand-100 dark:border-stone-800">#{tag}</span>
                            ))}
                          </div>

                          <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-brand-200 dark:border-brand-900/30 gap-6">
                            <div className="text-center sm:text-left">
                              <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-1">Recommended Price</span>
                              <p className="text-4xl font-black text-stone-900 dark:text-stone-50">${suggestion.suggestedPrice}</p>
                            </div>
                            <button 
                              onClick={handleManifestListing}
                              disabled={isSaving}
                              className="w-full sm:w-auto bg-stone-900 dark:bg-brand-600 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 hover:bg-brand-500 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-5 h-5" />}
                              Publish to Market
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sidebar Tip */}
                  <div className="w-full md:w-80 space-y-6">
                    <div className="bg-stone-50 dark:bg-stone-800/50 p-8 rounded-[2.5rem] space-y-4">
                      <div className="p-3 bg-white dark:bg-stone-900 rounded-2xl w-fit shadow-sm"><Lightbulb className="w-5 h-5 text-brand-500" /></div>
                      <h4 className="font-black text-stone-900 dark:text-stone-50 serif">Listing Strategy</h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-medium">Use sensory words in your initial description. Mention how it feels, smells, or the heritage of the materials used.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-black serif dark:text-stone-50">Open Commissions</h2>
                  <div className="flex gap-2">
                    {['All', 'Processing', 'Shipped'].map(filter => (
                      <button key={filter} className="px-4 py-2 bg-stone-50 dark:bg-stone-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-brand-600 transition-colors">{filter}</button>
                    ))}
                  </div>
                </div>
                
                <div className="text-center py-20 bg-stone-50 dark:bg-stone-800/20 rounded-[3rem] border-2 border-dashed border-stone-200 dark:border-stone-800">
                  <ShoppingBag className="w-16 h-16 text-stone-200 dark:text-stone-800 mx-auto mb-4" />
                  <h3 className="text-xl font-black dark:text-stone-50">No active orders</h3>
                  <p className="text-stone-400 text-sm mt-2">When someone falls in love with your work, it'll appear here.</p>
                </div>
              </div>
            )}

            {/* GROWTH TAB */}
            {activeTab === 'growth' && (
              <div className="space-y-10 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black serif dark:text-stone-50">Growth Lab</h2>
                    <p className="text-stone-500 dark:text-stone-400">AI-curated strategies specifically for your shop's niche.</p>
                  </div>
                  <button 
                    onClick={fetchTips} 
                    disabled={isLoadingTips} 
                    className="p-4 bg-stone-50 dark:bg-stone-800 rounded-2xl hover:text-brand-600 transition-all shadow-sm"
                  >
                    <RefreshCw className={`w-5 h-5 ${isLoadingTips ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {isLoadingTips ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-64 bg-stone-50 dark:bg-stone-800 animate-pulse rounded-[2.5rem]" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {growthTips.map((tip, idx) => (
                      <div key={idx} className="bg-white dark:bg-stone-900 p-8 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 shadow-xl hover:shadow-2xl transition-all group flex flex-col h-full">
                        <div className="flex justify-between items-start mb-6">
                          <div className="p-3 bg-brand-50 dark:bg-brand-900/20 text-brand-600 rounded-2xl group-hover:scale-110 transition-transform">
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                            tip.impact === 'High' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                          }`}>
                            {tip.impact} Impact
                          </span>
                        </div>
                        <h4 className="text-xl font-black text-stone-900 dark:text-stone-50 mb-3 serif italic">{tip.title}</h4>
                        <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed font-medium mb-8 flex-1">{tip.advice}</p>
                        <button className="text-[10px] font-black text-brand-600 uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
                          Action Insight <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-stone-900 dark:bg-black p-12 rounded-[3.5rem] text-white overflow-hidden relative group mt-12">
                   <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-600/10 -skew-x-12 translate-x-1/2" />
                   <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                     <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/20 rounded-full border border-brand-500/30 text-brand-500 text-[10px] font-black uppercase tracking-widest">
                          <AlertCircle className="w-3 h-3" /> Seasonal Alert
                        </div>
                        <h3 className="text-4xl font-black serif leading-tight italic">Prepare for the Winter Harvest Season</h3>
                        <p className="text-stone-400 leading-relaxed font-medium">Historical data shows searches for "Handmade Gifts" spike by 340% starting next week. Ensure your tags are updated to include "Gift Sets" and "Holiday Decor".</p>
                        <button className="bg-white text-stone-900 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-brand-500 hover:text-white transition-all">
                          View Season Roadmap
                        </button>
                     </div>
                     <div className="hidden md:flex justify-center">
                        <div className="relative">
                          <div className="absolute inset-0 bg-brand-500/40 blur-3xl animate-pulse rounded-full" />
                          <TrendingUp className="w-48 h-48 text-brand-500 relative z-10" />
                        </div>
                     </div>
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
