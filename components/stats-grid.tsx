"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Target, Zap, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  label: string
  icon: React.ElementType
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

function StatCard({ title, value, label, icon: Icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn("hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-slate-900">{value}</p>
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-slate-500" />
                <p className="text-sm text-slate-600">{label}</p>
              </div>
            </div>
          </div>
          {trend && (
            <div className="text-right">
              <div
                className={cn(
                  "flex items-center gap-1 text-sm font-medium",
                  trend.isPositive ? "text-green-600" : "text-red-600",
                )}
              >
                <TrendingUp className={cn("h-4 w-4", trend.isPositive ? "rotate-0" : "rotate-180 transform")} />
                <span>
                  {trend.isPositive ? "+" : ""}
                  {trend.value}%
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">vs last week</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function StatsGrid() {
  const stats = [
    {
      title: "Tasks Completed",
      value: "12",
      label: "This Week",
      icon: CheckCircle,
      trend: {
        value: 20,
        isPositive: true,
      },
    },
    {
      title: "Goal Progress",
      value: "78%",
      label: "Average Completion",
      icon: Target,
      trend: {
        value: 12,
        isPositive: true,
      },
    },
    {
      title: "Active Habits",
      value: "3",
      label: "Daily Routines",
      icon: Zap,
      trend: {
        value: 0,
        isPositive: true,
      },
    },
    {
      title: "Productivity Score",
      value: "94",
      label: "This Month",
      icon: TrendingUp,
      trend: {
        value: 8,
        isPositive: true,
      },
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          label={stat.label}
          icon={stat.icon}
          trend={stat.trend}
        />
      ))}
    </div>
  )
}
