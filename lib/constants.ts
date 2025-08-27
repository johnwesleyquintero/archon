import {
  Home,
  Target,
  ListTodo,
  BookOpen,
  Kanban,
  Settings,
  LucideIcon,
} from "lucide-react";

import type { Database } from "@/lib/supabase/types";
import { Widget } from "@/lib/types/widget-types";

type Goal = Database["public"]["Tables"]["goals"]["Row"] & {
  tags: string[] | null;
};

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  sub?: NavItem[];
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/kanban", label: "Kanban", icon: Kanban },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    sub: [
      { href: "/settings/profile", label: "Profile", icon: Target },
      { href: "/settings/appearance", label: "Appearance", icon: Target },
    ],
  },
];

export const SIGN_OUT_LABEL = "Sign Out";
export const SIGNING_OUT_LABEL = "Signing out...";

export const getAvailableWidgets = (initialGoals: Goal[]): Widget[] => [
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
    defaultProps: { initialGoals },
  },
  {
    id: "goals-display",
    type: "goals",
    title: "All Goals",
    description: "View all your defined goals.",
    componentId: "goals-display",
    minW: 6,
    minH: 4,
    defaultProps: { initialGoals },
  },
  {
    id: "recent-journal",
    type: "journal",
    title: "Recent Journal Entries",
    description: "A quick look at your latest journal entries.",
    componentId: "journal-list",
    minW: 4,
    minH: 4,
    defaultProps: { limit: 3 },
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
    },
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
