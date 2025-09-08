import { create } from "zustand";

export type QuickAddTab = "task" | "goal" | "journal";

type GlobalQuickAddState = {
  isOpen: boolean;
  activeTab: QuickAddTab;
  open: (_tab?: QuickAddTab) => void;
  close: () => void;
  setActiveTab: (_tab: QuickAddTab) => void;
};

export const useGlobalQuickAdd = create<GlobalQuickAddState>((set) => ({
  isOpen: false,
  activeTab: "task",
  open: (_tab = "task") => set({ isOpen: true, activeTab: _tab }),
  close: () => set({ isOpen: false }),
  setActiveTab: (_tab) => set({ activeTab: _tab }),
}));
