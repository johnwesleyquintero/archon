import { z } from "zod";

export const authSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

export const taskPriorityEnum = z.enum(["low", "medium", "high"]);

export const taskSchema = z
  .object({
    title: z
      .string()
      .min(1, { message: "Task title cannot be empty." })
      .max(255, { message: "Task title is too long." }),
    dueDate: z
      .string()
      .datetime({ message: "Invalid due date." })
      .optional()
      .nullable(),
    priority: taskPriorityEnum,
    category: z
      .string()
      .max(50, { message: "Category name is too long." })
      .optional()
      .nullable(),
    tags: z.array(z.string().max(30, { message: "Tag is too long." })),
  })
  .required({
    title: true,
    priority: true,
    tags: true,
  })
  .strict();

export const profileSchema = z.object({
  fullName: z
    .string()
    .min(1, { message: "Full name cannot be empty." })
    .max(100, { message: "Full name is too long." }),
  username: z
    .string()
    .min(1, { message: "Username cannot be empty." })
    .max(50, { message: "Username is too long." }),
  avatar: z
    .string()
    .url({ message: "Invalid avatar URL." })
    .optional()
    .or(z.literal("")),
});

export const goalSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Goal title cannot be empty." })
    .max(255, { message: "Goal title is too long." }),
  description: z.string().optional(),
  target_date: z.string().optional(), // Consider using z.date() if you parse dates
  status: z.enum(["pending", "in_progress", "completed"]),
  attachments: z.array(z.string().url()).optional(), // Array of URLs for attachments
});

const attachmentSchema = z.object({
  url: z.string().url(),
  filename: z.string(),
  type: z.enum(["image", "document"]),
});

export const journalEntrySchema = z.object({
  title: z
    .string()
    .min(1, { message: "Journal title cannot be empty." })
    .max(255, { message: "Journal title is too long." }),
  content: z.string().optional(),
  attachments: z.array(attachmentSchema).optional(),
});
