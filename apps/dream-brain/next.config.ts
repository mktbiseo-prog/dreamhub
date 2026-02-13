import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["@dreamhub/ui", "@dreamhub/auth", "@dreamhub/database", "3d-force-graph", "three"],
  outputFileTracingRoot: path.join(import.meta.dirname, "../../"),
};

export default nextConfig;
