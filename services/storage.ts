
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_BUCKET = 'product-images';

export const storageService = {
  /**
   * Uploads a file to Supabase Storage.
   * If Supabase is not configured, falls back to a Base64 demo simulation.
   */
  uploadProductImage: async (file: File, onProgress?: (progress: number) => void): Promise<string> => {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `listings/${fileName}`;

    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured. Falling back to demo mode (Base64).');
      return new Promise((resolve) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 25;
          if (onProgress) onProgress(progress);
          if (progress >= 100) {
            clearInterval(interval);
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          }
        }, 100);
      });
    }

    try {
      // Supabase Storage upload
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          // onUploadProgress is supported in the underlying cross-fetch/xhr used by supabase-js
          // but we simulate a smooth transition for UI polish if the browser doesn't expose it well.
          onUploadProgress: (event: any) => {
            if (onProgress && event.total) {
              const percent = Math.round((event.loaded / event.total) * 100);
              onProgress(percent);
            }
          }
        });

      if (error) throw error;

      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (err: any) {
      console.error('Supabase Storage upload error:', err);
      
      // Check for common Supabase errors
      let errorMessage = 'Upload failed. ';
      if (err.message?.includes('bucket not found')) {
        errorMessage += `Storage bucket "${STORAGE_BUCKET}" does not exist in your Supabase project.`;
      } else if (err.status === 403) {
        errorMessage += 'Permission denied. Ensure your Storage RLS policies allow uploads.';
      } else {
        errorMessage += err.message || 'Unknown network error.';
      }
      
      throw new Error(errorMessage);
    }
  },

  /**
   * Deletes an image from Supabase Storage given its public URL.
   */
  deleteProductImage: async (url: string): Promise<void> => {
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured. Demo mode: skipping storage deletion.');
      return;
    }

    try {
      // Extract path from URL
      // URL format typically: https://[project-id].supabase.co/storage/v1/object/public/product-images/listings/filename.jpg
      const parts = url.split(`${STORAGE_BUCKET}/`);
      if (parts.length < 2) {
        console.warn('Could not parse image path from URL for deletion:', url);
        return;
      }
      const path = parts[1];

      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([path]);

      if (error) throw error;
      console.log('Image successfully removed from storage:', path);
    } catch (err: any) {
      console.error('Failed to delete image from storage:', err);
      // We don't necessarily want to block the user if cleanup fails, 
      // but we log it for debugging.
    }
  }
};
