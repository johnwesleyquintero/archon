"use client"

import { StatsGrid } from "@/components/stats-grid"

export function DashboardHeader() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, John!</h1>
        <p className="text-slate-600">Here's what's happening with your goals and tasks today.</p>
      </div>

      {/* Stats Grid */}
      <StatsGrid />
    </div>
  )
}
