import { z } from "zod";

const serverEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  SUPABASE_ACCESS_TOKEN: z.string().optional(),
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  GROQ_MODEL: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
});

let parsedEnv: z.infer<typeof serverEnvSchema>;

function getParsedEnv() {
  if (!parsedEnv) {
    parsedEnv = serverEnvSchema.parse(process.env);
  }
  return parsedEnv;
}

export const serverEnv = getParsedEnv();
