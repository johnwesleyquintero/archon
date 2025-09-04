import { SupabaseClient } from "@supabase/supabase-js";
import { renderHook, act, waitFor } from "@testing-library/react";

import { useToast } from "@/components/ui/use-toast";
import { useGoals } from "@/hooks/use-goals";
import {
  addGoal,
  deleteGoal,
  getGoals,
  updateGoal,
} from "@/lib/database/goals";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/supabase/types";

// Mock database functions

// Mock Supabase client
jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(),
}));

// Mock useToast hook
jest.mock("@/components/ui/use-toast", () => ({
  useToast: jest.fn(() => ({
    toast: jest.fn(),
    toasts: [],
  })),
}));

// Mock useAuth hook
jest.mock("@/contexts/auth-context", () => ({
  useAuth: jest.fn(() => ({
    user: { id: "test-user-id" },
    isLoading: false,
    error: null,
  })),
}));

jest.mock("@/lib/database/goals", () => ({
  getGoals: jest.fn(() => Promise.resolve([])),
  addGoal: jest.fn(() => Promise.resolve(null)),
  updateGoal: jest.fn(() => Promise.resolve(null)),
  deleteGoal: jest.fn(() => Promise.resolve(undefined)),
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
    tags: null,
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
    tags: null,
  },
];

// Increase the default timeout for all tests in this file
jest.setTimeout(30000);

describe("useGoals", () => {
  let toast: jest.Mock;
  let mockSupabaseFrom: jest.Mock;
  let mockedCreateClient: jest.MockedFunction<typeof createClient>;

  beforeEach(() => {
    const mockToast = jest.fn();
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast, toasts: [] });
    toast = mockToast;
    toast.mockClear();

    mockedCreateClient = jest.mocked(createClient);
    mockedCreateClient.mockClear();

    mockedCreateClient.mockReturnValue({
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
    } as unknown as SupabaseClient<Database>);

    mockSupabaseFrom = mockedCreateClient().from as jest.Mock; // Cast to jest.Mock
    mockSupabaseFrom.mockClear();

    (getGoals as jest.Mock).mockClear();
    (addGoal as jest.Mock).mockClear();
    (updateGoal as jest.Mock).mockClear();
    (deleteGoal as jest.Mock).mockClear();
  });

  it("fetches goals successfully", async () => {
    (getGoals as jest.Mock).mockResolvedValue(mockGoals);

    const { result } = renderHook(() => useGoals());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(getGoals).toHaveBeenCalled();
    expect(result.current.goals).toEqual(mockGoals);
    expect(result.current.error).toBeNull();
  });

  it("handles fetch goals error", async () => {
    const fetchError = new Error("Failed to fetch goals");
    (getGoals as jest.Mock).mockRejectedValue(fetchError);

    const { result } = renderHook(() => useGoals());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(getGoals).toHaveBeenCalled();
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
      tags: null,
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

    (addGoal as jest.Mock).mockResolvedValue(returnedGoal);

    const { result } = renderHook(() => useGoals([...mockGoals]));

    await act(async () => {
      await result.current.addGoal(newGoalData);
    });

    expect(addGoal).toHaveBeenCalledWith(newGoalData);
    expect(result.current.goals).toContainEqual(returnedGoal);
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

    (addGoal as jest.Mock).mockRejectedValue(addError);

    const { result } = renderHook(() => useGoals([...mockGoals]));

    await act(async () => {
      await result.current.addGoal(badGoalData);
    });

    expect(addGoal).toHaveBeenCalledWith(badGoalData);
    expect(result.current.error).toEqual(addError);
    expect(result.current.goals).toEqual(mockGoals);
  });

  it("updates a goal successfully", async () => {
    const goalToUpdate = mockGoals[0];
    const updatedData = {
      title: "Updated Title",
      description: "Updated Desc",
    };
    const updatedGoal = { ...goalToUpdate, ...updatedData };

    (updateGoal as jest.Mock).mockResolvedValue(updatedGoal);

    const { result } = renderHook(() => useGoals([...mockGoals]));

    await act(async () => {
      await result.current.updateGoal(goalToUpdate.id, updatedData);
    });

    expect(updateGoal).toHaveBeenCalledWith(goalToUpdate.id, updatedData);
    expect(result.current.goals).toContainEqual(updatedGoal);
    expect(result.current.error).toBeNull();
  });

  it("handles update goal error", async () => {
    const updateError = new Error("Failed to update goal");
    const goalId = "goal-1";
    const badUpdateData = { title: "Bad Update" };

    (updateGoal as jest.Mock).mockRejectedValue(updateError);

    const { result } = renderHook(() => useGoals([...mockGoals]));

    await act(async () => {
      await result.current.updateGoal(goalId, badUpdateData);
    });

    expect(updateGoal).toHaveBeenCalledWith(goalId, badUpdateData);
    expect(result.current.error).toEqual(updateError);
    expect(result.current.goals).toEqual(mockGoals);
  });

  it("deletes a goal successfully", async () => {
    (deleteGoal as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useGoals([...mockGoals]));

    await act(async () => {
      await result.current.deleteGoal("goal-1");
    });

    expect(deleteGoal).toHaveBeenCalledWith("goal-1");
    expect(result.current.goals).toEqual([mockGoals[1]]);
    expect(result.current.error).toBeNull();
  });

  it("handles delete goal error", async () => {
    const deleteError = new Error("Failed to delete goal");
    (deleteGoal as jest.Mock).mockRejectedValue(deleteError);

    const { result } = renderHook(() => useGoals([...mockGoals]));

    await act(async () => {
      await result.current.deleteGoal("non-existent-goal");
    });

    expect(deleteGoal).toHaveBeenCalledWith("non-existent-goal");
    expect(result.current.error).toEqual(deleteError);
    expect(result.current.goals).toEqual(mockGoals);
  });
});
