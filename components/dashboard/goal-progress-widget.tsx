"use client";

import { BarChart, CheckCircle, Target } from "lucide-react";
import { useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useGoals } from "@/hooks/use-goals";
import { Goal } from "@/lib/types/goal";

export function GoalProgressWidget() {
  const { goals, isLoading, error } = useGoals();

  const activeGoals = useMemo(() => {
    return (
      goals?.filter((goal) => goal.status !== "completed").slice(0, 5) || []
    );
  }, [goals]);

  if (isLoading) {
    return (
      <Card className="col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Goal Progress</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Loading...</div>
          <p className="text-xs text-muted-foreground">Fetching your goals</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Goal Progress</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-sm text-red-500">Error: {error?.message}</div>
          <p className="text-xs text-muted-foreground">Failed to load goals.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Goal Progress</CardTitle>
        <BarChart className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {activeGoals.length === 0 ? (
          <div className="text-center py-4">
            <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No active goals.</p>
            <p className="text-xs text-muted-foreground">
              Set some goals to track your progress!
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[200px]">
            <div className="space-y-4 pr-4">
              {activeGoals.map((goal: Goal) => (
                <div key={goal.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{goal.title}</span>
                    <span className="text-muted-foreground">
                      {goal.current_progress ?? 0}%
                    </span>
                  </div>
                  <Progress
                    value={goal.current_progress ?? 0}
                    className="h-2"
                  />
                  {goal.target_date && (
                    <p className="text-xs text-muted-foreground">
                      Target: {new Date(goal.target_date).toLocaleDateString()}
                    </p>
                  )}
                  {goal.status === "completed" && (
                    <div className="flex items-center text-xs text-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" /> Completed
                    </div>
                  )}
                  <Separator className="my-2" />
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
