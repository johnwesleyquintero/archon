import * as Zod from "zod";

/**
 * Zod enum for defining task priorities.
 * Validates that a task's priority is one of "low", "medium", or "high".
 */
export const taskPriorityEnum = Zod.enum(["low", "medium", "high"]);

/**
 * Zod enum for defining task statuses.
 * Validates that a task's status is one of "todo", "in-progress", or "done".
 */
export const taskStatusEnum = Zod.enum(["todo", "in-progress", "done"]); // New enum for task status

/**
 * Zod schema for task validation.
 * Validates task properties such as title, due date, priority, category, and tags.
 * Ensures required fields are present and string lengths are within limits.
 */
export const taskSchema = Zod.object({
  title: Zod.string()
    .min(1, { message: "Task title cannot be empty." })
    .max(255, { message: "Task title is too long." }),
  dueDate: Zod.string()
    .datetime({ message: "Invalid due date." })
    .optional()
    .nullable(),
  priority: taskPriorityEnum,
  category: Zod.string()
    .max(50, { message: "Category name is too long." })
    .optional()
    .nullable(),
  tags: Zod.array(Zod.string().max(30, { message: "Tag is too long." })),
  status: taskStatusEnum, // Added status to task schema
  notes: Zod.string()
    .max(1000, { message: "Notes are too long." })
    .optional()
    .nullable(), // New field for task notes
  recurrence_pattern: Zod.enum(["none", "daily", "weekly", "monthly", "yearly"])
    .optional()
    .nullable(), // Added recurrence pattern
  recurrence_end_date: Zod.string()
    .datetime({ message: "Invalid recurrence end date." })
    .optional()
    .nullable(), // Added recurrence end date
});

export type TaskFormValues = Zod.infer<typeof taskSchema>; // Export TaskFormValues

/**
 * Zod schema for authentication, validating email and password.
 * Used for general authentication flows where both fields are required.
 */
export const authSchema = Zod.object({
  email: Zod.string().email({ message: "Invalid email address." }),
  password: Zod.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

/**
 * Zod schema for user login, validating email and password.
 * Ensures that the provided credentials meet the basic requirements for login.
 */
export const loginSchema = Zod.object({
  email: Zod.string().email({ message: "Invalid email address." }),
  password: Zod.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

/**
 * Zod schema for user signup, validating email, password, and password confirmation.
 * Ensures that passwords match and meet minimum length requirements.
 */
export const signupSchema = Zod.object({
  email: Zod.string().email({ message: "Invalid email address." }),
  password: Zod.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  confirmPassword: Zod.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
}).refine(
  (data: { password: string; confirmPassword: string }) =>
    data.password === data.confirmPassword,
  {
    message: "Passwords donod't match.",
    path: ["confirmPassword"],
  },
);

/**
 * Zod schema for user profile validation.
 * Validates user profile information including full name, username, and avatar URL.
 */
export const profileSchema = Zod.object({
  fullName: Zod.string()
    .min(1, { message: "Full name cannot be empty." })
    .max(100, { message: "Full name is too long." }),
  username: Zod.string()
    .min(1, { message: "Username cannot be empty." })
    .max(50, { message: "Username is too long." }),
  avatar: Zod.string()
    .url({ message: "Invalid avatar URL." })
    .optional()
    .or(Zod.literal("")),
});

/**
 * Zod schema for goal validation.
 * Validates goal properties such as title, description, target date, status, and attachments.
 */
export const goalSchema = Zod.object({
  title: Zod.string()
    .min(1, { message: "Goal title cannot be empty." })
    .max(255, { message: "Goal title is too long." }),
  description: Zod.string().optional(),
  target_date: Zod.string().optional(), // Consider using Zod.date() if you parse dates
  status: Zod.enum(["pending", "in_progress", "completed"]).optional(),
  attachments: Zod.array(Zod.string().url()).optional(), // Array of URLs for attachments
});

/**
 * Zod schema for validating individual attachment objects.
 * Defines the structure for file attachments, including URL, filename, and type.
 */
const attachmentSchema = Zod.object({
  url: Zod.string().url(),
  filename: Zod.string(),
  type: Zod.enum(["image", "document"]),
});

/**
 * Zod schema for journal entry validation.
 * Validates journal entry properties such as title, content, and attachments.
 */
export const journalEntrySchema = Zod.object({
  title: Zod.string()
    .min(1, { message: "Journal title cannot be empty." })
    .max(255, { message: "Journal title is too long." }),
  content: Zod.string().optional(),
  attachments: Zod.array(attachmentSchema).optional(),
});
