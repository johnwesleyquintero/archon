import { StatsGrid } from "@/components/stats-grid";
import { GoalTrackerWithAttachments } from "@/components/goal-tracker-with-attachments";
import { TodoList } from "@/components/todo-list";
import { PlaceholderInfographics } from "@/components/placeholder-infographics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { CustomizableDashboardLayout } from "@/components/customizable-dashboard-layout";
import { DashboardWidget } from "@/components/dashboard-widget";
import {
  useDashboardSettings,
  WidgetLayout,
} from "@/hooks/use-dashboard-settings";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardWidgetConfig {
  id: string;
  title: string;
  component: React.ReactNode;
  defaultSize: { w: number; h: number };
}

export default function DashboardPage() {
  const { layout, isLoading, handleLayoutChange, toggleWidgetVisibility } =
    useDashboardSettings();

  const widgets: DashboardWidgetConfig[] = [
    {
      id: "stats-grid",
      title: "Statistics Overview",
      component: <StatsGrid />,
      defaultSize: { w: 4, h: 2 },
    },
    {
      id: "goal-tracker",
      title: "My Strategic Goals",
      component: <GoalTrackerWithAttachments />,
      defaultSize: { w: 4, h: 3 },
    },
    {
      id: "task-list",
      title: "My Tasks",
      component: <TodoList />, // TodoList handles its own onAddTaskClick internally
      defaultSize: { w: 4, h: 3 },
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-4 md:p-6">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Skeleton className="h-[120px] w-full" />
          <Skeleton className="h-[120px] w-full" />
          <Skeleton className="h-[120px] w-full" />
          <Skeleton className="h-[120px] w-full" />
        </div>
        <Skeleton className="h-[200px] w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
        <Skeleton className="h-[250px] w-full" />
      </div>
    );
  }

  const visibleWidgets = widgets.filter((widget: DashboardWidgetConfig) => {
    const item = layout.find((l) => l.i === widget.id);
    return item ? item.isVisible : true; // Default to visible if not in layout
  });

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <CustomizableDashboardLayout
        widgets={visibleWidgets.map((widget: DashboardWidgetConfig) => ({
          id: widget.id,
          component: (
            <DashboardWidget
              id={widget.id}
              title={widget.title}
              isVisible={
                layout.find((l) => l.i === widget.id)?.isVisible ?? true
              }
              onToggleVisibility={toggleWidgetVisibility}
            >
              {widget.component}
            </DashboardWidget>
          ),
          defaultSize: widget.defaultSize,
        }))}
        initialLayout={layout}
        onLayoutChange={handleLayoutChange}
      />

      <PlaceholderInfographics />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Activity className="h-5 w-5 text-slate-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 text-sm">
            Recent activity feed will go here.
          </p>
          {/* Placeholder for activity feed */}
          <div className="h-40 bg-slate-50 rounded-md mt-4 flex items-center justify-center text-slate-400 text-sm">
            Activity Feed Placeholder
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
