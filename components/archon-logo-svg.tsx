export function ArchonLogoSvg({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="archon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="20" fill="url(#archon-gradient)" />
      <path d="M30 70L50 30L70 70H60L50 50L40 70H30Z" fill="white" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="50" cy="75" r="3" fill="white" />
    </svg>
  )
}

// Export with both names for compatibility
export const ArchonLogoSVG = ArchonLogoSvg
