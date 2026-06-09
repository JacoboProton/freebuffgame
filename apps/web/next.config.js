/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix: Tell Next.js the correct workspace root for monorepo
  outputFileTracingRoot: __dirname,
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