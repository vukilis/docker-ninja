import { Metadata } from 'next';
import Home from '../page-client';

export const metadata: Metadata = {
    title: 'Browse Categories | Docker Ninja',
    description: 'Browse the official collection of battle-tested docker-compose.yml files categorized by technical architecture layers. Find the perfect stack for your project, whether it’s a simple web server or a complex microservices setup.',
    openGraph: {
        title: 'Browse Categories | Docker Ninja',
        description: 'Browse the official collection of battle-tested docker-compose.yml files categorized by technical architecture layers. Find the perfect stack for your project, whether it’s a simple web server or a complex microservices setup.',
        url: 'https://dockerninja.org/categories',
        type: 'website',
        images: [{ url: 'https://raw.githubusercontent.com/vukilis/docker-ninja/refs/heads/main/app/page_preview.png', width: 1200, height: 630, alt: 'Categories Page Banner' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Browse Categories | Docker Ninja',
        description: 'Browse the official collection of battle-tested docker-compose.yml files categorized by technical architecture layers.',
        images: ['https://raw.githubusercontent.com/vukilis/docker-ninja/refs/heads/main/app/page_preview.png'],
    },
};

export default function CategoriesRoute() {
    return <Home initialView="categories" />;
}