import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'OpenStore — The Open-Source Software Discovery & Execution Platform',
  description:
    'Discover, install, auto-fix prerequisites via Winget, and run open-source repositories hands-free on your desktop.',
  openGraph: {
    title: 'OpenStore — Open-Source App Store & Execution Agent',
    description:
      'Discover, clone, auto-fix prerequisites via Winget, and run any GitHub repository hands-free.',
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
      <body className={`${inter.className} bg-[var(--bg-app)] text-[var(--text-main)] antialiased min-h-screen selection:bg-zinc-800 selection:text-white dark:selection:bg-zinc-200 dark:selection:text-zinc-950`}>
        {children}
      </body>
    </html>
  );
}
