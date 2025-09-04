import { renderHook, act, waitFor } from "@testing-library/react";

import { useAuth } from "@/contexts/auth-context";
import { useTasks } from "@/hooks/use-tasks";
import { getTasks } from "@/lib/database/tasks";
import { Task, TaskPriority } from "@/lib/types/task";
// Removed unused import: import { createClient } from "@/lib/supabase/client";

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
    toasts: [], // Add toasts property
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
    const mockTasks: Task[] = [
      {
        id: "1",
        title: "Task 1",
        is_completed: false,
        tags: [],
        category: null,
        created_at: new Date().toISOString(),
        description: null,
        due_date: null,
        goal_id: null,
        parent_id: null,
        priority: TaskPriority.Medium,
        progress: 0,
        status: "todo",
        updated_at: new Date().toISOString(),
        user_id: "user-123",
        position: 0,
        sort_order: 0,
      },
      {
        id: "2",
        title: "Task 2",
        is_completed: true,
        tags: [],
        category: null,
        created_at: new Date().toISOString(),
        description: null,
        due_date: null,
        goal_id: null,
        parent_id: null,
        priority: TaskPriority.Medium,
        progress: 100,
        status: "done",
        updated_at: new Date().toISOString(),
        user_id: "user-123",
        position: 0,
        sort_order: 0,
      },
    ];

    let resolveGetTasks: (_value: Task[]) => void;
    (getTasks as jest.Mock).mockImplementation(
      () => new Promise<Task[]>((resolve) => (resolveGetTasks = resolve)),
    );

    const { result } = renderHook(() => useTasks());

    // Advance timers by 0 to allow useEffect to run
    jest.advanceTimersByTime(0);

    expect(result.current.loading).toBe(true);
    expect(result.current.tasks).toEqual([]);

    // Resolve the promise to simulate fetch completion
    act(() => {
      resolveGetTasks(mockTasks);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.tasks).toEqual(mockTasks);
      expect(getTasks).toHaveBeenCalledTimes(1);
    });
  });
});
