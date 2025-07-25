import { Suspense } from "react"
import { AuthForm } from "@/components/auth/auth-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Archon
            </span>
          </Link>
        </div>

        {/* Auth Card */}
        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">Welcome Back</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-300">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading...</div>}>
              <AuthForm />
            </Suspense>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-slate-600 dark:text-slate-300">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-medium">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
