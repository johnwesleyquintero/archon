"use client"

import { useState } from "react"
import { CustomizableDashboardLayout, type DashboardWidget } from "@/components/customizable-dashboard-layout"
import { DashboardWidget as Widget } from "@/components/dashboard-widget"
import { StatsGrid } from "@/components/stats-grid"
import { TaskList } from "@/components/task-list"
import { GoalTracker } from "@/components/goal-tracker"
import { JournalList } from "@/components/journal-list"
import { PlaceholderInfographics } from "@/components/placeholder-infographics"
import { AdvancedStatsGrid } from "@/components/advanced-stats-grid"
import type { Layout } from "react-grid-layout"

export default function DashboardPage() {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([
    {
      id: "stats",
      title: "Statistics",
      component: (
        <Widget title="Statistics" description="Overview of your productivity metrics">
          <StatsGrid />
        </Widget>
      ),
      defaultLayout: { w: 12, h: 4, x: 0, y: 0, minW: 6, minH: 3 },
      visible: true,
    },
    {
      id: "tasks",
      title: "Recent Tasks",
      component: (
        <Widget title="Recent Tasks" description="Your latest task updates">
          <TaskList />
        </Widget>
      ),
      defaultLayout: { w: 6, h: 6, x: 0, y: 4, minW: 4, minH: 4 },
      visible: true,
    },
    {
      id: "goals",
      title: "Goal Progress",
      component: (
        <Widget title="Goal Progress" description="Track your goal achievements">
          <GoalTracker />
        </Widget>
      ),
      defaultLayout: { w: 6, h: 6, x: 6, y: 4, minW: 4, minH: 4 },
      visible: true,
    },
    {
      id: "journal",
      title: "Journal Entries",
      component: (
        <Widget title="Journal Entries" description="Your recent thoughts and reflections">
          <JournalList />
        </Widget>
      ),
      defaultLayout: { w: 6, h: 5, x: 0, y: 10, minW: 4, minH: 4 },
      visible: true,
    },
    {
      id: "infographics",
      title: "Insights",
      component: (
        <Widget title="Insights" description="Visual analytics and trends">
          <PlaceholderInfographics />
        </Widget>
      ),
      defaultLayout: { w: 6, h: 5, x: 6, y: 10, minW: 4, minH: 4 },
      visible: true,
    },
    {
      id: "advanced-stats",
      title: "Advanced Analytics",
      component: (
        <Widget title="Advanced Analytics" description="Detailed performance metrics">
          <AdvancedStatsGrid />
        </Widget>
      ),
      defaultLayout: { w: 12, h: 6, x: 0, y: 15, minW: 6, minH: 4 },
      visible: false,
    },
  ])

  const handleLayoutChange = (layout: Layout[]) => {
    // Save layout to localStorage or database
    console.log("Layout changed:", layout)
  }

  const handleWidgetVisibilityChange = (widgetId: string, visible: boolean) => {
    setWidgets((prev) => prev.map((widget) => (widget.id === widgetId ? { ...widget, visible } : widget)))
  }

  return (
    <div className="p-6">
      <CustomizableDashboardLayout
        widgets={widgets}
        onLayoutChange={handleLayoutChange}
        onWidgetVisibilityChange={handleWidgetVisibilityChange}
      />
    </div>
  )
}
