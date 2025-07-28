import { Button } from "@/components/ui/button";
import { ArchonLogoSVG } from "@/components/archon-logo-svg";
import Link from "next/link";

export function AppNavbar() {
  return (
    <nav className="border-b border-gray-200 bg-white backdrop-blur-md dark:border-gray-700 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <ArchonLogoSVG className="h-8 w-8 text-purple-700 dark:text-purple-400" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Archon
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/signin">
              <Button
                variant="ghost"
                className="text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-white/10"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-purple-700 hover:bg-purple-800 text-white dark:bg-purple-600 dark:hover:bg-purple-700">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
