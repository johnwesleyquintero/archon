import { AuthForm } from "@/components/auth/auth-form";
import { ArchonLogoSVG } from "@/components/archon-logo-svg";
import Link from "next/link";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-4">
            <ArchonLogoSVG className="h-8 w-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">Archon</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-gray-300">Sign in to your account to continue</p>
        </div>

        {/* Auth Form */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
          <Suspense fallback={<div className="text-white">Loading...</div>}>
            <AuthForm />
          </Suspense>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-purple-400 hover:text-purple-300 font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
