import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Ready to transform your productivity?
        </h2>
        <p className="text-xl text-gray-300 mb-8">
          Join thousands of users who have already started their journey to
          better organization and goal achievement.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login">
            <Button
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <p className="text-gray-400 text-sm mt-4">
          No credit card required &bull; Free forever plan available
        </p>
      </div>
    </section>
  );
}
