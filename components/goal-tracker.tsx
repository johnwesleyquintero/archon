"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, Edit3, Calendar, Target } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState } from "@/components/error-state"
import { EmptyState } from "@/components/empty-state"
import { getGoals } from "@/lib/database/goals" // Import the Server Action
import type { Goal } from "@/lib/supabase/types"

const statusConfig = {
  pending: { color: "bg-gray-100 text-gray-800 border-gray-200", icon: "⚪ Not Started" },
  in_progress: { color: "bg-green-100 text-green-800 border-green-200", icon: "🟢 On Track" },
  completed: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: "✅ Completed" },
  at_risk: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: "🟡 At Risk" },
}

export function GoalTracker() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGoals = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await getGoals()
      if (fetchError) {
        setError(fetchError.message)
        setGoals([])
      } else {
        setGoals(data || [])
      }
    } catch (err: any) {
      setError(err.message || "Failed to load goals.")
      setGoals([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchGoals()
  }, [])

  const handleEditGoal = (goalId: string) => {
    // In a real app, you would open an edit modal here
    console.log("Edit goal:", goalId)
  }

  const handleAddGoal = () => {
    // In a real app, you would open a create goal modal here
    console.log("Add new goal")
  }

  if (isLoading) {
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
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Target className="h-5 w-5 text-slate-600" />
            My Strategic Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorState message={error} onRetry={fetchGoals} />
        </CardContent>
      </Card>
    )
  }

  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.status === "completed").length;
  const onTrackGoals = goals.filter((g) => g.status === "in_progress").length;
  const atRiskGoals = goals.filter((g) => g.status === "at_risk").length;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Target className="h-5 w-5 text-slate-600" />
          My Strategic Goals
        </CardTitle>
        <Button onClick={handleAddGoal} size="sm" className="bg-slate-900 hover:bg-slate-800 text-white">
          <Plus className="h-4 w-4 mr-1" />
          Add New Goal
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.length > 0 ? (
          goals.map((goal) => (
            <Card key={goal.id} className="border border-slate-200 hover:border-slate-300 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Goal Title and Status */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-slate-900 text-sm leading-tight">{goal.title}</h3>
                      <Badge
                        variant="outline"
                        className={cn("text-xs font-medium shrink-0", statusConfig[goal.status].color)}
                      >
                        {statusConfig[goal.status].icon}
                      </Badge>
                    </div>

                    {/* Target Date */}
                    {goal.target_date && (
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        <Calendar className="h-3 w-3" />
                        <span>Due: {goal.target_date}</span>
                      </div>
                    )}

                    {/* Progress Bar (assuming progress is a number 0-100) */}
                    {typeof goal.progress === 'number' && (
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-600">Progress</span>
                          <span className="text-xs font-medium text-slate-900">{goal.progress}%</span>
                        </div>
                        <Progress value={goal.progress} className="h-2" />
                      </div>
                    )}

                    {/* Description */}
                    {goal.description && <p className="text-xs text-slate-500 leading-relaxed">{goal.description}</p>}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditGoal(goal.id)}
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
            icon={<Target className="h-12 w-12 text-slate-300" />}
            title="No goals set yet"
            description="Create your first strategic goal to get started."
            buttonText="Add New Goal"
            onButtonClick={handleAddGoal}
          />
        )}

        {/* Summary Stats */}
        {goals.length > 0 && (
          <div className="pt-4 border-t border-slate-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="space-y-1">
                <p className="text-xs text-slate-500">Total Goals</p>
                <p className="text-lg font-semibold text-slate-900">{totalGoals}</p>
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
                <p className="text-xs text-slate-500">At Risk</p>
                <p className="text-lg font-semibold text-yellow-600">
                  {atRiskGoals}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
