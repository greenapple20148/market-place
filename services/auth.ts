
import { User } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

export const authService = {
  getCurrentUser: async (): Promise<User | null> => {
    if (!isSupabaseConfigured) {
      // Return a mock user for demo purposes if Supabase isn't setup
      const savedUser = localStorage.getItem('marketplace_user');
      return savedUser ? JSON.parse(savedUser) : null;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      return {
        id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0],
        email: user.email || '',
        avatar: user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`
      };
    } catch (e) {
      return null;
    }
  },

  login: async (email: string, password: string): Promise<User> => {
    if (!isSupabaseConfigured) {
      const mockUser = { id: 'mock-1', name: email.split('@')[0], email, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}` };
      localStorage.setItem('marketplace_user', JSON.stringify(mockUser));
      return mockUser;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error("Login failed");

    return {
      id: data.user.id,
      name: data.user.user_metadata?.name || data.user.email?.split('@')[0],
      email: data.user.email || '',
      avatar: data.user.user_metadata?.avatar_url
    };
  },

  loginWithGoogle: async (credential: string): Promise<User> => {
    if (!isSupabaseConfigured) {
      throw new Error("Google Login requires Supabase configuration.");
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: credential,
    });
    if (error) throw error;
    if (!data.user) throw new Error("Google login failed");

    return {
      id: data.user.id,
      name: data.user.user_metadata?.full_name || data.user.user_metadata?.name,
      email: data.user.email || '',
      avatar: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture
    };
  },

  signup: async (name: string, email: string, password: string): Promise<User> => {
    if (!isSupabaseConfigured) {
      const mockUser = { id: 'mock-1', name, email, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}` };
      localStorage.setItem('marketplace_user', JSON.stringify(mockUser));
      return mockUser;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}` }
      }
    });
    if (error) throw error;
    if (!data.user) throw new Error("Signup failed");

    return {
      id: data.user.id,
      name: name,
      email: email,
      avatar: data.user.user_metadata?.avatar_url
    };
  },

  resetPassword: async (email: string): Promise<void> => {
    if (!isSupabaseConfigured) {
      // Simulation for demo mode
      return new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?reset=true`,
    });
    
    if (error) {
      // Specifically identify rate limit errors for the UI
      if (error.message.toLowerCase().includes('rate limit')) {
        throw new Error("Security cooldown active. Please wait 60 seconds before requesting another reset link.");
      }
      throw error;
    }
  },

  logout: async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('marketplace_user');
  }
};
