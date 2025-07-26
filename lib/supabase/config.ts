export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
<<<<<<< HEAD
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
};

if (!supabaseConfig.url) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
}

if (!supabaseConfig.anonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable");
=======
}

// Validate environment variables
if (!supabaseConfig.url) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
}

if (!supabaseConfig.anonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable")
>>>>>>> bf82e287a63e13247ad4b38263d2068fda55c2b9
}
