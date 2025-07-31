import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (!SENTRY_DSN) {
  console.warn(
    "Sentry DSN not found. Please set NEXT_PUBLIC_SENTRY_DSN environment variable.",
  );
} else {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 1.0,
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
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
    ],
  });
}
