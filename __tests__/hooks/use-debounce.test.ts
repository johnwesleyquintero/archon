import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "@/hooks/use-debounce";

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
    const { result } = renderHook(() => useDebounce(mockCallback, 500));

    // Initial call to the debounced function
    act(() => {
      result.current("initial");
    });
    expect(mockCallback).not.toHaveBeenCalled(); // Should not be called immediately

    act(() => {
      jest.advanceTimersByTime(200);
      result.current("first change"); // Call again before delay
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
  });

  it("should update immediately if delay is 0", () => {
    const mockCallback = jest.fn();
    const { result } = renderHook(() => useDebounce(mockCallback, 0));

    act(() => {
      result.current("changed");
      // Even with delay=0, the callback is still scheduled with setTimeout
      // so we need to advance timers to trigger it
      jest.advanceTimersByTime(0);
    });
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith("changed");
  });

  it("should handle multiple rapid changes and only execute the last one", () => {
    const mockCallback = jest.fn();
    const { result } = renderHook(() => useDebounce(mockCallback, 100));

    act(() => {
      result.current("A");
      jest.advanceTimersByTime(50);
      result.current("B");
      jest.advanceTimersByTime(50);
      result.current("C");
      jest.advanceTimersByTime(50);
      result.current("D");
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
    const { result, unmount } = renderHook(() =>
      useDebounce(mockCallback, 500),
    );

    act(() => {
      result.current("test");
    });
    expect(clearTimeoutSpy).not.toHaveBeenCalled();

    unmount();
    expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);
  });
});
