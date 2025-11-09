import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Disable ESLint during production builds (run separately)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable type checking during production builds (run separately)
    ignoreBuildErrors: true,
  },
  // Ensure markdown files are included in serverless functions
  outputFileTracingIncludes: {
    '/[locale]/docs': ['./docs/**/*'],
    '/[locale]/docs/*': ['./docs/**/*'],
    '/[locale]/docs/**': ['./docs/**/*'],
  },
  webpack: (config) => {
    // This ensures markdown files are included in the build
    config.module.rules.push({
      test: /\.md$/,
      type: 'asset/source',
    });
    return config;
  },
};

export default withNextIntl(nextConfig);
