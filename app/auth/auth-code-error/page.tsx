import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArchonLogoSVG } from "@/components/archon-logo-svg"

export default function AuthCodeErrorPage({
  searchParams,
}: {
  searchParams: { message: string }
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ArchonLogoSVG className="h-12 w-12 text-slate-900" />
          </div>
          <CardTitle className="text-2xl">Authentication Status</CardTitle>
          <CardDescription>{searchParams.message || "An authentication event occurred."}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Link href="/login" className="underline text-slate-600 hover:text-slate-900">
            Go to Login
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
