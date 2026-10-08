// Statikus export, hogy GitHub Pages-en is fusson.
// A GitHub Actions a NEXT_PUBLIC_BASE_PATH-ban adja át az alútvonalat (pl. /Zeus-Perfume),
// helyben (npm run dev) üres marad.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
