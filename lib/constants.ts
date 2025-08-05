import {
  Home,
  Target,
  ListTodo,
  BookOpen,
  Kanban,
  LucideIcon,
} from "lucide-react";
import { AdvancedStatsGrid } from "@/components/advanced-stats-grid";
import { WelcomeWidget } from "@/components/dashboard/welcome-widget";
import { GoalTracker } from "@/components/goal-tracker";
import { JournalList, JournalListProps } from "@/components/journal-list";
import {
  PlaceholderInfographics,
  PlaceholderInfographicsProps,
} from "@/components/placeholder-infographics";
import { StatsGrid } from "@/components/stats-grid";
import { TodoList } from "@/components/todo-list";
import { GoalsDisplay } from "@/components/goals-display";

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
  { href: "/kanban", label: "Kanban", icon: Kanban },
];

export const SIGN_OUT_LABEL = "Sign Out";
export const SIGNING_OUT_LABEL = "Signing out...";

export const getAvailableWidgets = (initialGoals: Goal[]) => [
  {
    id: "stats-overview",
    type: "stats",
    title: "Overview Stats",
    description: "A summary of your key statistics.",
    component: StatsGrid,
    minW: 6,
    minH: 3,
    defaultProps: {},
  },
  {
    id: "todo-list",
    type: "tasks",
    title: "Quick Tasks",
    description: "Your immediate to-do list.",
    component: TodoList,
    minW: 4,
    minH: 4,
    defaultProps: {},
  },
  {
    id: "goal-tracker",
    type: "goals",
    title: "Goal Progress",
    description: "Track the progress of your active goals.",
    component: GoalTracker,
    minW: 4,
    minH: 4,
    defaultProps: { initialGoals } as GoalTrackerProps,
  },
  {
    id: "goals-display",
    type: "goals",
    title: "All Goals",
    description: "View all your defined goals.",
    component: GoalsDisplay,
    minW: 6,
    minH: 4,
    defaultProps: { initialGoals } as GoalsDisplayProps,
  },
  {
    id: "recent-journal",
    type: "journal",
    title: "Recent Journal Entries",
    description: "A quick look at your latest journal entries.",
    component: JournalList,
    minW: 4,
    minH: 4,
    defaultProps: { limit: 3 } as JournalListProps,
  },
  {
    id: "advanced-stats",
    type: "analytics",
    title: "Advanced Analytics",
    description: "Detailed analytical insights into your data.",
    component: AdvancedStatsGrid,
    minW: 6,
    minH: 4,
    defaultProps: {},
  },
  {
    id: "productivity-chart",
    type: "charts",
    title: "Productivity Insights",
    description:
      "Charts and graphs detailing your productivity trends will be available here soon.",
    component: PlaceholderInfographics,
    minW: 6,
    minH: 4,
    defaultProps: {
      title: "Productivity Insights",
      description:
        "Charts and graphs detailing your productivity trends will be available here soon.",
    } as PlaceholderInfographicsProps,
  },
  {
    id: "welcome-message",
    type: "utility",
    title: "Welcome Message",
    description: "A personalized welcome message.",
    component: WelcomeWidget,
    minW: 2,
    minH: 1,
    defaultProps: {},
  },
];
