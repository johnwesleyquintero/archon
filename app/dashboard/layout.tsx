import type React from "react"
import { requireAuth } from "@/lib/supabase/auth"
import { AuthGuard } from "@/components/auth/auth-guard"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This will redirect to login if not authenticated
  await requireAuth()

  return <AuthGuard requireAuth={true}>{children}</AuthGuard>
}
