# Dashboard Widget System

## Overview
The dashboard widget system provides a customizable grid layout for displaying various widgets. It supports drag-and-drop repositioning, resizing, and toggling widget visibility.

## Components
- `CustomizableDashboardLayout`: Main container component that orchestrates the grid and widget interactions.
- `DashboardWidget`: Individual container for each widget, handling its specific rendering and state.
- `DashboardControlBar`: Provides user controls for entering/exiting customization mode, saving layouts, and managing widget visibility.

## Usage
The system is primarily used through the `CustomizableDashboardLayout` component.

```tsx
import { CustomizableDashboardLayout } from '@/components/customizable-dashboard-layout';
import { StatsGrid } from '@/components/stats-grid'; // Example widget component

const MyDashboardPage = () => {
  const widgets = [
    {
      id: "stats",
      type: "stats",
      title: "Statistics",
      component: StatsGrid,
      minW: 4,
      minH: 2
    },
    // ... other widget definitions
  ];

  const defaultLayout = [
    { i: 'stats', x: 0, y: 0, w: 4, h: 2 },
    // ... other layout definitions
  ];

  return (
    <CustomizableDashboardLayout
      widgets={widgets}
      initialLayout={defaultLayout}
    />
  );
}
```

## Widget Definition
Each widget passed to the `widgets` prop must be an object with the following properties:

- `id` (string): A unique identifier for the widget.
- `type` (string): A type for categorizing the widget.
- `title` (string): The title displayed in the widget's header.
- `component` (React.ComponentType): The React component to render inside the widget.
- `defaultProps` (object, optional): Props to pass to the widget component.
- `minW` (number, optional): The minimum width of the widget in grid units.
- `minH` (number, optional): The minimum height of the widget in grid units.
- `maxW` (number, optional): The maximum width of the widget in grid units.
- `maxH` (number, optional): The maximum height of the widget in grid units.

## Customization API
The layout is built on top of `react-grid-layout` and exposes the following functionality through the `DashboardControlBar`:

- **Toggle Customization Mode**: Allows users to drag, drop, and resize widgets.
- **Save Layout**: Persists the current layout configuration to user preferences (e.g., via Supabase).
- **Reset Layout**: Reverts the layout to its default state.
- **Toggle Widget Visibility**: Allows users to show or hide specific widgets from the dashboard.
