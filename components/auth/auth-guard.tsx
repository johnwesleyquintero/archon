"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Spinner } from "@/components/ui/spinner" // Assuming you have a Spinner component

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading, error } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user && !error) {
      // If not loading, no user, and no error (meaning not an auth error page), redirect to login
      router.push("/login")
    }
  }, [user, isLoading, error, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    // Render error message or redirect to a specific error page
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50 text-red-700 p-4">
        <p>Authentication Error: {error.message}</p>
      </div>
    )
  }

  if (!user) {
    // This case should ideally be handled by the useEffect redirect,
    // but as a fallback, return null or a minimal loading state.
    return null
  }

  return <>{children}</>
}
