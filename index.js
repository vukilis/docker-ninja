import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

export default {
    async fetch(request, env, ctx) {
        try {
        return await getAssetFromKV({
            request,
            waitUntil: ctx.waitUntil.bind(ctx),
        });
        } catch (e) {
        return new Response('Page not found', { status: 404 });
        }
    },
};