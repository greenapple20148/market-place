
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsService } from '../services/products';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { MapPin, Calendar, Star, Heart, MessageSquare, ShieldCheck, Loader2, Award, Sparkles, CheckCircle2 } from 'lucide-react';

interface SellerProfileProps {
  onProductClick: (p: Product) => void;
}

const SellerProfile: React.FC<SellerProfileProps> = ({ onProductClick }) => {
  const { sellerName } = useParams<{ sellerName: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (sellerName) {
      // For public profiles, we might want to fetch more or implement infinite scroll later.
      // For now, fetching first 20 is a good baseline.
      productsService.getSellerProducts(sellerName, 1, 20)
        .then(response => setProducts(response.products))
        .finally(() => setIsLoading(false));
    }
  }, [sellerName]);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 pb-20">
      <div className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 pt-12 pb-8 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
            <div className="w-40 h-40 rounded-[3rem] bg-stone-100 dark:bg-stone-800 border-4 border-white dark:border-stone-800 shadow-2xl overflow-hidden relative group">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${sellerName}`} 
                alt={sellerName} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute bottom-3 right-3 bg-green-500 text-white p-2 rounded-2xl border-4 border-white dark:border-stone-900 shadow-lg">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            
            <div className="flex-1 space-y-6 text-center md:text-left">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <h1 className="text-5xl font-black text-stone-900 dark:text-stone-50 serif italic">{sellerName}</h1>
                  <span className="flex items-center gap-2 bg-brand-50 dark:bg-brand-900/20 text-brand-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-100 dark:border-brand-900/30">
                    <Award className="w-3.5 h-3.5" /> Self-Certified Artisan
                  </span>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-stone-500 dark:text-stone-400 font-medium">
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Portland, OR</span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Studio joined 2022</span>
                  <span className="flex items-center gap-1.5 text-yellow-600"><Star className="w-4 h-4 fill-current" /> 4.9 (2,400 sales)</span>
                </div>
              </div>

              <div className="max-w-2xl bg-stone-50 dark:bg-stone-800/30 p-6 rounded-[2rem] border border-stone-100 dark:border-stone-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                   <Award className="w-16 h-16 text-brand-600" />
                </div>
                <div className="flex items-start gap-4 relative z-10">
                  <div className="p-3 bg-white dark:bg-stone-900 rounded-2xl shadow-sm text-brand-600 border border-stone-100 dark:border-stone-800">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Maker's Guarantee</p>
                    <p className="text-sm text-stone-900 dark:text-stone-50 font-black serif italic italic leading-relaxed">
                      "I certify that all products I list are made by me or my small team, and not mass-produced."
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center md:justify-start gap-4">
                <button className="bg-stone-900 dark:bg-brand-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-brand-600 transition-all">
                  <MessageSquare className="w-4 h-4" /> Contact Studio
                </button>
                <button className="bg-white dark:bg-stone-800 border-2 border-stone-100 dark:border-stone-800 text-stone-900 dark:text-stone-50 px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-stone-50 dark:hover:bg-stone-700 transition-all">
                  <Heart className="w-4 h-4" /> Favorite Shop
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-black text-stone-900 dark:text-stone-50 serif italic">Available Treasures</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mt-1">Current Shop Catalog</p>
          </div>
          <div className="flex gap-2">
             <div className="w-2 h-2 rounded-full bg-brand-500" />
             <div className="w-2 h-2 rounded-full bg-stone-200 dark:bg-stone-800" />
             <div className="w-2 h-2 rounded-full bg-stone-200 dark:bg-stone-800" />
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Loading catalog...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onClick={onProductClick} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerProfile;
