"use client";

import Link from "next/link";
import { DashboardWidget } from "@/components/dashboard/dashboard-widget";
import { Task } from "@/lib/types/task";
import { Goal } from "@/lib/types/goal";
import { useGlobalQuickAdd } from "@/lib/state/use-global-quick-add";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { TaskItem } from "@/components/task-item";
import { Target, BookPlus } from "lucide-react";

interface DailyFocusWidgetProps {
  goal: Goal | null;
  tasks: Task[];
  prompt: string | null;
  loading: boolean;
  error: string | null;
}

export function DailyFocusWidget({
  goal,
  tasks,
  prompt,
  loading,
  error,
}: DailyFocusWidgetProps) {
  const { open: openGlobalQuickAdd } = useGlobalQuickAdd();

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

    if (!goal && tasks.length === 0 && !prompt) {
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
        {prompt && (
          <div>
            <h3 className="font-semibold text-base mb-2 flex items-center text-slate-700">
              <BookPlus className="h-5 w-5 mr-2" />
              Journal Prompt
            </h3>
            <p className="text-sm text-slate-600 italic">"{prompt}"</p>
          </div>
        )}
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
              Tasks Due Today
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
