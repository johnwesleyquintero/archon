export function ArchonLogoSVG() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* Background: Dark charcoal-gray square with rounded corners */}
      <rect x="0" y="0" width="100" height="100" rx="10" fill="#1A1A1A" />

      {/* Foreground: Stylized, geometric letter "A" */}
      <path
        d="M 30 75 L 50 25 L 70 75 H 60 L 50 45 L 40 75 Z"
        fill="none"
        stroke="#8B5CF6" /* Electric purple */
        strokeWidth="8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Horizontal bar of the A */}
      <line
        x1="40"
        y1="60"
        x2="60"
        y2="60"
        stroke="#8B5CF6" /* Electric purple */
        strokeWidth="8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}
