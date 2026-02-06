
import { supabase, isSupabaseConfigured } from './supabase';

export const storageService = {
  /**
   * Uploads a file to the 'product-images' bucket.
   * Falls back to a simulated upload in demo mode.
   */
  uploadProductImage: async (file: File, onProgress?: (progress: number) => void): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `listings/${fileName}`;

    if (!isSupabaseConfigured) {
      // Simulation for Demo Mode
      return new Promise((resolve) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 20;
          if (onProgress) onProgress(progress);
          if (progress >= 100) {
            clearInterval(interval);
            // Convert to base64 for local persistence in demo mode
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          }
        }, 200);
      });
    }

    // Actual Supabase Storage Upload
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Storage error:', error);
      throw new Error('Failed to upload image to storage.');
    }

    // Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return publicUrl;
  }
};
