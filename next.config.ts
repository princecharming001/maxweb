import type { NextConfig } from "next";

const MAX_API_ORIGIN =
  process.env.MAX_API_ORIGIN ?? "https://maxapp-api.onrender.com";

const nextConfig: NextConfig = {
  images: {
    // Landing photography is hot-linked; Max app media is served from the API.
    remotePatterns: [
      { protocol: "https", hostname: "www.tryclean.ai" },
      { protocol: "https", hostname: "tryclean.ai" },
      { protocol: "https", hostname: "maxapp-api.onrender.com" },
    ],
  },
  // Same-origin proxy to the Max backend. The prod API blocks cross-origin
  // browser requests (CORS), so every call the web app makes goes through
  // /maxapi/* and Next forwards it server-side to <origin>/api/*.
  async rewrites() {
    return [
      {
        source: "/maxapi/:path*",
        destination: `${MAX_API_ORIGIN}/api/:path*`,
      },
    ];
  },
  // Chat POSTs can run up to ~120s; give the proxy headroom.
  experimental: {
    proxyTimeout: 130_000,
  },
};

export default nextConfig;
