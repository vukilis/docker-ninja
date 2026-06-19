import { Metadata } from 'next';
import AppPageClient from './app-client';
import { fetchAllApps } from '../../actions';
import { notFound } from 'next/navigation';
import { cache } from 'react';

const getAppBySlug = cache(async (slug: string) => {
    const apps = await fetchAllApps();
    const normalizedSlug = slug.toLowerCase();
    
    const exactMatch = apps.find(
        (a) => a.slug === slug || a.slug.toLowerCase() === normalizedSlug || String(a.id) === slug
    );
    
    return exactMatch || null;
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const app = await getAppBySlug(slug);
    
    const canonicalSlug = app?.slug || slug;
    const name = app?.name || 'Container Preview';
    const appUrl = `https://dockerninja.org/app/${encodeURIComponent(canonicalSlug)}`;
    const description = app?.description || `Read configuration steps, settings, and deployment details for ${name}.`;

    const hasCustomIcon = !!app?.icon_url;
    const imageUrl = app?.icon_url || 'https://dockerninja.org/page_preview.png';

    return {
        title: `${name} | Docker Ninja`,
        description,
        alternates: {
            canonical: appUrl,
        },
        openGraph: {
            title: `${name} | Docker Ninja`,
            description,
            url: appUrl,
            type: 'website',
            images: hasCustomIcon ? [] : [{ url: imageUrl, width: 1200, height: 630 }], 
        },
        twitter: {
            card: hasCustomIcon ? 'summary' : 'summary_large_image',
            title: `${name} | Docker Ninja`,
            description,
            images: [imageUrl],
        },
    };
}

export default async function AppSlugPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const app = await getAppBySlug(slug);

    if (!app) {
        notFound();
    }

    return <AppPageClient slug={slug} initialApp={app} />;
}