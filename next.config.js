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
        destination: 'http://localhost:5000/api/:path*', // Proxy to your local backend for `next dev`
      },
    ];
  },
};

module.exports = nextConfig;