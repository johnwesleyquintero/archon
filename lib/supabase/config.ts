// Validate environment variables
const requiredEnvVars = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
}

// Check if all required environment variables are present
for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
}

export const supabaseConfig = {
  url: requiredEnvVars.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: requiredEnvVars.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
}
