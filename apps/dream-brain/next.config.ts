import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["@dreamhub/ui", "@dreamhub/auth", "@dreamhub/database", "three"],
  outputFileTracingRoot: path.join(import.meta.dirname, "../../"),
};

export default nextConfig;
