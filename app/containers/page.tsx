import { Metadata } from 'next';
import Home from '../page-client';

export const metadata: Metadata = {
    title: 'Explore Containers | Docker Ninja',
    description: 'Access the official collection of battle-tested docker-compose.yml files. No more scouring the web, just deploy, scale, and launch.',
    openGraph: {
        title: 'Containers | Docker Ninja',
        description: 'Access the official collection of battle-tested docker-compose.yml files. No more scouring the web, just deploy, scale, and launch.',
        url: 'https://dockerninja.org/containers',
        type: 'website',
        images: [{ url: 'https://dockerninja.org/favicon.ico', width: 1200, height: 630, alt: 'Containers Page Banner' }],
    },
};

export default function ContainersRoute() {
    return <Home initialView="dashboard" />;
}