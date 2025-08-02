import Link from "next/link";
import Image from "next/image";
import { MailCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const handleResendEmail = () => {
    // In a real application, you would need to store the email
    // of the user who just signed up to resend the email.
    // For this example, we'll assume the user might re-enter it
    // or that the session somehow persists enough info.
    // A more robust solution would involve a server action to resend.
    // For now, we'll just log a message.
    // Example:
    // const { error } = await supabase.auth.resend({
    //   type: 'signup',
    //   email: 'user@example.com', // This email needs to be known
    // });
    // if (error) {
    //   console.error("Error resending email:", error);
    // } else {
    //   alert("Verification email resent! Please check your inbox.");
    // }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/favicon.ico"
              alt="Archon Logo"
              width={48}
              height={48}
            />
          </div>
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <CardDescription>
            A verification link has been sent to your email address. Please
            check your inbox (and spam folder) to confirm your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <MailCheck className="h-16 w-16 text-primary" />
          </div>
          <Button onClick={() => void handleResendEmail()} className="w-full">
            Resend Verification Email
          </Button>
          <div className="text-center text-sm">
            Already verified?{" "}
            <Link
              href="/auth/signin"
              className="underline text-primary hover:text-primary/80"
            >
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
