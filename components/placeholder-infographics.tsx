// Common SVG props for wireframe style
const commonSvgProps = {
  stroke: "currentColor",
  fill: "none",
  strokeWidth: "2",
  strokeLinecap: "round" as const,
}

// Component 1: BarChartPlaceholder
export function BarChartPlaceholder() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...commonSvgProps}>
      {/* X-axis */}
      <line x1="10" y1="90" x2="90" y2="90" />
      {/* Y-axis */}
      <line x1="10" y1="90" x2="10" y2="10" />

      {/* Bars */}
      <rect x="20" y="60" width="15" height="30" />
      <rect x="40" y="40" width="15" height="50" />
      <rect x="60" y="70" width="15" height="20" />
      <rect x="80" y="50" width="15" height="40" />
    </svg>
  )
}

// Component 2: LineChartPlaceholder
export function LineChartPlaceholder() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...commonSvgProps}>
      {/* X-axis */}
      <line x1="10" y1="90" x2="90" y2="90" />
      {/* Y-axis */}
      <line x1="10" y1="90" x2="10" y2="10" />

      {/* Line path */}
      <polyline points="15,80 30,40 45,70 60,30 75,60 85,20" />
    </svg>
  )
}

// Component 3: PieChartPlaceholder
export function PieChartPlaceholder() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...commonSvgProps}>
      {/* Circle */}
      <circle cx="50" cy="50" r="40" />

      {/* Slices (using paths for clean cuts) */}
      {/* Slice 1 */}
      <path d="M50 50 L50 10 A40 40 0 0 1 84.64 30 L50 50 Z" />
      {/* Slice 2 */}
      <path d="M50 50 L84.64 30 A40 40 0 0 1 84.64 70 L50 50 Z" />
      {/* Slice 3 */}
      <path d="M50 50 L84.64 70 A40 40 0 0 1 15.36 70 L50 50 Z" />
      {/* Slice 4 */}
      <path d="M50 50 L15.36 70 A40 40 0 0 1 50 10 L50 50 Z" />
    </svg>
  )
}
