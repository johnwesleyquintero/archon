import React from "react";

interface DashboardWidgetProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  isCustomizing: boolean;
  onRemove: () => void;
  onSaveConfig: (config: { title: string }) => void;
}

export function DashboardWidget({
  title,
  children,
  className,
  isCustomizing: _isCustomizing,
  onRemove: _onRemove,
  onSaveConfig: _onSaveConfig,
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
