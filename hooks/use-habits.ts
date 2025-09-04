import { useCallback, useState } from "react";

import { Habit } from "@/lib/types/habits";

// Mock data for initial development
const MOCK_HABITS: Habit[] = [
  {
    id: "1",
    name: "Read for 15 minutes",
    streak: 5,
    lastCompleted: new Date(new Date().setDate(new Date().getDate() - 1)),
  },
  {
    id: "2",
    name: "Morning Meditation",
    streak: 12,
    lastCompleted: new Date(new Date().setDate(new Date().getDate() - 1)),
  },
  { id: "3", name: "Workout", streak: 0, lastCompleted: null },
];

export const useHabits = () => {
  const [habits, setHabits] = useState<Habit[]>(MOCK_HABITS);
  const [loading, _setLoading] = useState(false);
  const [error, _setError] = useState<Error | null>(null);

  const addHabit = useCallback((name: string) => {
    const newHabit: Habit = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      streak: 0,
      lastCompleted: null,
    };
    setHabits((prev) => [...prev, newHabit]);
  }, []);

  const completeHabit = useCallback((habitId: string) => {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id === habitId) {
          const today = new Date();
          const isAlreadyCompletedToday =
            habit.lastCompleted &&
            habit.lastCompleted.getDate() === today.getDate() &&
            habit.lastCompleted.getMonth() === today.getMonth() &&
            habit.lastCompleted.getFullYear() === today.getFullYear();

          if (isAlreadyCompletedToday) return habit;

          return {
            ...habit,
            streak: habit.streak + 1,
            lastCompleted: today,
          };
        }
        return habit;
      }),
    );
  }, []);

  return { habits, loading, error, addHabit, completeHabit };
};
