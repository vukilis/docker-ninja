import { Metadata } from 'next';
import Home from '../page-client';
import { jsonLdScriptProps, organizationJsonLd } from '../utils/seoJsonLd';
import { fetchAllApps } from '../actions';

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ preview?: string }> }): Promise<Metadata> {
  const params = await searchParams;
  const previewSlug = params.preview;

  if (previewSlug) {
    const apps = await fetchAllApps();
    const app = apps.find((a) => a.slug === previewSlug || String(a.id) === previewSlug);
    const name = app?.name || 'Container Preview';
    const imageUrl = '/page_preview.png';
    return {
      title: `Previewing ${name} | Docker Ninja`,
      description: `Read configuration steps, settings, and deployment details for ${name}.`,
      alternates: {
          canonical: 'https://dockerninja.org/containers',
      },
      openGraph: {
        title: `Previewing ${name} | Docker Ninja`,
        description: `Read configuration steps, settings, and deployment details for ${name}.`,
        url: `https://dockerninja.org/containers?preview=${encodeURIComponent(previewSlug)}`,
        type: 'website',
        images: [{ url: imageUrl, width: 1200, height: 630, alt: name }],
      },
      twitter: {
        card: 'summary_large_image',
        title: `Previewing ${name} | Docker Ninja`,
        description: `Read configuration steps, settings, and deployment details for ${name}.`,
        images: [imageUrl],
      },
    };
  }

  return {
    title: 'Explore Containers | Docker Ninja',
    description: 'Access the official collection of battle-tested docker-compose.yml files. No more scouring the web, just deploy, scale, and launch.',
    alternates: {
        canonical: 'https://dockerninja.org/containers',
    },
    openGraph: {
      title: 'Containers | Docker Ninja',
      description: 'Access the official collection of battle-tested docker-compose.yml files. No more scouring the web, just deploy, scale, and launch.',
      url: 'https://dockerninja.org/containers',
      type: 'website',
      images: [{ url: '/page_preview.png', width: 1200, height: 630, alt: 'Containers Page Banner' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Containers | Docker Ninja',
      description: 'Access the official collection of battle-tested docker-compose.yml files. No more scouring the web, just deploy, scale, and launch.',
      images: ['/page_preview.png'],
    },
  };
}

export default async function ContainersRoute({ searchParams }: { searchParams: Promise<{ preview?: string }> }) {
  const params = await searchParams;
  const previewSlug = params.preview;

  return (
    <>
      <script id="json-ld-containers" {...jsonLdScriptProps(organizationJsonLd)} />
      <Home initialView="dashboard" initialAppSlug={previewSlug} />
    </>
  );
}
