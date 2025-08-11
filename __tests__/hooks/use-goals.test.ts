import { renderHook, act, waitFor } from "@testing-library/react";
import { useGoals } from "@/hooks/use-goals";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth-context";

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
    channel: jest.fn(() => ({
      on: jest.fn(() => ({
        subscribe: jest.fn(),
      })),
      subscribe: jest.fn(),
    })),
    removeChannel: jest.fn(),
  })),
}));

// Mock useToast hook
jest.mock("@/components/ui/use-toast", () => ({
  useToast: jest.fn(),
}));

// Mock useAuth hook
jest.mock("@/contexts/auth-context", () => ({
  useAuth: jest.fn(() => ({
    user: { id: "test-user-id" },
    isLoading: false,
    error: null,
  })),
}));

// Mock database functions
jest.mock("@/lib/database/goals", () => ({
  getGoals: jest.fn().mockResolvedValue([]),
  addGoal: jest.fn().mockResolvedValue(null),
  updateGoal: jest.fn().mockResolvedValue(null),
  deleteGoal: jest.fn().mockResolvedValue(undefined),
}));

const mockGoals = [
  {
    id: "goal-1",
    title: "Goal 1",
    description: "Desc 1",
    target_date: "2025-12-31",
    status: "pending",
    attachments: [],
    milestones: [],
    created_at: new Date().toISOString(),
    progress: 0,
    updated_at: new Date().toISOString(),
    user_id: "test-user-id",
    tags: null, // Added missing tags property
  },
  {
    id: "goal-2",
    title: "Goal 2",
    description: "Desc 2",
    target_date: "2025-11-30",
    status: "in_progress",
    attachments: [],
    milestones: [],
    created_at: new Date().toISOString(),
    progress: 50,
    updated_at: new Date().toISOString(),
    user_id: "test-user-id",
    tags: null, // Added missing tags property
  },
];

