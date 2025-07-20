import type React from "react";
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { ErrorBoundary } from "@/components/error-boundary";
import { getUser } from "@/lib/supabase/auth"; // Import getUser

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Archon",
  description:
    "A powerful dashboard for managing your tasks, goals, and journal.",
  generator: "v0.dev",
  icons: {
    icon: "/favicon.svg",
  },
};

export default async function RootLayout({
  // Make RootLayout async
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialUser = await getUser(); // Fetch initial user on the server

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
            <AuthProvider initialUser={initialUser}>{children}</AuthProvider>{" "}
            {/* Pass initialUser */}
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
