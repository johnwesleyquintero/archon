"use client";

import React from "react";
import { Responsive, WidthProvider, Layout } from "react-grid-layout";

const ResponsiveGridLayout = WidthProvider(Responsive);
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
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: initialLayout }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={100}
          width={1200} // This will be overridden by WidthProvider
          onLayoutChange={onLayoutChange}
          isBounded={true}
        >
          {widgets.map((widget) => {
            const layoutItem = initialLayout.find((l) => l.i === widget.id);
            if (!layoutItem || !layoutItem.isVisible) {
              return null;
            }
            return (
              <div key={widget.id} data-grid={layoutItem}>
                <DashboardWidget
                  id={widget.id}
                  title={widget.title}
                  isVisible={layoutItem.isVisible ?? true}
                  onToggleVisibility={toggleWidgetVisibility}
                >
                  {widget.component}
                </DashboardWidget>
              </div>
            );
          })}
        </ResponsiveGridLayout>
      </main>
    </div>
  );
}
