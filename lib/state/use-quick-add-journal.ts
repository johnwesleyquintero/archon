import { create } from "zustand";

type QuickAddJournalState = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

export const useQuickAddJournal = create<QuickAddJournalState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