// Increase the default timeout for all tests in this file
jest.setTimeout(30000);

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
    // Import the mocked getGoals function
    const { getGoals } = require("@/lib/database/goals");

    // Set up the mock to resolve with mockGoals
    (getGoals as jest.Mock).mockResolvedValue(mockGoals);

    const { result } = renderHook(() => useGoals());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Verify the mock was called
    expect(getGoals).toHaveBeenCalled();

    // Verify the goals were set in the state
    expect(result.current.goals).toEqual(mockGoals);
    expect(result.current.error).toBeNull();
  });

  it("handles fetch goals error", async () => {
    const fetchError = new Error("Failed to fetch goals");

    // Import the mocked getGoals function
    const { getGoals } = require("@/lib/database/goals");

    // Set up the mock to reject with an error
    (getGoals as jest.Mock).mockRejectedValue(fetchError);

    const { result } = renderHook(() => useGoals());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Verify the mock was called
    expect(getGoals).toHaveBeenCalled();

    // Verify error handling
    expect(result.current.goals).toEqual([]);
    expect(result.current.error).toEqual(fetchError);
  });

  it("adds a new goal successfully", async () => {
    const newGoalData = {
      title: "New Goal",
      description: "New Desc",
      target_date: "2026-01-01",
      status: "pending",
      attachments: [],
      tags: null, // Added missing tags property
    };
    const returnedGoal = {
      id: "new-goal-id",
      user_id: "test-user-id",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      progress: 0,
      milestones: [],
      ...newGoalData,
    };

    // Import the mocked addGoal function
    const { addGoal } = require("@/lib/database/goals");

    // Set up the mock to resolve with the new goal
    (addGoal as jest.Mock).mockResolvedValue(returnedGoal);

    // Initialize with mock data to avoid initial fetch
    const { result } = renderHook(() => useGoals([...mockGoals]));

    await act(async () => {
      await result.current.addGoal(newGoalData);
    });

    // Verify the mock was called with the correct data
    expect(addGoal).toHaveBeenCalledWith(newGoalData);

    // Verify that the new goal was added to the state
    // The optimistic update is replaced with the returned goal
    expect(result.current.goals).toContainEqual(returnedGoal);

    // Verify that there are no errors
    expect(result.current.error).toBeNull();
  });

  it("handles add goal error", async () => {
    const addError = new Error("Failed to add goal");
    const badGoalData = {
      title: "Bad Goal",
      description: "",
      target_date: "",
      status: "pending",
      attachments: [],
      milestones: [],
    };

    // Import the mocked addGoal function
    const { addGoal } = require("@/lib/database/goals");

    // Set up the mock to reject with an error
    (addGoal as jest.Mock).mockRejectedValue(addError);

    // Initialize with mock data to avoid initial fetch
    const { result } = renderHook(() => useGoals([...mockGoals]));

    await act(async () => {
      await result.current.addGoal(badGoalData);
    });

    // Verify the mock was called with the correct data
    expect(addGoal).toHaveBeenCalledWith(badGoalData);

    // Verify error handling
    expect(result.current.error).toEqual(addError);

    // Verify that goals remain unchanged
    expect(result.current.goals).toEqual(mockGoals);
  });

  it("updates a goal successfully", async () => {
    const goalToUpdate = mockGoals[0];
    const updatedData = {
      title: "Updated Title",
      description: "Updated Desc",
    };
    const updatedGoal = { ...goalToUpdate, ...updatedData };

    // Import the mocked updateGoal function
    const { updateGoal } = require("@/lib/database/goals");

    // Set up the mock to resolve with the updated goal
    (updateGoal as jest.Mock).mockResolvedValue(updatedGoal);

    // Initialize with mock data to avoid initial fetch
    const { result } = renderHook(() => useGoals([...mockGoals]));

    await act(async () => {
      await result.current.updateGoal(goalToUpdate.id, updatedData);
    });

    // Verify the mock was called with the correct data
    expect(updateGoal).toHaveBeenCalledWith(goalToUpdate.id, updatedData);

    // Verify that the goal was updated in the state
    expect(result.current.goals).toContainEqual(updatedGoal);

    // Verify that there are no errors
    expect(result.current.error).toBeNull();
  });

  it("handles update goal error", async () => {
    const updateError = new Error("Failed to update goal");
    const goalId = "goal-1";
    const badUpdateData = { title: "Bad Update" };

    // Import the mocked updateGoal function
    const { updateGoal } = require("@/lib/database/goals");

    // Set up the mock to reject with an error
    (updateGoal as jest.Mock).mockRejectedValue(updateError);

    // Initialize with mock data to avoid initial fetch
    const { result } = renderHook(() => useGoals([...mockGoals]));

    await act(async () => {
      await result.current.updateGoal(goalId, badUpdateData);
    });

    // Verify the mock was called with the correct data
    expect(updateGoal).toHaveBeenCalledWith(goalId, badUpdateData);

    // Verify error handling
    expect(result.current.error).toEqual(updateError);

    // Verify that goals remain unchanged
    expect(result.current.goals).toEqual(mockGoals);
  });

  it("deletes a goal successfully", async () => {
    // Import the mocked deleteGoal function
    const { deleteGoal } = require("@/lib/database/goals");

    // Set up the mock to resolve successfully
    (deleteGoal as jest.Mock).mockResolvedValue(undefined);

    // Initialize with mock data to avoid initial fetch
    const { result } = renderHook(() => useGoals([...mockGoals]));

    // Execute the delete operation
    await act(async () => {
      await result.current.deleteGoal("goal-1");
    });

    // Verify the mock was called with the correct ID
    expect(deleteGoal).toHaveBeenCalledWith("goal-1");

    // Verify that the goal was removed from the state
    expect(result.current.goals).toEqual([mockGoals[1]]);

    // Verify that there are no errors
    expect(result.current.error).toBeNull();
  });

  it("handles delete goal error", async () => {
    const deleteError = new Error("Failed to delete goal");

    // Import the mocked deleteGoal function
    const { deleteGoal } = require("@/lib/database/goals");

    // Set up the mock to reject with an error
    (deleteGoal as jest.Mock).mockRejectedValue(deleteError);

    // Initialize with mock data to avoid initial fetch
    const { result } = renderHook(() => useGoals([...mockGoals]));

    // Execute the delete operation
    await act(async () => {
      await result.current.deleteGoal("non-existent-goal");
    });

    // Verify the mock was called with the correct ID
    expect(deleteGoal).toHaveBeenCalledWith("non-existent-goal");

    // Verify error handling
    expect(result.current.error).toEqual(deleteError);

    // Verify that goals remain unchanged
    expect(result.current.goals).toEqual(mockGoals);
  });
});
