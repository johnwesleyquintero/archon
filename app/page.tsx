import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, CheckCircle, Target, BookOpen, BarChart3, Star, Quote } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Archon
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/login">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            ✨ New Dashboard Experience
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 dark:from-slate-100 dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
            Your Personal
            <br />
            Productivity Hub
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
            Streamline your workflow with our all-in-one dashboard. Track tasks, set goals, journal your thoughts, and
            visualize your progress—all in one beautiful interface.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white/50 dark:bg-slate-800/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-slate-100">
              Everything You Need to Stay Organized
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Our comprehensive suite of tools helps you manage every aspect of your productivity journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
              <CardHeader>
                <CheckCircle className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>Task Management</CardTitle>
                <CardDescription>
                  Organize your tasks with priorities, categories, and due dates. Never miss a deadline again.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
              <CardHeader>
                <Target className="h-10 w-10 text-green-600 mb-2" />
                <CardTitle>Goal Tracking</CardTitle>
                <CardDescription>
                  Set ambitious goals and track your progress with visual milestones and achievement metrics.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950">
              <CardHeader>
                <BookOpen className="h-10 w-10 text-purple-600 mb-2" />
                <CardTitle>Smart Journal</CardTitle>
                <CardDescription>
                  Capture your thoughts, ideas, and reflections with our rich text editor and attachment support.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-orange-600 mb-2" />
                <CardTitle>Analytics</CardTitle>
                <CardDescription>
                  Visualize your productivity patterns and gain insights into your performance over time.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
              <div className="text-slate-600 dark:text-slate-300">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">1M+</div>
              <div className="text-slate-600 dark:text-slate-300">Tasks Completed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">99.9%</div>
              <div className="text-slate-600 dark:text-slate-300">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-white/50 dark:bg-slate-800/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-slate-100">
              What Our Users Say
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <Quote className="h-8 w-8 text-slate-400 mb-4" />
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  "Archon has completely transformed how I manage my daily tasks and long-term goals. The interface is
                  intuitive and the features are exactly what I needed."
                </p>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-semibold">
                    S
                  </div>
                  <div className="ml-3">
                    <div className="font-semibold">Sarah Johnson</div>
                    <div className="text-sm text-slate-500">Product Manager</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <Quote className="h-8 w-8 text-slate-400 mb-4" />
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  "The goal tracking feature is phenomenal. I can see my progress visually and it keeps me motivated to
                  achieve my objectives."
                </p>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center text-white font-semibold">
                    M
                  </div>
                  <div className="ml-3">
                    <div className="font-semibold">Michael Chen</div>
                    <div className="text-sm text-slate-500">Entrepreneur</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <Quote className="h-8 w-8 text-slate-400 mb-4" />
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  "As a freelancer, staying organized is crucial. Archon's dashboard gives me a clear overview of all my
                  projects and deadlines."
                </p>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold">
                    E
                  </div>
                  <div className="ml-3">
                    <div className="font-semibold">Emily Rodriguez</div>
                    <div className="text-sm text-slate-500">Designer</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900 dark:text-slate-100">
              Ready to Transform Your Productivity?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
              Join thousands of users who have already revolutionized their workflow with Archon. Start your journey
              today.
            </p>
            <Link href="/login">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Get Started for Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Archon
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Your personal productivity hub for managing tasks, goals, and insights.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-slate-900 dark:text-slate-100">Product</h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li>
                  <Link href="#" className="hover:text-blue-600">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-blue-600">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-blue-600">
                    Updates
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-slate-900 dark:text-slate-100">Company</h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li>
                  <Link href="#" className="hover:text-blue-600">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-blue-600">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-blue-600">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-slate-900 dark:text-slate-100">Support</h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li>
                  <Link href="#" className="hover:text-blue-600">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-blue-600">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-blue-600">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-slate-600 dark:text-slate-300">
            <p>&copy; 2024 Archon. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
