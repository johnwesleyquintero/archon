import { Layout } from "react-grid-layout";

export interface WidgetLayout extends Layout {
  isVisible: boolean;
  title: string; // Add title to widget layout
}
