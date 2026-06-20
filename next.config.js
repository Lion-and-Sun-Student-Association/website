/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Admins paste arbitrary poster/image URLs, so allow any https host.
    // (next/image still optimizes them; only https is permitted.)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
