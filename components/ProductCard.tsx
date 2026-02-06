
import React from 'react';
import { Star, Heart } from 'lucide-react';
import { Product } from '../types';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
  onClick: (p: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  // Construct a safe URL path for the seller profile
  const sellerPath = encodeURIComponent(product.seller || 'artisan');

  return (
    <div 
      className="group cursor-pointer bg-white dark:bg-stone-900/50 rounded-3xl overflow-hidden hover:shadow-2xl dark:hover:shadow-black/60 transition-all duration-500 border border-stone-100 dark:border-stone-800 flex flex-col h-full transform hover:-translate-y-2"
      onClick={() => onClick(product)}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-stone-100 dark:bg-stone-800">
        <img 
          src={product.image} 
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <button 
          className="absolute top-4 right-4 p-3 bg-white/95 dark:bg-stone-900/90 backdrop-blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-brand-600 hover:text-white shadow-xl transform translate-y-4 group-hover:translate-y-0 text-stone-900 dark:text-stone-50"
          onClick={(e) => {
            e.stopPropagation();
          }}
          aria-label="Add to favorites"
        >
          <Heart className="w-5 h-5" />
        </button>
      </div>
      
      <div className="p-6 flex flex-col flex-1 gap-4">
        <div className="space-y-1.5">
          <h3 className="font-black text-lg text-stone-900 dark:text-stone-50 line-clamp-1 group-hover:text-brand-600 transition-colors">
            {product.title}
          </h3>
          <Link 
            to={`/profile/${sellerPath}`}
            className="text-[10px] text-stone-500 dark:text-stone-400 font-black uppercase tracking-[0.2em] hover:text-brand-600 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {product.seller}
          </Link>
        </div>
        
        <div className="flex items-center gap-2 mt-auto">
          <div className="flex items-center bg-stone-50 dark:bg-stone-800/80 px-2.5 py-1 rounded-xl border border-stone-100 dark:border-stone-700 shadow-sm">
            <Star className="w-3.5 h-3.5 fill-brand-500 text-brand-500" />
            <span className="ml-1.5 text-xs font-black text-stone-900 dark:text-stone-50">{product.rating.toFixed(1)}</span>
          </div>
          <span className="text-[10px] text-stone-400 dark:text-stone-500 font-bold uppercase tracking-widest">({product.reviews.toLocaleString()} reviews)</span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-stone-50 dark:border-stone-800">
          <p className="text-2xl font-black text-stone-900 dark:text-stone-50">
            ${product.price.toFixed(2)}
          </p>
          {product.tags && product.tags.length > 0 && (
            <span className="text-[9px] uppercase tracking-[0.2em] font-black text-brand-700 dark:text-brand-500 bg-brand-50 dark:bg-brand-950/40 px-3 py-1.5 rounded-full border border-brand-100 dark:border-brand-900/30">
              Free Shipping
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
