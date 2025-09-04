"use client";

import { useState, useEffect, useCallback } from "react";

interface UseDataStateOptions<T> {
  fetcher: () => Promise<T>;
  initialData?: T | null;
  dependencies?: React.DependencyList;
  skip?: boolean; // Optional: to skip fetching initially
}

interface UseDataStateResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDataState<T>({
  fetcher,
  initialData = null,
  dependencies = [],
  skip = false,
}: UseDataStateOptions<T>): UseDataStateResult<T> {
  const [data, setData] = useState<T | null>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(!skip);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (skip) return;

    setIsLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred.",
      );
      setData(null); // Clear data on error
    } finally {
      setIsLoading(false);
    }
  }, [fetcher, skip, ...dependencies]); // Include dependencies for refetch to react to changes

  useEffect(() => {
    fetchData().catch((err) => {
      // Handle potential errors from fetchData if not caught internally
      console.error("Error in useEffect fetchData:", err);
    });
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
