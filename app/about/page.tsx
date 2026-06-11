import { Metadata } from 'next';
import Home from '../page-client';
import { jsonLdScriptProps, organizationJsonLd } from '../utils/seoJsonLd';

export const metadata: Metadata = {
    title: 'About | Docker Ninja',
    description: 'Containerization redefined my reality, yet I constantly hit a ceiling. I grew tired of the fragmented search for reliable infrastructure code and the endless scouring for inspiration. I built this universe to collapse the hurdles. Whether you are a student exploring the basics, a tinkerer building a homelab or a pro architecting a stack, this is the perfect place for you.',
    alternates: {
        canonical: 'https://dockerninja.org/about',
    },
    openGraph: {
        title: 'About Us | Docker Ninja',
        description: 'Containerization redefined my reality, yet I constantly hit a ceiling. I grew tired of the fragmented search for reliable infrastructure code and the endless scouring for inspiration. I built this universe to collapse the hurdles. Whether you are a student exploring the basics, a tinkerer building a homelab or a pro architecting a stack, this is the perfect place for you.',
        url: 'https://dockerninja.org/about',
        type: 'website',
        images: [{ url: '/page_preview.png', width: 1200, height: 630, alt: 'About Page Banner' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'About | Docker Ninja',
        description: 'Whether you are a student exploring the basics, a tinkerer building a homelab or a pro architecting a stack, this is the perfect place for you.',
        images: ['/page_preview.png'],
    },
};

export default function AboutRoute() {
    return (
        <>
            <script id="json-ld-about" {...jsonLdScriptProps(organizationJsonLd)} />
            <Home initialView="about" />
        </>
    );
}
