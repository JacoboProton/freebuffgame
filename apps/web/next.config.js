/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@duobijac/shared'],
  async rewrites() {
    return [
      {
        source: '/api/admin-auth/:path*',
        destination: 'http://localhost:3001/api/admin-auth/:path*',
      },
    ];
  },
};

module.exports = nextConfig;