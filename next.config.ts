import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["lh3.googleusercontent.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "my-store-id.public.blob.vercel-storage.com",
        pathname: "/**",
      },
    ],
  },

};

export default nextConfig;
