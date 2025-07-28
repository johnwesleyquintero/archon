import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export const dynamic = "force-dynamic";

class SentryExampleAPIError extends Error {
  constructor(message: string | undefined) {
    super(message);
    this.name = "SentryExampleAPIError";
  }
}

// A faulty API route to test Sentry's error monitoring
export function GET() {
  try {
    throw new SentryExampleAPIError(
      "This error is raised on the backend called by the example page.",
    );
    return NextResponse.json({ data: "Testing Sentry Error..." });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
