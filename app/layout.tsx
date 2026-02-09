import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
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
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
