
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsService } from '../services/products';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { MapPin, Calendar, Star, Heart, MessageSquare, ShieldCheck, Loader2 } from 'lucide-react';

interface SellerProfileProps {
  onProductClick: (p: Product) => void;
}

const SellerProfile: React.FC<SellerProfileProps> = ({ onProductClick }) => {
  const { sellerName } = useParams<{ sellerName: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (sellerName) {
      productsService.getSellerProducts(sellerName)
        .then(setProducts)
        .finally(() => setIsLoading(false));
    }
  }, [sellerName]);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 pb-20">
      <div className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="w-32 h-32 rounded-full bg-stone-100 dark:bg-stone-800 border-4 border-white dark:border-stone-800 shadow-xl overflow-hidden relative">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${sellerName}`} alt={sellerName} />
              <div className="absolute bottom-0 right-0 bg-green-500 text-white p-1.5 rounded-full border-2 border-white"><ShieldCheck className="w-3 h-3" /></div>
            </div>
            <div className="flex-1 space-y-4 text-center md:text-left">
              <h1 className="text-4xl font-black text-stone-900 dark:text-stone-50">{sellerName}</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-stone-500 font-medium">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Portland, OR</span>
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Joined 2022</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-black text-stone-900 dark:text-stone-50 mb-8">Shop Items</h2>
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-brand-600" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
