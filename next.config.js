/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: "build",
  // basePath: "/_next",
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  }
}

module.exports = nextConfig
