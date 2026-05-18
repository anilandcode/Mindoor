import type { NextConfig } from "next";

// Server-side env vars — set these in Vercel dashboard
// BACKEND_URL      = your Fly.io/Railway FastAPI URL (e.g. https://mindoor-api.fly.dev)
// LOBSTER_TRAP_URL = your Fly.io/Railway Lobster Trap URL (same host, port 8080 or separate)
const BACKEND_URL      = process.env.BACKEND_URL      || "http://localhost:8000";
const LOBSTER_TRAP_URL = process.env.LOBSTER_TRAP_URL || "http://localhost:8080";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // /api/* → FastAPI directly (events, audit export, log-event — management plane)
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
      // /proxy/* → Veea Lobster Trap (chat goes through security inspection layer)
      {
        source: "/proxy/:path*",
        destination: `${LOBSTER_TRAP_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
