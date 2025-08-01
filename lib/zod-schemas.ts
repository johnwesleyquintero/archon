import * as Zod from "zod";

export const widgetLayoutSchema = Zod.object({
  i: Zod.string(),
  x: Zod.number(),
  y: Zod.number(),
  w: Zod.number(),
  h: Zod.number(),
  minW: Zod.number().optional(),
  maxW: Zod.number().optional(),
  minH: Zod.number().optional(),
  maxH: Zod.number().optional(),
  moved: Zod.boolean().optional(),
  static: Zod.boolean().optional(),
  isDraggable: Zod.boolean().optional(),
  isResizable: Zod.boolean().optional(),
  isVisible: Zod.boolean().default(true),
});

export const widgetLayoutsSchema = Zod.array(widgetLayoutSchema);
