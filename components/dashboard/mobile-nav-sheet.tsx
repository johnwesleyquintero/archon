"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  BookOpen,
  Home,
  ListTodo,
  LogOut,
  Menu,
  Settings,
  Target,
} from "lucide-react";

import { ArchonLogoSVG } from "@/components/archon-logo-svg";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/auth-context";

export function MobileNavSheet() {
  const { signOut, isSigningOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          className="sm:hidden bg-transparent"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Navigation Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="sm:max-w-xs">
        <nav className="grid gap-6 text-lg font-medium">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-lg font-semibold"
          >
            <ArchonLogoSVG className="h-6 w-6" />
            Archon
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-4 px-2.5 text-slate-600 hover:text-slate-900"
          >
            <Home className="h-5 w-5" />
            Dashboard
          </Link>
          <Link
            href="/goals"
            className="flex items-center gap-4 px-2.5 text-slate-600 hover:text-slate-900"
          >
            <Target className="h-5 w-5" />
            Goals
          </Link>
          <Link
            href="/tasks"
            className="flex items-center gap-4 px-2.5 text-slate-600 hover:text-slate-900"
          >
            <ListTodo className="h-5 w-5" />
            Tasks
          </Link>
          <Link
            href="/journal"
            className="flex items-center gap-4 px-2.5 text-slate-600 hover:text-slate-900"
          >
            <BookOpen className="h-5 w-5" />
            Journal
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-4 px-2.5 text-slate-600 hover:text-slate-900"
          >
            <Settings className="h-5 w-5" />
            Settings
          </Link>
          <Button
            variant="ghost"
            className="flex items-center gap-4 px-2.5 text-slate-600 hover:text-slate-900 justify-start"
            onClick={() => void handleSignOut()}
            disabled={isSigningOut}
          >
            <LogOut className="h-5 w-5" />
            {isSigningOut ? "Signing out..." : "Sign Out"}
          </Button>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
