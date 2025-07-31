import { z } from "zod";

export const widgetLayoutSchema = z.object({
  i: z.string(),
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
  minW: z.number().optional(),
  maxW: z.number().optional(),
  minH: z.number().optional(),
  maxH: z.number().optional(),
  moved: z.boolean().optional(),
  static: z.boolean().optional(),
  isDraggable: z.boolean().optional(),
  isResizable: z.boolean().optional(),
  isVisible: z.boolean().default(true),
});

export const widgetLayoutsSchema = z.array(widgetLayoutSchema);
