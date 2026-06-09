import { Metadata } from 'next';
import Home from '../page-client';

export const metadata: Metadata = {
    title: 'Sponsoring | Docker Ninja',
    description: 'If these compose files saved you hours of debugging or helped you learn something new, consider sending a one-time donation to keep the lights on and the registry growing. Your support keeps the servers running and the code open source. Choose your preferred method below.',
    openGraph: {
        title: 'Sponsoring | Docker Ninja',
        description: 'If these compose files saved you hours of debugging or helped you learn something new, consider sending a one-time donation to keep the lights on and the registry growing. Your support keeps the servers running and the code open source. Choose your preferred method below.',
        url: 'https://dockerninja.org/sponsoring',
        type: 'website',
        images: [{ url: 'https://dockerninja.org/og-landing.jpg', width: 1200, height: 630, alt: 'Sponsoring Page Banner' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Sponsoring | Docker Ninja',
        description: 'If these compose files saved you hours of debugging or helped you learn something new, consider sending a one-time donation to keep the lights on and the registry growing.',
        images: ['https://dockerninja.org/og-landing.jpg'],
    },
};

export default function SponsoringRoute() {
    return <Home initialView="sponsoring" />;
}