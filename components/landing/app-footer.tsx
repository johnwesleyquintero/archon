import { ArchonLogoSVG } from "@/components/archon-logo-svg";
import Link from "next/link";

export function AppFooter() {
  return (
    <footer
      className="
      border-t border-gray-200 dark:border-white/10
      bg-gray-50 dark:bg-gray-950
      py-12 px-4 sm:px-6 lg:px-8
    "
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            {/* ArchonLogoSVG remains purple, suitable for both light and dark backgrounds */}
            <ArchonLogoSVG className="h-6 w-6 text-purple-400" />
            {/* Adjusted text color for light mode, with dark mode fallback */}
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              Archon
            </span>
          </div>
          <div className="flex items-center space-x-6 text-gray-600 dark:text-gray-400">
            <Link
              href="/privacy"
              className="hover:text-purple-600 dark:hover:text-white transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="hover:text-purple-600 dark:hover:text-white transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/support"
              className="hover:text-purple-600 dark:hover:text-white transition-colors"
            >
              Support
            </Link>
          </div>
        </div>
        <div
          className="
          mt-8 pt-8
          border-t border-gray-200 dark:border-white/10
          text-center text-gray-600 dark:text-gray-400
        "
        >
          <p>&copy; 2024 Archon. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
