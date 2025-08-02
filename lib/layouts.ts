import { WidgetLayout } from "@/app/types";

export const DEFAULT_LAYOUT: WidgetLayout[] = [
  { i: "stats-overview", x: 0, y: 0, w: 4, h: 2, isVisible: true, title: "Stats Overview" },
  { i: "goal-tracker", x: 4, y: 0, w: 4, h: 3, isVisible: true, title: "Goal Tracker" },
  { i: "todo-list", x: 8, y: 0, w: 4, h: 3, isVisible: true, title: "Todo List" },
];
