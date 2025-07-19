"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, LineChart, PieChart } from "lucide-react" // Using Lucide icons for placeholders

export function PlaceholderInfographics() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sales Trend</CardTitle>
          <LineChart className="h-4 w-4 text-slate-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$1,234,567</div>
          <p className="text-xs text-slate-500">Year-to-date sales</p>
          <div className="mt-4 h-32 w-full bg-slate-100 rounded-md flex items-center justify-center text-slate-400 text-sm">
            Line Chart Placeholder
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">User Acquisition</CardTitle>
          <BarChart className="h-4 w-4 text-slate-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">8,765 New Users</div>
          <p className="text-xs text-slate-500">Last 30 days</p>
          <div className="mt-4 h-32 w-full bg-slate-100 rounded-md flex items-center justify-center text-slate-400 text-sm">
            Bar Chart Placeholder
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Revenue Breakdown</CardTitle>
          <PieChart className="h-4 w-4 text-slate-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Product Categories</div>
          <p className="text-xs text-slate-500">Distribution of revenue</p>
          <div className="mt-4 h-32 w-full bg-slate-100 rounded-md flex items-center justify-center text-slate-400 text-sm">
            Pie Chart Placeholder
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
