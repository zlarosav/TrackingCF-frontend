/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para GitHub Pages con SPA mode
  ...(process.env.BUILD_STATIC === 'true' && {
    output: 'export',
    basePath: '/TrackingCF',
    assetPrefix: '/TrackingCF/',
    trailingSlash: true,
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
