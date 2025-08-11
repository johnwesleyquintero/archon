import {
  Home,
  Target,
  ListTodo,
  BookOpen,
  Kanban,
  LucideIcon,
} from "lucide-react";
import { JournalListProps } from "@/components/journal-list";
import { PlaceholderInfographicsProps } from "@/components/placeholder-infographics";
import type { Database } from "@/lib/supabase/types";
import { GoalTrackerProps } from "@/components/goal-tracker";
import { GoalsDisplayProps } from "@/components/goals-display";

type Goal = Database["public"]["Tables"]["goals"]["Row"] & {
  tags: string[] | null;
};

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
    componentId: "stats-grid",
    minW: 6,
    minH: 3,
    defaultProps: {},
  },
  {
    id: "todo-list",
    type: "tasks",
    title: "Quick Tasks",
    description: "Your immediate to-do list.",
    componentId: "todo-list",
    minW: 4,
    minH: 4,
    defaultProps: {},
  },
  {
    id: "goal-tracker",
    type: "goals",
    title: "Goal Progress",
    description: "Track the progress of your active goals.",
    componentId: "goal-tracker",
    minW: 4,
    minH: 4,
    defaultProps: { initialGoals } as GoalTrackerProps,
  },
  {
    id: "goals-display",
    type: "goals",
    title: "All Goals",
    description: "View all your defined goals.",
    componentId: "goals-display",
    minW: 6,
    minH: 4,
    defaultProps: { initialGoals } as GoalsDisplayProps,
  },
  {
    id: "recent-journal",
    type: "journal",
    title: "Recent Journal Entries",
    description: "A quick look at your latest journal entries.",
    componentId: "journal-list",
    minW: 4,
    minH: 4,
    defaultProps: { limit: 3 } as JournalListProps,
  },
  {
    id: "advanced-stats",
    type: "analytics",
    title: "Advanced Analytics",
    description: "Detailed analytical insights into your data.",
    componentId: "advanced-stats-grid",
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
    componentId: "placeholder-infographics",
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
    componentId: "welcome-widget",
    minW: 2,
    minH: 1,
    defaultProps: {},
  },
];
