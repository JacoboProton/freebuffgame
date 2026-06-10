/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable trailing slash handling
  trailingSlash: false,
  // Increase static page generation timeout (default is 60s)
  staticPageGenerationTimeout: 120,
  // Generate a consistent build ID to avoid cache issues
  generateBuildId: () => `build-${Date.now()}`,
  // Turbopack config (Next.js 16 uses Turbopack by default)
  turbopack: {},
  async rewrites() {
    return [
      {
        source: '/api/admin-auth/:path*',
        destination: 'https://freebuffgame-api.onrender.com/api/admin-auth/:path*',
      },
    ];
  },
};

export default nextConfig;
