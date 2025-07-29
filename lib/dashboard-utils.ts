import { type Layout } from "react-grid-layout";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { DEFAULT_LAYOUT } from "@/lib/layouts";

// This should match the DashboardLayoutItem in customizable-dashboard-layout.tsx
export interface CustomLayout extends Layout {
  isVisible: boolean;
}

export function mergeLayouts(
  storedLayout: CustomLayout[],
  defaultLayout: CustomLayout[],
): CustomLayout[] {
  return defaultLayout.map((defaultWidget) => {
    const storedWidget = storedLayout.find((sl) => sl.i === defaultWidget.i);
    return {
      ...defaultWidget,
      ...storedWidget,
      // Ensure isVisible is always a boolean, defaulting to true.
      isVisible: storedWidget?.isVisible ?? defaultWidget.isVisible ?? true,
    };
  });
}
