"use client";

import type React from "react";

import { CheckCircle, Clock, Target, TrendingUp, Zap } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AdvancedStatCardProps {
  title: string;
  value: string | number;
  label: string;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "blue" | "green" | "purple" | "orange" | "red";
  className?: string;
}

const colorVariants = {
  blue: {
    bg: "bg-blue-50",
    icon: "text-blue-600",
    trend: "text-blue-600",
  },
  green: {
    bg: "bg-green-50",
    icon: "text-green-600",
    trend: "text-green-600",
  },
  purple: {
    bg: "bg-purple-50",
    icon: "text-purple-600",
    trend: "text-purple-600",
  },
  orange: {
    bg: "bg-orange-50",
    icon: "text-orange-600",
    trend: "text-orange-600",
  },
  red: {
    bg: "bg-red-50",
    icon: "text-red-600",
    trend: "text-red-600",
  },
};

function AdvancedStatCard({
  title,
  value,
  label,
  icon: Icon,
  trend,
  color = "blue",
  className,
}: AdvancedStatCardProps) {
  const colorClasses = colorVariants[color];

  return (
    <Card
      className={cn(
        "hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-0 shadow-sm",
        className,
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", colorClasses.bg)}>
                <Icon className={cn("h-5 w-5", colorClasses.icon)} />
              </div>
              <p className="text-sm font-medium text-slate-600">{title}</p>
            </div>

            <div className="space-y-1">
              <p className="text-3xl font-bold text-slate-900">{value}</p>
              <p className="text-sm text-slate-500">{label}</p>
            </div>
          </div>

          {trend && (
            <div className="text-right">
              <div
                className={cn(
                  "flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-full",
                  trend.isPositive
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700",
                )}
              >
                <TrendingUp
                  className={cn(
                    "h-3 w-3",
                    trend.isPositive ? "rotate-0" : "rotate-180 transform",
                  )}
                />
                <span>
                  {trend.isPositive ? "+" : ""}
                  {trend.value}%
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function AdvancedStatsGrid() {
  const stats = [
    {
      title: "Tasks Completed",
      value: "24",
      label: "This Week",
      icon: CheckCircle,
      color: "green" as const,
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
      color: "blue" as const,
      trend: {
        value: 12,
        isPositive: true,
      },
    },
    {
      title: "Active Streaks",
      value: "7",
      label: "Daily Habits",
      icon: Zap,
      color: "purple" as const,
      trend: {
        value: 15,
        isPositive: true,
      },
    },
    {
      title: "Focus Time",
      value: "4.2h",
      label: "Today",
      icon: Clock,
      color: "orange" as const,
      trend: {
        value: 8,
        isPositive: true,
      },
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <AdvancedStatCard
          key={index}
          title={stat.title}
          value={stat.value}
          label={stat.label}
          icon={stat.icon}
          color={stat.color}
          trend={stat.trend}
        />
      ))}
    </div>
  );
}
