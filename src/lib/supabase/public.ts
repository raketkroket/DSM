import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { env, isSupabaseConfigured } from '@/lib/env';

/** Cookie-less anon client for public, cacheable reads (published content, media). */
export function createPublicClient() {
  if (!isSupabaseConfigured()) return null;
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
