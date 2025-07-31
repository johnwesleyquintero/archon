import { z } from "zod";

/**
 * Zod schema for authentication, validating email and password.
 * Used for general authentication flows where both fields are required.
 */
export const authSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

/**
 * Zod schema for user login, validating email and password.
 * Ensures that the provided credentials meet the basic requirements for login.
 */
export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

/**
 * Zod schema for user signup, validating email, password, and password confirmation.
 * Ensures that passwords match and meet minimum length requirements.
 */
export const signupSchema = z
  .object({
    email: z.string().email({ message: "Invalid email address." }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters." }),
    confirmPassword: z
      .string()
      .min(6, { message: "Password must be at least 6 characters." }),
  })
  .refine(
    (data: { password: string; confirmPassword: string }) =>
      data.password === data.confirmPassword,
    {
      message: "Passwords don't match.",
      path: ["confirmPassword"],
    },
  );

/**
 * Zod enum for defining task priorities.
 * Validates that a task's priority is one of "low", "medium", or "high".
 */
export const taskPriorityEnum = z.enum(["low", "medium", "high"]);

/**
 * Zod schema for task validation.
 * Validates task properties such as title, due date, priority, category, and tags.
 * Ensures required fields are present and string lengths are within limits.
 */
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

/**
 * Zod schema for user profile validation.
 * Validates user profile information including full name, username, and avatar URL.
 */
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

/**
 * Zod schema for goal validation.
 * Validates goal properties such as title, description, target date, status, and attachments.
 */
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

/**
 * Zod schema for validating individual attachment objects.
 * Defines the structure for file attachments, including URL, filename, and type.
 */
const attachmentSchema = z.object({
  url: z.string().url(),
  filename: z.string(),
  type: z.enum(["image", "document"]),
});

/**
 * Zod schema for journal entry validation.
 * Validates journal entry properties such as title, content, and attachments.
 */
export const journalEntrySchema = z.object({
  title: z
    .string()
    .min(1, { message: "Journal title cannot be empty." })
    .max(255, { message: "Journal title is too long." }),
  content: z.string().optional(),
  attachments: z.array(attachmentSchema).optional(),
});
