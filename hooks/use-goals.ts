"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import {
  getGoals,
  addGoal,
  updateGoal,
  deleteGoal,
} from "@/lib/database/goals";
import { createClient } from "@/lib/supabase/client";
import type { Database, Json } from "@/lib/supabase/types";
import { useAuth } from "@/contexts/auth-context";

type Goal = Database["public"]["Tables"]["goals"]["Row"];
type GoalInsert = Database["public"]["Tables"]["goals"]["Insert"];
type GoalUpdate = Database["public"]["Tables"]["goals"]["Update"];

export function useGoals(initialGoals: Goal[] = []) {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [isLoading, setIsLoading] = useState(initialGoals.length === 0);
  const [error, setError] = useState<Error | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchGoals = useCallback(async () => {
    if (!user?.id) {
      setGoals([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await getGoals(user.id);
      setGoals(data || []);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to load goals.");
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (initialGoals.length === 0 || user?.id) {
      // Fetch if no initial goals or user changes
      fetchGoals();
    }

    const client = createClient();
    const channel = client
      .channel("realtime-goals")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "goals",
          filter: `user_id=eq.${user?.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setGoals((prev) => [...prev, payload.new as Goal]);
          }
          if (payload.eventType === "UPDATE") {
            setGoals((prev) =>
              prev.map((goal) =>
                goal.id === payload.new.id ? (payload.new as Goal) : goal,
              ),
            );
          }
          if (payload.eventType === "DELETE") {
            setGoals((prev) =>
              prev.filter((goal) => goal.id !== payload.old.id),
            );
          }
        },
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [fetchGoals, initialGoals, user?.id]);

  const addGoalMutation = useCallback(
    async (newGoalData: Omit<GoalInsert, "user_id" | "id">) => {
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
            status: newGoalData.status || "todo", // Default to "todo"
            attachments: (newGoalData.attachments || null) as Json,
            milestones: [], // Initialize milestones as an empty array
            progress: newGoalData.progress ?? 0,
          };
          setGoals((prev) => [optimisticGoal, ...prev]);

          const data = await addGoal(newGoalData);

          setGoals((prev) =>
            prev.map((goal) => (goal.id === tempId ? data! : goal)),
          );
        } catch (err) {
          const error =
            err instanceof Error ? err : new Error("Failed to add goal.");
          setError(error);
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
        } catch (err) {
          const error =
            err instanceof Error ? err : new Error("Failed to update goal.");
          setError(error);
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
        } catch (err) {
          const error =
            err instanceof Error ? err : new Error("Failed to delete goal.");
          setError(error);
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
