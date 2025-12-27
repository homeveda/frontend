import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "home-veda-storage.s3.ap-south-1.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
