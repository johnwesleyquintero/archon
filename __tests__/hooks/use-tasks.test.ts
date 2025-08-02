import { renderHook, act, waitFor } from "@testing-library/react";
import { useTasks } from "@/hooks/use-tasks";
import { getTasks } from "@/lib/database/tasks";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/ui/use-toast";

// Mock server actions
jest.mock("@/lib/database/tasks");

// Mock Supabase client
jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(() => ({
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
    })),
    removeChannel: jest.fn(),
  })),
}));

// Mock useAuth hook
jest.mock("@/contexts/auth-context", () => ({
  useAuth: jest.fn(() => ({
    user: { id: "user-123" },
  })),
}));

// Mock useToast hook
const mockToast = jest.fn();
jest.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

describe("useTasks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers(); // Use fake timers for explicit control
    mockToast.mockClear();
    (useAuth as jest.Mock).mockReturnValue({ user: { id: "user-123" } });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers(); // Ensure all timers are cleared
    jest.useRealTimers(); // Restore real timers
  });

  it("fetches tasks on initial render", async () => {
    const mockTasks = [
      { id: "1", title: "Task 1", is_completed: false, tags: [] },
      { id: "2", title: "Task 2", is_completed: true, tags: [] },
    ];

    let resolveGetTasks: (value: any) => void;
    (getTasks as jest.Mock).mockImplementation(
      () => new Promise((resolve) => (resolveGetTasks = resolve)),
    );

    const { result } = renderHook(() => useTasks());

    expect(result.current.loading).toBe(true);
    expect(result.current.tasks).toEqual([]);

    // Resolve the promise to simulate fetch completion
    await act(async () => {
      resolveGetTasks(mockTasks);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.tasks).toEqual(mockTasks);
      expect(getTasks).toHaveBeenCalledTimes(1);
    });
  });
});
