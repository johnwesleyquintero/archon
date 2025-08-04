import { Home, Target, ListTodo, BookOpen, LucideIcon } from "lucide-react";
import { AdvancedStatsGrid } from "@/components/advanced-stats-grid";
import { GoalTracker } from "@/components/goal-tracker";
import { JournalList, JournalListProps } from "@/components/journal-list";
import {
  PlaceholderInfographics,
  PlaceholderInfographicsProps,
} from "@/components/placeholder-infographics";
import { StatsGrid } from "@/components/stats-grid";
import { TodoList } from "@/components/todo-list";
import { GoalsDisplay } from "@/components/goals-display";
import type { Widget } from "@/components/customizable-dashboard-layout";
import type { Database } from "@/lib/supabase/types";
import { GoalTrackerProps } from "@/components/goal-tracker";
import { GoalsDisplayProps } from "@/components/goals-display";

type Goal = Database["public"]["Tables"]["goals"]["Row"];



interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/journal", label: "Journal", icon: BookOpen },
];

export const SIGN_OUT_LABEL = "Sign Out";
export const SIGNING_OUT_LABEL = "Signing out...";

export const getAvailableWidgets = (
  initialGoals: Goal[],
) => [
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
    defaultProps: { initialGoals } as GoalTrackerProps,
  },
  {
    id: "goals-display",
    type: "goals",
    title: "All Goals",
    component: GoalsDisplay,
    minW: 6,
    minH: 4,
    defaultProps: { initialGoals } as GoalsDisplayProps,
  },
  {
    id: "recent-journal",
    type: "journal",
    title: "Recent Journal Entries",
    component: JournalList,
    minW: 4,
    minH: 4,
    defaultProps: { limit: 3 } as JournalListProps,
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
      title: "Productivity Insights",
      description:
        "Charts and graphs detailing your productivity trends will be available here soon.",
    } as PlaceholderInfographicsProps,
  },
];
