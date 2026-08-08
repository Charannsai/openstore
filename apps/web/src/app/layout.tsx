import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'OpenStore — Discover, Clone & Run Open-Source Apps Hands-Free',
  description: 'The native open-source software discovery & execution platform. Browse top open-source tools and run them locally in seconds.',
  openGraph: {
    title: 'OpenStore — Open-Source Software Discovery & Execution Platform',
    description: 'Browse top-tier open-source tools and run them locally in seconds.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#09090b] text-zinc-100 antialiased min-h-screen selection:bg-emerald-500/20 selection:text-emerald-400`}>
        {children}
      </body>
    </html>
  );
}
