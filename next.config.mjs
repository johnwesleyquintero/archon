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
    ],
  },
};

import { withSentryConfig } from "@sentry/nextjs";

const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Suppresses source map uploading logs during build time.
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
};

// Make sure adding Sentry options is the last code to run before exporting, to ensure that
// other plugins can't change the webpack config after Sentry has moved the sourcemaps.
export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
