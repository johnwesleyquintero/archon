import { CheckCircle, Flame } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import { Habit } from "@/lib/types/habits";

interface HabitItemProps {
  habit: Habit;
  onComplete: (_id: string) => void;
}

export const HabitItem: React.FC<HabitItemProps> = ({ habit, onComplete }) => {
  const today = new Date();
  const isCompletedToday = !!(
    habit.lastCompleted &&
    habit.lastCompleted.getDate() === today.getDate() &&
    habit.lastCompleted.getMonth() === today.getMonth() &&
    habit.lastCompleted.getFullYear() === today.getFullYear()
  );

  return (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onComplete(habit.id)}
          disabled={isCompletedToday}
          className={`h-8 w-8 rounded-full ${isCompletedToday ? "text-green-500" : "text-gray-400"}`}
        >
          <CheckCircle size={20} />
        </Button>
        <span className="ml-2 text-sm font-medium">{habit.name}</span>
      </div>
      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
        <Flame size={16} className="mr-1 text-orange-500" />
        <span>{habit.streak}</span>
      </div>
    </div>
  );
};
