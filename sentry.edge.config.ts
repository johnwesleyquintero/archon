// This file configures the initialization of Sentry on the Edge runtime.
// The config you add here will be used whenever an Edge runtime is used (e.g. middlewares)
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: process.env.NODE_ENV === "development", // Enable debug in development
  // Adjust this value in production, or use tracesSampler for greater control
  // For an overview of all available options, see https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/
});
