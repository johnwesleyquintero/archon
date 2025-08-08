import { create } from "zustand";

type QuickAddGoalState = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

export const useQuickAddGoal = create<QuickAddGoalState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
