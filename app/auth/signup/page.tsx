import { AuthForm } from "@/components/auth/auth-form"
import { getUser } from "@/lib/supabase/auth"
import { redirect } from "next/navigation"

export default async function SignUpPage() {
  const user = await getUser()

  if (user) {
    redirect("/dashboard")
  }

  return <AuthForm mode="signup" />
}
