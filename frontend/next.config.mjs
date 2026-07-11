/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,


  experimental: {
    memoryBasedWorkersCount: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    loader: 'custom',
    loaderFile: './src/app/(shared)/lib/imageLoader.js',

    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'bluepillc.com',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: 'bluepillc.com',
        pathname: '/media/**',
      },
    ],
  },
};

export default nextConfig;
