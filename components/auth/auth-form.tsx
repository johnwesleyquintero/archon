"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useAuth } from "@/contexts/auth-context"
import { loginSchema, signupSchema } from "@/lib/validators"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

// Define a union type for the schemas
type AuthFormSchema = z.infer<typeof loginSchema> | z.infer<typeof signupSchema>

interface AuthFormProps {
  mode: "login" | "signup"
}

const AuthForm = ({ mode }: AuthFormProps) => {
  const { signIn, signUp } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formSchema = mode === "login" ? loginSchema : signupSchema

  const form = useForm<AuthFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      ...(mode === "signup" && { confirmPassword: "" }),
    },
  })

  const onSubmit = async (values: AuthFormSchema) => {
    setIsSubmitting(true)
    try {
      if (mode === "login") {
        await signIn(values.email, values.password)
        toast({
          title: "Signed in successfully!",
          description: "Welcome back to Archon.",
        })
        router.push("/dashboard")
      } else {
        await signUp(values.email, values.password)
        toast({
          title: "Sign up successful!",
          description: "Please check your email to confirm your account.",
        })
        // Optionally redirect to a confirmation page or login page
        router.push("/auth/signin")
      }
    } catch (error: any) {
      toast({
        title: "Authentication Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      })
      console.error("Authentication error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">{mode === "login" ? "Login" : "Sign Up"}</CardTitle>
        <CardDescription>
          {mode === "login"
            ? "Enter your email below to login to your account."
            : "Enter your email and password to create an account."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input id="email" type="email" placeholder="m@example.com" required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input id="password" type="password" required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {mode === "signup" && (
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input id="confirmPassword" type="password" required {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting
                ? mode === "login"
                  ? "Logging in..."
                  : "Signing up..."
                : mode === "login"
                  ? "Login"
                  : "Sign Up"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export { AuthForm } // Named export
export default AuthForm // Default export
