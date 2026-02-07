
import { User } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

export const profilesService = {
  updateProfile: async (userId: string, updates: Partial<User>): Promise<void> => {
    if (!isSupabaseConfigured) {
      // Mock local update
      const saved = localStorage.getItem('marketplace_user');
      if (saved) {
        const user = JSON.parse(saved);
        localStorage.setItem('marketplace_user', JSON.stringify({ ...user, ...updates }));
      }
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: updates.name,
        shop_name: updates.shop_name,
        onboarding_completed: updates.onboarding_completed,
        verification_status: updates.verification_status,
        bank_last_four: updates.bank_last_four,
        seller_declaration_signed: updates.seller_declaration_signed,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;
  },

  getProfile: async (userId: string): Promise<Partial<User> | null> => {
    if (!isSupabaseConfigured) {
      const saved = localStorage.getItem('marketplace_user');
      return saved ? JSON.parse(saved) : null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) return null;
    return {
      id: data.id,
      name: data.full_name,
      shop_name: data.shop_name,
      onboarding_completed: data.onboarding_completed,
      verification_status: data.verification_status,
      bank_last_four: data.bank_last_four,
      seller_declaration_signed: data.seller_declaration_signed,
      avatar: data.avatar_url
    };
  }
};
