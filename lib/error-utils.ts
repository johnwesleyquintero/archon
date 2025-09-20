export function withErrorHandling<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
): (...args: TArgs) => Promise<TReturn | { error: string }> {
  return async (...args: TArgs) => {
    try {
      const result = await fn(...args);
      return result;
    } catch (e: unknown) {
      console.error("Error in async operation:", e);
      if (e instanceof Error) {
        return { error: e.message };
      }
      return { error: "An unknown error occurred." };
    }
  };
}

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean; // Indicates if it's an error we expect and can handle gracefully

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function handleServerError(error: unknown, context: string) {
  console.error(`[SERVER ERROR] ${context}:`, error); // Log full error details

  // For production, return a generic message to the client
  if (process.env.NODE_ENV === "production") {
    return new AppError("An unexpected error occurred.", 500, false);
  }

  // For development, return more detailed error
  if (error instanceof AppError) {
    return error;
  }
  if (error instanceof Error) {
    return new AppError(error.message, 500, false);
  }
  return new AppError("An unknown error occurred.", 500, false);
}
