/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep Prisma out of the server bundle so its query engine resolves at
  // runtime from node_modules. Otherwise Turbopack inlines the client into the
  // server chunks and the engine lookup fails on Vercel ("could not locate the
  // Query Engine for runtime rhel-openssl-3.0.x").
  serverExternalPackages: ['@prisma/client', '.prisma/client'],
  // data/victims.csv is read at runtime via a dynamic process.cwd() path that
  // Next's tracer can't detect, so force it into the function bundle.
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
