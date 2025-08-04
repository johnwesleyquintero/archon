import * as Sentry from "@sentry/nextjs";

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unknown error occurred.";
}

export function handleServerError(
  error: unknown,
  context: Record<string, unknown> = {},
  message: string = "An unexpected server error occurred.",
) {
  const errorMessage = getErrorMessage(error);
  const fullMessage = `${message} Details: ${errorMessage}`;

  Sentry.logger.error(fullMessage, {
    ...context,
    error: errorMessage,
    stack: error instanceof Error ? error.stack : undefined,
  });
  Sentry.captureException(error, {
    extra: context,
  });

  // In a production environment, you might want to return a generic error message
  // to the client to avoid exposing sensitive details.
  // For now, we'll return the detailed message for debugging.
  return { success: false, message: fullMessage };
}
