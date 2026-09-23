import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/en", destination: "/", permanent: true },
      { source: "/en/:path*", destination: "/:path*", permanent: true },
    ];
  },
  async rewrites() {
    return [
      { source: "/career", destination: "/en/career" },
      { source: "/job-offers", destination: "/en/job-offers" },
      { source: "/job-offers/:slug", destination: "/en/job-offers/:slug" },
      { source: "/news", destination: "/en/news" },
      { source: "/news/:slug", destination: "/en/news/:slug" },
    ];
  },
};

export default nextConfig;
