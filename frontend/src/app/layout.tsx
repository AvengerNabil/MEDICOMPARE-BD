import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';

export const metadata: Metadata = {
  title: 'MediCompare BD — Bangladesh Medicine Intelligence & Price Comparison',
  description: 'Explore verified medicine information, compare matching brands, and understand potential healthcare savings across Bangladesh. DGDA-aligned.',
  keywords: [
    'Bangladesh medicine price',
    'DGDA registered medicines',
    'Generic medicine comparison',
    'Square Pharmaceuticals',
    'Beximco Pharma',
    'Incepta',
    'Napa',
    'Nexum',
    'Paracetamol BDT price',
  ],
  authors: [{ name: 'MediCompare BD HealthTech' }],
  openGraph: {
    title: 'MediCompare BD — Compare Medicines. Understand Better. Save Smarter.',
    description: 'Verify active ingredients, discover equivalent generic brands, and calculate pharmaceutical cost savings across Bangladesh.',
    locale: 'en_BD',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col bg-brand-bg text-brand-text antialiased">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
