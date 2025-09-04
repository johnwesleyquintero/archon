"use client";

import React, { useState } from "react";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { DashboardWidget } from "@/components/dashboard/dashboard-widget";

import { useHabits } from "@/hooks/use-habits";

import { HabitItem } from "./habit-item";

interface HabitTrackerWidgetProps {
  isCustomizing?: boolean;
  onRemove?: () => void;
  onSaveConfig?: (_config: { title: string }) => void;
}

export const HabitTrackerWidget: React.FC<HabitTrackerWidgetProps> = ({
  isCustomizing = false,
  onRemove = () => {},
  onSaveConfig = () => {},
}) => {
  const { habits, addHabit, completeHabit } = useHabits();
  const [newHabitName, setNewHabitName] = useState("");

  const handleAddHabit = () => {
    if (newHabitName.trim()) {
      addHabit(newHabitName.trim());
      setNewHabitName("");
    }
  };

  return (
    <DashboardWidget
      title="Habit Tracker"
      isCustomizing={isCustomizing}
      onRemove={onRemove}
      onSaveConfig={onSaveConfig}
    >
      <div className="space-y-2">
        {habits.map((habit) => (
          <HabitItem key={habit.id} habit={habit} onComplete={completeHabit} />
        ))}
      </div>
      <div className="mt-4 flex items-center space-x-2">
        <Input
          type="text"
          placeholder="Add a new habit..."
          value={newHabitName}
          onChange={(e) => setNewHabitName(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAddHabit()}
        />
        <Button onClick={handleAddHabit} size="icon">
          <Plus size={16} />
        </Button>
      </div>
    </DashboardWidget>
  );
};
