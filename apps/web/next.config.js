/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@duobijac/shared'],
  async rewrites() {
    const isProduction = process.env.NODE_ENV === 'production';
    const apiUrl = isProduction 
      ? process.env.NEXT_PUBLIC_API_URL || 'https://freebuffgame-api.onrender.com/api'
      : 'http://localhost:3001/api';
    
    return [
      {
        source: '/api/admin-auth/:path*',
        destination: `${apiUrl}/admin-auth/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;