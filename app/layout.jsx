import { Cinzel, Cormorant_Garamond, GFS_Didot } from 'next/font/google';
import './globals.css';

const cinzel = Cinzel({ subsets: ['latin', 'latin-ext'], weight: ['600', '700', '800'], variable: '--f-cinzel' });
const cormorant = Cormorant_Garamond({ subsets: ['latin', 'latin-ext'], weight: ['400', '500'], style: ['normal', 'italic'], variable: '--f-cormorant' });
const didot = GFS_Didot({ subsets: ['greek'], weight: '400', variable: '--f-didot' });

export const metadata = {
  title: 'ZEUS — Az istenek illata',
  description: 'ZEUS és PHARAON Eau de Parfum – 100 ml, 51 600 Ft. Az istenek illata.',
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23d9b25a' d='M13.5 2 4.5 13.5h6.2L9.5 22l10-12.2h-6.4L13.5 2Z'/%3E%3C/svg%3E",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#05060a',
};

export default function RootLayout({ children }) {
  return (
    <html lang="hu" className={`js ${cinzel.variable} ${cormorant.variable} ${didot.variable}`} suppressHydrationWarning>
      <body className="intro" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
