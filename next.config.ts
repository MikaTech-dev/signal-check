import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },

  // Proxy /api/backend/* -> Express server
  // The backend URL is read from server-side env (no NEXT_PUBLIC_ prefix)
  // and is never sent to the browser.
  async rewrites() {
    const backendUrl = process.env.API_URL ?? 'http://localhost:3233';
    return [
      {
        source: '/api/backend/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
