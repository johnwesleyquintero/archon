import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { DemoModal } from "@/components/demo-modal";

export function HeroSection() {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <Badge className="mb-4 bg-purple-600/20 text-purple-300 border-purple-500/30">
          ✨ Now with AI-powered insights
        </Badge>
        <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
          Your Personal
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            {" "}
            Productivity Hub
          </span>
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Transform your daily routine with our intelligent dashboard. Track
          goals, manage tasks, and journal your journey—all in one beautifully
          designed space.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login">
            <Button
              size="lg"
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
              className="border-white/20 text-white hover:bg-white/10 bg-transparent"
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
