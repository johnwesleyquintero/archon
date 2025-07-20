import { StatsGrid } from "@/components/stats-grid";
import { GoalTrackerWithAttachments } from "@/components/goal-tracker-with-attachments";
import { TodoList } from "@/components/todo-list";
import { PlaceholderInfographics } from "@/components/placeholder-infographics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <StatsGrid />

      <PlaceholderInfographics />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GoalTrackerWithAttachments />
        <TodoList />
      </div>

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
