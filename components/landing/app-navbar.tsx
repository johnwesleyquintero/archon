import { Button } from "@/components/ui/button";
import { ArchonLogoSVG } from "@/components/archon-logo-svg";
import Link from "next/link";

export function AppNavbar() {
  return (
    <nav className="border-b border-white/10 bg-white/5 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <ArchonLogoSVG className="h-8 w-8 text-purple-400" />
            <span className="text-xl font-bold text-white">Archon</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Sign In
              </Button>
            </Link>
            <Link href="/login">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
