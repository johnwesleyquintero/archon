import { RotateCcw, Save, Settings, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DashboardControlBarProps {
  isCustomizing: boolean;
  onToggleCustomization: () => void;
  onSaveLayout: () => void;
  onCancelCustomization: () => void;
  onResetLayout: () => void;
  userName?: string;
}

export function DashboardControlBar({
  isCustomizing,
  onToggleCustomization,
  onSaveLayout,
  onCancelCustomization,
  onResetLayout,
}: DashboardControlBarProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        {isCustomizing && (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Customizing
          </Badge>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {isCustomizing ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onResetLayout}
              className="flex items-center space-x-1 bg-transparent"
              aria-label="Reset Dashboard Layout"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onCancelCustomization}
              className="flex items-center space-x-1"
              aria-label="Cancel Customization"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </Button>
            <Button
              size="sm"
              onClick={onSaveLayout}
              className="flex items-center space-x-1"
              aria-label="Save Layout"
            >
              <Save className="h-4 w-4" />
              <span>Save</span>
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleCustomization}
            className="flex items-center space-x-1 bg-transparent"
            aria-label="Customize Dashboard Layout"
          >
            <Settings className="h-4 w-4" />
            <span>Customize</span>
          </Button>
        )}
      </div>
    </div>
  );
}
