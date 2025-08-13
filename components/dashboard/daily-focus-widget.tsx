"use client";

import { useState, useEffect } from "react";
import { DashboardWidget } from "@/components/dashboard/dashboard-widget";
import { Task } from "@/lib/types/task";
import { Goal } from "@/lib/types/goal";
import { getGoals } from "@/lib/database/goals";
import { getTasks } from "@/lib/database/tasks";
import { useAuth } from "@/contexts/auth-context";
import { Spinner } from "@/components/ui/spinner";
import { TaskItem } from "@/components/task-item";
import { Target } from "lucide-react";

export function DailyFocusWidget() {
  const { user } = useAuth();
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
        // 1. Fetch the highest priority goal.
        // This assumes a 'priority' field and sorting logic in getGoals.
        // For now, we'll just fetch all goals and take the first one as a placeholder.
        const allGoals = await getGoals(user.id);
        const highestPriorityGoal = allGoals.length > 0 ? allGoals[0] : null;
        setGoal(highestPriorityGoal);

        if (highestPriorityGoal) {
          // 2. Fetch tasks associated with that goal.
          const associatedTasks = await getTasks({
            goal_id: highestPriorityGoal.id,
          });
          setTasks(associatedTasks);
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
      return <Spinner className="h-8 w-8" />;
    }

    if (error) {
      return <p className="text-red-500 text-sm">{error}</p>;
    }

    if (!goal) {
      return (
        <div className="text-center text-slate-500">
          <p>No high-priority goal set.</p>
          <p className="text-xs">Set a goal's priority to see it here.</p>
        </div>
      );
    }

    return (
      <div>
        <h3 className="font-semibold text-lg mb-2 flex items-center">
          <Target className="h-5 w-5 mr-2 text-slate-600" />
          {goal.title}
        </h3>
        {tasks.length > 0 ? (
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
                  goal={goal}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No tasks for this goal yet.</p>
        )}
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
      <div className="p-4">{renderContent()}</div>
    </DashboardWidget>
  );
}
