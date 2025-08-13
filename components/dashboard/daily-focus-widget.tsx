"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardWidget } from "@/components/dashboard/dashboard-widget";
import { Task } from "@/lib/types/task";
import { Goal } from "@/lib/types/goal";
import { getGoals } from "@/lib/database/goals";
import { getTasks } from "@/lib/database/tasks";
import { useAuth } from "@/contexts/auth-context";
import { useGlobalQuickAdd } from "@/lib/state/use-global-quick-add";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { TaskItem } from "@/components/task-item";
import { Target, BookPlus } from "lucide-react";

export function DailyFocusWidget() {
  const { user } = useAuth();
  const { open: openGlobalQuickAdd } = useGlobalQuickAdd();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDailyFocusData() {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch recent goal and priority tasks in parallel
        const [goalResult, tasksResult] = await Promise.allSettled([
          getGoals(user.id, {
            is_completed: false,
            sortBy: "updated_at",
            ascending: false,
            limit: 1,
          }),
          getTasks(
            {
              isCompleted: false,
            },
            { sortBy: "priority", sortOrder: "desc" },
          ),
        ]);

        if (goalResult.status === "fulfilled" && goalResult.value.length > 0) {
          setGoal(goalResult.value[0]);
        }

        if (tasksResult.status === "fulfilled") {
          setTasks(tasksResult.value);
        }

        if (
          goalResult.status === "rejected" ||
          tasksResult.status === "rejected"
        ) {
          console.error("Error fetching daily focus data:", {
            goalResult,
            tasksResult,
          });
          throw new Error("Partial or complete data fetch failed.");
        }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        console.error("Failed to fetch daily focus data:", errorMessage);
        setError("Could not load daily focus data.");
      } finally {
        setLoading(false);
      }
    }

    void fetchDailyFocusData();
  }, [user]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-full">
          <Spinner className="h-8 w-8" />
        </div>
      );
    }

    if (error) {
      return <p className="text-red-500 text-sm text-center">{error}</p>;
    }

    if (!goal && tasks.length === 0) {
      return (
        <div className="text-center text-slate-500">
          <p>Your focus for today is clear!</p>
          <p className="text-xs mt-1">
            Add some tasks or goals to get started.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {goal && (
          <div>
            <h3 className="font-semibold text-base mb-2 flex items-center text-slate-700">
              <Target className="h-5 w-5 mr-2" />
              Focus Goal
            </h3>
            <Link
              href={`/goals#${goal.id}`}
              className="block p-2 rounded-md hover:bg-slate-50"
            >
              <p className="font-medium truncate">{goal.title}</p>
              <p className="text-xs text-slate-500">
                Last updated: {new Date(goal.updated_at).toLocaleDateString()}
              </p>
            </Link>
          </div>
        )}

        {tasks.length > 0 && (
          <div>
            <h3 className="font-semibold text-base mb-2 flex items-center text-slate-700">
              <Target className="h-5 w-5 mr-2" />
              Top Tasks
            </h3>
            <ul className="space-y-1">
              {tasks.map((task) => (
                <li key={task.id}>
                  <TaskItem
                    {...task}
                    onToggle={() => {}}
                    onArchive={() => {}}
                    onDeletePermanently={() => {}}
                    onUpdate={() => Promise.resolve()}
                    onAddTask={() => Promise.resolve()}
                    onOpenModal={() => {}}
                    onEdit={() => {}}
                    isSelected={false}
                    onSelect={() => {}}
                    goal={null}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={() => openGlobalQuickAdd("journal")}
        >
          <BookPlus className="mr-2 h-4 w-4" />
          New Journal Entry
        </Button>
      </div>
    );
  };

  return (
    <DashboardWidget
      title="Daily Focus"
      isCustomizing={false}
      onRemove={() => {}}
      onSaveConfig={() => {}}
    >
      <div className="p-4 h-full">{renderContent()}</div>
    </DashboardWidget>
  );
}
