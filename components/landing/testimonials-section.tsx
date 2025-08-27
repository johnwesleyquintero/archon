import { Star } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function TestimonialsSection() {
  return (
    // Section background: Light gray for light mode, very dark gray for dark mode
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          {/* Heading: Dark gray for light mode, white for dark mode */}
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Loved by thousands of users
          </h2>
          {/* Subtitle: Medium gray for light mode, light gray for dark mode */}
          <p className="text-xl text-gray-700 dark:text-gray-300">
            See what our community has to say about their productivity journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card: White background, light border, shadow for light mode; darker background, darker border for dark mode */}
          <Card className="bg-white border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                {Array.from({ length: 5 }).map((_, i: number) => (
                  <Star
                    key={i}
                    className="h-4 w-4 text-yellow-400 fill-current" // Stars remain consistent across themes
                  />
                ))}
              </div>
              {/* Testimonial text: Medium gray for light mode, light gray for dark mode */}
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                "Archon has completely transformed how I manage my daily tasks
                and long-term goals. The AI insights are incredibly helpful!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  S
                </div>
                <div className="ml-3">
                  {/* Name: Dark gray for light mode, white for dark mode */}
                  <p className="text-gray-900 dark:text-white font-semibold">
                    Sarah Chen
                  </p>
                  {/* Role: Medium-light gray for light mode, medium-dark gray for dark mode */}
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Product Manager
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                {Array.from({ length: 5 }).map((_, i: number) => (
                  <Star
                    key={i}
                    className="h-4 w-4 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                "The customizable dashboard is perfect for my workflow. I can
                see everything I need at a glance and stay focused on what
                matters."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  M
                </div>
                <div className="ml-3">
                  <p className="text-gray-900 dark:text-white font-semibold">
                    Marcus Johnson
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Entrepreneur
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                {Array.from({ length: 5 }).map((_, i: number) => (
                  <Star
                    key={i}
                    className="h-4 w-4 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                "I love the journaling feature. It helps me reflect on my
                progress and stay motivated. The analytics show how much I've
                grown!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                  A
                </div>
                <div className="ml-3">
                  <p className="text-gray-900 dark:text-white font-semibold">
                    Alex Rivera
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Designer
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
