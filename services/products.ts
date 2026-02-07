
import { Product } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';
import { MOCK_PRODUCTS } from '../constants';

export interface PaginatedProducts {
  products: Product[];
  total: number;
}

const LOCAL_STORAGE_KEY = 'marketplace_local_products';

const getLocalProducts = (): Product[] => {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
};

const saveLocalProducts = (products: Product[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
};

export const productsService = {
  getAllProducts: async (): Promise<Product[]> => {
    if (!isSupabaseConfigured) {
      await new Promise(r => setTimeout(r, 500));
      return [...getLocalProducts(), ...MOCK_PRODUCTS].filter(p => p.moderation_status === 'approved' || !p.moderation_status);
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or('moderation_status.eq.approved,moderation_status.is.null')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  getSellerProducts: async (sellerId: string, page: number = 1, pageSize: number = 10): Promise<PaginatedProducts> => {
    if (!isSupabaseConfigured) {
      const allLocal = getLocalProducts().filter(p => p.seller_id === sellerId);
      const allMock = MOCK_PRODUCTS.filter(p => p.seller_id === sellerId);
      const allSellerProducts = [...allLocal, ...allMock];
      
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      return {
        products: allSellerProducts.slice(start, end),
        total: allSellerProducts.length
      };
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (error) throw error;
    return {
      products: data || [],
      total: count || 0
    };
  },

  getModerationQueue: async (): Promise<Product[]> => {
    if (!isSupabaseConfigured) {
      return getLocalProducts().filter(p => p.moderation_status === 'pending_review' || p.moderation_status === 'flagged');
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .in('moderation_status', ['pending_review', 'flagged'])
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  getProductById: async (id: string): Promise<Product | null> => {
    if (!isSupabaseConfigured) {
      return [...getLocalProducts(), ...MOCK_PRODUCTS].find(p => p.id === id) || null;
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  },

  createProduct: async (product: Omit<Product, 'id'>): Promise<Product> => {
    if (!isSupabaseConfigured) {
      const newProduct = { 
        ...product, 
        id: Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        moderation_status: product.moderation_status || 'approved'
      } as Product;
      const prods = getLocalProducts();
      saveLocalProducts([newProduct, ...prods]);
      return newProduct;
    }

    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  updateProduct: async (id: string, updates: Partial<Product>): Promise<Product> => {
    if (!isSupabaseConfigured) {
      const products = getLocalProducts();
      const index = products.findIndex(p => p.id === id);
      if (index !== -1) {
        products[index] = { ...products[index], ...updates };
        saveLocalProducts(products);
        return products[index];
      }
      return { ...updates, id } as Product;
    }

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    if (!isSupabaseConfigured) {
      const products = getLocalProducts().filter(p => p.id !== id);
      saveLocalProducts(products);
      return;
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  reportProduct: async (id: string, reason: string): Promise<void> => {
    if (!isSupabaseConfigured) {
      const products = getLocalProducts();
      const p = products.find(prod => prod.id === id);
      if (p) {
        p.is_flagged = true;
        p.moderation_status = 'flagged';
        p.moderation_reason = reason;
        saveLocalProducts(products);
      }
      return;
    }

    const { error } = await supabase
      .from('products')
      .update({ is_flagged: true, moderation_status: 'flagged', moderation_reason: reason })
      .eq('id', id);

    if (error) throw error;
  },

  updateModerationStatus: async (id: string, status: 'approved' | 'rejected', reason?: string): Promise<void> => {
    if (!isSupabaseConfigured) {
      const products = getLocalProducts();
      const p = products.find(prod => prod.id === id);
      if (p) {
        p.moderation_status = status;
        if (reason) p.moderation_reason = reason;
        p.is_flagged = status === 'rejected';
        saveLocalProducts(products);
      }
      return;
    }

    const { error } = await supabase
      .from('products')
      .update({ 
        moderation_status: status, 
        moderation_reason: reason || null,
        is_flagged: status === 'rejected'
      })
      .eq('id', id);

    if (error) throw error;
  }
};
