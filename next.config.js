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
        destination: process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/:path*` : 'http://localhost:5000/api/:path*', // Use env var or fallback to localhost
      },
    ];
  },
  // Configure the source directory for the application
  // Note: appDir is enabled by default in Next.js 13+ and no longer needs to be specified
  // Tell Next.js where to find the source code
  // This is important for the build process to find the app directory
  distDir: '.next',
  // Ensure Next.js knows to look in the src directory
  swcMinify: true,
};

module.exports = nextConfig;