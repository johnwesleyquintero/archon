"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import Link from "next/link";
import { useAuth, type Profile } from "@/contexts/auth-context"; // Import Profile type from auth-context
import { useRouter } from "next/navigation";

export function UserMenu() {
  const { user, signOut, profile, isSigningOut, setIsSigningOut } = useAuth();
  const router = useRouter();

  // Explicitly type profile to ensure correct type inference
  const typedProfile: Profile | null = profile;

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    router.push("/login");
    setIsSigningOut(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={typedProfile?.avatar_url || "/placeholder-user.png"}
              alt={typedProfile?.full_name || "User"}
            />
            <AvatarFallback>
              {typedProfile?.full_name ? (
                typedProfile.full_name.charAt(0)
              ) : (
                <User className="h-4 w-4" />
              )}
            </AvatarFallback>
          </Avatar>
          <span className="sr-only">Toggle user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          {typedProfile?.full_name || user?.email || "My Account"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings">Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>Support</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={void handleSignOut} disabled={isSigningOut}>
          {isSigningOut ? "Signing out..." : "Logout"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
