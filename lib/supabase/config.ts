// Configuration helper to validate Supabase setup
export function validateSupabaseConfig() {
  const config = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }

  const errors: string[] = []

  if (!config.url) {
    errors.push("SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is required")
  }

  if (!config.anonKey) {
    errors.push("SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY is required")
  }

  if (config.url && !config.url.startsWith("https://")) {
    errors.push("SUPABASE_URL must start with https://")
  }

  return {
    isValid: errors.length === 0,
    errors,
    config,
  }
}

// Debug function to check environment
export function debugEnvironment() {
  console.log("=== Supabase Environment Debug ===")
  console.log("NODE_ENV:", process.env.NODE_ENV)
  console.log(
    "Available Supabase env vars:",
    Object.keys(process.env)
      .filter((key) => key.includes("SUPABASE"))
      .map((key) => `${key}: ${process.env[key] ? "SET" : "NOT SET"}`),
  )

  const validation = validateSupabaseConfig()
  console.log("Config validation:", validation)
  console.log("================================")

  return validation
}
