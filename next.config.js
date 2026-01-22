/** @type {import('next').NextConfig} */
const nextConfig = {
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
