"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export function AuthGuard({ children, requireAuth = true, redirectTo = "/auth/signin" }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        router.push(redirectTo)
      } else if (!requireAuth && user) {
        router.push("/dashboard")
      }
    }
  }, [user, loading, requireAuth, redirectTo, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
          <p className="text-sm text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (requireAuth && !user) {
    return null // Will redirect
  }

  if (!requireAuth && user) {
    return null // Will redirect
  }

  return <>{children}</>
}
