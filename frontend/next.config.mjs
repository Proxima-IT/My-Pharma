/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  output: 'standalone',

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
        protocol: 'http',
        hostname: '46.202.194.251',
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
