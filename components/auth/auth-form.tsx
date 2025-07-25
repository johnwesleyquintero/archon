"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Mail, Lock, Github, Chrome, AlertCircle, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirectTo") || "/dashboard"
  const supabase = createClient()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear errors when user starts typing
    if (error) setError(null)
  }

  const validateForm = () => {
    if (!formData.email) {
      setError("Email is required")
      return false
    }
    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address")
      return false
    }
    if (!formData.password) {
      setError("Password is required")
      return false
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return false
    }
    return true
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please check your credentials and try again.")
        } else if (error.message.includes("Email not confirmed")) {
          setError("Please check your email and click the confirmation link before signing in.")
        } else {
          setError(error.message)
        }
        return
      }

      // Success - redirect will happen automatically via auth state change
      router.push(redirectTo)
      router.refresh()
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error("Sign in error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email) {
      setError("Please enter your email address")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        setError(error.message)
        return
      }

      setSuccess("Password reset email sent! Check your inbox for further instructions.")
      setShowForgotPassword(false)
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error("Password reset error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialSignIn = async (provider: "github" | "google") => {
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
        },
      })

      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error("Social sign in error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (showForgotPassword) {
    return (
      <form onSubmit={handleForgotPassword} className="space-y-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Reset Password</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Enter your email address and we'll send you a reset link
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="reset-email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              id="reset-email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              className="pl-10"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex space-x-2">
          <Button type="submit" className="flex-1" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Reset Link
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setShowForgotPassword(false)
              setError(null)
              setSuccess(null)
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </form>
    )
  }

  return (
    <div className="space-y-6">
      {/* Social Sign In */}
      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          className="w-full bg-transparent"
          onClick={() => handleSocialSignIn("github")}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Github className="mr-2 h-4 w-4" />}
          Continue with GitHub
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full bg-transparent"
          onClick={() => handleSocialSignIn("google")}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Chrome className="mr-2 h-4 w-4" />}
          Continue with Google
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">Or continue with email</span>
        </div>
      </div>

      {/* Email Sign In Form */}
      <form onSubmit={handleSignIn} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              className="pl-10"
              required
              disabled={isLoading}
              autoComplete="email"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              className="pl-10 pr-10"
              required
              disabled={isLoading}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              disabled={isLoading}
            />
            <Label htmlFor="remember" className="text-sm text-slate-600 dark:text-slate-300">
              Remember me
            </Label>
          </div>
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            disabled={isLoading}
          >
            Forgot password?
          </button>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign In
        </Button>
      </form>
    </div>
  )
}
