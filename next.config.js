/** @type {import('next').NextConfig} */
const nextConfig = {
  // The names backdrop reads data/victims.csv at runtime via a dynamic
  // process.cwd() path, which Next's file tracer can't detect on its own.
  // Force it into the serverless function bundle so the read works on Vercel.
  outputFileTracingIncludes: {
    '/**': ['./data/victims.csv'],
  },
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
