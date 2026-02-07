
import { createClient } from '@supabase/supabase-js';

// Accessing environment variables directly ensures compatibility with 
// build systems that use search-and-replace (like Webpack DefinePlugin).
const supabaseUrl = process.env.SUPABASE_URL || `https://atvlxahigofpepoimvqn.supabase.co`;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || `sb_publishable_vQdOhrpZTSvHSqpDbQV1CQ_0NrDRjHJ`;

// Check if we have the required configuration
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseAnonKey.includes('_placeholder') && 
  !supabaseAnonKey.startsWith('sb_publishable_')
);

// Only initialize if we have legitimate keys, otherwise provide null for demo mode fallback
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null as any;
