// This file was previously abbreviated. Here is its full content.
"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface AuthFormProps {
  type: "signin" | "signup"
}

export function AuthForm({ type }: AuthFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const supabase = createClient()
  const router = useRouter()

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    setError("")

    try {
      if (type === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/confirm`,
          },
        })

        if (signUpError) {
          setError(signUpError.message)
          return
        }

        if (data.user && data.user.identities?.length === 0) {
          setMessage("Account already exists. Please sign in.")
        } else {
          setMessage("Check your email for a confirmation link to activate your account.")
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          setError(signInError.message)
          return
        }

        router.push("/dashboard") // Redirect to dashboard on successful sign-in
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    setLoading(true)
    setError("")
    try {
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (signInError) {
        setError(signInError.message)
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-background/80 backdrop-blur-sm shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">
          {type === "signin" ? "Sign In to Archon" : "Create an Archon Account"}
        </CardTitle>
        <CardDescription>
          {type === "signin"
            ? "Enter your email and password to access your dashboard."
            : "Enter your email and password to create your account."}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {error && <p className="text-destructive text-sm text-center">{error}</p>}
        {message && <p className="text-green-500 text-sm text-center">{message}</p>}

        <form onSubmit={handleEmailAuth} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {type === "signin" ? "Signing In..." : "Signing Up..."}
              </>
            ) : type === "signin" ? (
              "Sign In"
            ) : (
              "Sign Up"
            )}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full flex items-center gap-2 bg-transparent"
          onClick={() => handleOAuthSignIn("google")}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <svg role="img" viewBox="0 0 24 24" className="h-4 w-4">
              <path
                fill="currentColor"
                d="M12.48 10.92v2.73h3.49c-.07 1.8-1.85 4.73-4.91 4.73-4.18 0-7.6-3.35-7.6-7.48s3.42-7.48 7.6-7.48c2.04 0 3.22.83 4.12 1.68l2.16-2.08c-1.35-1.24-3.88-2.52-6.28-2.52-5.65 0-10.29 4.6-10.29 10.29s4.64 10.29 10.29 10.29c5.24 0 8.91-3.84 8.91-9.88 0-.71-.09-1.25-.19-1.87v-.01H12.48z"
              />
            </svg>
          )}
          Google
        </Button>
        <Button
          variant="outline"
          className="w-full flex items-center gap-2 bg-transparent"
          onClick={() => handleOAuthSignIn("github")}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <svg role="img" viewBox="0 0 24 24" className="h-4 w-4">
              <path
                fill="currentColor"
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.73.084-.73 1.205.084 1.838 1.238 1.838 1.238 1.07 1.835 2.809 1.305 3.49.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12z"
              />
            </svg>
          )}
          GitHub
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          {type === "signin" ? (
            <>
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="underline underline-offset-4 hover:text-primary">
                Sign Up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href="/auth/signin" className="underline underline-offset-4 hover:text-primary">
                Sign In
              </Link>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
