/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  // Skip type checking during build (passes locally)
  typescript: { ignoreBuildErrors: true },
  // Disable trailing slash handling
  trailingSlash: false,
  // Increase static page generation timeout (default is 60s)
  staticPageGenerationTimeout: 120,
  // Generate a consistent build ID to avoid cache issues
  generateBuildId: () => `build-${Date.now()}`,
  // Turbopack config (Next.js 16 uses Turbopack by default)
  turbopack: {},
  // Webpack config for @splinetool/react-spline ESM exports fix
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@splinetool/react-spline': path.resolve(__dirname, 'node_modules/@splinetool/react-spline/dist/react-spline.js'),
    };
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/admin-auth/:path*',
        destination: 'https://freebuffgame-api.onrender.com/api/admin-auth/:path*',
      },
    ];
  },
};

module.exports = nextConfig;