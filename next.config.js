/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  // Remove rewrites for Vercel compatibility
  // API calls will use NEXT_PUBLIC_API_URL directly
};

module.exports = nextConfig;
