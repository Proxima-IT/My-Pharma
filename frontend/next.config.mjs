/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  output: 'standalone',
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
  // /media/* is proxied by src/app/media/[[...path]]/route.js so BACKEND_URL_INTERNAL
  // works at runtime in Docker. Do not add a rewrite here (it would be baked at build time).
};

export default nextConfig;
