
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { CartItem } from '../types';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose, items, onUpdateQuantity, onRemove }) => {
  const navigate = useNavigate();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden">
      <div className="absolute inset-0 bg-stone-900/50 dark:bg-black/70 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white dark:bg-stone-900 shadow-2xl flex flex-col transform transition-transform duration-300 border-l border-stone-200 dark:border-stone-800">
        <div className="p-6 border-b border-stone-200 dark:border-stone-800 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2 dark:text-stone-50">
            <ShoppingBag className="w-5 h-5 text-brand-600 dark:text-brand-500" />
            Your Basket ({items.reduce((acc, item) => acc + item.quantity, 0)})
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full dark:text-stone-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag className="w-16 h-16 text-stone-200 dark:text-stone-800 mx-auto mb-4" />
              <p className="text-stone-500 dark:text-stone-400 font-medium">Your basket is empty</p>
              <button 
                onClick={onClose}
                className="mt-4 text-brand-600 dark:text-brand-500 font-bold hover:underline"
              >
                Keep shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 group">
                <img src={item.images?.[0]} alt={item.title} className="w-20 h-20 object-cover rounded-2xl bg-stone-100 dark:bg-stone-800 shadow-sm" />
                <div className="flex-1 space-y-1">
                  <h4 className="font-semibold text-stone-900 dark:text-stone-50 text-sm line-clamp-2">{item.title}</h4>
                  <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest">Sold by {item.seller_name}</p>
                  <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center border border-stone-200 dark:border-stone-700 rounded-xl bg-white dark:bg-stone-800 overflow-hidden">
                      <button 
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="p-1 px-3 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-black dark:text-stone-50">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="p-1 px-3 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="font-black text-stone-900 dark:text-stone-50">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <button 
                    onClick={() => onRemove(item.id)}
                    className="text-[10px] text-stone-300 font-bold hover:text-red-500 transition-colors uppercase tracking-widest pt-1"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-8 border-t border-stone-100 dark:border-stone-800 space-y-6 bg-stone-50/50 dark:bg-stone-800/20">
            <div className="space-y-3">
              <div className="flex justify-between text-stone-500 dark:text-stone-400 text-sm font-medium">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-500 dark:text-stone-400 text-sm font-medium">
                <span>Estimated Shipping</span>
                <span className="text-green-600 font-black uppercase text-[10px] tracking-widest">Calculated at checkout</span>
              </div>
              <div className="h-px bg-stone-200 dark:bg-stone-800 my-2" />
              <div className="flex justify-between font-black text-xl text-stone-900 dark:text-stone-50 serif italic">
                <span>Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
            </div>
            <button 
              onClick={handleCheckout}
              className="w-full bg-stone-900 dark:bg-brand-600 text-white font-black py-5 rounded-2xl hover:bg-brand-600 dark:hover:bg-brand-500 transition-all shadow-xl flex items-center justify-center gap-3 uppercase text-xs tracking-[0.2em]"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;
