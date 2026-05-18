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
export async function getComposeContent(appSlug: string): Promise<string> {
    if (!appSlug) return "Error: Invalid application slug.";

    try {
        const { data: app, error } = await supabase
            .from('apps')
            .select('compose_url, fallback_compose')
            .eq('slug', appSlug)
            .single();

        if (error || !app) {
            return "Error: Application not found in database.";
        }

        if (app.compose_url) {
            try {
                const response = await fetch(app.compose_url, { 
                    next: { revalidate: 3600 }, // Cache result for 1 hour
                    headers: { 'Accept': 'text/plain' }
                });
                
                if (response.ok) {
                    return await response.text();
                }
            } catch (e) {
                console.error(`Remote fetch request failed for ${appSlug}:`, e);
            }
        }

        return app.fallback_compose || "No compose configuration found in database!";
    } catch (err) {
        console.error("Critical error in getComposeContent server action:", err);
        return "Error: Internal server configuration failure.";
    }
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
/// --- LIKES SYSTEM CATEGORIES ---
export async function fetchAllActiveLikes(): Promise<Record<string, number>> {
    try {
        const { data, error } = await supabase
            .from('app_likes')
            .select('app_slug')
            .eq('is_liked', true);
            
        if (error || !data) return {};
        const likesMap: Record<string, number> = {};
        
        data.forEach(item => {
            const slug = item.app_slug;
            if (slug) {
                likesMap[slug] = (likesMap[slug] || 0) + 1;
            }
        });

        return likesMap;
    } catch (err) {
        console.error("Failed fetching active dashboard likes:", err);
        return {};
    }
}

/// --- LIKES SYSTEM COUNT ---
export async function fetchAppLikes(appSlug: string): Promise<number> {
    try {
        const { count, error } = await supabase
            .from('app_likes')
            .select('*', { count: 'exact', head: true })
            .eq('app_slug', appSlug)
            .eq('is_liked', true);

        if (error) return 0;
        return count || 0;
    } catch (err) {
        return 0;
    }
}

/**
 * Check if this unique device string exists inside the backend table row
 */
export async function checkHasDeviceLiked(appSlug: string, deviceUuid: string): Promise<boolean> {
    try {
        if (!deviceUuid) return false;
        
        const { data, error } = await supabase
            .from('app_likes')
            .select('id')
            .eq('app_slug', appSlug)
            .eq('device_uuid', deviceUuid)
            .eq('is_liked', true)
            .maybeSingle();

        if (error || !data) return false;
        return true;
    } catch (err) {
        return false;
    }
}

/**
 * Adds or removes row items from our public tracker table based on flag condition
 */
export async function toggleAppLike(appSlug: string, isIncrement: boolean, deviceUuid: string): Promise<boolean> {
    try {
        if (!deviceUuid) return false;

        if (isIncrement) {
            const { data: existing } = await supabase
                .from('app_likes')
                .select('id')
                .eq('app_slug', appSlug)
                .eq('device_uuid', deviceUuid)
                .maybeSingle();

            if (existing) {
                const { error } = await supabase
                    .from('app_likes')
                    .update({ is_liked: true })
                    .eq('id', existing.id);
                return !error;
            }

            const { data: allRows } = await supabase
                .from('app_likes')
                .select('id')
                .order('id', { ascending: true });

            let nextId = 1;
            if (allRows && allRows.length > 0) {
                for (let i = 0; i < allRows.length; i++) {
                    if (allRows[i].id === nextId) {
                        nextId++;
                    } else if (allRows[i].id > nextId) {
                        break;
                    }
                }
            }

            const { error } = await supabase
                .from('app_likes')
                .insert({ 
                    id: nextId,
                    app_slug: appSlug, 
                    device_uuid: deviceUuid, 
                    is_liked: true 
                });

            if (error) {
                console.error("Insert error:", error.message);
                return false;
            }
        } else {
            const { error } = await supabase
                .from('app_likes')
                .delete()
                .eq('app_slug', appSlug)
                .eq('device_uuid', deviceUuid);

            if (error) return false;
        }

        return true;
    } catch (err) {
        return false;
    }
}