import { create } from "zustand";

export type QuickAddTab = "task" | "goal" | "journal";

type GlobalQuickAddState = {
  isOpen: boolean;
  activeTab: QuickAddTab;
  open: (tab?: QuickAddTab) => void;
  close: () => void;
  setActiveTab: (tab: QuickAddTab) => void;
};

export const useGlobalQuickAdd = create<GlobalQuickAddState>((set) => ({
  isOpen: false,
  activeTab: "task",
  open: (tab = "task") => set({ isOpen: true, activeTab: tab }),
  close: () => set({ isOpen: false }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
