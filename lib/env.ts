import * as Zod from "zod";

const clientEnvSchema = Zod.object({
  NEXT_PUBLIC_SUPABASE_URL: Zod.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: Zod.string(),
  NEXT_PUBLIC_APP_URL: Zod.string().optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: Zod.string().min(1),
});

export const clientEnv: Zod.infer<typeof clientEnvSchema> =
  clientEnvSchema.parse(process.env as Record<string, string | undefined>);
