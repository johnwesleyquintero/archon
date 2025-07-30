import { renderHook, act, waitFor } from "@testing-library/react";
import { useGoals } from "@/hooks/use-goals";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Mock Supabase client
jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            data: [],
            error: null,
          })),
        })),
        order: jest.fn(() => ({
          data: [],
          error: null,
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: {
              id: "new-goal-id",
              title: "New Goal",
              description: null,
              target_date: null,
              status: "pending",
              attachments: [],
            },
            error: null,
          })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: {
                id: "goal-1",
                title: "Updated Goal",
                description: "Updated",
                target_date: null,
                status: "completed",
                attachments: [],
              },
              error: null,
            })),
          })),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          data: {},
          error: null,
        })),
      })),
    })),
  })),
}));

// Mock useToast hook
jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(),
}));

const mockGoals = [
  {
    id: "goal-1",
    title: "Goal 1",
    description: "Desc 1",
    target_date: "2025-12-31",
    status: "pending",
    attachments: [],
  },
  {
    id: "goal-2",
    title: "Goal 2",
    description: "Desc 2",
    target_date: "2025-11-30",
    status: "in_progress",
    attachments: [],
  },
];

describe("useGoals", () => {
  let toast: jest.Mock;
  let mockSupabaseFrom: jest.Mock;

  beforeEach(() => {
    const mockToast = jest.fn();
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    toast = mockToast; // Assign the mock toast function to the variable
    toast.mockClear();

    mockSupabaseFrom = (createClient as jest.Mock)().from;
    mockSupabaseFrom.mockClear();

    mockSupabaseFrom = (createClient as jest.Mock)().from;
    mockSupabaseFrom.mockClear();
  });

  it("fetches goals successfully", async () => {
    mockSupabaseFrom.mockReturnValue({
      select: () => ({
        order: () => ({
          data: mockGoals,
          error: null,
        }),
      }),
    });

    const { result } = renderHook(() => useGoals());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.goals).toEqual(mockGoals);
    expect(result.current.error).toBeNull();
  });

  it("handles fetch goals error", async () => {
    const fetchError = new Error("Failed to fetch goals");
    mockSupabaseFrom.mockReturnValue({
      select: () => ({
        order: () => ({
          data: null,
          error: fetchError,
        }),
      }),
    });

    const { result } = renderHook(() => useGoals());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.goals).toEqual([]);
    expect(result.current.error).toEqual(fetchError);
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Error fetching goals",
        description: fetchError.message,
        variant: "destructive",
      }),
    );
  });

  it("adds a new goal successfully", async () => {
    const newGoalData = {
      title: "New Goal",
      description: "New Desc",
      target_date: "2026-01-01",
      status: "pending",
      attachments: [],
    };
    const returnedGoal = { id: "new-goal-id", ...newGoalData };

    mockSupabaseFrom.mockReturnValue({
      insert: () => ({
        select: () => ({
          single: () => ({
            data: returnedGoal,
            error: null,
          }),
        }),
      }),
      select: () => ({
        order: () => ({
          data: [...mockGoals, returnedGoal], // Simulate refetch after insert
          error: null,
        }),
      }),
    });

    const { result } = renderHook(() => useGoals());
    await waitFor(() => expect(result.current.isLoading).toBe(false)); // Wait for initial fetch

    await act(async () => {
      await result.current.addGoal(newGoalData);
    });

    expect(mockSupabaseFrom().insert).toHaveBeenCalledWith(newGoalData);
    expect(result.current.goals).toEqual([...mockGoals, returnedGoal]);
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Goal added successfully!",
      }),
    );
  });

  it("handles add goal error", async () => {
    const addError = new Error("Failed to add goal");
    mockSupabaseFrom.mockReturnValue({
      insert: () => ({
        select: () => ({
          single: () => ({
            data: null,
            error: addError,
          }),
        }),
      }),
      select: () => ({
        order: () => ({
          data: mockGoals, // Simulate no change after failed insert
          error: null,
        }),
      }),
    });

    const { result } = renderHook(() => useGoals());
    await waitFor(() => expect(result.current.isLoading).toBe(false)); // Wait for initial fetch

    await act(async () => {
      await result.current.addGoal({
        title: "Bad Goal",
        description: "",
        target_date: "",
        status: "pending",
        attachments: [],
      });
    });

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Error adding goal",
        description: addError.message,
        variant: "destructive",
      }),
    );
    expect(result.current.goals).toEqual(mockGoals); // Goals should not change
  });

  it("updates an existing goal successfully", async () => {
    const updatedGoalData = { title: "Updated Goal", status: "completed" };
    const updatedGoal = { ...mockGoals[0], ...updatedGoalData };

    mockSupabaseFrom.mockReturnValue({
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => ({
              data: updatedGoal,
              error: null,
            }),
          }),
        }),
      }),
      select: () => ({
        order: () => ({
          data: [updatedGoal, mockGoals[1]], // Simulate refetch after update
          error: null,
        }),
      }),
    });

    const { result } = renderHook(() => useGoals());
    await waitFor(() => expect(result.current.isLoading).toBe(false)); // Wait for initial fetch

    await act(async () => {
      await result.current.updateGoal("goal-1", updatedGoalData);
    });

    expect(mockSupabaseFrom().update).toHaveBeenCalledWith(updatedGoalData);
    expect(mockSupabaseFrom().update().eq).toHaveBeenCalledWith("id", "goal-1");
    expect(result.current.goals).toEqual([updatedGoal, mockGoals[1]]);
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Goal updated successfully!",
      }),
    );
  });

  it("handles update goal error", async () => {
    const updateError = new Error("Failed to update goal");
    mockSupabaseFrom.mockReturnValue({
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => ({
              data: null,
              error: updateError,
            }),
          }),
        }),
      }),
      select: () => ({
        order: () => ({
          data: mockGoals, // Simulate no change after failed update
          error: null,
        }),
      }),
    });

    const { result } = renderHook(() => useGoals());
    await waitFor(() => expect(result.current.isLoading).toBe(false)); // Wait for initial fetch

    await act(async () => {
      await result.current.updateGoal("goal-1", { title: "Invalid Update" });
    });

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Error updating goal",
        description: updateError.message,
        variant: "destructive",
      }),
    );
    expect(result.current.goals).toEqual(mockGoals); // Goals should not change
  });

  it("deletes a goal successfully", async () => {
    mockSupabaseFrom.mockReturnValue({
      delete: () => ({
        eq: () => ({
          data: {},
          error: null,
        }),
      }),
      select: () => ({
        order: () => ({
          data: [mockGoals[1]], // Simulate refetch after delete
          error: null,
        }),
      }),
    });

    const { result } = renderHook(() => useGoals());
    await waitFor(() => expect(result.current.isLoading).toBe(false)); // Wait for initial fetch

    await act(async () => {
      await result.current.deleteGoal("goal-1");
    });

    expect(mockSupabaseFrom().delete).toHaveBeenCalled();
    expect(mockSupabaseFrom().delete().eq).toHaveBeenCalledWith("id", "goal-1");
    expect(result.current.goals).toEqual([mockGoals[1]]);
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Goal deleted successfully!",
      }),
    );
  });

  it("handles delete goal error", async () => {
    const deleteError = new Error("Failed to delete goal");
    mockSupabaseFrom.mockReturnValue({
      delete: () => ({
        eq: () => ({
          data: null,
          error: deleteError,
        }),
      }),
      select: () => ({
        order: () => ({
          data: mockGoals, // Simulate no change after failed delete
          error: null,
        }),
      }),
    });

    const { result } = renderHook(() => useGoals());
    await waitFor(() => expect(result.current.isLoading).toBe(false)); // Wait for initial fetch

    await act(async () => {
      await result.current.deleteGoal("non-existent-goal");
    });

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Error deleting goal",
        description: deleteError.message,
        variant: "destructive",
      }),
    );
    expect(result.current.goals).toEqual(mockGoals); // Goals should not change
  });
});
