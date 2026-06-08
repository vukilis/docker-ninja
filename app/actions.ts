'use server';

import { getSupabase } from '../lib/supabase';
import { unstable_cache } from 'next/cache';

export interface AppRow {
    id: string | number;
    slug: string;
    name: string;
    category: string;
    icon_url?: string;
    [key: string]: unknown;
}

export async function fetchAllApps(category?: string, search?: string, minimal: boolean = false): Promise<AppRow[]> {
    const fields = minimal ? 'id, name, slug, icon_url' : 'id, name, slug, category, icon_url';
    const supabase = getSupabase();
    if (!supabase) return [];

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

    return ((data || []) as unknown[]).filter((item): item is AppRow => {
        const record = item as Record<string, unknown>;
        return (
            (typeof record.id === 'string' || typeof record.id === 'number') &&
            typeof record.slug === 'string' &&
            typeof record.name === 'string' &&
            typeof record.category === 'string'
        );
    });
}

export async function fetchAppDetail(slug: string) {
    const supabase = getSupabase();
    if (!supabase) return {};

    const { data } = await supabase
        .from('apps')
        .select('website, github, docs, source, description, run_command, cli_update_command, bash_command, update_command, env_file, updated_at, version')
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
        const supabase = getSupabase();
        if (!supabase) return "Error: Application not found.";

        const { data: appRaw, error } = await supabase
            .from('apps')
            .select('compose_url, fallback_compose')
            .eq('slug', appSlug)
            .single();
        const app = appRaw as { compose_url: string | null; fallback_compose: string | null } | null;

        if (error || !app) {
            return "Error: Application not found.";
        }
        if (app.fallback_compose) {
            return app.fallback_compose;
        }
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
        return "No compose configuration found!";
    },
    ['compose-content'],
    { 
        revalidate: 10, // 3600 prod
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
    const supabase = getSupabase();
    if (!supabase) return 5;

    try {
        const { data: analyticsRaw, error } = await supabase
            .from('analytics')
            .select('copy_count')
            .single();
        const analytics = analyticsRaw as { copy_count: number } | null;

        if (error || !analytics) {
            console.error("SUPABASE ERROR:", error?.message, error?.details);
            return 5;
        }

        console.log("DATABASE FETCHED:", analytics.copy_count);
        return analytics.copy_count;
    } catch (err) {
        console.error("CATCH ERROR:", err);
        return 0;
    }
}

/**
 * Increments the global copy counter.
 */
export async function incrementCopyCount(): Promise<number> {
    const supabase = getSupabase();
    if (!supabase) return -1;

    const { data, error } = await supabase.rpc('increment_copy_count');
    if (error) return -1;
    return data as number; // Returns the new total
}
/// --- LIKES SYSTEM ---
export async function fetchAllActiveLikes(): Promise<Record<string, number>> {
    const supabase = getSupabase();
    if (!supabase) return {};

    try {
        const { data: likesRaw, error } = await supabase
            .from('app_likes')
            .select('app_slug')
            .eq('is_liked', true);
        const likes = likesRaw as { app_slug: string }[] | null;
            
        if (error || !likes) return {};
        const likesMap: Record<string, number> = {};
        
        likes.forEach(item => {
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
    const supabase = getSupabase();
    if (!supabase) return false;

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
export async function toggleAppLike(appSlug: string, isLiked: boolean, deviceUuid: string): Promise<number> {
    if (!appSlug || !deviceUuid) return -1;
    const supabase = getSupabase();
    if (!supabase) return -1;

    try {
        if (isLiked) {
            const { error: insertError } = await supabase
                .from('app_likes')
                .insert([{ app_slug: appSlug, device_uuid: deviceUuid, is_liked: true }] as never);

            if (insertError) {
                console.error('Error liking app:', insertError);
                return -1;
            }
        } else {
            const { error: deleteError } = await supabase
                .from('app_likes')
                .delete()
                .eq('app_slug', appSlug)
                .eq('device_uuid', deviceUuid);

            if (deleteError) {
                console.error('Error unliking app:', deleteError);
                return -1;
            }
        }

        const { count, error: countError } = await supabase
            .from('app_likes')
            .select('*', { count: 'exact', head: true })
            .eq('app_slug', appSlug);

        if (countError) {
            console.error('Error counting likes:', countError);
            return -1;
        }

        return typeof count === 'number' ? count : -1;
    } catch (err) {
        console.error('Unexpected error toggling like:', err);
        return -1;
    }
}
