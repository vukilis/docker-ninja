import { createClient } from '@supabase/supabase-js';

// Fallback to empty strings to prevent build-time crashes
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase credentials missing. Check your .env.local file.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);