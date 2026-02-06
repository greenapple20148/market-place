
import React, { useEffect, useState } from 'react';
import { productsService } from '../services/products';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { Loader2, Sparkles } from 'lucide-react';

interface HomeProps {
  onProductClick: (p: Product) => void;
}

const Home: React.FC<HomeProps> = ({ onProductClick }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    productsService.getAllProducts()
      .then(setProducts)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-12 space-y-4">
        <div className="flex items-center gap-2 text-brand-600">
          <Sparkles className="w-5 h-5 fill-current" />
          <span className="text-xs font-black uppercase tracking-[0.2em]">Curated for you</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-stone-900 dark:text-stone-50 serif italic">
          Discover Unique Treasures
        </h1>
        <p className="text-stone-500 dark:text-stone-400 max-w-2xl font-medium">
          Explore a handpicked selection of extraordinary items from independent makers and artisans around the world.
        </p>
      </header>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Loading the marketplace...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onClick={onProductClick} />
          ))}
        </div>
      )}

      {!isLoading && products.length === 0 && (
        <div className="text-center py-32 bg-white dark:bg-stone-900 rounded-[3rem] border-2 border-dashed border-stone-100 dark:border-stone-800">
          <p className="text-stone-400 font-medium italic">The marketplace is currently resting. Check back soon for new treasures.</p>
        </div>
      )}
    </div>
  );
};

export default Home;
