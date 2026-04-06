/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.usecurling.com',
      },
    ],
  },
}

export default nextConfig
