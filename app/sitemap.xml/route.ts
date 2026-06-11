import { NextResponse } from 'next/server';
import { fetchAllApps } from '../actions';

export const revalidate = 3600;

interface SitemapUrl {
  loc: string;
  lastmod: string;
  priority: string;
  changefreq: string;
  name?: string;
  description?: string;
  image?: string;
}

const escapeXml = (value: string) =>
  value.replace(/[<>&'"]/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[char] ?? char));

export async function GET() {
  const baseUrl = 'https://dockerninja.org';
  const apps = await fetchAllApps();

  const staticUrls: SitemapUrl[] = [
    { loc: `${baseUrl}/`, lastmod: '2026-06-11', priority: '1.0', changefreq: 'daily' },
    { loc: `${baseUrl}/containers`, lastmod: '2026-06-11', priority: '0.9', changefreq: 'daily' },
    { loc: `${baseUrl}/categories`, lastmod: '2026-06-11', priority: '0.8', changefreq: 'daily' },
    { loc: `${baseUrl}/docs`, lastmod: '2026-06-11', priority: '0.8', changefreq: 'weekly' },
    { loc: `${baseUrl}/about`, lastmod: '2026-06-11', priority: '0.6', changefreq: 'monthly' },
    { loc: `${baseUrl}/community`, lastmod: '2026-06-11', priority: '0.6', changefreq: 'weekly' },
    { loc: `${baseUrl}/sponsoring`, lastmod: '2026-06-11', priority: '0.6', changefreq: 'monthly' },
  ];

  const appUrls: (SitemapUrl & { name: string; description: string; image: string })[] = apps.map((app) => {
    const lastmod = typeof app.updated_at === 'string' && app.updated_at ? app.updated_at : '2026-06-11';
    const name = escapeXml(typeof app.name === 'string' ? app.name : '');
    const description = escapeXml(typeof app.description === 'string' ? app.description : '');
    const iconUrl = typeof app.icon_url === 'string' && app.icon_url.length > 0 ? app.icon_url : `${baseUrl}/favicon-32x32.png`;
    return {
      loc: `${baseUrl}/app/${encodeURIComponent(app.slug || String(app.id))}`,
      lastmod,
      priority: '0.7',
      changefreq: 'weekly',
      name,
      description,
      image: iconUrl,
    };
  });

  const urls = [...staticUrls, ...appUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls
  .map((url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <priority>${url.priority}</priority>
    <changefreq>${url.changefreq}</changefreq>
    ${url.name ? `<name>${url.name}</name>` : ''}
    ${url.description ? `<description>${url.description}</description>` : ''}
    ${url.image ? `<image:image><image:loc>${url.image}</image:loc></image:image>` : ''}
  </url>`)
  .join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
