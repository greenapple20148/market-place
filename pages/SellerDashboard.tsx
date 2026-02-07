
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Plus, LayoutGrid, ShoppingBag, TrendingUp, Search, 
  AlertTriangle, XCircle, ShieldAlert, Edit3, Trash2, Loader2, Sparkles 
} from 'lucide-react';
import { User, Product } from '../types';
import { productsService } from '../services/products';

interface SellerDashboardProps {
  user: User;
}

const SellerDashboard: React.FC<SellerDashboardProps> = ({ user }) => {
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'listings'>('overview');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, [user.id]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { products } = await productsService.getSellerProducts(user.id, 1, 100);
      setMyProducts(products);
    } catch (err) {
      console.error("Failed to fetch seller products", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!window.confirm("Delete this listing?")) return;
    try {
      await productsService.deleteProduct(id);
      fetchProducts();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  // Sub-component for listing status badge
  const StatusBadge = ({ product }: { product: Product }) => {
    switch (product.moderation_status) {
      case 'pending_review':
        return (
          <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[8px] font-black uppercase rounded-md border border-amber-100 dark:border-amber-900/30 flex items-center gap-1">
            <Search className="w-2.5 h-2.5" /> AI Review Pending
          </span>
        );
      case 'flagged':
        return (
          <span className="px-2 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[8px] font-black uppercase rounded-md border border-red-100 dark:border-red-900/30 flex items-center gap-1">
            <AlertTriangle className="w-2.5 h-2.5" /> Action Required
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2 py-0.5 bg-stone-900 text-white text-[8px] font-black uppercase rounded-md flex items-center gap-1">
            <XCircle className="w-2.5 h-2.5" /> Blocked
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-[8px] font-black uppercase rounded-md border border-green-100 dark:border-green-900/30">
            Active
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 pb-20 transition-colors duration-500">
      <div className="bg-stone-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl font-black serif italic">Welcome, {user.name}</h1>
              <p className="text-stone-400 mt-2 font-medium">Your studio's impact today.</p>
            </div>
            <button 
              onClick={() => navigate('/seller/products/new')}
              className="bg-brand-600 hover:bg-brand-500 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> New Listing
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] shadow-2xl border border-stone-100 dark:border-stone-800 overflow-hidden">
          <div className="flex border-b border-stone-100 dark:border-stone-800">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-6 font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'text-brand-600 bg-stone-50/50 dark:bg-stone-800/20 border-b-2 border-brand-600' : 'text-stone-400 hover:text-stone-600'}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('listings')}
              className={`flex-1 py-6 font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'listings' ? 'text-brand-600 bg-stone-50/50 dark:bg-stone-800/20 border-b-2 border-brand-600' : 'text-stone-400 hover:text-stone-600'}`}
            >
              Listings
            </button>
          </div>

          {myProducts.some(p => p.moderation_status === 'rejected') && (
            <div className="bg-stone-900 text-white px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/10">
              <div className="flex items-start gap-4">
                <ShieldAlert className="w-6 h-6 text-brand-500 flex-shrink-0 mt-1" />
                <div className="space-y-1">
                  <p className="text-xs font-black uppercase tracking-widest">Integrity Violation Detected</p>
                  <p className="text-xs text-stone-400 font-medium leading-relaxed max-w-xl">
                    One or more listings have been permanently removed for violating marketplace standards. Review the "Listings" tab for feedback.
                  </p>
                </div>
              </div>
              <button onClick={() => setActiveTab('listings')} className="px-6 py-2 bg-white text-stone-900 rounded-xl text-[10px] font-black uppercase tracking-widest">Review Feedback</button>
            </div>
          )}

          <div className="p-8 md:p-12">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 bg-stone-50 dark:bg-stone-800/30 rounded-[2rem] border border-stone-100 dark:border-stone-800">
                  <TrendingUp className="w-8 h-8 text-brand-600 mb-4" />
                  <p className="text-3xl font-black dark:text-stone-50">$1,240.00</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mt-1">Monthly Earnings</p>
                </div>
                <div className="p-8 bg-stone-50 dark:bg-stone-800/30 rounded-[2rem] border border-stone-100 dark:border-stone-800">
                  <ShoppingBag className="w-8 h-8 text-brand-600 mb-4" />
                  <p className="text-3xl font-black dark:text-stone-50">{myProducts.length}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mt-1">Active Listings</p>
                </div>
                <div className="p-8 bg-stone-50 dark:bg-stone-800/30 rounded-[2rem] border border-stone-100 dark:border-stone-800">
                  <LayoutGrid className="w-8 h-8 text-brand-600 mb-4" />
                  <p className="text-3xl font-black dark:text-stone-50">4.9</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mt-1">Average Rating</p>
                </div>
              </div>
            )}

            {activeTab === 'listings' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-black dark:text-stone-50 serif italic">Manage Studio Catalog</h2>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {myProducts.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-[2rem]">
                      <p className="text-stone-400 font-medium italic">No listings yet. Start manifesting your creations.</p>
                    </div>
                  ) : (
                    myProducts.map(p => (
                      <div key={p.id} className={`flex flex-col md:flex-row items-center gap-6 p-6 rounded-3xl border transition-all ${
                        p.moderation_status === 'rejected' ? 'bg-stone-50 dark:bg-stone-800/20 border-stone-200 dark:border-stone-800 grayscale' : 'bg-white dark:bg-stone-800/30 border-stone-100 dark:border-stone-800 hover:shadow-xl'
                      }`}>
                        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-stone-100 flex-shrink-0">
                          <img src={p.images?.[0]} className="w-full h-full object-cover" alt={p.title} />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className={`font-black ${p.moderation_status === 'rejected' ? 'text-stone-400' : 'text-stone-900 dark:text-stone-50'}`}>{p.title}</h3>
                            <StatusBadge product={p} />
                          </div>
                          {p.moderation_reason && (
                            <p className="text-[10px] font-black uppercase text-brand-600 bg-brand-50 dark:bg-brand-900/20 px-3 py-1.5 rounded-xl border border-brand-100 dark:border-brand-900/30 inline-block">
                              Feedback: {p.moderation_reason}
                            </p>
                          )}
                          <p className="text-xs text-stone-400 line-clamp-1">{p.description}</p>
                        </div>
                        <div className="flex gap-2">
                          {p.moderation_status !== 'rejected' && (
                            <button onClick={() => navigate(`/seller/products/edit/${p.id}`)} className="p-3 hover:bg-stone-100 rounded-xl"><Edit3 className="w-4 h-4" /></button>
                          )}
                          <button onClick={() => handleDeleteListing(p.id)} className="p-3 hover:bg-red-50 rounded-xl text-stone-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))
                  )}
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
