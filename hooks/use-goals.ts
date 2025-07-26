"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import {
  getGoals,
  addGoal,
  updateGoal,
  deleteGoal,
} from "@/lib/database/goals";
import type { Database } from "@/lib/supabase/types";

type Goal = Database["public"]["Tables"]["goals"]["Row"];
type GoalInsert = Database["public"]["Tables"]["goals"]["Insert"];
type GoalUpdate = Database["public"]["Tables"]["goals"]["Update"];

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchGoals = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getGoals();
      console.log("Fetched goals data:", data); // Debug log
      setGoals(data || []);
    } catch (err: any) {
      console.error("Failed to fetch goals:", err);
      setError(new Error(err.message || "Failed to load goals."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const addGoalMutation = useCallback(
    async (newGoalData: Omit<GoalInsert, "user_id">) => {
      startTransition(async () => {
        setError(null);
        try {
          // Optimistic update
          const tempId = `temp-${Date.now()}`;
          const optimisticGoal: Goal = {
            id: tempId,
            user_id: "optimistic_user", // Placeholder, will be replaced by server
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            title: newGoalData.title,
            description: newGoalData.description || null,
            target_date: newGoalData.target_date || null,
            status: newGoalData.status || "pending",
            attachments: newGoalData.attachments || [],
            progress: 0, // Initialize progress as 0 for new goals
          };
          setGoals((prev) => [optimisticGoal, ...prev]);

          const data = await addGoal(newGoalData);

          setGoals((prev) =>
            prev.map((goal) => (goal.id === tempId ? data! : goal)),
          );
        } catch (err: any) {
          console.error("Failed to add goal:", err);
          setError(new Error(err.message || "Failed to add goal."));
          setGoals((prev) =>
            prev.filter((goal) => !goal.id.startsWith("temp-")),
          ); // Rollback optimistic update
        }
      });
    },
    [],
  );

  const updateGoalMutation = useCallback(
    async (id: string, updates: GoalUpdate) => {
      startTransition(async () => {
        setError(null);
        const originalGoals = goals; // Snapshot for rollback
        setGoals((prev) =>
          prev.map((goal) =>
            goal.id === id
              ? {
                  ...goal,
                  ...updates,
                  updated_at: new Date().toISOString(), // Optimistic update for updated_at
                }
              : goal,
          ),
        );
        try {
          const data = await updateGoal(id, updates);
          // If data is returned, update with actual server data
          setGoals((prev) =>
            prev.map((goal) => (goal.id === id ? data! : goal)),
          );
        } catch (err: any) {
          console.error("Failed to update goal:", err);
          setError(new Error(err.message || "Failed to update goal."));
          setGoals(originalGoals); // Rollback
        }
      });
    },
    [goals],
  );

  const deleteGoalMutation = useCallback(
    async (id: string) => {
      startTransition(async () => {
        setError(null);
        const originalGoals = goals; // Snapshot for rollback
        setGoals((prev) => prev.filter((goal) => goal.id !== id)); // Optimistic delete
        try {
          await deleteGoal(id);
        } catch (err: any) {
          console.error("Failed to delete goal:", err);
          setError(new Error(err.message || "Failed to delete goal."));
          setGoals(originalGoals); // Rollback
        }
      });
    },
    [goals],
  );

  return {
    goals,
    isLoading,
    error,
    isMutating: isPending,
    addGoal: addGoalMutation,
    updateGoal: updateGoalMutation,
    deleteGoal: deleteGoalMutation,
    refetchGoals: fetchGoals,
  };
}
