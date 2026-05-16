import { ThemeProvider } from 'next-themes';
import Preloader from './components/Preloader';
import './style/globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[#f6f4f0] dark:bg-[#0d1117] text-slate-900 dark:text-slate-200 transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Preloader />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

export const metadata = {
    title: 'Docker Ninja',
    description: `Containerization redefined my reality, yet I constantly hit a ceiling. 
    I grew tired of the fragmented search for reliable infrastructure code and the endless scouring for inspiration. 
    I built this universe to collapse the hurdles. Whether you are a student exploring the basics, 
    a tinkerer building a homelab or a pro architecting a stack, this is the perfect place for you.`,
    keywords: ['Docker', 'Self-hosting', 'Templates', 'Compose'],
    authors: [{ name: 'Vuk Lekic' }],
    creator: 'Vuk Lekic',
    metadataBase: new URL('https://dockerninja.com'),
    openGraph: {
      title: 'Docker Ninja',
      description: `Containerization redefined my reality, yet I constantly hit a ceiling. 
    I grew tired of the fragmented search for reliable infrastructure code and the endless scouring for inspiration. 
    I built this universe to collapse the hurdles. Whether you are a student exploring the basics, 
    a tinkerer building a homelab or a pro architecting a stack, this is the perfect place for you.`,
      url: 'https://dockerninja.com',
      siteName: 'Docker Ninja',
      images: [
        {
          url: 'https://dockerninja.com/og-image.png',
          width: 1200,
          height: 630,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'Docker Ninja',
      title: 'Docker Ninja',
      description: `Containerization redefined my reality, yet I constantly hit a ceiling. 
    I grew tired of the fragmented search for reliable infrastructure code and the endless scouring for inspiration. 
    I built this universe to collapse the hurdles. Whether you are a student exploring the basics, 
    a tinkerer building a homelab or a pro architecting a stack, this is the perfect place for you.`,
      creator: '@vukilis',
      images: ['https://dockerninja.com/og-image.png'], 
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: 'https://dockerninja.com',
    },
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
}

export const viewport = {
    themeColor: '#000000',
    width: 'device-width',
    initialScale: 1,
}