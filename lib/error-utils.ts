// lib/error-utils.ts

/**
 * A utility function for consistent error handling across the application.
 * This can be expanded to include logging, reporting, and more sophisticated error processing.
 *
 * @param error The error object, can be an Error instance or a string.
 * @param context Optional context for the error, e.g., function name or operation.
 * @returns A standardized error message or object.
 */
export function handleError(
  error: unknown,
  context?: string,
): { message: string; details?: string } {
  let errorMessage = "An unknown error occurred.";
  let errorDetails: string | undefined;

  if (error instanceof Error) {
    errorMessage = error.message;
    errorDetails = error.stack;
  } else if (typeof error === "string") {
    errorMessage = error;
  }

  console.error(
    `[ERROR]${context ? ` (${context})` : ""}: ${errorMessage}`,
    errorDetails || error,
  );

  return {
    message: errorMessage,
    details: errorDetails,
  };
}

/**
 * A utility function specifically for handling server-side errors.
 * It can be expanded to include server-specific logging, error reporting, etc.
 *
 * @param error The error object, can be an Error instance or a string.
 * @param context Optional context for the error, e.g., function name or operation.
 * @returns A standardized error message or object.
 */
export function handleServerError(
  error: unknown,
  context?: Record<string, unknown>,
  message?: string,
): { message: string; details?: string } {
  let fullContext = "Server Error";
  if (message) {
    fullContext += `: ${message}`;
  }
  if (context) {
    fullContext += ` (Context: ${JSON.stringify(context)})`;
  }
  return handleError(error, fullContext);
}

/**
 * Custom error class for application-specific errors.
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly originalError?: unknown;

  constructor(
    message: string,
    code: string = "APP_ERROR",
    originalError?: unknown,
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.originalError = originalError;
    // Set the prototype explicitly to ensure instanceof works correctly
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
