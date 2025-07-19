"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface AuthFormProps {
  mode: "signin" | "signup"
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        })

        if (error) {
          setError(error.message)
        } else if (data.user && !data.user.email_confirmed_at) {
          setMessage("Please check your email for a confirmation link.")
        } else {
          router.push("/dashboard")
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          setError(error.message)
        } else {
          router.push("/dashboard")
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error("Auth error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
        setLoading(false)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      setLoading(false)
      console.error("Google auth error:", err)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fillRule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fillOpacity=\"0.02\"%3E%3Ccircle cx=\"7\" cy=\"7\" r=\"1\"/%3E%3Ccircle cx=\"27\" cy=\"7\" r=\"1\"/%3E%3Ccircle cx=\"47\" cy=\"7\" r=\"1\"/%3E%3Ccircle cx=\"7\" cy=\"27\" r=\"1\"/%3E%3Ccircle cx=\"27\" cy=\"27\" r=\"1\"/%3E%3Ccircle cx=\"47\" cy=\"27\" r=\"1\"/%3E%3Ccircle cx=\"7\" cy=\"47\" r=\"1\"/%3E%3Ccircle cx=\"27\" cy=\"47\" r=\"1\"/%3E%3Ccircle cx=\"47\" cy=\"47\" r=\"1\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
      
      <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm shadow-2xl border-0">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </CardTitle>
          <CardDescription className="text-slate-600">
            {mode === 'signin' 
              ? 'Sign in to your Archon dashboard' 
              : 'Get started with your personal command center'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium text-slate-700">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-11 border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                  required
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 border-slate-200 focus:border-slate-400 focus:ring-slate-400 pr-10"
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-slate-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-slate-400" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-100">
                {error}
              </div>
            )}

            {message && (
              <div className="text-sm text-green-600 bg-green-50 p-3 rounded border border-green-100">
                {message}
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                mode === 'signin' ? 'Sign In' : 'Create Account'
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">Or continue with</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full h-11 border-slate-200 hover:bg-slate-50 font-medium bg-transparent"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Continue with Google
          </Button>

          <div className="text-center">
            <p className="text-sm text-slate-600">
              {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
              <a 
                href={mode === 'signin' ? '/auth/signup' : '/auth/signin'} 
                className="font-medium text-slate-900 hover:text-slate-700 underline underline-offset-4"
              >
                {mode === 'signin' ? 'Sign Up' : 'Sign In'}
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
