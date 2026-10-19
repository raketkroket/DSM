import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google';
import { MotionProvider } from '@/components/motion/MotionProvider';
import { getPublishedSite } from '@/lib/content/get';
import { env } from '@/lib/env';
import './globals.css';

const geist = Geist({ variable: '--font-geist', subsets: ['latin'], display: 'swap' });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'], display: 'swap' });
const instrument = Instrument_Serif({
  variable: '--font-instrument',
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getPublishedSite();
  const ogImage = settings.ogImage.src || '/opengraph-image';
  return {
    metadataBase: new URL(env.siteUrl),
    title: { default: settings.seoTitle, template: `%s | ${settings.companyName}` },
    description: settings.seoDescription,
    applicationName: settings.companyName,
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      locale: 'nl_NL',
      siteName: settings.companyName,
      title: settings.seoTitle,
      description: settings.seoDescription,
      images: [{ url: ogImage, width: 1200, height: 630, alt: settings.companyName }],
    },
    twitter: { card: 'summary_large_image', title: settings.seoTitle, description: settings.seoDescription },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: '#f6f7f9',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="nl" className={`${geist.variable} ${geistMono.variable} ${instrument.variable}`}>
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
