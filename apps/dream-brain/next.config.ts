import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["@dreamhub/ui", "@dreamhub/design-system", "@dreamhub/auth", "@dreamhub/database", "@dreamhub/shared-types", "@dreamhub/event-bus", "three"],
  outputFileTracingRoot: path.join(import.meta.dirname, "../../"),
};

export default nextConfig;
