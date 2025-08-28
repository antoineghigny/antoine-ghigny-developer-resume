import createNextIntlPlugin from 'next-intl/plugin';

// Point to the i18n request config
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true
  },
  compiler: {
    // Needed for libraries that use styled-components internally (e.g., react-chrono)
    styledComponents: true
  },
  output: 'standalone'
};

export default withNextIntl(nextConfig);
