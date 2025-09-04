"use client";

import React from "react";

import { Widget } from "@/lib/types/widget-types";

import { AddWidgetDialog } from "../../add-widget-dialog";
import { CustomizationHelpText } from "../customization-help-text";

import { DashboardControlBar } from "./dashboard-control-bar";

interface DashboardCustomizationControlsProps<
  P extends Record<string, unknown>,
> {
  isCustomizing: boolean;
  onToggleCustomization: () => void;
  onSaveLayout: () => void;
  onCancelCustomization: () => void;
  onResetLayout: () => void;
  userName?: string;
  availableWidgets: Widget<P>[];
  onAddWidget: (_widgetId: string) => void;
}

export function DashboardCustomizationControls<
  P extends Record<string, unknown>,
>({
  isCustomizing,
  onToggleCustomization,
  onSaveLayout,
  onCancelCustomization,
  onResetLayout,
  userName,
  availableWidgets,
  onAddWidget,
}: DashboardCustomizationControlsProps<P>) {
  return (
    <>
      <DashboardControlBar
        isCustomizing={isCustomizing}
        onToggleCustomization={onToggleCustomization}
        onSaveLayout={onSaveLayout}
        onCancelCustomization={onCancelCustomization}
        onResetLayout={onResetLayout}
        userName={userName}
      />

      {isCustomizing && <CustomizationHelpText />}

      {isCustomizing && (
        <AddWidgetDialog
          availableWidgets={availableWidgets}
          onAddWidget={onAddWidget}
        />
      )}
    </>
  );
}
