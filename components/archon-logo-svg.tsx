import type { SVGProps } from "react"
const ArchonLogoSVG = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="none" viewBox="0 0 24 24" {...props}>
    <path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM8 12a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z" />
    <path fill="currentColor" d="M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
  </svg>
)
export { ArchonLogoSVG }
