import { ThemeProvider } from './components/ThemeProvider';
import { QueryProvider } from './components/QueryProvider';
import Preloader from './components/Preloader';
import { AppsProvider } from './context/AppsContext';
import { fetchAllApps, fetchAllActiveLikes } from './actions';
import './style/globals.css';

export const metadata = {
  metadataBase: new URL('https://dockerninja.org'),
  title: {
    default: 'Docker Ninja',
    template: '%s | Docker Ninja',
  },
  description: `Containerization redefined my reality, yet I constantly hit a ceiling. I grew tired of the fragmented search for reliable infrastructure code and the endless scouring for inspiration. I built this universe to collapse the hurdles. Whether you are a student exploring the basics, a tinkerer building a homelab or a pro architecting a stack, this is the perfect place for you.`,
  keywords: ['Docker', 'Self-hosting', 'Templates', 'Compose'],
  authors: [{ name: 'Vuk Lekic' }],
  creator: 'Vuk Lekic',
  openGraph: {
    siteName: 'Docker Ninja',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/page_preview.png',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@vukilis',
    images: ['/page_preview.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://dockerninja.org',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
  },
};

export const viewport = {
    themeColor: '#000000',
    width: 'device-width',
    initialScale: 1,
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	const [apps, likes] = await Promise.all([fetchAllApps(), fetchAllActiveLikes()]);
	return (
		<html lang="en" suppressHydrationWarning>
  	<body className="my-custom-background text-slate-900 dark:text-slate-200">
				<ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
					<QueryProvider>
						<AppsProvider initialApps={apps} initialGlobalLikes={likes}>
							<Preloader />
							{children}
						</AppsProvider>
					</QueryProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}