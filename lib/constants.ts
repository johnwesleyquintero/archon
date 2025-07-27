import { Home, Target, ListTodo, BookOpen, Settings, LucideIcon, User } from "lucide-react";

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
  { href: "/settings", label: "Settings", icon: Settings },
];

export const PROFILE_NAV_ITEM: NavItem = {
  href: "/settings",
  label: "Profile",
  icon: User,
};

export const SIGN_OUT_LABEL = "Sign Out";
export const SIGNING_OUT_LABEL = "Signing out...";
