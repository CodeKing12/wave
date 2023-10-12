/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: "build",
  output: "export",
  assetPrefix: "./",
  // basePath: "/_next",
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  }
}

module.exports = nextConfig
