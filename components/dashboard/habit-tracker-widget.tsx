"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardWidget } from "@/components/dashboard/dashboard-widget";
import { HabitItem } from "./habit-item";

import { useHabits } from "@/hooks/use-habits";

export const HabitTrackerWidget: React.FC = () => {
  const { habits, addHabit, completeHabit } = useHabits();
  const [newHabitName, setNewHabitName] = useState("");

  const handleAddHabit = () => {
    if (newHabitName.trim()) {
      addHabit(newHabitName.trim());
      setNewHabitName("");
    }
  };

  return (
    <DashboardWidget title="Habit Tracker">
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
