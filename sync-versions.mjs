import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.CLIENT_URL,
    process.env.CLIENT_KEY,
    {
        auth: { persistSession: false },
        realtime: { enabled: false } 
    }
);

async function syncVersions() {
    console.log("Starting version sync...");

    const { data: apps, error } = await supabase
        .from('apps')
        .select('id, github')
        .like('github', '%github.com%');

    if (error) {
        console.error("Error fetching apps:", error);
        return;
    }

    for (const app of apps) {
        const match = app.github.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (!match) continue;

        const [_, owner, repo] = match;

        try {
            const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, {
                headers: { 'Authorization': `Bearer ${process.env.CLIENT_TOKEN}` }
            });

            if (!res.ok) continue;

            const data = await res.json();
            if (data.tag_name) {
                await supabase
                    .from('apps')
                    .update({ version: data.tag_name })
                    .eq('id', app.id);
                console.log(`✅ Updated ${repo} to ${data.tag_name}`);
            }
        } catch (e) {
            console.error(`❌ Failed to update ${repo}:`, e.message);
        }
    }
}

syncVersions();