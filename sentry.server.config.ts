import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN;

if (!SENTRY_DSN) {
  console.warn(
    "Sentry DSN not found. Please set SENTRY_DSN environment variable.",
  );
  // If SENTRY_DSN is not set, do not initialize Sentry
} else {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0.1,
    integrations: [],
    // Disable automatic instrumentation of fetch and console

    _experiments: {
      enableWebVitals: false,
      enablePerformanceMonitoring: false,
      enableConsole: false,
      enableFetch: false,
      enableXHR: false,
      enableHistory: false,
      enablePushState: false,
      enablePopState: false,
      enableClick: false,
      enableKeypress: false,
      enableError: false,
      enableUnhandledRejection: false,
    },
  });
}
