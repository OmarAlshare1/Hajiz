/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'hajiz.co.uk', 'www.hajiz.co.uk'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'hajiz-backend-kscmjmdcm-omars-projects-ce6be162.vercel.app*', // Proxy to your local backend for `next dev`
      },
    ];
  },
};

module.exports = nextConfig;