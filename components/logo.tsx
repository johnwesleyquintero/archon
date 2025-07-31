import Image from "next/image";
import React from "react";

// Using Next.js Image component requires different props from a standard `<img>` tag.
// We can get the props type from the Image component itself.
// We make `width` and `height` optional for the Logo component consumer,
// providing default values.
type LogoProps = Omit<
  React.ComponentProps<typeof Image>,
  "src" | "alt" | "width" | "height"
> & {
  width?: number;
  height?: number;
};

const Logo: React.FC<LogoProps> = ({ width = 24, height = 24, ...props }) => (
  <Image
    src="/logo.png"
    alt="Archon Logo"
    width={width}
    height={height}
    {...props}
  />
);

export default Logo;
