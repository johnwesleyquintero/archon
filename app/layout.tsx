import type React from "react";
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { ErrorBoundary } from "@/components/error-boundary";
import { getUser } from "@/lib/supabase/auth"; // Import getUser
import { getProfile } from "@/lib/database/profiles"; // Import getProfile

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Archon",
  description:
    "A powerful dashboard for managing your tasks, goals, and journal.",
  generator: "archon team",
  icons: {
    icon: "/favicon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let initialUser = null;
  let initialProfile = null;

  try {
    initialUser = await getUser(); // Fetch initial user on the server
    if (initialUser) {
      initialProfile = await getProfile(initialUser.id); // Fetch initial profile on the server
    }
  } catch (error) {
    console.error(
      "Error fetching initial user or profile in RootLayout:",
      error,
    );
    // Optionally, you could set a flag or pass an error state to AuthProvider
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
        suppressHydrationWarning={true}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <AuthProvider
              initialUser={initialUser}
              initialProfile={initialProfile}
            >
              {children}
            </AuthProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
