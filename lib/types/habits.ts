export interface Habit {
  id: string;
  name: string;
  description?: string;
  streak: number;
  lastCompleted: Date | null;
}

export interface HabitEntry {
  id: string;
  habit_id: string;
  date: Date;
}
