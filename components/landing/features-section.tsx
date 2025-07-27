import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle,
  Zap,
  Shield,
  Target,
  Calendar,
  BarChart3,
} from "lucide-react";

export function FeaturesSection() {
  return (
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
                Organize your tasks with priorities, categories, and due dates.
                Never miss a deadline again.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-colors">
            <CardHeader>
              <Calendar className="h-8 w-8 text-blue-400 mb-2" />
              <CardTitle className="text-white">Smart Journal</CardTitle>
              <CardDescription className="text-gray-300">
                Reflect on your progress with our intelligent journaling system
                that helps you grow.
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
  );
}
