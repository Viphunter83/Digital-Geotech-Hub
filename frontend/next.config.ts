import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8055",
        pathname: "/assets/**",
      },
      {
        protocol: "https",
        hostname: "terra-expert.ru",
        pathname: "/directus/assets/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/directus/:path*",
        destination: "http://geotech_cms:8055/:path*",
      },
    ];
  },
};

export default nextConfig;
