"use client";

import React from "react";
import { Layout } from "react-grid-layout";
import "/node_modules/react-grid-layout/css/styles.css";
import "/node_modules/react-resizable/css/styles.css";

import { MobileNavSheet } from "@/components/dashboard/mobile-nav-sheet";
import { SearchBar } from "@/components/dashboard/search-bar";
import { NotificationsButton } from "@/components/dashboard/notifications-button";
import { UserMenu } from "@/components/dashboard/user-menu";
import { DashboardWidget } from "@/components/dashboard-widget";
import {
  useDashboardSettings,
  WidgetLayout,
} from "@/hooks/use-dashboard-settings";

interface DashboardWidgetConfig {
  id: string;
  title: string;
  component: React.ReactNode;
  defaultSize: { w: number; h: number };
}

interface CustomizableDashboardLayoutProps {
  widgets: DashboardWidgetConfig[];
  initialLayout: WidgetLayout[];
  onLayoutChange: (layout: Layout[]) => void;
}

export function CustomizableDashboardLayout({
  widgets,
  initialLayout,
  onLayoutChange,
}: CustomizableDashboardLayoutProps) {
  const { toggleWidgetVisibility } = useDashboardSettings();

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <MobileNavSheet />
        <SearchBar />
        <NotificationsButton />
        <UserMenu />
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
        </div>
        <div
          className="grid flex-1 auto-rows-max items-start gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          x-chunk="dashboard-05-chunk-0"
        >
          {widgets.map((widget) => (
            <DashboardWidget
              key={widget.id}
              id={widget.id}
              title={widget.title}
              isVisible={
                initialLayout.find((l) => l.i === widget.id)?.isVisible ?? true
              }
              onToggleVisibility={toggleWidgetVisibility}
            >
              {widget.component}
            </DashboardWidget>
          ))}
        </div>
      </main>
    </div>
  );
}
