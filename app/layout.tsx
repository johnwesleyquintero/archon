import type { Metadata } from "next";
import { Inter } from "next/font/google";
import React from "react";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/auth-context";
import { CommandMenuProvider } from "@/contexts/command-menu-context";
import DynamicCommandMenu from "@/components/custom/dynamic-command-menu";

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
          {/* 
            If you encounter a script error like "Cannot render a sync or defer <script> outside the main document",
            it's likely a third-party script being injected. You might need to identify that script's URL
            and add it here with the appropriate strategy. For example:
            <Script src="https://example.com/problematic-script.js" strategy="beforeInteractive" async />
            For now, this is a placeholder to demonstrate the solution approach.
          */}
          {/* <Script src="/path/to/your/problematic-script.js" strategy="beforeInteractive" async /> */}
        </body>
      </html>
    </ThemeProvider>
  );
}
