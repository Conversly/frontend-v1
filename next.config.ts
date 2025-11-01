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
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "https://terminal.apps.shashankkk.site/api/v1/:path*",
      },
    ];
  },

};

export default nextConfig;
