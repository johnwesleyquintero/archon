import type * as React from "react"

interface PlaceholderSVGProps extends React.SVGProps<SVGSVGElement> {}

export function BarChartPlaceholder(props: PlaceholderSVGProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      {...props}
    >
      {/* X-axis */}
      <line x1="10" y1="90" x2="90" y2="90" />
      {/* Y-axis */}
      <line x1="10" y1="90" x2="10" y2="10" />

      {/* Bars */}
      <rect x="20" y="70" width="10" height="20" />
      <rect x="40" y="50" width="10" height="40" />
      <rect x="60" y="65" width="10" height="25" />
      <rect x="80" y="40" width="10" height="50" />
    </svg>
  )
}

export function LineChartPlaceholder(props: PlaceholderSVGProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      {...props}
    >
      {/* X-axis */}
      <line x1="10" y1="90" x2="90" y2="90" />
      {/* Y-axis */}
      <line x1="10" y1="90" x2="10" y2="10" />

      {/* Line graph */}
      <polyline points="15 80, 30 50, 45 70, 60 30, 75 60, 85 20" />
    </svg>
  )
}

export function PieChartPlaceholder(props: PlaceholderSVGProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      {...props}
    >
      {/* Circle */}
      <circle cx="50" cy="50" r="40" />
      {/* Slices (using lines from center to edge) */}
      <line x1="50" y1="50" x2="50" y2="10" /> {/* Top */}
      <line x1="50" y1="50" x2="84.64" y2="70" /> {/* Bottom-right */}
      <line x1="50" y1="50" x2="15.36" y2="70" /> {/* Bottom-left */}
    </svg>
  )
}
