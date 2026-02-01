import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Support both: full URL, OR Project ID + publishable key (URL = https://PROJECT_ID.supabase.co)
const envUrl = typeof import.meta.env.VITE_SUPABASE_URL === 'string' ? import.meta.env.VITE_SUPABASE_URL.trim() : '';
const envProjectId = typeof import.meta.env.VITE_SUPABASE_PROJECT_ID === 'string' ? import.meta.env.VITE_SUPABASE_PROJECT_ID.trim() : '';
const supabaseUrl = envUrl || (envProjectId ? `https://${envProjectId}.supabase.co` : '');
// Publishable API key (Supabase Dashboard → Settings → API → anon public)
const supabasePublishableKey = typeof import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY === 'string' ? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY.trim() : '';

let supabaseClient: SupabaseClient | null = null;
if (supabaseUrl && supabasePublishableKey) {
  try {
    supabaseClient = createClient(supabaseUrl, supabasePublishableKey);
  } catch (e) {
    console.warn('Supabase client init failed:', e);
  }
} else {
  console.warn(
    'Missing Supabase config. Set in .env: VITE_SUPABASE_URL (or VITE_SUPABASE_PROJECT_ID) and VITE_SUPABASE_PUBLISHABLE_KEY.'
  );
}

export const supabase = supabaseClient;

export function isSupabaseConfigured(): boolean {
  return supabaseClient != null;
}
