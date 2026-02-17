import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'UK Resume Builder - Free ATS-Friendly CV Templates',
  description: 'Create professional UK CVs with our free ATS-friendly templates. Perfect for entry-level job seekers.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB">
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
        <Script
          data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || 'cvbuilder.co.uk'}
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
