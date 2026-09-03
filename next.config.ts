import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/lumora", destination: "/", permanent: false }];
  },
  async rewrites() {
    return {
      beforeFiles: [{ source: "/", destination: "/lumora.html" }],
    };
  },
};

export default nextConfig;
