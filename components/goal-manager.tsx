"use client";

import { useState, useMemo } from "react";
import { useGoals } from "@/hooks/use-goals";
import { CreateGoalModal } from "@/components/create-goal-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit3, Calendar, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import type { Database } from "@/lib/supabase/types";
import { goalSchema } from "@/lib/validators";
import { z } from "zod";
import { ChartContainer, ChartPrimitive } from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

type Goal = Database["public"]["Tables"]["goals"]["Row"] & {
  tags: string[] | null;
};
type GoalFormValues = z.infer<typeof goalSchema>;

const statusConfig = {
  pending: {
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: "⚪ Not Started",
    chartColor: "#A0AEC0",
  },
  in_progress: {
    color: "bg-green-100 text-green-800 border-green-200",
    icon: "🟢 On Track",
    chartColor: "#48BB78",
  },
  completed: {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: "✅ Completed",
    chartColor: "#4299E1",
  },
};

export function GoalManager() {
  const { goals, isLoading, error, isMutating, addGoal, updateGoal } =
    useGoals();
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleEditGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    setModalOpen(true);
  };

  const handleAddGoal = () => {
    setSelectedGoal(null);
    setModalOpen(true);
  };

  const handleSaveGoal = async (goalData: GoalFormValues, goalId?: string) => {
    if (goalId) {
      await updateGoal(goalId, goalData);
    } else {
      await addGoal(goalData);
    }
    setModalOpen(false);
  };

  const filteredAndSortedGoals = useMemo(() => {
    const filtered = goals.filter((goal) => {
      const matchesStatus =
        statusFilter === "all" || goal.status === statusFilter;
      const matchesSearch =
        goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (goal.description &&
          goal.description.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesStatus && matchesSearch;
    });

    filtered.sort((a, b) => {
      if (sortBy === "created_at") {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
      if (sortBy === "target_date") {
        if (!a.target_date && !b.target_date) return 0;
        if (!a.target_date) return 1;
        if (!b.target_date) return -1;
        return (
          new Date(a.target_date).getTime() - new Date(b.target_date).getTime()
        );
      }
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return filtered;
  }, [goals, statusFilter, sortBy, searchTerm]);

  if (isLoading && !isMutating) {
    return (
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Target className="h-5 w-5 text-slate-600" />
            My Strategic Goals
          </CardTitle>
          <Skeleton className="h-9 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) return <div>Failed to load goals. Error: {error.message}</div>;

  const totalGoals = filteredAndSortedGoals.length;
  const completedGoals = filteredAndSortedGoals.filter(
    (g) => g.status === "completed",
  ).length;
  const onTrackGoals = filteredAndSortedGoals.filter(
    (g) => g.status === "in_progress",
  ).length;
  const notStartedGoals = filteredAndSortedGoals.filter(
    (g) => g.status === "pending",
  ).length;

  const chartData = [
    {
      name: "Completed",
      value: completedGoals,
      color: statusConfig.completed.chartColor,
    },
    {
      name: "On Track",
      value: onTrackGoals,
      color: statusConfig.in_progress.chartColor,
    },
    {
      name: "Not Started",
      value: notStartedGoals,
      color: statusConfig.pending.chartColor,
    },
  ].filter((data) => data.value > 0);

  const chartConfig = {
    completed: {
      label: "Completed",
      color: statusConfig.completed.chartColor,
    },
    onTrack: {
      label: "On Track",
      color: statusConfig.in_progress.chartColor,
    },
    notStarted: {
      label: "Not Started",
      color: statusConfig.pending.chartColor,
    },
  };

  return (
    <>
      <CreateGoalModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSaveOrUpdate={handleSaveGoal}
        isSaving={isMutating}
        initialData={selectedGoal}
      />
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Target className="h-5 w-5 text-slate-600" />
            My Strategic Goals
          </CardTitle>
          <Button
            onClick={handleAddGoal}
            size="sm"
            className="bg-slate-900 hover:bg-slate-800 text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add New Goal
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-4 mb-4">
            <Input
              placeholder="Search goals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Newest First</SelectItem>
                <SelectItem value="target_date">Target Date</SelectItem>
                <SelectItem value="title">Title (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredAndSortedGoals.length > 0 && (
            <ChartContainer config={chartConfig} className="h-48 w-full">
              <ChartPrimitive.PieChart>
                <ChartPrimitive.Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                >
                  {chartData.map((entry, index) => (
                    <ChartPrimitive.Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                    />
                  ))}
                </ChartPrimitive.Pie>
                <ChartPrimitive.Legend />
              </ChartPrimitive.PieChart>
            </ChartContainer>
          )}

          {filteredAndSortedGoals.length > 0 ? (
            filteredAndSortedGoals.map((goal) => (
              <Card
                key={goal.id}
                className="border border-slate-200 hover:border-slate-300 transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-slate-900 text-sm leading-tight">
                          {goal.title}
                        </h3>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs font-medium shrink-0",
                            statusConfig[
                              goal.status as keyof typeof statusConfig
                            ]?.color,
                          )}
                        >
                          {
                            statusConfig[
                              goal.status as keyof typeof statusConfig
                            ]?.icon
                          }
                        </Badge>
                      </div>

                      {goal.target_date && (
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                          <Calendar className="h-3 w-3" />
                          <span>Due: {goal.target_date}</span>
                        </div>
                      )}

                      {goal.description && (
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {goal.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditGoal(goal)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100 shrink-0"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <EmptyState
              title="No goals found"
              description="No goals match your current filters. Try adjusting your search or filter settings."
              actionLabel="Clear Filters"
              onAction={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setSortBy("created_at");
              }}
            />
          )}

          {goals.length > 0 && (
            <div className="pt-4 border-t border-slate-100">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">Total Goals</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {totalGoals}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">Completed</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {completedGoals}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">On Track</p>
                  <p className="text-lg font-semibold text-green-600">
                    {onTrackGoals}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">Not Started</p>
                  <p className="text-lg font-semibold text-gray-600">
                    {notStartedGoals}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
