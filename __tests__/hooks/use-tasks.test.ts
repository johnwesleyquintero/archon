import { renderHook, act, waitFor } from "@testing-library/react";
import { useTasks } from "@/hooks/use-tasks";
import { getTasks } from "@/lib/database/tasks";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/ui/use-toast";

// Mock dependencies
jest.mock("@/lib/database/tasks");
jest.mock("@/components/ui/use-toast");
jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(() => ({
    channel: jest.fn(() => ({
      on: jest.fn(() => ({
        subscribe: jest.fn(),
      })),
      subscribe: jest.fn(),
    })),
    removeChannel: jest.fn(),
  })),
}));

// Mock useAuth at the top level to ensure user is available from the start
jest.mock("@/contexts/auth-context", () => ({
  useAuth: jest.fn(() => ({ user: { id: "test-user-id" } })),
}));

describe("useTasks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers(); // Use fake timers for explicit control
    (useToast as jest.Mock).mockReturnValue({
      toast: jest.fn(),
    });
    (getTasks as jest.Mock).mockResolvedValue([]);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers(); // Ensure all timers are cleared
    jest.useRealTimers(); // Restore real timers
  });

  test("fetches tasks on initial render", async () => {
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

    // Wait for the hook to update
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.tasks).toEqual(mockTasks);
    });

    expect(getTasks).toHaveBeenCalledTimes(1);
  });
});
