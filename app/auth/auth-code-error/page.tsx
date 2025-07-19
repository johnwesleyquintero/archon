import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm shadow-2xl border-0">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-xl font-bold text-slate-900">Authentication Error</CardTitle>
          <CardDescription className="text-slate-600">
            There was an error processing your authentication request.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600 text-center">
            This could be due to an expired or invalid authentication code. Please try signing in again.
          </p>
          <div className="flex gap-2">
            <Button asChild className="flex-1 bg-slate-900 hover:bg-slate-800">
              <Link href="/auth/signin">Try Again</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 bg-transparent">
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
