
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || `https://atvlxahigofpepoimvqn.supabase.co`;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || `sb_publishable_vQdOhrpZTSvHSqpDbQV1CQ_0NrDRjHJ`;

// Check if we have the required configuration
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Only initialize if we have the keys, otherwise provide null
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl!, supabaseAnonKey!) 
  : null as any;
