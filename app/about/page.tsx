import { Metadata } from 'next';
import Home from '../page-client';

export const metadata: Metadata = {
    title: 'About | Docker Ninja',
    description: 'Containerization redefined my reality, yet I constantly hit a ceiling. I grew tired of the fragmented search for reliable infrastructure code and the endless scouring for inspiration. I built this universe to collapse the hurdles. Whether you are a student exploring the basics, a tinkerer building a homelab or a pro architecting a stack, this is the perfect place for you.',
    openGraph: {
        title: 'About Us | Docker Ninja',
        description: 'Containerization redefined my reality, yet I constantly hit a ceiling. I grew tired of the fragmented search for reliable infrastructure code and the endless scouring for inspiration. I built this universe to collapse the hurdles. Whether you are a student exploring the basics, a tinkerer building a homelab or a pro architecting a stack, this is the perfect place for you.',
        url: 'https://dockerninja.org/about',
        type: 'website',
        images: [{ url: 'https://dockerninja.org/favicon.ico', width: 1200, height: 630, alt: 'About Page Banner' }],
    },
};

export default function AboutRoute() {
    return <Home initialView="About" />;
}