"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authSchema } from "@/lib/validators";
import type { z } from "zod";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner"; // Assuming you have a Spinner component

type AuthFormValues = z.infer<typeof authSchema>;

interface AuthFormProps {
  type: "signin" | "signup";
}

export function AuthForm({ type }: AuthFormProps) {
  const { signIn, signUp } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: AuthFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      if (type === "signin") {
        await signIn(data.email, data.password);
        router.push("/dashboard");
      } else {
        await signUp(data.email, data.password);
        router.push(
          "/auth/auth-code-error?message=Check your email for a confirmation link to activate your account.",
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="m@example.com"
          {...form.register("email")}
          disabled={isLoading}
        />
        {form.formState.errors.email && (
          <p className="text-sm text-red-500">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          {...form.register("password")}
          disabled={isLoading}
        />
        {form.formState.errors.password && (
          <p className="text-sm text-red-500">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button
        type="submit"
        className="w-full bg-slate-900 hover:bg-slate-800"
        disabled={isLoading}
      >
        {isLoading ? (
          <Spinner size="sm" />
        ) : type === "signin" ? (
          "Sign In"
        ) : (
          "Sign Up"
        )}
      </Button>
    </form>
  );
}
