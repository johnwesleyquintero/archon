"use client";

import {
  CustomizableDashboardLayout,
  type Widget,
} from "@/components/customizable-dashboard-layout";
import { StatsGrid } from "@/components/stats-grid";
import { TodoList } from "@/components/todo-list";
import { GoalTracker } from "@/components/goal-tracker";
import { JournalList } from "@/components/journal-list";
import { AdvancedStatsGrid } from "@/components/advanced-stats-grid";
import { PlaceholderInfographics } from "@/components/placeholder-infographics";
import type { Layout } from "react-grid-layout";
import { useDashboardSettings } from "@/hooks/use-dashboard-settings";

// Define available widgets
const availableWidgets: Widget[] = [
  {
    id: "stats-overview",
    type: "stats",
    title: "Overview Stats",
    component: StatsGrid,
    minW: 6,
    minH: 3,
    defaultProps: {},
  },
  {
    id: "todo-list",
    type: "tasks",
    title: "Quick Tasks",
    component: TodoList,
    minW: 4,
    minH: 4,
    defaultProps: {},
  },
  {
    id: "goal-tracker",
    type: "goals",
    title: "Goal Progress",
    component: GoalTracker,
    minW: 4,
    minH: 4,
    defaultProps: {},
  },
  {
    id: "recent-journal",
    type: "journal",
    title: "Recent Journal Entries",
    component: JournalList,
    minW: 4,
    minH: 4,
    defaultProps: { limit: 3 },
  },
  {
    id: "advanced-stats",
    type: "analytics",
    title: "Advanced Analytics",
    component: AdvancedStatsGrid,
    minW: 6,
    minH: 4,
    defaultProps: {},
  },
  {
    id: "productivity-chart",
    type: "charts",
    title: "Productivity Insights",
    component: PlaceholderInfographics,
    minW: 6,
    minH: 4,
    defaultProps: {
      title: "Productivity Trends",
      description: "Your productivity patterns over time",
    },
  },
];

export default function DashboardPage() {
  const { layout } = useDashboardSettings();

  const handleLayoutChange = (_newLayout: Layout[]) => {
    // Layout changes are handled by the CustomizableDashboardLayout component
    // and saved via the useDashboardSettings hook
  };

  return (
    <div className="container mx-auto p-6">
      <CustomizableDashboardLayout
        widgets={availableWidgets}
        initialLayout={layout}
        onLayoutChange={handleLayoutChange}
        className="min-h-screen"
      />
    </div>
  );
}
