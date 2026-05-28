// sync-versions.mjs
async function syncVersions() {
    console.log("Starting version sync...");
    const url = process.env.CLIENT_URL;
    const key = process.env.CLIENT_KEY;

    // Fetch apps
    const appsRes = await fetch(`${url.replace(/\/$/, "")}/rest/v1/apps?select=id,github&github=like.%github.com%`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    });

    if (!appsRes.ok) {
        const errorText = await appsRes.text();
        console.error("Supabase Error:", errorText);
        return;
    }
    const apps = await appsRes.json();

    for (const app of apps) {
        const match = app.github.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (!match) continue;

        const [_, owner, repo] = match;

        try {
            // etch from GitHub API
            const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, {
                headers: { 'Authorization': `Bearer ${process.env.CLIENT_TOKEN}` }
            });

            if (!res.ok) continue;

            const data = await res.json();
            
            // Update Supabase
            if (data.tag_name) {
                await fetch(`${url}/rest/v1/apps?id=eq.${app.id}`, {
                    method: 'PATCH',
                    headers: { 
                        'apikey': key, 
                        'Authorization': `Bearer ${key}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({ version: data.tag_name })
                });
                console.log(`✅ Updated ${repo} to ${data.tag_name}`);
            }
        } catch (e) {
            console.error(`❌ Failed:`, e.message);
        }
    }
}

syncVersions();