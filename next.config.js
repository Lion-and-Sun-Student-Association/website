/** @type {import('next').NextConfig} */
const nextConfig = {
  // Force files into the serverless function bundle that Next's tracer can't
  // detect on its own:
  //  - data/victims.csv is read at runtime via a dynamic process.cwd() path.
  //  - the Prisma query engine (.so.node) lives in the custom generated/prisma
  //    output dir; without this it isn't copied and queries throw
  //    "could not locate the Query Engine for runtime rhel-openssl-3.0.x".
  outputFileTracingIncludes: {
    '/**': ['./data/victims.csv', './generated/prisma/**/*'],
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
