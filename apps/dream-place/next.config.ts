import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["@dreamhub/ui", "@dreamhub/design-system", "@dreamhub/auth", "@dreamhub/database", "@dreamhub/shared-types", "@dreamhub/event-bus", "@dreamhub/trust-engine"],
  serverExternalPackages: ["@prisma/client", "prisma", "bcryptjs"],
  outputFileTracingRoot: path.join(import.meta.dirname, "../../"),
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 768, 1024, 1280, 1536],
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "**.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "react-globe.gl"],
  },
};

export default nextConfig;
