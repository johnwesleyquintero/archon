import type * as React from "react"

function ArchonLogoSVG(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Dark charcoal-gray square background with rounded corners */}
      <rect x="0" y="0" width="100" height="100" rx="10" fill="#1A1A1A" />

      {/* Stylized, geometric letter "A" in vibrant electric purple */}
      <path d="M50 20 L25 80 H35 L45 55 H55 L65 80 H75 L50 20 Z M47 45 L50 35 L53 45 H47 Z" fill="#8B5CF6" />
    </svg>
  )
}

export default ArchonLogoSVG
