/**
 * Lightweight helpers that wrap the server-side Supabase client.
 */
import { getSupabaseServerClient } from "./server"; // Import the async function

/**
 * Returns the signed-in user (or null) inside a Server Action /
 * Route Handler / RSC.
 */
export async function getUser() {
  const supabase = await getSupabaseServerClient(); // Get the Supabase client instance
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) {
    if (error.name === "AuthSessionMissingError") {
      // Log AuthSessionMissingError at a lower level as it's often expected for unauthenticated access
      console.log(
        "[Supabase] getUser (AuthSessionMissingError):",
        error.message,
      );
    } else {
      // Log other authentication errors as errors
      console.error("[Supabase] getUser error:", error);
    }
  }
  return user ?? null;
}
