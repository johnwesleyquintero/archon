import * as Zod from "zod";

const clientEnvSchema = Zod.object({
  NEXT_PUBLIC_SUPABASE_URL: Zod.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: Zod.string(),
  NEXT_PUBLIC_APP_URL: Zod.string().optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: Zod.string().min(1),
});

export const clientEnv: Zod.infer<typeof clientEnvSchema> =
  clientEnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
  });
