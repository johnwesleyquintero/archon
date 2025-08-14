import type React from "react";

import { AuthGuard } from "@/components/auth/auth-guard";
import { DashboardLayout } from "@/components/dashboard-layout";
import { CommandMenuProvider } from "@/contexts/command-menu-context";
import { DynamicCommandMenu } from "@/components/custom/dynamic-command-menu";
import { GlobalQuickAdd } from "@/components/custom/global-quick-add";
import { CommandMenuInitializer } from "@/components/custom/command-menu-initializer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <CommandMenuProvider>
        <CommandMenuInitializer />
        <DashboardLayout>{children}</DashboardLayout>
        <DynamicCommandMenu />
        <GlobalQuickAdd />
      </CommandMenuProvider>
    </AuthGuard>
  );
}
