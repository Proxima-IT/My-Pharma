/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  images: {
    // This tells Next.js to use our custom function for EVERY <Image /> component
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
    ],
  },
  async rewrites() {
    const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://46.202.194.251:8000';
    return [
      {
        source: '/media/:path*',
        destination: `${backendBase}/media/:path*`,
      },
    ];
  },
};

export default nextConfig;
