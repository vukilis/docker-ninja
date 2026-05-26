'use server';

import { supabase } from '../lib/supabase';
import { unstable_cache } from 'next/cache';

/**
 * Fetches all app metadata from Supabase.
 * Used by the useApps hook to populate the main dashboard grid.
 */
export async function fetchAllApps(category?: string, search?: string, minimal: boolean = false) {
    // If minimal is true, we fetch even fewer fields
    const fields = minimal ? 'id, name, slug, icon_url' : 'id, name, slug, category, icon_url';
    
    let query = supabase.from('apps').select(fields);

    if (category && category !== "Dashboard" && category !== "categories") {
        query = query.eq('category', category);
    }
    if (search) {
        query = query.textSearch('name', `${search}:*`);
    }

    const { data, error } = await query.order('name', { ascending: true });
    
    if (error) {
        console.error("Error fetching apps:", error);
        return [];
    }
    
    return data || [];
}

export async function fetchAppDetail(slug: string) {
    const { data } = await supabase
        .from('apps')
        .select('website, github, docs, source, description, run_command, compose_url, fallback_compose')
        .eq('slug', slug)
        .single();
    return data || {};
}

/**
 * Retrieves Docker Compose content for a specific app.
 * Logic Flow:
 * handles the DB lookup and the remote fetch,
 * and caches the final string result for 1 hour
 */

const getCachedComposeContent = unstable_cache(
    async (appSlug: string): Promise<string> => {
        // Fetch from Supabase
        const { data: app, error } = await supabase
            .from('apps')
            .select('compose_url, fallback_compose')
            .eq('slug', appSlug)
            .single();

        if (error || !app) {
            return "Error: Application not found.";
        }

        // Attempt remote fetch if URL exists
        if (app.compose_url) {
            try {
                const response = await fetch(app.compose_url, { 
                    headers: { 'Accept': 'text/plain' }
                });
                if (response.ok) return await response.text();
            } catch (e) {
                console.error(`Remote fetch failed for ${appSlug}:`, e);
            }
        }

        return app.fallback_compose || "No compose configuration found!";
    },
    ['compose-content'],
    { 
        revalidate: 3600, 
        tags: ['compose-content']
    }
);

export async function getComposeContent(appSlug: string): Promise<string> {
    if (!appSlug) return "Error: Invalid application slug.";
    return await getCachedComposeContent(appSlug);
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
export async function incrementCopyCount(): Promise<number> {
    const { data, error } = await supabase.rpc('increment_copy_count');
    if (error) return -1;
    return data as number; // Returns the new total
}
/// --- LIKES SYSTEM ---
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

/**
 * Check if this unique device string exists inside the backend table row
 */
export async function checkHasDeviceLiked(appSlug: string, deviceUuid: string): Promise<boolean> {
    const { data } = await supabase
        .from('app_likes')
        .select('id')
        .eq('app_slug', appSlug)
        .eq('device_uuid', deviceUuid)
        .maybeSingle();

    return !!data;
}

/**
 * Adds or removes row items from our public tracker table based on flag condition
 */
export async function toggleAppLike(appSlug: string, isIncrement: boolean, deviceUuid: string): Promise<number> {
    try {
        if (isIncrement) {
            await supabase
                .from('app_likes')
                .upsert({ app_slug: appSlug, device_uuid: deviceUuid, is_liked: true }, { onConflict: 'app_slug, device_uuid' });
        } else {
            await supabase
                .from('app_likes')
                .delete()
                .eq('app_slug', appSlug)
                .eq('device_uuid', deviceUuid);
        }

        const { count } = await supabase
            .from('app_likes')
            .select('*', { count: 'exact', head: true })
            .eq('app_slug', appSlug);
            
        return count || 0;
    } catch (err) {
        return -1;
    }
}