import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { fetchAllApps } from '../../actions';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const apps = await fetchAllApps();
    const app = apps.find((a) => a.slug === slug || String(a.id) === slug);
    const name = app?.name || 'Container Preview';
    
    return {
        title: `Previewing ${name} | Docker Ninja`,
        description: `Read configuration steps, settings, and deployment details for ${name}.`,
        openGraph: {
        title: `Previewing ${name} | Docker Ninja`,
        description: `Read configuration steps, settings, and deployment details for ${name}.`,
        url: `https://dockerninja.org/app/${encodeURIComponent(slug)}`,
        type: 'website',
        images: [{ url: '/og-image.png', width: 1200, height: 630 }],
        },
    };
}

export default async function AppSlugPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    redirect(`/containers?preview=${encodeURIComponent(slug)}`);
}
