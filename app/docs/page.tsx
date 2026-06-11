import { Metadata } from 'next';
import Home from '../page-client';
import { jsonLdScriptProps, organizationJsonLd } from '../utils/seoJsonLd';

export const metadata: Metadata = {
    title: 'Documentation | Docker Ninja',
    description: 'Professional reference for installing Docker, Docker Compose, structuring compose files, and configuring .env variables. Official links and annotated examples included.',
    alternates: {
        canonical: 'https://dockerninja.org/docs',
    },
    openGraph: {
        title: 'Documentation | Docker Ninja',
        description: 'Professional reference for installing Docker, Docker Compose, structuring compose files, and configuring .env variables. Official links and annotated examples included.',
        url: 'https://dockerninja.org/docs',
        type: 'website',
        images: [{ url: '/page_preview.png', width: 1200, height: 630, alt: 'Documentation Page Banner' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Documentation | Docker Ninja',
        description: 'Professional reference for installing Docker, Docker Compose, structuring compose files, and configuring .env variables.',
        images: ['/page_preview.png'],
    },
};

export default function DocsRoute() {
    return (
        <>
            <script id="json-ld-docs" {...jsonLdScriptProps(organizationJsonLd)} />
            <Home initialView="docs" />
        </>
    );
}
