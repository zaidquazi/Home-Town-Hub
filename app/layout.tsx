import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { QueryProvider } from '@/providers/query-provider';
import AuthProvider from '@/components/providers/AuthProvider';
import { SocketProvider } from '@/lib/providers/SocketProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: { default: 'Hometown Hub — Digital Community Platform', template: '%s | Hometown Hub' },
  description: 'Connect with your hometown community. Share updates, organize events, preserve local culture, and build genuine connections with neighbors.',
  keywords: ['community', 'hometown', 'local', 'neighbors', 'events', 'social', 'hyperlocal'],
  authors: [{ name: 'Hometown Hub' }],
  openGraph: {
    title: 'Hometown Hub — Digital Community Platform',
    description: 'Connect with your hometown community. Share updates, organize events, and build genuine connections.',
    type: 'website',
    siteName: 'Hometown Hub',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hometown Hub — Digital Community Platform',
    description: 'Connect with your hometown community.',
  },
};

export const viewport: Viewport = {
  themeColor: '#2563EB',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <QueryProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <AuthProvider>
              <SocketProvider>
                {children}
              </SocketProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
              borderRadius: '14px',
              padding: '12px 16px',
              fontSize: '14px',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.08)',
            },
          }}
        />
      </body>
    </html>
  );
}
