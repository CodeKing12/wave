/** @type {import('next').NextConfig} */
// Comment the output: export & unoptimized: true configurations to fix production build 
const nextConfig = {
  distDir: "build",
  // output: "export",
  assetPrefix: "./",
  // basePath: "/_next",
  reactStrictMode: true,
  images: {
    // unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  }
}

module.exports = nextConfig
