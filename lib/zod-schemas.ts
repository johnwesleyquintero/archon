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
  title: Zod.string(), // Add title to schema
});

export const widgetLayoutsSchema = Zod.array(widgetLayoutSchema);

export const journalEntryInsertSchema = Zod.object({
  title: Zod.string().min(1, "Title is required."),
  content: Zod.string().nullable().optional(),
  attachments: Zod.any().nullable().optional(),
  user_id: Zod.string(),
});

export const journalEntryUpdateSchema = Zod.object({
  title: Zod.string().min(1, "Title cannot be empty.").optional(),
  content: Zod.string().nullable().optional(),
  attachments: Zod.any().nullable().optional(),
});

export const messageSchema = Zod.object({
  role: Zod.enum(["user", "assistant", "system"]),
  content: Zod.string(),
});

export const messagesSchema = Zod.array(messageSchema);

export const taskInsertSchema = Zod.object({
  title: Zod.string().min(1, "Title is required."),
  user_id: Zod.string(),
  is_completed: Zod.boolean().optional(),
  due_date: Zod.string().nullable().optional(),
  priority: Zod.enum(["low", "medium", "high"]).nullable().optional(),
  category: Zod.string().nullable().optional(),
  tags: Zod.array(Zod.string()).nullable().optional(),
  parent_id: Zod.string().nullable().optional(), // Added for subtasks
  recurrence_pattern: Zod.string().nullable().optional(),
  recurrence_end_date: Zod.string().nullable().optional(),
  original_task_id: Zod.string().nullable().optional(),
  shared_with_user_ids: Zod.array(Zod.string()).nullable().optional(),
  notes: Zod.string()
    .max(1000, { message: "Notes are too long." })
    .nullable()
    .optional(), // New field for task notes
  goal_id: Zod.string().nullable().optional(),
  status: Zod.enum(["todo", "in_progress", "done", "canceled"])
    .optional()
    .nullable(), // Modified status field
});

export const taskUpdateSchema = Zod.object({
  title: Zod.string().min(1, "Title cannot be empty.").optional(),
  is_completed: Zod.boolean().optional(),
  due_date: Zod.string().nullable().optional(),
  priority: Zod.enum(["low", "medium", "high"]).nullable().optional(),
  category: Zod.string().nullable().optional(),
  tags: Zod.array(Zod.string()).nullable().optional(),
  status: Zod.enum(["todo", "in_progress", "done", "canceled"])
    .optional()
    .nullable(), // Modified status field
  parent_id: Zod.string().nullable().optional(), // Added for subtasks
  recurrence_pattern: Zod.string().nullable().optional(),
  recurrence_end_date: Zod.string().nullable().optional(),
  original_task_id: Zod.string().nullable().optional(),
  shared_with_user_ids: Zod.array(Zod.string()).nullable().optional(),
  notes: Zod.string()
    .max(1000, { message: "Notes are too long." })
    .nullable()
    .optional(), // New field for task notes
  position: Zod.number().nullable().optional(), // New field for task position
  goal_id: Zod.string().nullable().optional(),
});
