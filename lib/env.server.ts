import { z } from "zod";

const serverEnvSchema = z.object({
  SUPABASE_ACCESS_TOKEN: z.string().optional(),
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
});

export const serverEnv = serverEnvSchema.parse(process.env);
