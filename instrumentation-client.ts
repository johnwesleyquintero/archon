import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (!SENTRY_DSN) {
  console.warn(
    "Sentry DSN not found. Please set NEXT_PUBLIC_SENTRY_DSN environment variable.",
  );
} else {
  Sentry.init({
    dsn: SENTRY_DSN,
    // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
    tracesSampleRate: 1.0,
    // Define how likely Replay events are sampled.
    replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,
    // Define how likely Replay events are sampled when an error occurs.
    replaysOnErrorSampleRate: process.env.NODE_ENV === "production" ? 1.0 : 0,

    integrations: [
      // Replay integration is only enabled in production
      ...(process.env.NODE_ENV === "production"
        ? [
            Sentry.replayIntegration({
              maskAllText: true,
              blockAllMedia: true,
            }),
          ]
        : []),
      ...(process.env.NODE_ENV === "development"
        ? []
        : [
            Sentry.consoleLoggingIntegration({
              levels: ["log", "error", "warn"],
            }),
            Sentry.browserTracingIntegration(),
          ]),
    ],

    // Enable logs to be sent to Sentry
    _experiments: {
      enableLogs: true,
    },

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
