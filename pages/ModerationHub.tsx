
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, CheckCircle2, XCircle, Loader2, Search, 
  Eye, ExternalLink, ArrowLeft, AlertTriangle, Filter, 
  Gavel, FileText, Clock, History 
} from 'lucide-react';
import { productsService } from '../services/products';
import { Product } from '../types';

const ModerationHub: React.FC = () => {
  const [queue, setQueue] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    setIsLoading(true);
    try {
      const data = await productsService.getModerationQueue();
      setQueue(data);
    } catch (err) {
      console.error("Failed to fetch moderation queue", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    const reason = window.prompt(`Reason for ${status}:`, status === 'rejected' ? 'Violates handmade policy' : 'Verified artisan quality');
    if (reason === null) return;

    setActionLoading(true);
    try {
      await productsService.updateModerationStatus(id, status, reason);
      setSelectedProduct(null);
      fetchQueue();
    } catch (err) {
      console.error("Action failed", err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 transition-colors duration-500 pb-20">
      <div className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl">
              <ArrowLeft className="w-5 h-5 text-stone-400" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-600 text-white rounded-xl">
                <Gavel className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-black serif italic dark:text-stone-50">Moderation Portal</h1>
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Marketplace Integrity Queue</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-brand-50 dark:bg-brand-900/20 text-brand-600 rounded-full text-[10px] font-black uppercase tracking-widest">
              {queue.length} Reports Pending
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          <div className="lg:col-span-1 space-y-4">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
              <input 
                type="text" 
                placeholder="Search reports..."
                className="w-full bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl py-3 pl-12 pr-4 outline-none font-medium dark:text-stone-50"
              />
            </div>
            
            <div className="space-y-3">
              {isLoading ? (
                <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-600" /></div>
              ) : queue.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-stone-900 rounded-[2rem] border-2 border-dashed border-stone-100 dark:border-stone-800">
                  <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-4" />
                  <p className="text-xs font-black uppercase text-stone-400">Queue is Clear</p>
                </div>
              ) : (
                queue.map(p => (
                  <button 
                    key={p.id}
                    onClick={() => setSelectedProduct(p)}
                    className={`w-full flex items-start gap-4 p-5 rounded-3xl border transition-all text-left ${selectedProduct?.id === p.id ? 'bg-brand-50 dark:bg-brand-900/10 border-brand-200' : 'bg-white dark:bg-stone-900 border-stone-100 dark:border-stone-800 hover:shadow-xl'}`}
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-stone-100">
                      <img src={p.images?.[0]} className="w-full h-full object-cover" alt={p.title} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-stone-900 dark:text-stone-50 truncate">{p.title}</p>
                      <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">Seller: {p.seller_name}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${p.moderation_status === 'flagged' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                          {p.moderation_status?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedProduct ? (
              <div className="bg-white dark:bg-stone-900 rounded-[3rem] border border-stone-100 dark:border-stone-800 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="p-8 md:p-12 space-y-10">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-1/3 aspect-[4/5] rounded-[2rem] overflow-hidden bg-stone-100 shadow-inner">
                      <img src={selectedProduct.images?.[0]} className="w-full h-full object-cover" alt={selectedProduct.title} />
                    </div>
                    <div className="flex-1 space-y-4">
                      <h2 className="text-3xl font-black serif italic dark:text-stone-50">{selectedProduct.title}</h2>
                      <p className="text-stone-500 dark:text-stone-400 leading-relaxed font-medium italic">"{selectedProduct.description}"</p>
                      <div className="pt-4 grid grid-cols-2 gap-4">
                        <div className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-2xl">
                          <p className="text-[8px] font-black uppercase text-stone-400 tracking-widest">Price Point</p>
                          <p className="text-xl font-black dark:text-stone-50">${selectedProduct.price.toFixed(2)}</p>
                        </div>
                        <div className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-2xl">
                          <p className="text-[8px] font-black uppercase text-stone-400 tracking-widest">Listing Tag</p>
                          <p className="text-xl font-black dark:text-stone-50">{selectedProduct.category}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 pt-8 border-t border-stone-100 dark:border-stone-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <History className="w-5 h-5 text-brand-600" />
                        <h3 className="font-black text-xs uppercase tracking-widest dark:text-stone-50">Compliance Log History</h3>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {selectedProduct.moderation_logs?.map((log, i) => (
                        <div key={i} className="flex gap-4 p-4 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-100 dark:border-stone-800">
                          <div className={`p-2 rounded-xl h-fit ${
                            log.status === 'flagged' ? 'bg-amber-100 text-amber-600' :
                            log.status === 'rejected' ? 'bg-red-100 text-red-600' :
                            'bg-green-100 text-green-600'
                          }`}>
                            <Clock className="w-4 h-4" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase tracking-widest text-stone-900 dark:text-stone-50">{log.type.replace('_', ' ')}</span>
                              <span className="text-[8px] text-stone-400 font-bold uppercase">{new Date(log.timestamp).toLocaleString()}</span>
                            </div>
                            <p className="text-xs text-stone-600 dark:text-stone-400 font-medium italic">"{log.reason}"</p>
                          </div>
                        </div>
                      ))}
                      {(!selectedProduct.moderation_logs || selectedProduct.moderation_logs.length === 0) && (
                        <p className="text-xs text-stone-400 italic text-center py-4">No historical logs found for this listing.</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-10 border-t border-stone-100 dark:border-stone-800">
                    <button 
                      onClick={() => handleAction(selectedProduct.id, 'rejected')} 
                      disabled={actionLoading} 
                      className="flex-1 py-5 bg-red-50 text-red-600 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest border-2 border-red-100 flex items-center justify-center gap-3 hover:bg-red-100"
                    >
                      {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                      Reject & Ban
                    </button>
                    <button 
                      onClick={() => handleAction(selectedProduct.id, 'approved')} 
                      disabled={actionLoading} 
                      className="flex-1 py-5 bg-green-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:bg-green-500"
                    >
                      {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-40 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-[3rem]">
                <Gavel className="w-16 h-16 text-stone-300 mb-6" />
                <h2 className="text-2xl font-black serif italic dark:text-stone-50">Select a report to review</h2>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ModerationHub;
