/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "**.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "**.v0.dev",
      },
      {
        protocol: "https",
        hostname: new URL(process.env.NEXT_PUBLIC_APP_URL || "").hostname,
      },
      {
        protocol: "https",
        hostname: new URL(process.env.VERCEL_URL || "").hostname,
      },
    ],
  },
};

import { withSentryConfig } from "@sentry/nextjs";

// Make sure adding Sentry options is the last code to run before exporting, to ensure that
// other plugins can't change the webpack config after Sentry has moved the sourcemaps.
export default nextConfig;