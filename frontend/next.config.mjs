/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      // Proxy /media/* to Django so profile pictures and other media load from same origin
      { source: '/media/:path*', destination: 'http://localhost:8000/media/:path*' },
    ];
  },
};

export default nextConfig;
