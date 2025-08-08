import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Database } from "@/lib/supabase/types";
import type { Task } from "@/lib/types/task";

// Define the raw task type from the database, ensuring it's sourced from the single source of truth.
type RawTask = Database["public"]["Tables"]["tasks"]["Row"] & {
  status: Database["public"]["Enums"]["task_status"] | null;
  notes?: string | null;
  sort_order?: number | null;
};

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

  const processedStatus: Task["status"] =
    rawTask.status === "todo" ||
    rawTask.status === "in_progress" || // Corrected typo
    rawTask.status === "done" ||
    rawTask.status === "canceled" // Added canceled status
      ? rawTask.status
      : "todo"; // Default to 'todo' if status is null or invalid

  return {
    ...rawTask,
    tags: processedTags,
    status: processedStatus,
    parent_id: (rawTask as { parent_id?: string | null }).parent_id ?? null,
    recurrence_pattern:
      (rawTask as { recurrence_pattern?: string | null }).recurrence_pattern ??
      null,
    recurrence_end_date:
      (rawTask as { recurrence_end_date?: string | null })
        .recurrence_end_date ?? null,
    original_task_id:
      (rawTask as { original_task_id?: string | null }).original_task_id ??
      null,
    shared_with_user_ids:
      (rawTask as { shared_with_user_ids?: string[] | null })
        .shared_with_user_ids ?? null,
    notes: rawTask.notes ?? null,
    sort_order: rawTask.sort_order ?? null,
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

export const handleError = (
  error: unknown,
  context: string = "Application",
  messagePrefix: string = "An unexpected error occurred.",
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

  const fullMessage = `${messagePrefix} Details: ${appError.message}`;
  console.error(
    `[${context} Error] Code: ${appError.code}, Message: ${fullMessage}`,
    appError.details || "",
  );

  if (process.env.NODE_ENV === "production") {
    Sentry.captureException(appError, {
      extra: {
        context: context,
        details: appError.details,
        httpStatus: appError.httpStatus,
      },
    });
  }

  return appError;
};

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

export const withErrorHandling = <Args extends unknown[], Return>(
  actionFn: (...args: Args) => Promise<Return>,
  context: string,
) => {
  return async (...args: Args): Promise<Return> => {
    try {
      return await actionFn(...args);
    } catch (error: unknown) {
      const appError = handleError(error, context);
      throw new Error(
        `Failed to ${context.toLowerCase()}: ${appError.message}`,
      );
    }
  };
};
