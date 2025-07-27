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
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getDashboardSettings } from "@/lib/database/dashboard-settings";
import { DEFAULT_LAYOUT } from "@/hooks/use-dashboard-settings";

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

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialLayout = DEFAULT_LAYOUT;
  if (user) {
    const storedLayout = await getDashboardSettings(user.id);
    if (storedLayout) {
      initialLayout = DEFAULT_LAYOUT.map((defaultWidget) => {
        const storedWidget = storedLayout.find(
          (sl) => sl.i === defaultWidget.i,
        );
        return {
          ...defaultWidget,
          ...storedWidget,
          isVisible: storedWidget
            ? storedWidget.isVisible
            : defaultWidget.isVisible,
        };
      });
    }
  }

  return (
    <div className="container mx-auto p-6">
      <CustomizableDashboardLayout
        widgets={availableWidgets}
        initialLayout={initialLayout}
        className="min-h-screen"
      />
    </div>
  );
}
