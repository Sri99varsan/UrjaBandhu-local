/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  trailingSlash: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.netlify.app',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    // Only apply rewrites in development for specific backend APIs
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/backend/:path*',
          destination: 'http://localhost:8000/api/:path*',
        },
        // Add other specific backend API routes here if needed
        // The /api/chat route will be handled by Next.js API routes
      ];
    }
    return [];
  },
  // External packages for server components
  serverExternalPackages: ['@supabase/supabase-js'],
};

module.exports = nextConfig;
