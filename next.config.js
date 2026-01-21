/** @type {import('next').NextConfig} */
const nextConfig = {
  // Solo usar export estático en build de producción para GitHub Pages
  ...(process.env.BUILD_STATIC === 'true' && {
    output: 'export',
    basePath: '/TrackingCF',
    assetPrefix: '/TrackingCF/',
  }),
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'userpic.codeforces.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'userpic.codeforces.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig
