import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { getUserWithProfile } from "@/lib/supabase/auth"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Archon Dashboard",
  description: "Your personal command center",
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let user = null
  let profile = null

  try {
    const result = await getUserWithProfile()
    user = result.user
    profile = result.profile
  } catch (error) {
    console.error("Failed to initialize Supabase in layout:", error)
    // Continue without auth - the AuthProvider will handle the error state
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider initialUser={user} initialProfile={profile}>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
