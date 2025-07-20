"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, CreditCard, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function StatsGrid() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Simulate 2 seconds loading time
    return () => clearTimeout(timer);
  }, []);

  const renderCardContent = (value: string, percentage: string) => (
    <>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-slate-500">{percentage}</p>
    </>
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
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-slate-500" />
        </CardHeader>
        <CardContent>
          {isLoading
            ? renderSkeletonContent()
            : renderCardContent("$45,231.89", "+20.1% from last month")}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
          <Users className="h-4 w-4 text-slate-500" />
        </CardHeader>
        <CardContent>
          {isLoading
            ? renderSkeletonContent()
            : renderCardContent("+2350", "+180.1% from last month")}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sales</CardTitle>
          <CreditCard className="h-4 w-4 text-slate-500" />
        </CardHeader>
        <CardContent>
          {isLoading
            ? renderSkeletonContent()
            : renderCardContent("+12,234", "+19% from last month")}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Now</CardTitle>
          <Activity className="h-4 w-4 text-slate-500" />
        </CardHeader>
        <CardContent>
          {isLoading
            ? renderSkeletonContent()
            : renderCardContent("+573", "+201 since last hour")}
        </CardContent>
      </Card>
    </div>
  );
}
