"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  FormProvider, // Added this import
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/contexts/auth-context";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authSchema } from "@/lib/validators";
import type { z } from "zod";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner"; // Assuming you have a Spinner component
import { useFormStatus } from "react-dom";

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
    mode: "onBlur", // Enable real-time validation on blur
  });

  const onSubmit = async (data: AuthFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      if (type === "signin") {
        await signIn(data.email as string, data.password as string);
        router.push("/dashboard");
      } else {
        await signUp(data.email as string, data.password as string);
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
    <FormProvider {...form}>
      <form
        onSubmit={(e) => {
          void form.handleSubmit(onSubmit)(e);
        }}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="m@example.com"
                  disabled={isLoading}
                  {...field}
                />
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
                <Input type="password" disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <SubmitButton
          type="submit"
          className="w-full bg-slate-900 hover:bg-slate-800"
          disabled={isLoading}
          pendingText={type === "signin" ? "Signing In..." : "Signing Up..."}
        >
          {type === "signin" ? "Sign In" : "Sign Up"}
        </SubmitButton>
      </form>
    </FormProvider>
  );
}

interface SubmitButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pendingText: string;
}

export function SubmitButton({
  children,
  pendingText,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button {...props} type="submit" disabled={pending || props.disabled}>
      {pending ? (
        <span className="flex items-center gap-2">
          <Spinner size="sm" /> {pendingText}
        </span>
      ) : (
        children
      )}
    </Button>
  );
}
