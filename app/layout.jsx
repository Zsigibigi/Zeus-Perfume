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

// Első festés előtt: no-js → js (JavaScript nélkül így minden tartalom látszik).
const HEAD_SCRIPT = "document.documentElement.classList.replace('no-js','js')";

// Az intro első (csak CSS-es) fázisa azonnal indul, nem várja meg a React betöltését.
// Ha a JS csomag 8 mp alatt sem fut le (pl. betöltési hiba), felfedjük az oldalt.
const BODY_SCRIPT = [
  "if(!matchMedia('(prefers-reduced-motion: reduce)').matches){setTimeout(function(){if(document.body.classList.contains('intro'))document.body.classList.add('i-line')},80)}",
  "setTimeout(function(){if(!window.__zeusInit){var b=document.body.classList;b.remove('intro','i-line');b.add('is-ready')}},8000)",
].join(';');

export default function RootLayout({ children }) {
  return (
    <html lang="hu" className={`no-js ${cinzel.variable} ${cormorant.variable} ${didot.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: HEAD_SCRIPT }} />
      </head>
      <body className="intro" suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: BODY_SCRIPT }} />
        {children}
      </body>
    </html>
  );
}
