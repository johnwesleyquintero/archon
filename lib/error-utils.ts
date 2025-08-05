export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
): (
  ...args: Parameters<T>
) => Promise<Awaited<ReturnType<T>> | { error: string }> {
  return async (...args: Parameters<T>) => {
    try {
      const result = await fn(...args);
      return result;
    } catch (e: any) {
      console.error("Error in async operation:", e);
      // In a real app, you'd log this to a service like Sentry
      // and potentially show a toast on the client-side if this is a client-callable function.
      return { error: e.message || "An unknown error occurred." };
    }
  };
}
