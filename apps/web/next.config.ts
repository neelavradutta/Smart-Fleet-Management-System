import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@sfms/shared"],
  agentRules: false,
};

export default nextConfig;
