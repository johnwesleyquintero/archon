export type WidgetConfig = {
  title: string;
  // Add other generic widget configuration properties here
  [key: string]: unknown;
};

export type AllWidgetConfigs = Record<string, WidgetConfig>;

// Example of a specific widget's config
export type TodoWidgetConfig = WidgetConfig & {
  filters: {
    status: "all" | "completed" | "incomplete";
  };
  sort: {
    by: "dueDate" | "priority";
    order: "asc" | "desc";
  };
};

export type Widget<P = Record<string, unknown>> = {
  id: string;
  type: string;
  title: string;
  description: string;
  componentId: string;
  minW: number;
  minH: number;
  maxW?: number;
  maxH?: number;
  defaultProps?: P;
};
