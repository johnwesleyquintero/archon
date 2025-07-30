import { renderHook, act } from "@testing-library/react";
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

    (getTasks as jest.Mock).mockResolvedValue([]);
  });

  test("fetches tasks on initial render", async () => {
    const mockTasks = [
      { id: "1", title: "Task 1", is_completed: false },
      { id: "2", title: "Task 2", is_completed: true },
    ];

    (getTasks as jest.Mock).mockResolvedValue(mockTasks);

    const { result } = renderHook(() => useTasks());

    // Initial state
    expect(result.current.loading).toBe(true);
    expect(result.current.tasks).toEqual([]);

    // Wait for state update after async fetch
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // After fetch completes
    expect(result.current.loading).toBe(false);
    expect(result.current.tasks).toEqual(mockTasks);
    expect(getTasks).toHaveBeenCalledTimes(1);
  });

  // Additional tests for task operations (add, toggle, delete, update)
});
