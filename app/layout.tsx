import type React from "react"
// This file was previously abbreviated. Here is its full content.
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/auth-context"
import { getUserWithProfile } from "@/lib/supabase/auth"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Archon Dashboard",
  description: "A powerful and responsive dashboard built with Next.js and Supabase.",
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { user, error } = await getUserWithProfile()

  // You might want to handle the error more gracefully, e.g., redirect to an error page
  if (error) {
    console.error("RootLayout: Error fetching user profile:", error.message)
    // Depending on your error strategy, you might redirect or show a global error message
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider initialUser={user?.user || null} initialProfile={user?.profile || null}>
            {children}
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
