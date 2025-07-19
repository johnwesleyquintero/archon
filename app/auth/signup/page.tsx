import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthForm } from "@/components/auth/auth-form"
import Link from "next/link"
import { ArchonLogoSVG } from "@/components/archon-logo-svg"

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ArchonLogoSVG className="h-12 w-12 text-slate-900" />
          </div>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>Create an account to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm type="signup" />
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/auth/signin" className="underline text-slate-600 hover:text-slate-900">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
