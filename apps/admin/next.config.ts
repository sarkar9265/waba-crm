import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["@algo-matrix/ui", "@algo-matrix/shared"],
  turbopack: {
    root: path.join(__dirname, "../.."),
  },
};

export default nextConfig;
