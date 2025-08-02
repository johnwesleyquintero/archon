import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN;

if (!SENTRY_DSN) {
  console.warn(
    "Sentry DSN not found. Please set SENTRY_DSN environment variable.",
  );
} else {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 1.0,
    _experiments: {
      enableLogs: true,
    },
  });
}
