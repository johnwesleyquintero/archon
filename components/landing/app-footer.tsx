import { ArchonLogoSVG } from "@/components/archon-logo-svg";
import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="border-t border-white/10 bg-white/5 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <ArchonLogoSVG className="h-6 w-6 text-purple-400" />
            <span className="text-lg font-semibold text-white">Archon</span>
          </div>
          <div className="flex items-center space-x-6 text-gray-400">
            <Link
              href="/privacy"
              className="hover:text-white transition-colors"
            >
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link
              href="/support"
              className="hover:text-white transition-colors"
            >
              Support
            </Link>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white/10 text-center text-gray-400">
          <p>&copy; 2024 Archon. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
