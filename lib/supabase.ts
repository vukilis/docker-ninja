import { createClient } from '@supabase/supabase-js';

let client: ReturnType<typeof createClient> | null = null;

export const getSupabase = () => {
    if (!client) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
        
        if (!supabaseUrl || !supabaseKey) {
            return null;
        }
        
        client = createClient(supabaseUrl, supabaseKey);
    }
    return client;
};