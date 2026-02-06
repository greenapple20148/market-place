
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Search, Plus, Filter, MoreHorizontal, 
  Edit3, Trash2, Eye, ChevronDown, Loader2, 
  Package, AlertCircle, CheckCircle2, X
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { productsService } from '../services/products';
import { Product, User, Category } from '../types';

interface ManageInventoryProps {
  user: User;
}

const ManageInventory: React.FC<ManageInventoryProps> = ({ user }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, [user.name]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const data = await productsService.getSellerProducts(user.name);
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing? This action cannot be undone.")) return;
    try {
      await productsService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert("Failed to delete product.");
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-6">
              <Link 
                to="/seller" 
                className="p-2.5 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-2xl transition-colors text-stone-400 hover:text-stone-900 dark:hover:text-stone-50"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-xl font-black serif italic dark:text-stone-50">Manage Inventory</h1>
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Shop Catalog Control</p>
              </div>
            </div>
            
            <button 
              onClick={() => navigate('/seller/products/new')}
              className="bg-stone-900 dark:bg-brand-600 text-white px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Listing
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Controls */}
        <div className="bg-white dark:bg-stone-900 p-6 rounded-[2.5rem] shadow-xl border border-stone-100 dark:border-stone-800 mb-8 space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-brand-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Search inventory by title or tags..."
                className="w-full bg-stone-50 dark:bg-stone-800 border-2 border-transparent focus:border-brand-500 rounded-2xl py-3 pl-12 pr-4 outline-none dark:text-stone-50 font-medium transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select 
                className="bg-stone-50 dark:bg-stone-800 border-2 border-transparent focus:border-brand-500 rounded-2xl px-6 py-3 outline-none dark:text-stone-50 font-black text-[10px] uppercase tracking-widest appearance-none transition-all cursor-pointer"
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                {Object.values(Category).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Inventory List */}
        <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] shadow-xl border border-stone-100 dark:border-stone-800 overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
              <p className="text-xs font-black text-stone-400 uppercase tracking-widest">Inventory Manifest Loading...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-32">
              <Package className="w-16 h-16 text-stone-200 dark:text-stone-800 mx-auto mb-4" />
              <h3 className="text-xl font-black dark:text-stone-50 serif">No matching items found</h3>
              <p className="text-stone-400 text-sm mt-2 max-w-xs mx-auto">Adjust your search or filters to locate your unique treasures.</p>
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="mt-6 text-brand-600 font-black text-[10px] uppercase tracking-widest hover:underline"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-stone-50 dark:bg-stone-800/50 border-b border-stone-100 dark:border-stone-800">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-stone-400">Product</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-stone-400">Category</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-stone-400">Price</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-stone-400">Status</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-stone-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50 dark:divide-stone-800">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="group hover:bg-stone-50/50 dark:hover:bg-stone-800/20 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 flex-shrink-0 border border-stone-100 dark:border-stone-700">
                            <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-stone-900 dark:text-stone-50 truncate max-w-[200px]">{p.title}</p>
                            <p className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">ID: {p.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs font-medium text-stone-500 dark:text-stone-400">{p.category}</span>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-black text-stone-900 dark:text-stone-50">${p.price.toFixed(2)}</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-green-600">Active</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <Link 
                            to={`/shop?q=${encodeURIComponent(p.title)}`}
                            className="p-2 text-stone-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link 
                            to={`/seller/products/edit/${p.id}`}
                            className="p-2 text-stone-400 hover:text-brand-600 transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>
                          <button 
                            onClick={() => handleDelete(p.id)}
                            className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ManageInventory;
