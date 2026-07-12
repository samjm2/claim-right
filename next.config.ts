import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfkit + its fontkit dep can't be bundled by turbopack — load them from node_modules at runtime
  serverExternalPackages: ["pdfkit"],
};

export default nextConfig;
