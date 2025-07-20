import type React from "react"
import type { Metadata } from "next"
import { Mona_Sans as FontSans } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { ErrorBoundary } from "@/app/error-boundary"
import { Toaster } from "@/components/ui/toaster"
import { getUser } from "@/lib/supabase/auth" // Import getUser
import { getProfile } from "@/lib/database/profiles" // Import getProfile
import type { ProfilesRow } from "@/lib/database/profiles" // Import ProfilesRow type
import type { SerializableUser } from "@/contexts/auth-context" // Import SerializableUser type

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Archon",
  description: "A powerful dashboard for managing your tasks, goals, and journal.",
  generator: "archon team",
  icons: {
    icon: "/favicon.svg",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  let initialUser: SerializableUser | null = null
  let initialProfile: ProfilesRow | null = null

  const fetchedUser = await getUser() // Fetch initial user on the server
  // Only pass serializable parts of the user object
  initialUser = fetchedUser ? { id: fetchedUser.id, email: fetchedUser.email ?? undefined } : null
  if (initialUser) {
    initialProfile = await getProfile(initialUser.id) // Fetch initial profile on the server
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}
        suppressHydrationWarning={true}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ErrorBoundary>
            <AuthProvider initialUser={initialUser} initialProfile={initialProfile}>
              {children}
            </AuthProvider>
          </ErrorBoundary>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
