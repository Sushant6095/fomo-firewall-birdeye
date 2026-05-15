/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@fomo/ui",
    "@fomo/shared",
    "@fomo/scoring",
    "@fomo/birdeye",
    "@fomo/db"
  ],
  experimental: {
    optimizePackageImports: ["lucide-react"]
  }
};

export default nextConfig;
