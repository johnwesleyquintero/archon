import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Define a custom error class for structured error handling
export class AppError extends Error {
  public readonly code: string;
  public readonly details?: Record<string, unknown>;
  public readonly httpStatus?: number;

  constructor(
    message: string,
    code: string = "GENERIC_ERROR",
    details?: Record<string, unknown>,
    httpStatus?: number,
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.details = details;
    this.httpStatus = httpStatus;
    Object.setPrototypeOf(this, AppError.prototype); // Restore prototype chain
  }
}

// Centralized error logging and handling utility
export const handleError = (
  error: unknown,
  context: string = "Application",
): AppError => {
  let appError: AppError;

  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof Error) {
    appError = new AppError(error.message, "UNEXPECTED_ERROR", {
      originalStack: error.stack,
    });
  } else {
    appError = new AppError("An unknown error occurred.", "UNKNOWN_ERROR", {
      originalError: error,
    });
  }

  console.error(
    `[${context} Error] Code: ${appError.code}, Message: ${appError.message}`,
    appError.details || "",
  );

  // In a real application, you might send this to a logging service like Sentry, Datadog, etc.
  // Example: Sentry.captureException(appError);

  return appError;
};

// Helper for API responses
export const apiErrorResponse = (
  error: unknown,
  context: string = "API",
): Response => {
  const appError = handleError(error, context);
  const status = appError.httpStatus || 500;
  return new Response(
    JSON.stringify({
      error: appError.message,
      code: appError.code,
      details: appError.details,
    }),
    { status, headers: { "Content-Type": "application/json" } },
  );
};
