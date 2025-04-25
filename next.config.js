/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/a/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**',
      },
    ],
  },
  // Ensure files can be served from public directory
  async rewrites() {
    return [
      {
        source: '/files/:path*',
        destination: '/files/:path*',
      },
    ];
  },
};

module.exports = nextConfig;