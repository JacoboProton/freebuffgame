/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@duobijac/shared'],
  env: {
    // Override Clerk env vars with hardcoded values to prevent Git Bash
    // from corrupting /login → C:/Program Files/Git/login during Windows builds
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: '/login',
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: '/register',
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: '/dashboard',
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: '/dashboard',
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