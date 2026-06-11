import { Metadata } from 'next';
import Home from './page-client';
import { jsonLdScriptProps, organizationJsonLd, websiteJsonLd } from './utils/seoJsonLd';

export const metadata: Metadata = {
  title: 'Docker Ninja | Explore the Infinite Stack',
  description: 'Master your containerization universe with official compose stacks for any application, all in one place. Dive into a hub perfectly crafted for both absolute beginners and seasoned experts in the vast containerization ecosystem.',
  alternates: {
      canonical: 'https://dockerninja.org',
  },
  openGraph: {
    title: 'Docker Ninja | Explore the Infinite Stack',
    description: 'Master your containerization universe with official compose stacks for any application, all in one place. Dive into a hub perfectly crafted for both absolute beginners and seasoned experts in the vast containerization ecosystem.',
    url: 'https://dockerninja.org',
    type: 'website',
    images: [
      {
        url: '/page_preview.png',
        width: 1200,
        height: 630,
        alt: 'Docker Ninja Home Page Banner',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Docker Ninja | Explore the Infinite Stack',
    description: 'Master your containerization universe with official compose stacks for any application, all in one place.',
    images: ['/page_preview.png'],
  },
};

export default function RootRoute() {
  return (
    <>
      <script id="json-ld-home" {...jsonLdScriptProps({ ...organizationJsonLd, ...websiteJsonLd })} />
      <Home initialView="dashboard" />
    </>
  );
}
