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
      {
        source: "/scraped-preview/wp-content/themes/mimco/resources/assets/images/image.png",
        destination: "/wp-content/themes/mimco/resources/assets/images/interactive-image-background.png",
      },
      {
        source: "/wp-content/themes/mimco/resources/assets/images/image.png",
        destination: "/wp-content/themes/mimco/resources/assets/images/interactive-image-background.png",
      },
      { source: "/career", destination: "/en/career" },
      { source: "/job-offers", destination: "/en/job-offers" },
      { source: "/job-offers/:slug", destination: "/en/job-offers/:slug" },
      { source: "/news", destination: "/en/news" },
      { source: "/news/:slug", destination: "/en/news/:slug" },
    ];
  },
};

export default nextConfig;
