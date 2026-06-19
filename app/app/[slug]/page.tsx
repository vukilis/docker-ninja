import { Metadata } from 'next';
import AppPageClient from './app-client';
import { fetchAllApps } from '../../actions';
import { notFound } from 'next/navigation';

const findAppBySlug = (apps: Awaited<ReturnType<typeof fetchAllApps>>, slug: string) => {
    const normalizedSlug = slug.toLowerCase();
    const exactMatch = apps.find((a) => a.slug === slug || a.slug.toLowerCase() === normalizedSlug || String(a.id) === slug);
    return exactMatch || null;
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const apps = await fetchAllApps();
    const app = findAppBySlug(apps, slug);
    const canonicalSlug = app?.slug || slug;
    const name = app?.name || 'Container Preview';
    const imageUrl = '/page_preview.png';
    const appUrl = `https://dockerninja.org/app/${encodeURIComponent(canonicalSlug)}`;

    return {
        title: `${name} | Docker Ninja`,
        description: app?.description || `Read configuration steps, settings, and deployment details for ${name}.`,
        alternates: {
            canonical: appUrl,
        },
        openGraph: {
            title: `${name} | Docker Ninja`,
            description: app?.description || `Read configuration steps, settings, and deployment details for ${name}.`,
            url: appUrl,
            type: 'website',
            images: [{ url: imageUrl, width: 1200, height: 630, alt: name }],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${name} | Docker Ninja`,
            description: app?.description || `Read configuration steps, settings, and deployment details for ${name}.`,
            images: [imageUrl],
        },
    };
}

export default async function AppSlugPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const apps = await fetchAllApps();
    const initialApp = findAppBySlug(apps, slug);

    if (!initialApp) {
        notFound();
    }

    return <AppPageClient slug={slug} initialApp={initialApp} />;
}
