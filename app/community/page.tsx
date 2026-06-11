import { Metadata } from 'next';
import Home from '../page-client';
import { jsonLdScriptProps, organizationJsonLd } from '../utils/seoJsonLd';

export const metadata: Metadata = {
    title: 'Community | Docker Ninja',
    description: 'Found a bug? Have a stack suggestion? Want to just say hi? Our core is built on open communication and shared curiosity.',
    alternates: {
        canonical: 'https://dockerninja.org/community',
    },
    openGraph: {
        title: 'Community | Docker Ninja',
        description: 'Found a bug? Have a stack suggestion? Want to just say hi? Our core is built on open communication and shared curiosity.',
        url: 'https://dockerninja.org/community',
        type: 'website',
        images: [{ url: '/page_preview.png', width: 1200, height: 630, alt: 'Community Page Banner' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Community | Docker Ninja',
        description: 'Found a bug? Have a stack suggestion? Want to just say hi? Our core is built on open communication and shared curiosity.',
        images: ['/page_preview.png'],
    },
};

export default function CommunityRoute() {
    return (
        <>
            <script id="json-ld-community" {...jsonLdScriptProps(organizationJsonLd)} />
            <Home initialView="community" />
        </>
    );
}