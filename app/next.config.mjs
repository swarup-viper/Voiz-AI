/** @type {import('next').NextConfig} */

// Origin of the Feedback-to-Opportunity-Map backend (server-side only).
const BACKEND_URL = (process.env.BACKEND_URL || 'http://localhost:3000').replace(/\/+$/, '');

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Analyzing up to 200 items through Claude can take longer than the 30s proxy default.
    proxyTimeout: 120_000,
  },
  async rewrites() {
    return [
      {
        source: '/backend-api/:path*',
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
