import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/wp-content/:path*",
        destination: "https://www.mimcocapital.com/wp-content/:path*",
      },
      {
        source: "/wp-includes/:path*",
        destination: "https://www.mimcocapital.com/wp-includes/:path*",
      },
    ];
  },
};

export default nextConfig;
