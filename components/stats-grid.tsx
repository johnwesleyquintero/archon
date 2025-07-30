"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ListTodo, Loader2, CalendarDays } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getTaskStats } from "@/lib/database/dashboard";

interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  tasksCompletedThisMonth: number;
}

export function StatsGrid() {
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const taskStats = await getTaskStats();
        setStats(taskStats);
      } catch (error) {
        console.error("Failed to fetch task stats:", error);
        setStats(null);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchStats();
  }, []);

  const renderCardContent = (value: string | number) => (
    <div className="text-2xl font-bold">{value}</div>
  );

  const renderSkeletonContent = () => (
    <div className="space-y-2">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          <ListTodo className="h-4 w-4 text-slate-500" />
        </CardHeader>
        <CardContent>
          {isLoading
            ? renderSkeletonContent()
            : renderCardContent(stats?.totalTasks ?? 0)}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
          <CheckCircle className="h-4 w-4 text-slate-500" />
        </CardHeader>
        <CardContent>
          {isLoading
            ? renderSkeletonContent()
            : renderCardContent(stats?.completedTasks ?? 0)}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
          <Loader2 className="h-4 w-4 text-slate-500" />
        </CardHeader>
        <CardContent>
          {isLoading
            ? renderSkeletonContent()
            : renderCardContent(stats?.pendingTasks ?? 0)}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Completed This Month
          </CardTitle>
          <CalendarDays className="h-4 w-4 text-slate-500" />
        </CardHeader>
        <CardContent>
          {isLoading
            ? renderSkeletonContent()
            : renderCardContent(stats?.tasksCompletedThisMonth ?? 0)}
        </CardContent>
      </Card>
    </div>
  );
}
