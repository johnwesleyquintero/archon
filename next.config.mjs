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
        hostname: new URL(
          `https://${process.env.NEXT_PUBLIC_APP_URL}` || "https://example.com",
        ).hostname,
      },
      {
        protocol: "https",
        hostname: new URL(
          `https://${process.env.VERCEL_URL}` || "https://example.com",
        ).hostname,
      },
      {
        protocol: "https",
        hostname: "sourcemaps.io",
      },
    ],
  },
};

import { withSentryConfig } from "@sentry/nextjs";

// Make sure adding Sentry options is the last code to run before exporting, to ensure that
// other plugins can't change the webpack config after Sentry has moved the sourcemaps.
export default withSentryConfig(nextConfig, {
  // For all available options, see:  https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (useful for debugging, but creates larger builds).
  // Set this to false when you're ready to deploy to production.
  // This option cannot be configured via the environment variable SENTRY_INCLUDE_SERVER_SCHEMAS.
  includeServerSchemas: false,

  // For all available options, see: https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Hides source maps from generated client bundles.
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size.
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Jobs. For more information see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/features/#vercel-cron-job-auto-instrumentation
  // autoInstrumentServerFunctions: true,
});
