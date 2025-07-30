/*
import { render, act, screen } from "@testing-library/react";
import { useDebounce } from "@/hooks/use-debounce";
import React, { useState, useEffect, useRef } from "react";

// Create a wrapper component to test the useDebounce hook
interface TestComponentProps {
  callback: jest.Mock;
  delay: number;
  onDebouncedFnReady: (fn: (...args: any[]) => void) => void;
}

const TestComponent = ({
  callback,
  delay,
  onDebouncedFnReady,
}: TestComponentProps) => {
  const debouncedFn = useDebounce(callback, delay);

  useEffect(() => {
    onDebouncedFnReady(debouncedFn);
  }, [debouncedFn, onDebouncedFnReady]);

  return null; // The component doesn't render anything visible
};

describe("useDebounce", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("should debounce the callback execution", () => {
    const mockCallback = jest.fn();
    const debouncedFunctionRef = useRef<((...args: any[]) => void) | undefined>(undefined);

    const onDebouncedFnReady = (fn: (...args: any[]) => void) => {
      debouncedFunctionRef.current = fn;
    };

    const { rerender } = render(
      <TestComponent
        callback={mockCallback}
        delay={500}
        onDebouncedFnReady={onDebouncedFnReady}
      />,
    );

    // Initial call to the debounced function
    act(() => {
      debouncedFunctionRef.current?.("initial");
    });
    expect(mockCallback).not.toHaveBeenCalled(); // Should not be called immediately

    act(() => {
      jest.advanceTimersByTime(200);
      debouncedFunctionRef.current?.("first change"); // Call again before delay
    });
    expect(mockCallback).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(499);
      expect(mockCallback).not.toHaveBeenCalled(); // Still not called
    });

    act(() => {
      jest.advanceTimersByTime(1); // Total 500ms from "first change"
    });
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith("first change"); // Only the last call should go through

    // Reset mock for next test
    mockCallback.mockClear();

    act(() => {
      debouncedFunctionRef.current?.("another change");
      jest.advanceTimersByTime(500);
    });
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith("another change");
  });

  it("should update immediately if delay is 0", () => {
    const mockCallback = jest.fn();
    const debouncedFunctionRef = useRef<((...args: any[]) => void) | undefined>(undefined);

    const onDebouncedFnReady = (fn: (...args: any[]) => void) => {
      debouncedFunctionRef.current = fn;
    };

    render(
      <TestComponent
        callback={mockCallback}
        delay={0}
        onDebouncedFnReady={onDebouncedFnReady}
      />,
    );

    act(() => {
      debouncedFunctionRef.current?.("changed");
    });
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith("changed");
  });

  it("should handle multiple rapid changes and only execute the last one", () => {
    const mockCallback = jest.fn();
    const debouncedFunctionRef = useRef<((...args: any[]) => void) | undefined>(undefined);

    const onDebouncedFnReady = (fn: (...args: any[]) => void) => {
      debouncedFunctionRef.current = fn;
    };

    render(
      <TestComponent
        callback={mockCallback}
        delay={100}
        onDebouncedFnReady={onDebouncedFnReady}
      />,
    );

    act(() => {
      debouncedFunctionRef.current?.("A");
      jest.advanceTimersByTime(50);
      debouncedFunctionRef.current?.("B");
      jest.advanceTimersByTime(50);
      debouncedFunctionRef.current?.("C");
      jest.advanceTimersByTime(50);
      debouncedFunctionRef.current?.("D");
    });

    expect(mockCallback).not.toHaveBeenCalled(); // Still not called after rapid changes

    act(() => {
      jest.advanceTimersByTime(99);
    });
    expect(mockCallback).not.toHaveBeenCalled(); // Still not called

    act(() => {
      jest.advanceTimersByTime(1); // Total 100ms from 'D'
    });
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith("D"); // Finally executes D
  });

  it("should clear timeout on unmount", () => {
    const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");
    const mockCallback = jest.fn();
    const debouncedFunctionRef = useRef<((...args: any[]) => void) | undefined>(undefined);

    const onDebouncedFnReady = (fn: (...args: any[]) => void) => {
      debouncedFunctionRef.current = fn;
    };

    const { unmount } = render(
      <TestComponent
        callback={mockCallback}
        delay={500}
        onDebouncedFnReady={onDebouncedFnReady}
      />,
    );

    act(() => {
      debouncedFunctionRef.current?.("test");
    });
    expect(clearTimeoutSpy).not.toHaveBeenCalled();

    unmount();
    expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);
  });

  it("should not re-trigger if callback reference is the same and not called", () => {
    const mockCallback = jest.fn();
    const debouncedFunctionRef = useRef<((...args: any[]) => void) | undefined>(undefined);

    const onDebouncedFnReady = (fn: (...args: any[]) => void) => {
      debouncedFunctionRef.current = fn;
    };

    const { rerender } = render(
      <TestComponent
        callback={mockCallback}
        delay={500}
        onDebouncedFnReady={onDebouncedFnReady}
      />,
    );

    act(() => {
      debouncedFunctionRef.current?.("first call");
    });
    jest.advanceTimersByTime(200);
    rerender(
      <TestComponent
        callback={mockCallback}
        delay={500}
        onDebouncedFnReady={onDebouncedFnReady}
      />,
    ); // Rerender with same props, but no new call to debounced function
    jest.advanceTimersByTime(300); // Total 500ms from first call
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith("first call");

    mockCallback.mockClear();

    act(() => {
      debouncedFunctionRef.current?.("second call");
    });
    jest.advanceTimersByTime(500);
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith("second call");
  });
});
*/
