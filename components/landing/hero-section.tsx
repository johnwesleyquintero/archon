import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { DemoModal } from "@/components/demo-modal";

export function HeroSection() {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        {/* Badge: Adjusted for a white background by default, with specific dark mode colors */}
        <Badge className="mb-4 bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-600/20 dark:text-purple-300 dark:border-purple-500/30">
          ✨ Now with AI-powered insights
        </Badge>
        {/* H1: Adjusted main text color for a white background, with a dark mode fallback to white */}
        <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          Your Personal
          {/* Gradient text remains effective across themes */}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            {" "}
            Productivity Hub
          </span>
        </h1>
        {/* Paragraph: Adjusted for a white background, with a dark mode fallback for readability */}
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          Transform your daily routine with our intelligent dashboard. Track
          goals, manage tasks, and journal your journey—all in one beautifully
          designed space.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/signup">
            <Button
              size="lg"
              // Primary button: The purple accent works well on both light and dark backgrounds
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Start Your Journey
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <DemoModal>
            <Button
              size="lg"
              variant="outline"
              // Outline button: Adjusted for a white background (dark border/text), with dark mode fallbacks
              className="border-gray-300 text-gray-800 hover:bg-gray-100 dark:border-white/20 dark:text-white dark:hover:bg-white/10 bg-transparent"
              aria-label="Watch a demonstration video of Archon"
            >
              Watch Demo
            </Button>
          </DemoModal>
        </div>
      </div>
    </section>
  );
}
