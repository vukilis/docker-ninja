import { ThemeProvider } from 'next-themes';
import Preloader from './components/Preloader';
import './style/globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white dark:bg-[#0d1117] text-slate-900 dark:text-slate-200 transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Preloader />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}