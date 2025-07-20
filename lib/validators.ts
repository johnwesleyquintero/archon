import { z } from "zod"

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
})

export const signupSchema = z
  .object({
    email: z.string().email({ message: "Invalid email address." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  })

// Temporary alias for backward compatibility
export const authSchema = loginSchema // Pointing to loginSchema as a common base

// Profile Schema
export const profileSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters." })
    .max(30, { message: "Username must not be longer than 30 characters." })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username must contain only letters, numbers, and underscores.",
    })
    .optional()
    .or(z.literal("")), // Allow empty string for optional field
  full_name: z
    .string()
    .max(50, { message: "Full name must not be longer than 50 characters." })
    .optional()
    .or(z.literal("")),
  website: z.string().url({ message: "Invalid URL." }).optional().or(z.literal("")),
  avatar_url: z.string().url({ message: "Invalid URL." }).optional().or(z.literal("")),
})

// Task Schema
export const taskSchema = z.object({
  title: z.string().min(1, { message: "Task title cannot be empty." }).max(255),
  is_complete: z.boolean().default(false),
})

// Goal Schema
export const goalSchema = z.object({
  title: z.string().min(1, { message: "Goal title cannot be empty." }).max(255),
  description: z.string().optional(),
  target_date: z.string().optional(), // Consider using z.date() if you convert to Date objects
  progress: z.number().min(0).max(100).default(0),
  attachments: z.array(z.string().url()).optional(), // Array of URLs for attachments
})

// Journal Entry Schema
export const journalEntrySchema = z.object({
  title: z.string().min(1, { message: "Title cannot be empty." }).max(255),
  content: z.string().min(1, { message: "Content cannot be empty." }),
  attachments: z.array(z.string().url()).optional(), // Array of URLs for attachments
})
