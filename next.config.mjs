/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ["@react-pdf/renderer"]
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;