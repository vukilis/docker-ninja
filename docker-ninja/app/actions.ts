'use server';

import { supabase } from '../lib/supabase';

/**
 * Fetches all app metadata from Supabase.
 * Used by the useApps hook to populate the main dashboard grid.
 */
export async function fetchAllApps() {
    try {
        const { data, error } = await supabase
            .from('apps')
            .select('*')
            .order('name', { ascending: true });
        
        if (error) {
            console.error("Supabase Error:", error.message);
            return [];
        }
        
        return data || [];
    } catch (err) {
        console.error("Database connection failed:", err);
        return [];
    }
}

/**
 * Retrieves Docker Compose content for a specific app.
 * Logic Flow:
 * 1. Attempt to fetch directly from the provided remote 'compose_url'.
 * 2. If the fetch fails (or URL is missing), fall back to 'fallback_compose' from the database.
 */
export async function getComposeContent(app: any) {
    if (!app) return "Error: Invalid application data.";

    // Try Remote Fetching first (GitHub/Raw)
    if (app.compose_url) {
        try {
            const response = await fetch(app.compose_url, { 
                next: { revalidate: 3600 }, // Cache result for 1 hour to prevent API rate limits
                headers: { 'Accept': 'text/plain' }
            });
            
            if (response.ok) {
                return await response.text();
            }
            // console.warn(`Remote fetch returned status ${response.status} for ${app.slug}. Using fallback.`);
        } catch (e) {
            // console.error(`Remote fetch request failed for ${app.slug}. Using fallback.`);
        }
    }

    // Retrieve from Database column
    return app.fallback_compose || "No compose configuration found in database!";
}

/**
 * Gets the total copy count from the analytics table.
 */
export async function getGlobalStats() {
    try {
        const { data, error } = await supabase
            .from('analytics')
            .select('copy_count')
            .single();

        if (error) {
            console.error("SUPABASE ERROR:", error.message, error.details);
            return 5;
        }

        console.log("DATABASE FETCHED:", data.copy_count);
        return data.copy_count;
    } catch (err) {
        console.error("CATCH ERROR:", err);
        return 0;
    }
}

/**
 * Increments the global copy counter.
 */
export async function incrementCopyCount() {
    try {
        const { error } = await supabase.rpc('increment_copy_count');
        
        if (error) {
            console.error("RPC Error:", error.message); 
            return { success: false };
        }
        return { success: true };
    } catch (err) {
        return { success: false };
    }
}