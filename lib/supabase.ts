import { createBrowserClient, createServerClient } from '@supabase/ssr';

type SupabaseClient = ReturnType<typeof createBrowserClient> | ReturnType<typeof createServerClient>;

let client: SupabaseClient | null = null;

export const getSupabase = () => {
    if (!client) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
        
        if (!supabaseUrl || !supabaseKey) {
            return null;
        }
        
        if (typeof window !== 'undefined') {
            client = createBrowserClient(supabaseUrl, supabaseKey);
        } else {
            client = createServerClient(supabaseUrl, supabaseKey, {
                cookies: {
                    getAll() { return []; },
                    setAll() {},
                },
            });
        }
    }
    return client;
};