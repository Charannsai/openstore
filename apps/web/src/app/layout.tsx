import type { Metadata } from 'next';
import Script from 'next/script';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-inter',
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
    <html lang="en" className={`dark ${inter.variable}`} suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
        />
      </head>
      <body
        className={`${inter.className} bg-[var(--bg-app)] text-[var(--text-main)] antialiased min-h-screen font-sans selection:bg-zinc-800 selection:text-white dark:selection:bg-zinc-200 dark:selection:text-zinc-950 transition-colors duration-200`}
        suppressHydrationWarning
      >
        <Script
          id="openstore-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('openstore-theme');
                  var theme = saved || 'dark';
                  document.documentElement.classList.remove('dark', 'light');
                  document.documentElement.classList.add(theme);
                } catch (e) {}
              })();
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
