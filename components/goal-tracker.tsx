"use client";

import { useState } from "react";
import { CreateGoalModal } from "@/components/create-goal-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit3, Calendar, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import type { Database } from "@/lib/supabase/types";
import { goalSchema } from "@/lib/validators";
import { z } from "zod";

type Goal = Database["public"]["Tables"]["goals"]["Row"];
type GoalFormValues = z.infer<typeof goalSchema>;

export interface GoalTrackerProps {
  initialGoals?: Goal[]; // Make initialGoals optional
}

const statusConfig = {
  pending: {
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: "⚪ Not Started",
  },
  in_progress: {
    color: "bg-green-100 text-green-800 border-green-200",
    icon: "🟢 On Track",
  },
  completed: {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: "✅ Completed",
  },
};

export function GoalTracker({ initialGoals }: GoalTrackerProps) {
  const [goals] = useState<Goal[]>(initialGoals || []); // Default to empty array if not provided
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // The fetchGoals function is now only for refreshing data after an action.
  const fetchGoals = () => {
    setIsLoading(true);
    try {
      // This would ideally be a server action or API call to get fresh data
      // For now, we'll just simulate a refresh.
      // In a real app, you'd call getGoals() here.
      console.log("Refreshing goals...");
    } catch (err) {
      console.error("Error refreshing goals:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    setModalOpen(true);
  };

  const handleAddGoal = () => {
    setSelectedGoal(null);
    setModalOpen(true);
  };

  const handleSaveGoal = async (goalData: GoalFormValues, goalId?: string) => {
    setIsSaving(true);
    // Here you would call your API to save or update the goal
    console.log("Saving goal:", goalData, goalId);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
    setIsSaving(false);
    setModalOpen(false);
    void fetchGoals(); // Refresh goals list
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Target className="h-5 w-5 text-slate-600" />
            My Strategic Goals
          </CardTitle>
          <Skeleton className="h-9 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.status === "completed").length;
  const onTrackGoals = goals.filter((g) => g.status === "in_progress").length;

  return (
    <>
      <CreateGoalModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSaveOrUpdate={handleSaveGoal}
        isSaving={isSaving}
        initialData={selectedGoal}
      />
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Target className="h-5 w-5 text-slate-600" />
            My Strategic Goals
          </CardTitle>
          <Button
            onClick={handleAddGoal}
            size="sm"
            className="bg-slate-900 hover:bg-slate-800 text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add New Goal
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {goals.length > 0 ? (
            goals.map((goal) => (
              <Card
                key={goal.id}
                className="border border-slate-200 hover:border-slate-300 transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Goal Title and Status */}
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-slate-900 text-sm leading-tight">
                          {goal.title}
                        </h3>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs font-medium shrink-0",
                            statusConfig[
                              goal.status as keyof typeof statusConfig
                            ]?.color,
                          )}
                        >
                          {
                            statusConfig[
                              goal.status as keyof typeof statusConfig
                            ]?.icon
                          }
                        </Badge>
                      </div>

                      {/* Target Date */}
                      {goal.target_date && (
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                          <Calendar className="h-3 w-3" />
                          <span>Due: {goal.target_date}</span>
                        </div>
                      )}

                      {/* Description */}
                      {goal.description && (
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {goal.description}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditGoal(goal)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100 shrink-0"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <EmptyState
              title="No goals set yet"
              description="Create your first strategic goal to get started."
              actionLabel="Add New Goal"
              onAction={handleAddGoal}
            />
          )}

          {/* Summary Stats */}
          {goals.length > 0 && (
            <div className="pt-4 border-t border-slate-100">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">Total Goals</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {totalGoals}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">Completed</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {completedGoals}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">On Track</p>
                  <p className="text-lg font-semibold text-green-600">
                    {onTrackGoals}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
