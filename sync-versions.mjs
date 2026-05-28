// sync-versions.mjs
async function syncVersions() {
    console.log("Starting version sync...");
    const url = process.env.CLIENT_URL;
    const key = process.env.CLIENT_KEY;

    // Fetch apps
    const appsRes = await fetch(`${url}/rest/v1/apps?select=id,github`, {
        headers: { 
            'apikey': key, 
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json'
        }
    });

    if (!appsRes.ok) {
        console.error("Fetch Apps Failed:", await appsRes.text());
        return;
    }
    const apps = await appsRes.json();

    for (const app of apps) {
        // Safety check: ensure app.github exists and is a string
        if (!app.github || typeof app.github !== 'string') {
            console.log(`⚠️ Skipping id ${app.id}: No GitHub URL found.`);
            continue;
        }
        
        const match = app.github.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (!match) continue;

        const [_, owner, repo] = match;

        try {
            // Fetch from GitHub API
            const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, {
                headers: { 'Authorization': `Bearer ${process.env.CLIENT_TOKEN}` }
            });

            if (!res.ok) {
                console.log(`ℹ️ Skipping ${repo}: No release found or private repo.`);
                continue;
            }

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

            // Wait 500ms between requests
            await new Promise(resolve => setTimeout(resolve, 500));

        } catch (e) {
            console.error(`❌ Failed to update ${repo}:`, e.message);
        }
    }
}

syncVersions();