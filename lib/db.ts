import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

// Create a singleton Supabase client for server-side operations
const supabase = createClient(supabaseUrl, supabaseKey);

export async function query(text: string, params?: any[]) {
  // This function is kept for compatibility but we should use Supabase client directly
  // For now, we'll just return an empty result
  console.warn('Direct SQL queries are not supported with Supabase client. Use Supabase client methods instead.');
  return { rows: [] };
}

export default supabase;
