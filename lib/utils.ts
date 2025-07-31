import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Database } from "@/lib/supabase/types";
import type { Task } from "@/lib/types/task";

// Define the raw task type from the database, ensuring it's sourced from the single source of truth.
type RawTask = Database["public"]["Tables"]["tasks"]["Row"];

/**
 * Combines Tailwind CSS classes and other class values into a single string.
 * This utility function uses `clsx` for conditional class joining and `tailwind-merge`
 * for intelligently merging Tailwind classes to resolve conflicts.
 *
 * @param inputs - An array of class values (strings, objects, arrays) to be combined.
 * @returns A single string containing the merged and combined CSS classes.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts a raw task object from the database to a structured Task object.
 * This function processes the `tags` field, ensuring it is always an array of strings or null,
 * which aligns the data structure with the application's `Task` type definition.
 *
 * @param rawTask - The raw task object fetched from the Supabase database.
 * @returns A structured `Task` object with a properly formatted `tags` property.
 */
export const convertRawTaskToTask = (rawTask: RawTask): Task => {
  let processedTags: string[] | null = null;

  if (rawTask.tags !== null) {
    if (Array.isArray(rawTask.tags)) {
      // Filter out any non-string values to ensure type safety.
      processedTags = rawTask.tags.filter(
        (tag): tag is string => typeof tag === "string",
      );
    } else if (typeof rawTask.tags === "string") {
      // If it's a single string, wrap it in an array.
      processedTags = [rawTask.tags];
    }
  }

  return {
    ...rawTask,
    tags: processedTags,
  };
};

/**
 * Custom error class for structured error handling within the Archon application.
 * Extends the native `Error` class to include additional properties like a specific
 * error code, detailed information, and an optional HTTP status code.
 */
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

/**
 * Centralized utility for handling and logging errors across the Archon application.
 * It normalizes various error types into an `AppError` instance, logs them to the console,
 * and optionally captures them with Sentry in production environments.
 *
 * @param error - The error object to handle. Can be an `AppError`, a standard `Error`, or any unknown type.
 * @param context - An optional string indicating the context where the error occurred (e.g., "API", "Database", "UI").
 * @returns An `AppError` instance representing the handled error.
 */
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

  // Integrate Sentry for production error logging
  if (process.env.NODE_ENV === "production") {
    // Only capture exceptions in production to avoid noise during development
    // Sentry automatically captures unhandled exceptions, but this allows explicit capture
    // and ensures custom AppError details are sent.
    void import("@sentry/nextjs").then((Sentry) => {
      Sentry.captureException(appError, {
        extra: {
          context: context,
          details: appError.details,
          httpStatus: appError.httpStatus,
        },
      });
    });
  }

  return appError;
};

/**
 * Generates a standardized API error response.
 * This function leverages `handleError` to process the incoming error,
 * determines an appropriate HTTP status code, and formats the error
 * into a JSON response suitable for API clients.
 *
 * @param error - The error object to be included in the API response.
 * @param context - An optional string indicating the context where the API error occurred.
 * @returns A `Response` object with a JSON payload detailing the error and an appropriate HTTP status.
 */
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
