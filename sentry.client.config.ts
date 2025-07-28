// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a client-side browser context is used.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: process.env.NODE_ENV === "development", // Enable debug in development
  // Adjust this value in production, or use tracesSampler for greater control
  // For an overview of all available options, see https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/

  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then to a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when an error occurs.
});
