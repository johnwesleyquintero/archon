import React from "react";

interface DashboardWidgetProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  isCustomizing?: boolean;
  onRemove?: () => void;
  onSaveConfig?: () => void;
}

export function DashboardWidget({
  title,
  children,
  className,
}: DashboardWidgetProps) {
  return (
    <div
      className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className || ""}`}
    >
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">
          {title}
        </h3>
      </div>
      <div className="p-6 pt-0">{children}</div>
    </div>
  );
}
