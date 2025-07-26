import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  CheckCircle,
  Star,
  Zap,
  Shield,
  Target,
  Calendar,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { ArchonLogoSVG } from "@/components/archon-logo-svg";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <ArchonLogoSVG className="h-8 w-8 text-purple-400" />
              <span className="text-xl font-bold text-white">Archon</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/login">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
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
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 bg-transparent"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything you need to stay organized
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Powerful features designed to help you achieve your goals and
              maintain productivity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-colors">
              <CardHeader>
                <Target className="h-8 w-8 text-purple-400 mb-2" />
                <CardTitle className="text-white">Goal Tracking</CardTitle>
                <CardDescription className="text-gray-300">
                  Set, track, and achieve your personal and professional goals
                  with intelligent progress monitoring.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-colors">
              <CardHeader>
                <CheckCircle className="h-8 w-8 text-green-400 mb-2" />
                <CardTitle className="text-white">Task Management</CardTitle>
                <CardDescription className="text-gray-300">
                  Organize your tasks with priorities, categories, and due
                  dates. Never miss a deadline again.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-colors">
              <CardHeader>
                <Calendar className="h-8 w-8 text-blue-400 mb-2" />
                <CardTitle className="text-white">Smart Journal</CardTitle>
                <CardDescription className="text-gray-300">
                  Reflect on your progress with our intelligent journaling
                  system that helps you grow.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-colors">
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-yellow-400 mb-2" />
                <CardTitle className="text-white">Analytics</CardTitle>
                <CardDescription className="text-gray-300">
                  Gain insights into your productivity patterns with detailed
                  analytics and reports.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-colors">
              <CardHeader>
                <Zap className="h-8 w-8 text-orange-400 mb-2" />
                <CardTitle className="text-white">AI Insights</CardTitle>
                <CardDescription className="text-gray-300">
                  Get personalized recommendations and insights powered by
                  advanced AI technology.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-colors">
              <CardHeader>
                <Shield className="h-8 w-8 text-red-400 mb-2" />
                <CardTitle className="text-white">Secure & Private</CardTitle>
                <CardDescription className="text-gray-300">
                  Your data is encrypted and secure. We respect your privacy and
                  never share your information.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Loved by thousands of users
            </h2>
            <p className="text-xl text-gray-300">
              See what our community has to say about their productivity
              journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {Array.from({ length: 5 }).map((_, i: number) => (
                    <Star
                      key={i}
                      className="h-4 w-4 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-300 mb-4">
                  "Archon has completely transformed how I manage my daily tasks
                  and long-term goals. The AI insights are incredibly helpful!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    S
                  </div>
                  <div className="ml-3">
                    <p className="text-white font-semibold">Sarah Chen</p>
                    <p className="text-gray-400 text-sm">Product Manager</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {Array.from({ length: 5 }).map((_, i: number) => (
                    <Star
                      key={i}
                      className="h-4 w-4 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-300 mb-4">
                  "The customizable dashboard is perfect for my workflow. I can
                  see everything I need at a glance and stay focused on what
                  matters."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    M
                  </div>
                  <div className="ml-3">
                    <p className="text-white font-semibold">Marcus Johnson</p>
                    <p className="text-gray-400 text-sm">Entrepreneur</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {Array.from({ length: 5 }).map((_, i: number) => (
                    <Star
                      key={i}
                      className="h-4 w-4 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-300 mb-4">
                  "I love the journaling feature. It helps me reflect on my
                  progress and stay motivated. The analytics show how much I've
                  grown!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                    A
                  </div>
                  <div className="ml-3">
                    <p className="text-white font-semibold">Alex Rivera</p>
                    <p className="text-gray-400 text-sm">Designer</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
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

      {/* Footer */}
      <footer className="border-t border-white/10 bg-white/5 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <ArchonLogoSVG className="h-6 w-6 text-purple-400" />
              <span className="text-lg font-semibold text-white">Archon</span>
            </div>
            <div className="flex items-center space-x-6 text-gray-400">
              <Link
                href="/privacy"
                className="hover:text-white transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="hover:text-white transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/support"
                className="hover:text-white transition-colors"
              >
                Support
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-gray-400">
            <p>&copy; 2024 Archon. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
