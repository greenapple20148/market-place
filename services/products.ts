
import { Product } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';
import { MOCK_PRODUCTS } from '../constants';

export const productsService = {
  getAllProducts: async (): Promise<Product[]> => {
    if (!isSupabaseConfigured) {
      await new Promise(r => setTimeout(r, 500));
      return MOCK_PRODUCTS;
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  getSellerProducts: async (sellerName: string): Promise<Product[]> => {
    if (!isSupabaseConfigured) {
      return MOCK_PRODUCTS.filter(p => p.seller === sellerName);
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('seller', sellerName)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  getProductById: async (id: string): Promise<Product | null> => {
    if (!isSupabaseConfigured) {
      return MOCK_PRODUCTS.find(p => p.id === id) || null;
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
      const newProduct = { ...product, id: Math.random().toString(36).substr(2, 9) } as Product;
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
      console.log('Demo Mode: Deleted product', id);
      return;
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
