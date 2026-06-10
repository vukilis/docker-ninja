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
        images: [{ url: 'https://raw.githubusercontent.com/vukilis/docker-ninja/refs/heads/main/app/page_preview.png', width: 1200, height: 630 }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Documentation | Docker Ninja',
        description: 'Professional reference for installing Docker, Docker Compose, structuring compose files, and configuring .env variables.',
        images: ['https://raw.githubusercontent.com/vukilis/docker-ninja/refs/heads/main/app/page_preview.png'],
    },
};

export default function DocsRoute() {
    return <Home initialView="docs" />;
}
