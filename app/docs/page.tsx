import { Metadata } from 'next';
import Home from '../page-client';

export const metadata: Metadata = {
    title: 'Documentation | Docker Ninja',
    description: 'Professional reference for installing Docker, Docker Compose, structuring compose files, and configuring .env variables. Official links and annotated examples included.',
    openGraph: {
        title: 'Documentation | Docker Ninja',
        description: 'Professional reference for installing Docker, Docker Compose, structuring compose files, and configuring .env variables. Official links and annotated examples included.',
        url: 'https://dockerninja.org/docs',
        type: 'website',
        images: [{ url: 'https://dockerninja.org/og-image.png', width: 1200, height: 630 }],
    },
};

export default function DocsRoute() {
    return <Home initialView="docs" />;
}
