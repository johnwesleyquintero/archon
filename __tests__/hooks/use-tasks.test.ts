import { renderHook, act, waitFor } from "@testing-library/react";
import { useTasks } from "@/hooks/use-tasks";
import {
  getTasks,
  addTask,
  toggleTask,
  deleteTask,
  updateTask,
} from "@/lib/database/tasks";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/ui/use-toast";

// Mock dependencies
jest.mock("@/lib/database/tasks");
jest.mock("@/contexts/auth-context");
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

describe("useTasks", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: "test-user-id" },
    });

    (useToast as jest.Mock).mockReturnValue({
      toast: jest.fn(),
    });

    (getTasks as jest.Mock).mockImplementation(() => new Promise(() => {})); // Initially pending
  });

  test("fetches tasks on initial render", async () => {
    const mockTasks = [
      { id: "1", title: "Task 1", is_completed: false },
      { id: "2", title: "Task 2", is_completed: true },
    ];

    let resolveGetTasks: (value: any) => void;
    (getTasks as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveGetTasks = resolve;
        }),
    );

    const { result } = renderHook(() => useTasks());

    // Initial state should be loading
    expect(result.current.loading).toBe(true);
    expect(result.current.tasks).toEqual([]);

    // Resolve the promise to simulate fetch completion
    await act(async () => {
      resolveGetTasks(mockTasks);
    });

    // Wait for the loading to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // After fetch completes
    expect(result.current.tasks).toEqual(mockTasks);
    expect(getTasks).toHaveBeenCalledTimes(1);
  });

  // Additional tests for task operations (add, toggle, delete, update)
});
