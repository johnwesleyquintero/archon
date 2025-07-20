"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardWidgetProps {
  id: string;
  title: string;
  children: React.ReactNode;
  isVisible: boolean;
  onToggleVisibility: (id: string, isVisible: boolean) => void;
  className?: string;
}

export function DashboardWidget({
  id,
  title,
  children,
  isVisible,
  onToggleVisibility,
  className,
}: DashboardWidgetProps) {
  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <GripVertical className="h-5 w-5 text-slate-400 cursor-grab react-grid-drag-handle" />
          {title}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleVisibility(id, !isVisible)}
          className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          {isVisible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      <CardContent className="flex-1 p-4 pt-0">
        {isVisible ? (
          children
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">
            Widget is hidden. Click the eye icon to show.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
