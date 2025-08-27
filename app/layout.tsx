import { Inter } from "next/font/google";
import React from "react";

import { DynamicCommandMenu } from "@/components/custom/dynamic-command-menu";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/auth-context";
import { CommandMenuProvider } from "@/contexts/command-menu-context";

import type { Metadata } from "next";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Archon",
  description:
    "A modern, customizable dashboard for productivity and goal tracking",
  generator: "v0.dev",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <AuthProvider>
            <CommandMenuProvider>
              <TooltipProvider>{children}</TooltipProvider>
              <React.Suspense fallback={null}>
                <DynamicCommandMenu />
              </React.Suspense>
            </CommandMenuProvider>
            <Toaster />
          </AuthProvider>
        </body>
      </html>
    </ThemeProvider>
  );
}
