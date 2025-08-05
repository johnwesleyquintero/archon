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
